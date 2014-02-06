from irc.constants import *
import irc.util as util
import string

_options = {}
_options['nick'] = ""
_options['logger'] = None

def welcomeHandler(conn, line, namespace):
	_options['logger'].log("Succesfully connected to `%s`." % namespace)

def joinHandler(conn, line, namespace=None):
	_options['logger'].log("Succesfully joined channel `%s`." % line[1])

def modeHandler(conn, line, namespace=None):
	if line[1] == _options['nick']:
		line = line[2:]
		line[0] = string.lstrip(line[0], ':')
		_options['logger'].log("Mode set to %s" % string.join(line), verbose=True)

def ignoreHandler(conn, line, namespace=None):
	pass

def logWarningHandler(conn, line, namespace=None):
	_options['logger'].log(string.join(line), "warn")

def msgHandler(conn, line, namespace):
	sender = namespace
	receiver = line[1]
	line = line[2:]
	line[0] = string.lstrip(line[0], ':')
	msg = string.join(line)

	if receiver[0] is '#':
		_options['logger'].message(util.getNick(sender), msg)
	else:
		pass # TODO: Print private message

motdData = {}
motdData['state'] = "none"
def motdHandler(conn, line, namespace=None):
	if line[0] == RPL_MOTD_START:
		motdData['state'] = "receiving"
		motdData['message'] = ""
	elif line[0] == RPL_MOTD_TEXT:
		line = line[3:]
		motdData['message'] += string.join(line) + "\n"
	elif line[0] == RPL_MOTD_END:
		motdData['state'] = "received"
