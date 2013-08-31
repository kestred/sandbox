package xmpp

import (
	"encoding/xml"
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
type remoteHeader struct {
	header
	Content string `xml:"xmlns,attr,omitempty"`
}

// An Error represents a <stream:error> or <sasl:failure> element.
//
// The first condition will always be the XMPP defined error condition.
// Other conditions, if they exist, will be application-specific error conditions
type Error struct {
	XMLName    xml.Name
	Conditions []*XMLGeneric `xml:",any,omitempty"`
	Text       *XMLText      `xml:",omitempty"`
}

// StreamErr is a helper function which returns a <stream:error> element.
func StreamErr(condition string, text string) *Error {
	conds := make([]*XMLGeneric, 0, 2)
	conds[0] = new(XMLGeneric)
	conds[0].XMLName.Local = condition
	conds[0].XMLName.Space = NsStreams

	var textElem *XMLText
	if len(text) > 0 {
		textElem = new(XMLText)
		textElem.XMLName.Space = NsStreams
		textElem.Text = text
		textElem.Lang = "en"
	}
	errElem := new(Error)
	errElem.XMLName.Local = "error"
	errElem.XMLName.Space = NsStream
	errElem.Conditions = conds
	errElem.Text = textElem
	return errElem
}

// Error implements the error interface
func (err *Error) Error() string {
	return "stream error: " + err.Conditions[0].XMLName.Local + ": " + err.Text.Text
}

// <stream:features>
type streamFeatures struct {
	XMLName    xml.Name    `xml:"http://etherx.jabber.org/streams features"`
	Starttls   *starttls   `xml:",omitempty"`
	Mechanisms *mechanisms `xml:",omitempty"`
	//Bind       *bind       `xml:",omitempty"` // TODO: appropriate XML qualifier
	//Session    *XMLGeneric    `xml:",omitempty"` // TODO: appropriate XML qualifier
	Any []*XMLGeneric `xml:",omitempty"`
}

// <starttls:starttls>
type starttls struct {
	XMLName  xml.Name `xml:"urn:ietf:params:xml:ns:xmpp-tls starttls"`
	Required bool     `xml:",omitempty"`
}

// <sasl:mechanisms>
type mechanisms struct {
	XMLName   xml.Name `xml:"urn:ietf:params:xml:ns:xmpp-sasl mechanisms"`
	Mechanism []string `xml:"urn:ietf:params:xml:ns:xmpp-sasl mechanism"`
}

// <sasl:auth>
type auth struct {
	XMLName   xml.Name `xml:"urn:ietf:params:xml:ns:xmpp-sasl auth"`
	Mechanism string   `xml:",attr"`
	Response  string   `xml:",chardata"`
}

type bind struct {
	XMLName  xml.Name `xml:"urn:ietf:params:xml:ns:xmpp-bind bind"`
	Resource string   `xml:"resource"`
	Jid      string   `xml:"jid"`
}

// A XMLGeneric is an XML encodable struct which can represent any attribute-free XML data.
// Its useful for one-of XML elements and also unknown/variable-name elements (like XMPP StreamError conditions).
type XMLGeneric struct {
	XMLName  xml.Name
	Any      []*XMLGeneric `xml:",any,omitempty"`
	Chardata string        `xml:",chardata"`
}

// XMLText represents the <text> child of a <stream:error> or <sasl:failure>
type XMLText struct {
	XMLName xml.Name `xml:"text"`
	Lang    string   `xml:"http://www.w3.org/XML/1998/namespace lang,attr,omitempty"`
	Text    string   `xml:",chardata"`
}
