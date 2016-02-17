package xmpp

import (
	"bytes"
	"crypto/tls"
	"encoding/xml"
	"errors"
	"net"
)

// A Stream represents a pair of XMPP streams: one incoming, one outgoing.
// Streams handle sending and recieving data on a client-to-server or server-to-server XMPP session.
//
// NOTE: API and implementation currently incomplete.
type Config struct {
	Extensions []Extension

	// Mechanisms represent SASL authentication methods, ordered from highest to lowest preference.
	//
	// SCRAM-SHA-1-PLUS, SCRAM-SHA-1, and DIGEST-MD5 are provided (in that order) automatically.
	// Mechanisms SCRAM-SHA1 are mandatory to support in RFC 6120; DIGEST-MD5 is provided for interoperability.
	//
	// Mechanism PLAIN will always be at the end of the list.
	//
	// SASL-External will be automatically prepended to the list when recommended by RFC 6120, unless it is already in the list.
	// During server-to-server negotiation mechanisms after SASL-External will be rejected as too-weak.
	Mechanisms []Mechanism

	// TLS is the tls configuration used for the Stream's connections.
	//
	// If nil, Initiate will not use TLS if it is advertised as optional.
	// If nil, Recieve will advertise TLS as optional and, if TLS is requested, the stream will close with an error.
	TLS *tls.Config

	// Lang is the preferred language of human readable data encoded in the stream.
	Lang string

	// Records is a list of service/hostname/port combinations accepted by Recieve
	Records []SRV

	// ServerDialback indicates whether a server-to-server stream should attempt Server Dialback [XEP-0220] if SASL External fails.
	ServerDialback bool

	// Id returns a unique (typically random) ID for a Stream or Stanza. If nil, uses library built-in secure random generator.
	Id func() string
}

// FindSRV checks the localhost's outward facing internet addresses and auto-populates the SRV list.
//
// TODO: Implement
func (cfg Config) FindSRV() {
	// Check for SRVs on both XMPP client and server protocols
	// If no SRVs are discovered, default to the highest level domain
	// with default ports (check to make sure the ports are open).
}

func (cfg Config) setRequired() {
	// Required to implement TLS cipher suite
	if cfg.TLS.CipherSuites != nil {
		cfg.TLS.CipherSuites = append(cfg.TLS.CipherSuites, tls.TLS_RSA_WITH_AES_128_CBC_SHA)
	}

	// Default XMPP Id generator
	if cfg.Id == nil {
		cfg.Id = generateId
	}
}

type Stream struct {
	// Stream details
	config  *Config
	content string
	id      string

	// Connection details
	to, from JID
	in, out  *Conn

	// Extension details
	handlers map[string]func(DecodeData) error
}

// Initiate connects to a given JID and returns the negotiated Stream.
func Initiate(to JID, from JID, cfg *Config) (s *Stream, err error) {
	s = new(Stream)
	s.to = to
	s.from = from
	s.config = cfg
	s.config.setRequired()
	s.handlers = make(map[string]func(DecodeData) error)
	s.handlers["error"] = errorHandler

	if len(from.Node) > 0 {
		s.content = NsClient
		conn, err := clientDial(to)
		if err != nil {
			return nil, err
		}
		s.out = newConn(conn)
	} else {
		s.content = NsServer
		conn, err := serverDial(to)
		if err != nil {
			return nil, err
		}
		s.out = newConn(conn)
	}

	err = s.sendHeader(s.out)
	if err != nil {
		return nil, err
	}

	err = s.recvReplyHeader(s.out)
	if err != nil {
		return nil, err
	}

	err = s.negotiateInitiated(s.out)
	if err != nil {
		return nil, err
	}

	return s, nil
}

// Recieve attempts XMPP negotiation on a given connection, returning the negotiated Stream.
func Recieve(conn net.Conn, cfg *Config) (s *Stream, err error) {
	s = new(Stream)
	s.config = cfg
	s.in = newConn(conn)

	s.handlers = make(map[string]func(DecodeData) error)
	s.handlers["error"] = errorHandler

	err = s.recvHeader(s.in)
	if err != nil {
		return nil, err
	}

	err = s.sendReplyHeader(s.out)
	if err != nil {
		return nil, err
	}

	err = s.negotiateRecieved(s.in)
	if err != nil {
		return nil, err
	}

	return s, nil
}

// TODO: Figure out best way to handle feature advertising
func (s *Stream) negotiateRecieved(c *Conn) error {
	if len(s.content) == 0 {
		return errors.New("content-type is required to negotiate")
	} else if s.content != NsServer && s.content != NsClient {
		return errors.New("unsupported content-type: " + s.content)
	}

	/*
		encoder := xml.NewEncoder(s.in)

		feat := new(streamFeatures)
		feat.Starttls = new(starttls)
		feat.Starttls.Required = tls
		if !tls {

			// TODO: Handle External mechanism
			// TODO: Allow user to sort mechanism preference order directly
			// TODO: Verify REQUIRED SASL methods are in the list

			feat.Mechanisms = new(mechanisms)
			mechs := make([]string, 0, len(s.Mechanisms))
			for i, mech := range s.Mechanisms {
				mechs[i] = mech.Name
			}
			feat.Mechanisms.Mechanism = mechs
		}

		// TODO: Get tls.Config from somewhere

		encoder.Encode(feat)

		s.handlers["starttls"] = starttlsHandler
	*/

	return readXML(s, c)
}

