// Package xmpp implements the XMPP protocol as defined in RFC 6120, 6121, 6122 and common extensions, with interopability to the RFC 3920... specifcation.
//
// The package provides a complete XMPP API to build extensible XMPP Clients and Servers.
// Simple client and server implementations are provided in the client and server subpackages.
//
// NOTE: Implementation unfinished. Currently implements RFC 6120 Sec. 1 - Sec.5
//
//
// TODO(Next Step): Implement SASL
//
// TODO(Documentation): Provide common usage examples in overview (see 'package net' overview as example documentation)
package xmpp

import (
	"encoding/xml"
	"fmt"
	"regexp"
)

const (
	// Version of RFC 6120 implented by library
	Version = "1.0"

	// XMPP related XML namespaces
	NsClient  = "jabber:client"
	NsServer  = "jabber:server"
	NsStreams = "urn:ietf:params:xml:ns:xmpp-streams"
	NsStream  = "http://etherx.jabber.org/streams"
	NsTLS     = "urn:ietf:params:xml:ns:xmpp-tls"
	NsSASL    = "urn:ietf:params:xml:ns:xmpp-sasl"
	NsBind    = "urn:ietf:params:xml:ns:xmpp-bind"
	NsSession = "urn:ietf:params:xml:ns:xmpp-session"
	NsRoster  = "jabber:iq:roster"

	// DNS SRV names
	SrvServer = "xmpp-server"
	SrvClient = "xmpp-client"

	// XMPP Common Ports
	PortClient uint16 = 5222
	PortServer uint16 = 5269
)

// JID represents an entity that can communicate with other entities.
// It looks like node@domain/resource. Node and resource are sometimes optional.
type JID struct {
	Node     string
	Domain   string
	Resource string
}

func (jid *JID) String() string {
	result := jid.Domain
	if jid.Node != "" {
		result = jid.Node + "@" + result
	}
	if jid.Resource != "" {
		result = result + "/" + jid.Resource
	}
	return result
}

// Set parses a value as a JID
//
//     TODO: Implement sanitization with stringprep.
//
// Set implements flag.Value
func (jid *JID) Set(val string) error {
	r := regexp.MustCompile("^(([^@/]+)@)?([^@/]+)(/([^@/]+))?$")
	parts := r.FindStringSubmatch(val)
	if parts == nil {
		return fmt.Errorf("%s doesn't match user@domain/resource", val)
	}
	// jid.Node = stringprep.Nodeprep(parts[2])
	// jid.Domain = stringprep.Nodeprep(parts[3])
	// jid.Resource = stringprep.Resourceprep(parts[5])
	jid.Node = parts[2]
	jid.Domain = parts[3]
	jid.Resource = parts[5]
	return nil
}

// A Mechanism represents an XMPP SASL mechanism for peer authentication.
type Mechanism struct {
	// Name is the coded representation of the mechanism offered in <stream:features>.
	//     Example: "SCRAM-SHA-1-PLUS"
	Name string

	//TODO: Finalize fields and <doc> each field.
	SASLHandler func(*xml.Name) interface{}
}

// An Extension represents an XMPP Extension such as those defined in XEPs (http://xmpp.org/xmpp-protocols/xmpp-extensions/).
type Extension struct {
	//Features []func(Stream, Conn) string
	Handlers map[string]func(DecodeData) error
}
