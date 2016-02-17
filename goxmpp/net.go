package xmpp

import (
	"crypto/tls"
	"errors"
	"fmt"
	"net"
)

type Conn struct {
	net.Conn

	Started      bool
	TLSComplete  bool
	SASLComplete bool
	BindComplete bool
	Negotiated   bool

	header *remoteHeader
}

func newConn(conn net.Conn) *Conn {
	c := new(Conn)
	c.Conn = conn
	return c
}
func (c *Conn) startTLS(cfg *tls.Config) (state tls.ConnectionState, err error) {
	tlsc := tls.Server(c.Conn, cfg)
	err = tlsc.Handshake()
	state = tlsc.ConnectionState()
	return
}
func (c *Conn) proceedTLS(cfg *tls.Config) (state tls.ConnectionState, err error) {
	tlsc := tls.Client(c.Conn, cfg)
	err = tlsc.Handshake()
	state = tlsc.ConnectionState()
	c.Conn = tlsc
	return
}

type SRV struct {
	Service string
	Domain  string
	Port    uint16
}

// Dial opens a new TCP connection with XMPP-style peer discovery.
// Typically, Dial is not called directly but instead called when necessary by the stream object.
func Dial(domain, service string, defaultPort uint16) (*net.TCPConn, error) {
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

// clientDial starts a client-to-server connection. Convenience function.
func clientDial(jid JID) (conn *net.TCPConn, err error) {
	return Dial(jid.Domain, SrvClient, PortClient)
}

// SserverDial starts a server-to-server connection. Convenience function.
func serverDial(jid JID) (conn *net.TCPConn, err error) {
	return Dial(jid.Domain, SrvServer, PortServer)
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
