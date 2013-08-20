package xmpp

import (
	"encoding/xml"
	"strconv"
	"strings"
)

// <stream:stream>
type header struct {
	XMLName xml.Name `xml:"http://etherx.jabber.org/streams stream"`
	To      string   `xml:"to,attr,omitempty"`
	From    string   `xml:"from,attr,omitempty"`
	Id      string   `xml:"id,attr,omitempty"`
	Lang    string   `xml:"http://www.w3.org/XML/1998/namespace lang,attr,omitempty"`
	Version string   `xml:"version,attr,omitempty"`
}

// A recieved <stream:stream> that captures the content namespace.
type recvHeader struct {
	header
	Content string `xml:"xmlns,attr,omitempty"`
}

// <stream:error>
type streamError struct {
	XMLName   xml.Name   `xml:"http://etherx.jabber.org/streams error"`
	Condition *generic   `xml:",any,omitempty"`
	Text      *errorText `xml:",omitempty"`
}

func (err *streamError) Error() string {
	return "stream error: " + err.Condition.XMLName.Local + ": " + err.Text.Text
}

type errorText struct {
	XMLName xml.Name `xml:"urn:ietf:params:xml:ns:xmpp-streams text"`
	Lang    string   `xml:"http://www.w3.org/XML/1998/namespace lang,attr,omitempty"`
	Text    string   `xml:",chardata"`
}

// <stream:features>
type streamFeatures struct {
	XMLName    xml.Name    `xml:"http://etherx.jabber.org/streams features"`
	Starttls   *starttls   `xml:",omitempty"`
	Mechanisms *mechanisms `xml:",omitempty"`
	Bind       *bind       `xml:",omitempty"` // TODO: appropriate XML qualifier
	//Session    *generic    `xml:",omitempty"` // TODO: appropriate XML qualifier
	//Any        *generic    `xml:",omitempty"` // TODO: appropriate XML qualifier
}

type starttls struct {
	XMLName  xml.Name `xml:"urn:ietf:params:xml:ns:xmpp-tls starttls"`
	Required bool     `xml:",omitempty"` // TODO: appropriate XML qualifier
}

type mechanisms struct {
	XMLName   xml.Name `xml:"urn:ietf:params:xml:ns:xmpp-sasl mechanisms"`
	Mechanism []string `xml:"urn:ietf:params:xml:ns:xmpp-sasl mechanism"`
}

type bind struct {
	XMLName  xml.Name `xml:"urn:ietf:params:xml:ns:xmpp-bind bind"`
	Resource string   `xml:"resource"`
	Jid      string   `xml:"jid"`
}

// Holds an XML element not described by the more specific types.
type generic struct {
	XMLName  xml.Name
	Any      *generic `xml:",any,omitempty"`
	Chardata string   `xml:",chardata"`
}

func streamErr(condition string, text string) *streamError {
	condElem := new(generic)
	condElem.XMLName.Local = condition
	condElem.XMLName.Space = NsStreams

	var textElem *errorText
	if len(text) > 0 {
		textElem = new(errorText)
		textElem.Text = text
		textElem.Lang = "en"
	}
	errElem := new(streamError)
	errElem.Condition = condElem
	errElem.Text = textElem
	return errElem
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
