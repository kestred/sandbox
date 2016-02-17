// TODO: Package wide doc-comment
package sasl

import "encoding/base64"

func base64Decode(encoded string) string {
	if encoded == "=" {
		return ""
	}

	decoded, _ := base64.StdEncoding.DecodeString(encoded)
	return string(decoded)
}

func base64Encode(str string) string {
	return base64.StdEncoding.EncodeToString([]byte(str))
}
