package xmpp

import (
	"crypto/tls"
	"encoding/xml"
	"errors"
	"strconv"
	"strings"
)

type DecodeData struct {
	Stream   *Stream           // Assosciate stream
	Conn     *Conn             // Active connection within the stream
	Decoder  *xml.Decoder      // Active decoder for connection
	RawToken *xml.StartElement // StartElement for decoder
}

func readXML(s *Stream, c *Conn) error {
	d := xml.NewDecoder(c)
	t, xmlErr := d.RawToken()
	if xmlErr != nil {
		s.CloseError(c, StreamErr("bad-format", ""))
		return xmlErr
	}

	switch t := t.(type) {
	case xml.StartElement:
		handler := s.handlers[t.Name.Local]
		if handler == nil {
			var err *StreamError
			if c.BindComplete {
				err = StreamErr("unsupported-stanza-type", "")
			} else {
				err = StreamErr("not-authorized", "")
			}
			s.CloseError(c, err)
			return err
		}

		return handler(DecodeData{s, c, d, &t})
	case xml.EndElement:
		if t.Name.Local != "stream" {
			err := StreamErr("not-well-formed", "")
			s.CloseError(c, err)
			return err
		} else {
			s.Close()
			return errors.New("stream closed by peer")
		}
	case xml.ProcInst:
		if c.Started == false {
			return procInstHandler(s, c, t)
		}
		err := StreamErr("restricted-xml", "")
		s.CloseError(c, err)
		return err
	default:
		err := StreamErr("restricted-xml", "")
		s.CloseError(c, err)
		return err
	}
}

// Handler for recieving a peer's <stream:stream> header element.
func headerHandler(data DecodeData) error {
	h := new(remoteHeader)
	data.Conn.header = h

	err := data.Decoder.DecodeElement(h, data.RawToken)
	if err != nil {
		err := StreamErr("bad-format", "")
		data.Stream.CloseError(data.Conn, err)
		return err
	}

	if h.XMLName.Space != NsStream {
		err := StreamErr("invalid-namespace", "")
		data.Stream.CloseError(data.Conn, err)
		return err
	}

	// Handle recieved XMPP version (RFC 6120 Sec. 4.7.5.)
	if len(h.Version) == 0 {
		err := StreamErr("unsupported-version", "")
		data.Stream.CloseError(data.Conn, err)
		return err
	}
	recvMajor, recvMinor := parseVersion(h.Version)
	thisMajor, thisMinor := parseVersion(Version)
	if recvMajor >= thisMajor && recvMinor >= thisMinor {
		h.Version = Version
	}

	// TODO: Check for `improper-addressing`. See RFC 6120 4.9.3.7.

	if data.Stream.content != NsServer && len(h.To) > 0 {
		badHost := true
		for _, record := range data.Stream.config.Records {
			if h.To == record.Domain {
				badHost = false
				break
			}
		}
		if badHost {
			err := StreamErr("host-unknown", "")
			data.Stream.CloseError(data.Conn, err)
			return err
		}
	}

	return nil
}

// Handler for <stream:error> elements. Always returns an error (stream errors are unrecoverable).
// TODO: Finish implementation
func errorHandler(data DecodeData) error {
	err := new(StreamError)
	xmlErr := data.Decoder.DecodeElement(err, data.RawToken)
	if xmlErr != nil {
		// TODO: Close TCP connections as necessary
	}

	// TODO: Write </stream> to incoming and outgoing streams as necessary.

	for {
		token, closeErr := data.Decoder.RawToken()
		if closeErr != nil {
			break
		}
		if t, ok := token.(xml.EndElement); ok && t.Name.Local == "stream" {
			break
		}
	}

	// TODO: Close TCP connections as necessary

	return errors.New("Handling <stream:error> incompletely implemented")
	//return err
}

// Handler for <stream:features> element.
func featuresHandler(data DecodeData) error {
	if data.RawToken.Name.Space != NsStream {
		err := StreamErr("invalid-namespace", "")
		data.Stream.CloseError(data.Conn, err)
		return err
	}

	features := new(streamFeatures)
	data.Decoder.DecodeElement(features, data.RawToken)

	if features.Starttls != nil {
		switch {
		case data.Conn.TLSComplete:
			if features.Starttls.Required {
				err := StreamErr("unsupported-stream-feature", "recieved <starttls> after TLS handshake")
				data.Stream.CloseError(data.Conn, err)
				return err
			} else {
				break
			}
		case data.Stream.config.TLS == nil && !features.Starttls.Required:
			break
		case features.Starttls.XMLName.Space != NsTLS:
			err := StreamErr("invalid-namespace", "on <starttls> feature")
			data.Stream.CloseError(data.Conn, err)
			return err
		default:
			encoder := xml.NewEncoder(data.Conn)
			encoder.Encode(new(starttls))
			data.Stream.handlers["proceed"] = tlsProceedHandler
			data.Stream.handlers["failure"] = tlsFailureHandler
			delete(data.Stream.handlers, "features")
			return readXML(data.Stream, data.Conn)
		}
	}

	if features.Mechanisms != nil {
		if data.Conn.SASLComplete {
			err := StreamErr("unsupported-stream-feature", "recieved <mechanisms> after completing SASL")
			data.Stream.CloseError(data.Conn, err)
			return err
		}

		if features.Mechanisms.XMLName.Space != NsSASL {
			err := StreamErr("invalid-namespace", "on <mechanisms> feature")
			data.Stream.CloseError(data.Conn, err)
			return err
		}

		// TODO: HANDLE SASL
	}

	for _, feature := range features.Any {
		//switch feature.XMLName.Local {
		//default:
		for _, child := range feature.Any {
			if child.XMLName.Local == "required" {
				err := StreamErr("unsupported-steam-feature", "")
				data.Stream.CloseError(data.Conn, err)
				return err
			}
		}
		//}
	}

	return errors.New("Handling <stream:features> incompletely implemented")
}

