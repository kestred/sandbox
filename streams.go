package xmpp

import (
	"bytes"
	"encoding/xml"
	"errors"
	"net"
	"strings"
	"time"
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
	receiving  bool
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
func Recieve(conn net.Conn, timeout time.Duration, hosts []string) (*Stream, error) {
	data := setupData{conn, nil, hosts, timeout}

	decoder := xml.NewDecoder(conn)
	decoder.AutoClose = []string{"stream"}

	for {
		token, xmlErr := decoder.Token()
		if xmlErr != nil {
			err := streamErr("bad-format", "")
			closeSetup(data, err)
			return nil, err
		}

		switch t := token.(type) {
		case xml.ProcInst:
			if t.Target != "xml" {
				err := streamErr("restricted-xml", "")
				closeSetup(data, err)
				return nil, err
			}

			insts := strings.Split(string(t.Inst), " ")
			for _, inst := range insts {
				parts := strings.Split(inst, "=")
				switch parts[0] {
				case "version":
					if parts[1] != `"1.0"` {
						err := streamErr("unsupported-encoding", "xml version '"+parts[1]+"' is unsupported")
						closeSetup(data, err)
						return nil, err
					}
				case "encoding":
					if parts[1] != `"UTF-8"` {
						err := streamErr("unsupported-encoding", "")
						closeSetup(data, err)
						return nil, err
					}
				default:
					err := streamErr("restricted-xml", "<?xml "+parts[0]+"?> cannot be processed")
					closeSetup(data, err)
					return nil, err
				}
			}
		case xml.StartElement:
			h := new(recvHeader)
			data.Header = h

			decoder.DecodeElement(h, &t)
			if h.XMLName.Local != "stream" {
				err := streamErr("not-authorized", "")
				closeSetup(data, err)
				return nil, err
			}

			if h.XMLName.Space != NsStream {
				err := streamErr("invalid-namespace", "")
				closeSetup(data, err)
				return nil, err
			}

			// Ignore recieved stream id (RFC 6120 Sec. 4.7.3.)
			h.Id = ""

			// Handle recieved XMPP version (RFC 6120 Sec. 4.7.5.)
			if len(h.Version) == 0 {
				err := streamErr("unsupported-version", "")
				closeSetup(data, err)
				return nil, err
			}
			recvMajor, recvMinor := parseVersion(h.Version)
			thisMajor, thisMinor := parseVersion(Version)
			if recvMajor >= thisMajor && recvMinor >= thisMinor {
				h.Version = Version
			}

			// TODO: Check for `improper-addressing`. See RFC 6120 4.9.3.7.

			if len(h.To) > 0 {
				badHost := true
				for _, host := range data.Hosts {
					if h.To == host {
						badHost = false
						break
					}
				}
				if badHost {
					err := streamErr("host-unknown", "")
					closeSetup(data, err)
					return nil, err
				}
			}

			// SUCCESS
			return makeStream(conn, h), nil
		default:
			err := streamErr("restricted-xml", "")
			closeSetup(data, err)
			return nil, err
		}
	}
}

//func Send(w *io.Writer, h StreamHeader) Stream, error {
//	stream := new(xmlStream)
//}

func makeStream(conn net.Conn, h *recvHeader) *Stream {
	s := new(Stream)
	s.incoming = conn
	s.receiving = true

	s.To.Set(h.From)
	s.From.Set(h.To)
	s.Lang = h.Lang // PrepLangTag(h.Lang)

	if h.Content != NsStream {
		s.Content = h.Content
	}

	return s
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
			s.CloseError("invalid-namespace", "")
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

	// TODO: Finish negotiation

	return nil
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
func (s *Stream) CloseError(condition string, message string) error {
	if s.outgoing != nil {

	}
	if s.incoming != nil {

	}
	return nil
}

//func (s *Stream) reset() {}

// Outgoing returns the underlying connection the stream uses to send outgoing XMPP stanzas.
// In the case of a Client-To-Server connection, this is typically the same as Incoming().
func (s *Stream) Outgoing() net.Conn {
	return s.outgoing
}

// Outgoing returns the underlying connection the stream uses to recieve incoming XMPP stanzas.
// In the case of a Client-To-Server connection, this is typically the same as Outgoing().
func (s *Stream) Incoming() net.Conn {
	return s.incoming
}

type setupData struct {
	Conn    net.Conn
	Header  *recvHeader
	Hosts   []string
	Timeout time.Duration
}

// closeSetup does the same as CloseError, except on a connection that has not finished stream setup.
func closeSetup(data setupData, err *streamError) error {
	// Build response header
	reply := new(header)
	reply.Lang = "en"
	reply.Version = Version
	if len(data.Hosts) > 0 {
		reply.From = data.Hosts[0]
	}

	if data.Header != nil {
		if len(data.Header.From) != 0 {
			recvFrom := JID{}
			recvFrom.Set(data.Header.From)
			reply.To = recvFrom.String()
		}
		if len(data.Header.To) != 0 {
			for _, host := range data.Hosts {
				if host == data.Header.To {
					reply.From = data.Header.To
					break
				}
			}
		}
		if len(data.Header.Version) == 0 {
			reply.Version = ""
		} else if Version != data.Header.Version {
			recvMajor, recvMinor := parseVersion(data.Header.Version)
			thisMajor, thisMinor := parseVersion(Version)
			if recvMajor < thisMajor || (recvMajor == thisMajor && recvMinor < thisMinor) {
				reply.Version = data.Header.Version
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

	// Set default timeout
	if data.Timeout.Nanoseconds() <= 0 {
		data.Timeout = 6 * time.Second
	}

	// Send closing packet, read replies
	quit := make(chan bool)
	decoder := xml.NewDecoder(data.Conn)
	timeout := time.After(data.Timeout)
	go data.Conn.Write(errorPacket)
	go func(d *xml.Decoder, ch chan bool) {
		for {
			token, err := d.RawToken()
			if err != nil {
				quit <- true
				return
			}
			if t, ok := token.(xml.EndElement); ok && t.Name.Local == "stream" {
				quit <- true
				return
			}
		}
	}(decoder, quit)

	// Wait for clean exit from peer
	select {
	case <-quit:
	case <-timeout:
	}

	return data.Conn.Close()
}
