package sasl

import (
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/asn1"
)

// SASL External as described in [XEP-0178]
func External(initialResponse string, cert x509.Certificate, existsAcct func(string) bool) (id string, errCond string) {
	var ids []string
	id = base64Decode(initialResponse)

	ids, _ = xmppAddrFromX509(cert)
	switch len(ids) {
	case 0:
		if !existsAcct(cert.Subject.CommonName) {
			return "", "not-authorized"
		}

		if id != cert.Subject.CommonName {
			return "", "invalid-authzid"
		}

		return

	case 1:
		if len(id) > 0 {
			return "", "invalid-authzid"
		}

		if !existsAcct(ids[0]) {
			return "", "not-authorized"
		}

		return ids[0], ""

	default:
		if len(id) == 0 {
			return "", "invalid-authzid"
		}

		if existsAcct(id) {
			for _, v := range ids {
				if id == v {
					return v, ""
				}
			}
		}

		return "", "not-authorized"
	}
}

func xmppAddrFromX509(cert x509.Certificate) ([]string, error) {
	var tbsCert tbs
	_, err := asn1.Unmarshal(cert.RawTBSCertificate, &tbsCert)
	if err != nil {
		return nil, err
	}

	xmppAddrs := make([]string, 0, len(tbsCert.Extensions))
	for _, e := range tbsCert.Extensions {
		if len(e.Id) == 4 && e.Id[0] == 2 && e.Id[1] == 5 && e.Id[2] == 29 && e.Id[3] == 17 {
			// TODO: Fetch addrs from certificate
		}
	}

	return xmppAddrs, nil
}

type tbs struct {
	Extensions []pkix.Extension `asn1:"optional,explicit,tag:3"`
}
