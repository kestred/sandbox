package xmpp

import (
	"bytes"
	"encoding/xml"
	"errors"
	"net"
	"strings"
)

// A Stream represents a pair of XMPP streams: one incoming, one outgoing.
// Streams handle sending and recieving data on a client-to-server or server-to-server XMPP session.
//
// NOTE: API and implementation currently incomplete.
type Stream struct {
	// The formal xmpp names of the connection endpoints (to: peer, from: self).
	To, From JID

	// The namespace of the stream content, typically "jabber:server" or "jabber:client".
	Content string

	// A unique stream identifier.
	Id string

	// The language of human readable data encoded in the stream.
	Lang string

	// SASL authentication methods, ordered from highest to lowest preference.
	//
	// SCRAM-SHA-1-PLUS, SCRAM-SHA-1, and DIGEST-MD5 are provided in that order by NewStream().
	// Mechanisms SCRAM-SHA1 are mandatory to support in RFC 6120; DIGEST-MD5 is provided for interoperability.
	// SASL-External will be automatically prepended to the array when recommended by RFC 6120, unless it is already in the list.
	// If Mechanism PLAIN is found anywhere in the array, it will be moved to the end and only offered after successfuly TLS negotation.
	Mechanisms []Mechanism

	incoming   net.Conn
	outgoing   net.Conn
	extensions []Extension
	hosts      []string
	peerHeader *recvHeader
	sentHeader bool
	receiving  bool
	authorized bool

	handlers map[string]func(*Stream, *xml.Decoder, xml.StartElement) error
}

// NewStream returns a new Stream that is ready to start stream negotiation.
//
// NewStream(), typically followed by Stream.Negotiate() is used to start a new XMPP connection as the 'Initiating Entity'.
func NewStream(to JID, from JID, lang string) *Stream {
	s := new(Stream)
	s.To = to
	s.From = from

	if len(from.Node) > 0 {
		s.Content = NsClient
	} else {
		s.Content = NsServer
		s.hosts = []string{from.Domain}
	}

	s.Lang = lang

	return s
}

// Recieve returns a new Stream that is ready to start stream negotiation.
//
// Recieve(), typically followed by Stream.Negotiate() is used to handle an XMPP connection as the 'Recieving Entity'
func Recieve(conn net.Conn, hosts []string) (*Stream, error) {
	s := new(Stream)
	s.receiving = true
	s.incoming = conn
	s.hosts = hosts
	s.handlers = make(map[string]func(*Stream, *xml.Decoder, xml.StartElement) error)
	s.handlers["stream"] = headerHandler
	s.handlers["error"] = errorHandler

	err := s.readXML()
	for err == nil {
		if s.peerHeader != nil {
			break
		}
		err = s.readXML()
	}

	if err != nil {
		return nil, err
	}

	delete(s.handlers, "stream")

	s.To.Set(s.peerHeader.From)
	s.From.Set(s.peerHeader.To)
	s.Lang = s.peerHeader.Lang // PrepLangTag(h.Lang)
	if s.peerHeader.Content != NsStream {
		s.Content = s.peerHeader.Content
	}

	return s, nil
}

// Negotiate handles securing and setup for an XMPP Stream.
// If Negotiate returns without an error, the stream is ready to send and recieve normal XMPP stanzas and messages.
//
// Negotiate should be called on a new stream (from NewStream(), Recieve(), or self-initalized) after any desired Extensions, Mechanisms, etc. have been added.
//
// TODO: Finish implementation, some helper functions incomplete
func (s *Stream) Negotiate(tls bool) error {
	switch {
	case len(s.Content) == 0:
		return errors.New("content-type is required to negotiate")
	case s.Content != NsServer && s.Content != NsClient:
		if s.receiving {
			s.CloseError(StreamErr("invalid-namespace", ""))
		}
		return errors.New("unsupported content-type: " + s.Content)
	}

	if s.receiving {
		return s.negotiateIncoming(tls)
	} else {
		return s.negotiateOutgoing(tls)
	}

}

// TODO: Finish implementation
func (s *Stream) negotiateIncoming(tls bool) error {
	if s.incoming == nil {
		return errors.New("recieved stream has no connection")
	}

	//encoder := xml.NewEncoder(s.incoming)
	//decoder := xml.NewDecoder(s.incoming)
	//decoder.DefaultSpace = s.Content

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

	return nil
}

// Send the <stream:features> element
// Accepted features:
// 		tls-required
//		tls-optional
//		sasl
//		bind
//		session
func (s *Stream) advertise(feats []string) error {
	return nil
}

func (s *Stream) readXML() error {
	d := xml.NewDecoder(s.incoming)
	t, xmlErr := d.RawToken()
	if xmlErr != nil {
		s.CloseError(StreamErr("bad-format", ""))
		return xmlErr
	}

	switch t := t.(type) {
	case xml.StartElement:
		handler := s.handlers[t.Name.Local]
		if handler == nil {
			var err *StreamError
			if s.authorized {
				err = StreamErr("unsupported-stanza-type", "")
			} else {
				err = StreamErr("not-authorized", "")
			}
			s.CloseError(err)
			return err
		}

		return handler(s, d, t)
	case xml.EndElement:
		if t.Name.Local != "stream" {
			err := StreamErr("not-well-formed", "")
			s.CloseError(err)
			return err
		} else {
			s.Close()
			return errors.New("stream closed by peer")
		}
	case xml.ProcInst:
		if s.sentHeader == false {
			return procInstHandler(s, t)
		}
		err := StreamErr("restricted-xml", "")
		s.CloseError(err)
		return err
	default:
		err := StreamErr("restricted-xml", "")
		s.CloseError(err)
		return err
	}
}