// Handler for <starttls:starttls>
func starttlsHandler(data DecodeData) error {
	var err error
	if data.RawToken.Name.Space != NsTLS {
		tlsFail(data.Stream)
		return errors.New("malformed STARTTLS command")
	}

	// Consume "starttls" xml.EndElement
	token, err := data.Decoder.RawToken()
	if t, ok := token.(xml.EndElement); err != nil || !ok || t.Name.Local != "starttls" {
		err := StreamErr("bad-format", "")
		data.Stream.CloseError(data.Conn, err)
		return err
	}

	proceed := new(XMLGeneric)
	proceed.XMLName.Local = "proceed"
	proceed.XMLName.Space = NsTLS
	encoder := xml.NewEncoder(data.Conn)
	err = encoder.Encode(proceed)
	if err != nil {
		tlsFail(data.Stream)
		return errors.New("internal error during starttls negotiation")
	}

	// Do XMPP-style SNI
	name := data.Stream.From().Domain
	tlsCfg := data.Stream.config.TLS
	cert := tlsCfg.NameToCertificate[name]
	if cert != nil {
		// Restore config
		defer func(certs []tls.Certificate, nameMap map[string]*tls.Certificate) {
			tlsCfg.Certificates = certs
			tlsCfg.NameToCertificate = nameMap
		}(tlsCfg.Certificates, tlsCfg.NameToCertificate)
		tlsCfg.Certificates = []tls.Certificate{*cert}
		tlsCfg.NameToCertificate = nil
	}

	state, err := data.Conn.startTLS(tlsCfg)
	if err != nil || (len(state.ServerName) > 0 && state.ServerName != name) {
		data.Conn.Close()
		return err
	}

	if data.Stream.Type() == NsServer && len(name) > 0 && len(state.PeerCertificates) > 0 {
		err = state.PeerCertificates[0].VerifyHostname(name)
		if err != nil {
			data.Conn.Close()
			return err
		}
	}

	return data.Stream.Restart()
}

// Handler for <starttls:proceed>
func tlsProceedHandler(data DecodeData) error {
	var err error
	if data.RawToken.Name.Space != NsTLS {
		tlsFail(data.Stream)
		return errors.New("malformed STARTTLS proceed")
	}

	// Consume "proceed" xml.EndElement
	token, err := data.Decoder.RawToken()
	if t, ok := token.(xml.EndElement); err != nil || !ok || t.Name.Local != "proceed" {
		err := StreamErr("bad-format", "")
		data.Stream.CloseError(data.Conn, err)
		return err
	}

	state, err := data.Conn.proceedTLS(data.Stream.config.TLS)
	if err != nil {
		return err
	}

	if len(data.Stream.To().Domain) > 0 {
		state.PeerCertificates[0].VerifyHostname(data.Stream.To().Domain)
		if err != nil {
			data.Conn.Close()
			return err
		}
	}

	return data.Stream.Restart()
}

// Handler for <starttls:failure>
func tlsFailureHandler(data DecodeData) error {
	data.Conn.Close()
	return errors.New("recieved failure during starttls negotiation")
}

func tlsFail(s *Stream) {
	fail := new(XMLGeneric)
	fail.XMLName.Local = "failure"
	fail.XMLName.Space = NsTLS
	failBytes, _ := xml.Marshal(fail)
	failBytes = []byte(string(failBytes) + "</stream>")

	incoming := s.Incoming()
	incoming.Write(failBytes)
	incoming.Close()
}

// Handler for XML processing instructions <?target instructions...?>
func procInstHandler(s *Stream, c *Conn, pi xml.ProcInst) error {
	if pi.Target != "xml" {
		err := StreamErr("restricted-xml", "")
		s.CloseError(c, err)
		return err
	}

	insts := strings.Split(string(pi.Inst), " ")
	for _, inst := range insts {
		parts := strings.Split(inst, "=")
		switch parts[0] {
		case "version":
			if parts[1] != `"1.0"` {
				err := StreamErr("unsupported-encoding", "xml version '"+parts[1]+"' is unsupported")
				s.CloseError(c, err)
				return err
			}
		case "encoding":
			if parts[1] != `"UTF-8"` {
				err := StreamErr("unsupported-encoding", "")
				s.CloseError(c, err)
				return err
			}
		default:
			err := StreamErr("restricted-xml", "<?xml "+parts[0]+"?> cannot be processed")
			s.CloseError(c, err)
			return err
		}
	}

	return nil
}

func parseVersion(s string) (uint, uint) {
	var major, minor uint64

	nums := strings.Split(s, ".")

	major, _ = strconv.ParseUint(nums[0], 0, 64)
	switch {
	case len(nums) == 2:
		minor, _ = strconv.ParseUint(nums[1], 0, 64)
	case len(nums) > 2:
		minor, _ = strconv.ParseUint(strings.Join(nums, ""), 0, 64)
	default:
		minor = 0
	}

	return uint(major), uint(minor)
}