func (s *Stream) negotiateInitiated(c *Conn) error {
	if len(s.content) == 0 {
		return errors.New("content-type is required to negotiate")
	} else if s.content != NsServer && s.content != NsClient {
		return errors.New("unsupported content-type: " + s.content)
	}

	s.handlers["features"] = featuresHandler
	return readXML(s, c)
}

// Restart Performs an XMPP Stream Restart.
// Most uses of this package should not call Restart explicitly:
// custom XMPP extensions may need to call Restart,
// and it is otherwise called automatically according to the specification.
//
// TODO: Implement
func (s *Stream) Restart() error {
	return nil
}

// Close closes the stream, signaling that no further message will be sent.
// Incoming messages can still be recieved and processed after the method
// returns until the peer also closes the stream, after which the underlying
// TCP connections will be automatically closed.
//
// TODO: Implement
func (s *Stream) Close() error {
	return errors.New("Close not implemented")
}

// CloseError closes an XMPP Stream with a given <stream:error>.
// The underlying TCP connection is closed gracefully according to
// RFC 6120 Sec. 4.4. and Sec 4.9. for handling connection errors.
func (s *Stream) CloseError(c *Conn, err *Error) error {
	if c.Started {
		return s.closeSetup(c, err)
	}

	// TODO: Implement

	return errors.New("CloseError not implemented after stream setup")
}

// closeSetup does the same as closeError, except on a connection that has not finished stream setup.
func (s *Stream) closeSetup(c *Conn, err *Error) error {
	// Build response header
	reply := new(header)
	reply.Lang = "en"
	reply.Version = Version
	if len(s.config.Records) > 0 {
		reply.From = s.config.Records[0].Domain
	}

	if c.header != nil {
		if len(c.header.From) != 0 {
			recvFrom := JID{}
			recvFrom.Set(c.header.From)
			reply.To = recvFrom.String()
		}
		if len(c.header.To) != 0 {
			for _, record := range s.config.Records {
				if record.Domain == c.header.To {
					reply.From = c.header.To
					break
				}
			}
		}
		if len(c.header.Version) == 0 {
			reply.Version = ""
		} else if Version != c.header.Version {
			recvMajor, recvMinor := parseVersion(c.header.Version)
			thisMajor, thisMinor := parseVersion(Version)
			if recvMajor < thisMajor || (recvMajor == thisMajor && recvMinor < thisMinor) {
				reply.Version = c.header.Version
			}
		}
	}

	// Build tcp error packet
	xmlBytes := []byte(xml.Header)
	headerBytes, _ := xml.Marshal(reply)
	headerBytes = headerBytes[:len(headerBytes)-len("</stream>")]
	condBytes, _ := xml.Marshal(err)
	closeBytes := []byte("</stream>")

	errorPacket := bytes.Join([][]byte{xmlBytes, headerBytes, condBytes, closeBytes}, []byte{})

	c.Write(errorPacket)

	decoder := xml.NewDecoder(c)
	for {
		token, err := decoder.RawToken()
		if err != nil {
			break
		}
		if t, ok := token.(xml.EndElement); ok && t.Name.Local == "stream" {
			break
		}
	}

	return c.Close()
}

// Id returns the stream's unique id.
func (s *Stream) Id() string {
	return s.id
}

// To returns a copy of the peer XMPP identifier.
func (s *Stream) To() JID {
	return JID{s.to.Node, s.to.Domain, s.to.Resource}
}

// From returns a copy of the local XMPP identitier.
func (s *Stream) From() JID {
	return JID{s.from.Node, s.from.Domain, s.from.Resource}
}

// Outgoing returns the underlying connection the stream uses to recieve incoming XMPP stanzas.
// In the case of a Client-To-Server connection, this is typically the same as Outgoing().
func (s *Stream) Incoming() *Conn {
	return s.in
}

// Outgoing returns the underlying connection the stream uses to send outgoing XMPP stanzas.
// In the case of a Client-To-Server connection, this is typically the same as Incoming().
func (s *Stream) Outgoing() *Conn {
	return s.out
}

// Type returns either NsServer for server-to-server connections or NsClient for client-to-server connections
func (s *Stream) Type() string {
	return s.content
}

func (s *Stream) sendHeader(c *Conn) error {
	return errors.New("Sending <stream:stream> not implemented")
}
func (s *Stream) recvHeader(c *Conn) error {
	return errors.New("Recieving <stream:stream> not implemented")
}
func (s *Stream) sendReplyHeader(c *Conn) error {
	return errors.New("Sending <stream:stream> reply not implemented")
}
func (s *Stream) recvReplyHeader(c *Conn) error {
	s.to.Set(c.header.From)
	s.from.Set(c.header.To)
	if c.header.Content != NsStream {
		s.content = c.header.Content
	}

	// TODO: Implement

	return nil
}
