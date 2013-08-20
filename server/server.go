// Package server provides an example server implementation.
//
// The server is intended for teaching and testing purposes and is
// never intended to become a robust server for use in production.
package server

import (
	"fmt"
	"log"
	"net"
	"time"

	"github.com/kestred/go.xmpp"
)

// A Server represents an xmpp daemon that can successfully
// route XMPP messages between clients and other servers.
//
// NOTE: API and implementation currently incomplete.
type Server struct {
	// Ports to listen on
	ClientPort uint16
	ServerPort uint16

	// The preferred language of the server
	DefaultLanguage string

	// The server's fully-qualified domain name
	Hostname string

	// A logger for error output.
	Logger *log.Logger

	clientListener net.Listener
	serverListener net.Listener
	streams        []*xmpp.Stream
}

// DefaultServer is a convenience function that returns a new server
// with the XMPP defaults, and an autodiscovered domain name.
func DefaultServer() *Server {
	s := new(Server)
	s.ClientPort = xmpp.PortClient
	s.ServerPort = xmpp.PortServer
	s.DefaultLanguage = "en"
	s.Hostname = "localhost"

	addrs, _ := net.InterfaceAddrs()
	for _, addr := range addrs {
		names, _ := net.LookupAddr(addr.String())
		if len(names) > 0 {
			s.Hostname = names[0]
			break
		}
	}

	return s
}

// Serve starts the server, then returns
func (s *Server) Serve() (err error) {
	s.serverListener, err = net.Listen("tcp", fmt.Sprint(":", s.ServerPort))
	if err != nil {
		s.log(err)
		return err
	}
	s.clientListener, err = net.Listen("tcp", fmt.Sprint(":", s.ClientPort))
	if err != nil {
		s.log(err)
		return err
	}

	go s.handleConn(s.serverListener)
	go s.handleConn(s.clientListener)

	return nil
}

// Stop stops recieving new connections and closes existing connections.
func (s *Server) Stop() {
	s.serverListener.Close()
	s.clientListener.Close()

	ch := make(chan bool)
	for _, stream := range s.streams {
		go s.concurrentCloseStream(stream, ch)
	}

	for i := 0; i < len(s.streams); i++ {
		<-ch
	}
}

func (s *Server) handleConn(l net.Listener) {
	for {
		conn, err := l.Accept()
		if err != nil {
			s.log(err)
			return
		}
		go s.handleStream(conn)
	}
}

// TODO: Handle stanza logic
func (s *Server) handleStream(conn net.Conn) {
	stream, err := xmpp.Recieve(conn, time.Duration(0), []string{s.Hostname})
	if err != nil {
		s.log(err)
		return
	}

	err = stream.Negotiate(true)
	if err != nil {
		s.log(err)
		return
	}

	s.streams = append(s.streams, stream)

	//for {
	//whatever := stream.GetWhatever()
	go s.handleWhatever()
	//}
}

// TODO: Finalize and implement
func (s *Server) handleWhatever() {}

func (s *Server) concurrentCloseStream(stream *xmpp.Stream, ch chan<- bool) {
	s.log(stream.Close())
	ch <- true
}

func (s *Server) log(v interface{}) {
	if s.Logger != nil && v != nil {
		s.Logger.Println(v)
	}
}
