import string

def getNick(identifier):
	nick, junk = string.split(identifier, "!")
	return nick
