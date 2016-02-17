package sasl

import (
	"errors"
	"hash"
	//"crypto/hmac"
	"strconv"
	"strings"
)

// SCRAMInitial accepts a client's initial response and prepares a challenge as described in SASL SCRAM-SHA-1 as described in [RFC5802]
//
// TAKES:
//     func acctHmacInfo(username string) (salt []byte, iterations int)
//
func SCRAMInitial(initialResponse string, acctHmacInfo func(string) ([]byte, int)) (initialChallenge string, err error) {
	var iterCount int
	//var bindSupport bool
	var username string
	var salt, rnonce []byte

	_, username, rnonce, err = decodeInitial(initialResponse)
	if err != nil {
		return "", err
	}
	salt, iterCount = acctHmacInfo(username)
	if len(salt) == 0 && iterCount == 0 {
		return "", errors.New("user not found")
	}
	return encodeChallenge(salt, iterCount, rnonce), nil
}

// SCRAMChallenge accepts a challenge from a server and returns a response to the challenge.
//
// TODO: Implement
func SCRAMChallenge(initialChallenge string) (challengeResponse string) {
	return ""
}

// SCRAMFinal accepts a client's response to the challenge and returns a final message to be sent by the server.
//
// TODO: Implement
func SCRAMFinal(challengeResponse string) (finalMessage string) {
	return ""
}

func decodeInitial(msg string) (bindSupport bool, username string, rnonce []byte, err error) {
	msg = base64Decode(msg)
	vars := strings.Split(msg, ",")
	if vars[0] == "y" || vars[0] == "p" {
		bindSupport = true
	} else if vars[0] != "n" {
		err = errors.New("invalid SCRAM initial response")
		return
	}

	for i := 1; i < len(vars); i++ {
		keyvals := strings.Split(vars[i], "=")
		switch keyvals[0] {
		case "n":
			username = keyvals[1]
		case "r":
			rnonce = []byte(keyvals[1])
		}
	}

	return
}

// TODO
func decodeChallenge(msg string) {}
func decodeResponse(msg string)  {}
func decodeFinal(msg string)     {}

func encodeChallenge(salt []byte, iter int, rnonce []byte) string {
	var challenge string

	iterString := strconv.FormatInt(int64(iter), 10)

	nonceCompound := string(rnonce) + string(genNonce(len(rnonce)))
	challenge = "r=" + nonceCompound
	challenge += ",s=" + string(salt)
	challenge += ",i=" + iterString
	return base64Encode(challenge)
}

// TODO: Implement
func genNonce(length int) []byte {
	return []byte{}
}

// "Hi" as described [RFC5802] Notation section
// Essentially PBKDF2 with HMAC as the psuedorandom function
//
// TODO: Figure out how to properly use the hmac package
func hiSaltedPassword(password, salt string, iter int, h func() hash.Hash) { //[]byte {
	int1 := []byte{0x01, 0x00, 0x00, 0x00}

	parts := make([][]byte, 0, iter+1)
	parts[0] = []byte(string(salt) + string(int1))

	for i := 0; i < iter; i++ {
		//parts[i+1] := HMAC(key, parts[i])
	}
}
