package xmpp

import (
	"errors"
	"fmt"
	"net"
)

// ClientDial starts a client-to-server connection.
// Dial opens a new TCP connection with XMPP-style peer discovery.
//
// USAGE: Typically, NewStream() should be called instead and the Stream
//        object will call Dial where appropriate.
// WARNING: Dial is currently an unstable part of the public API and may
//          be removed or altered to maintain a simple, clean library.
func ClientDial(jid JID) (conn *net.TCPConn, err error) {
	return dial(jid.Domain, SrvClient, PortClient)
}

// ServerDial starts a server-to-server connection.
// Dial opens a new TCP connection with XMPP-style peer discovery.
//
// USAGE: Typically, NewStream() should be called instead and the Stream
//        object will call Dial where appropriate.
// WARNING: Dial is currently an unstable part of the public API and may
//          be removed or altered to maintain a simple, clean library.
func ServerDial(jid JID) (conn *net.TCPConn, err error) {
	return dial(jid.Domain, SrvServer, PortServer)
}

// dial opens a new TCP connection with XMPP-style peer discovery.
func dial(domain, service string, defaultPort uint16) (*net.TCPConn, error) {
	_, srvs, err := net.LookupSRV(service, "tcp", domain)

	// Try fallback process if SRV lookup fails
	if err != nil {
		addr, err := net.ResolveTCPAddr("tcp", fmt.Sprint(domain, ":", defaultPort))
		if err != nil {
			return nil, err
		}
		return net.DialTCP("tcp", addr, nil)
	}

	if len(srvs) == 1 && srvs[0].Target == "." {
		return nil, errors.New("dial: '" + service + "' service does not exist at " + domain)
	}

	for _, srv := range srvs {
		conn, err := dialRecord(srv)
		if err == nil {
			return conn, err
		}
	}

	return nil, errors.New("dial: the server '" + domain + "' failed to respond.")
}

func dialRecord(srv *net.SRV) (*net.TCPConn, error) {
	var err error
	ips, _ := net.LookupHost(srv.Target)
	for _, ip := range ips {
		addr, err := net.ResolveTCPAddr("tcp", ip+":"+fmt.Sprint(srv.Port))
		if err != nil {
			continue
		}
		conn, err := net.DialTCP("tcp", addr, nil)
		if err == nil {
			return conn, nil
		}
	}

	return nil, err
}
