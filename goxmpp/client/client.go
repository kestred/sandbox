// Package client provides an example client implementation.
//
// The examle client can be useful as part of an application that uses
// XMPP for network messages or RPCs, or with graphics libaries for a
// GUI Instant Messaging application.
package client

import "github.com/kestred/go.xmpp"

// Client represents a simple client in a client-to-server XMPP connection.
type Client struct {
	jid    xmpp.JID
	stream *xmpp.Stream
}

// NewClient starts a new connection to the given host which can 
func NewClient(host, user, password, lang string) (*Client, error) {
	cl := new(Client)
	err := cl.jid.Set(user + "@" + host)
	if err != nil {
		return nil, err
	}

	to := xmpp.JID{Domain: cl.jid.Domain}
	cl.stream = xmpp.NewStream(to, cl.jid, lang)
	err = cl.stream.Negotiate(true)
	if err != nil {
		return nil, err
	}

	// TODO: Start recieving and processing XMPP stanzas

	return cl, nil
}

// Close closes all client connections
func (cl *Client) Close() error {
	return cl.stream.Close()
}