// TODO: Finish implementation
func (s *Stream) negotiateOutgoing(tls bool) error {
	var err error

	if s.outgoing == nil {
		switch s.Content {
		case NsServer:
			s.outgoing, err = ServerDial(s.To)
		case NsClient:
			s.outgoing, err = ClientDial(s.To)
		}
		if err != nil {
			return err
		}
	}

	//encoder := xml.NewEncoder(s.outgoing)
	//decoder := xml.NewDecoder(s.outgoing)
	//decoder.DefaultSpace = s.Content

	return nil
}

//func (s *Stream) restart() {}

// Close closes the stream, signaling that no further message will be sent.
// Incoming messages can still be recieved and processed after the method
// returns until the peer also closes the stream, after which the underlying
// TCP connections will be automatically closed.
//
// TODO: Implement
func (s *Stream) Close() error {
	return nil
}

// CloseError closes an XMPP Stream with a given <stream:error>.
// The underlying TCP connection is closed gracefully according to
// RFC 6120 Sec. 4.4. and Sec 4.9. for handling connection errors.
//
// TODO: Implement
func (s *Stream) CloseError(err *StreamError) error {
	if !s.sentHeader {
		return s.closeSetup(err)
	}

	if s.outgoing != nil {

	}
	if s.incoming != nil {

	}
	return nil
}

// closeSetup does the same as CloseError, except on a connection that has not finished stream setup.
func (s *Stream) closeSetup(err *StreamError) error {
	// Build response header
	reply := new(header)
	reply.Lang = "en"
	reply.Version = Version
	if len(s.hosts) > 0 {
		reply.From = s.hosts[0]
	}

	if s.peerHeader != nil {
		if len(s.peerHeader.From) != 0 {
			recvFrom := JID{}
			recvFrom.Set(s.peerHeader.From)
			reply.To = recvFrom.String()
		}
		if len(s.peerHeader.To) != 0 {
			for _, host := range s.hosts {
				if host == s.peerHeader.To {
					reply.From = s.peerHeader.To
					break
				}
			}
		}
		if len(s.peerHeader.Version) == 0 {
			reply.Version = ""
		} else if Version != s.peerHeader.Version {
			recvMajor, recvMinor := parseVersion(s.peerHeader.Version)
			thisMajor, thisMinor := parseVersion(Version)
			if recvMajor < thisMajor || (recvMajor == thisMajor && recvMinor < thisMinor) {
				reply.Version = s.peerHeader.Version
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

	s.incoming.Write(errorPacket)

	decoder := xml.NewDecoder(s.incoming)
	for {
		token, err := decoder.RawToken()
		if err != nil {
			break
		}
		if t, ok := token.(xml.EndElement); ok && t.Name.Local == "stream" {
			break
		}
	}

	return s.incoming.Close()
}

// Outgoing returns the underlying connection the stream uses to recieve incoming XMPP stanzas.
// In the case of a Client-To-Server connection, this is typically the same as Outgoing().
func (s *Stream) Incoming() net.Conn {
	return s.incoming
}

// Outgoing returns the underlying connection the stream uses to send outgoing XMPP stanzas.
// In the case of a Client-To-Server connection, this is typically the same as Incoming().
func (s *Stream) Outgoing() net.Conn {
	return s.outgoing
}

func headerHandler(s *Stream, d *xml.Decoder, e xml.StartElement) error {
	h := new(recvHeader)
	s.peerHeader = h

	err := d.DecodeElement(h, &e)
	if err != nil {
		err := StreamErr("bad-format", "")
		s.CloseError(err)
		return err
	}

	if h.XMLName.Local != "stream" {
		err := StreamErr("not-authorized", "")
		s.CloseError(err)
		return err
	}

	if h.XMLName.Space != NsStream {
		err := StreamErr("invalid-namespace", "")
		s.CloseError(err)
		return err
	}

	// Ignore recieved stream id (RFC 6120 Sec. 4.7.3.)
	h.Id = ""

	// Handle recieved XMPP version (RFC 6120 Sec. 4.7.5.)
	if len(h.Version) == 0 {
		err := StreamErr("unsupported-version", "")
		s.CloseError(err)
		return err
	}
	recvMajor, recvMinor := parseVersion(h.Version)
	thisMajor, thisMinor := parseVersion(Version)
	if recvMajor >= thisMajor && recvMinor >= thisMinor {
		h.Version = Version
	}

	// TODO: Check for `improper-addressing`. See RFC 6120 4.9.3.7.

	if len(h.To) > 0 {
		badHost := true
		for _, host := range s.hosts {
			if h.To == host {
				badHost = false
				break
			}
		}
		if badHost {
			err := StreamErr("host-unknown", "")
			s.CloseError(err)
			return err
		}
	}

	return nil
}
func errorHandler(s *Stream, d *xml.Decoder, e xml.StartElement) error {
	return nil
}
func procInstHandler(s *Stream, pi xml.ProcInst) error {
	if pi.Target != "xml" {
		err := StreamErr("restricted-xml", "")
		s.CloseError(err)
		return err
	}

	insts := strings.Split(string(pi.Inst), " ")
	for _, inst := range insts {
		parts := strings.Split(inst, "=")
		switch parts[0] {
		case "version":
			if parts[1] != `"1.0"` {
				err := StreamErr("unsupported-encoding", "xml version '"+parts[1]+"' is unsupported")
				s.CloseError(err)
				return err
			}
		case "encoding":
			if parts[1] != `"UTF-8"` {
				err := StreamErr("unsupported-encoding", "")
				s.CloseError(err)
				return err
			}
		default:
			err := StreamErr("restricted-xml", "<?xml "+parts[0]+"?> cannot be processed")
			s.CloseError(err)
			return err
		}
	}

	return nil
}
