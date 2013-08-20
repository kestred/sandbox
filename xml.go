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

// A StreamError represents a <stream:error> element.
//
// The first condition will always be the XMPP error condition.
// Other conditions, if they exist, will be application-specific error conditions
type StreamError struct {
	XMLName    xml.Name         `xml:"http://etherx.jabber.org/streams error"`
	Conditions []*XMLGeneric    `xml:",any,omitempty"`
	Text       *StreamErrorText `xml:",omitempty"`
}

// StreamErr is a helper function which returns a StreamError in typical XMPP format.
func StreamErr(condition string, text string) *StreamError {
	conds := make([]*XMLGeneric, 0, 2)
	conds[0] = new(XMLGeneric)
	conds[0].XMLName.Local = condition
	conds[0].XMLName.Space = NsStreams

	var textElem *StreamErrorText
	if len(text) > 0 {
		textElem = new(StreamErrorText)
		textElem.Text = text
		textElem.Lang = "en"
	}
	errElem := new(StreamError)
	errElem.Conditions = conds
	errElem.Text = textElem
	return errElem
}

// Error implements the error interface
func (err *StreamError) Error() string {
	return "stream error: " + err.Conditions[0].XMLName.Local + ": " + err.Text.Text
}

// StreamErrorText represents the <text> child of a stream error
type StreamErrorText struct {
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
	//Session    *XMLGeneric    `xml:",omitempty"` // TODO: appropriate XML qualifier
	//Any        *XMLGeneric    `xml:",omitempty"` // TODO: appropriate XML qualifier
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

// A XMLGeneric is an XML encodable struct which can represent almost any XML data
type XMLGeneric struct {
	XMLName  xml.Name
	Any      []*XMLGeneric `xml:",any,omitempty"`
	Chardata string        `xml:",chardata"`
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
