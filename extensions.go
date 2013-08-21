package xmpp

import (
	"crypto/tls"
	"encoding/xml"
	"errors"
)

// An Extension represents an XMPP Extension such as those defined in XEPs (http://xmpp.org/xmpp-protocols/xmpp-extensions/).
type Extension interface {
	// TODO: Finalize interface
	Stanzas() []string
	Handle(string, *Stream, *xml.Decoder, *xml.StartElement) error
}

type tlsExtension struct {
	Config *tls.Config
}

func tlsExt(cfg *tls.Config) *tlsExtension {
	ext := new(tlsExtension)

	// Required to implement TLS cipher suite
	if cfg.CipherSuites != nil {
		cfg.CipherSuites = append(cfg.CipherSuites, tls.TLS_RSA_WITH_AES_128_CBC_SHA)
	}
	ext.Config = cfg

	return ext
}

// Handlers for TLS Negotiation
func (ext *tlsExtension) Handle(name string, s *Stream, d *xml.Decoder, e xml.StartElement) error {
	switch name {
	case "starttls":
		var err error
		if e.Name.Space != NsTLS {
			ext.Fail(s)
			return errors.New("malformed STARTTLS command")
		}

		// Consume "starttls" xml.EndElement
		token, err := d.RawToken()
		if t, ok := token.(xml.EndElement); err != nil || !ok || t.Name.Local != "starttls" {
			err := StreamErr("bad-format", "")
			s.CloseError(err)
			return err
		}

		proceed := new(XMLGeneric)
		proceed.XMLName.Local = "proceed"
		proceed.XMLName.Space = NsTLS
		encoder := xml.NewEncoder(s.incoming)
		err = encoder.Encode(proceed)
		if err != nil {
			ext.Fail(s)
			return errors.New("internal error during starttls negotiation")
		}

		// Do XMPP-style SNI
		cert := ext.Config.NameToCertificate[s.From.Domain]
		if cert != nil {
			// Restore config
			defer func(certs []tls.Certificate, nameMap map[string]*tls.Certificate) {
				ext.Config.Certificates = certs
				ext.Config.NameToCertificate = nameMap
			}(ext.Config.Certificates, ext.Config.NameToCertificate)
			ext.Config.Certificates = []tls.Certificate{*cert}
			ext.Config.NameToCertificate = nil
		}

		conn := tls.Server(s.incoming, ext.Config)
		err = conn.Handshake()
		state := conn.ConnectionState()
		if err != nil || (len(state.ServerName) > 0 && state.ServerName != s.From.Domain) {
			conn.Close()
			return err
		}

		if s.Content == NsServer && len(s.From.Domain) > 0 && len(state.PeerCertificates) > 0 {
			err = state.PeerCertificates[0].VerifyHostname(s.From.Domain)
			if err != nil {
				conn.Close()
				return err
			}
		}

		if s.outgoing == s.incoming {
			s.outgoing = conn
		}
		s.incoming = conn
		return s.Restart()
	case "proceed":
		var err error
		if e.Name.Space != NsTLS {
			ext.Fail(s)
			return errors.New("malformed STARTTLS command")
		}

		// Consume "proceed" xml.EndElement
		token, err := d.RawToken()
		if t, ok := token.(xml.EndElement); err != nil || !ok || t.Name.Local != "proceed" {
			err := StreamErr("bad-format", "")
			s.CloseError(err)
			return err
		}

		conn := tls.Client(s.incoming, ext.Config)
		err = conn.Handshake()
		if err != nil {
			return err
		}

		cert := conn.ConnectionState().PeerCertificates[0]
		if len(s.To.Domain) > 0 {
			cert.VerifyHostname(s.To.Domain)
			if err != nil {
				conn.Close()
				return err
			}
		}

		if s.incoming == s.outgoing {
			s.incoming = conn
		}
		s.outgoing = conn
		return s.Restart()
	case "failure":
		s.outgoing.Close()
		return errors.New("recieved failure during starttls negotiation")
	}

	return nil
}

// always returns an error
func (ext *tlsExtension) Fail(s *Stream) {
	fail := new(XMLGeneric)
	fail.XMLName.Local = "failure"
	fail.XMLName.Space = NsTLS
	failBytes, _ := xml.Marshal(fail)
	failBytes = []byte(string(failBytes) + "</stream>")
	s.incoming.Write(failBytes)
	s.incoming.Close()
}

func (ext *tlsExtension) Stanzas() []string {
	return []string{"starttls", "proceed", "failure"}
}
