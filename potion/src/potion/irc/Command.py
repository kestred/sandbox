import string

class Command:
    commands = {}

    def __init__(self, name, format=None, minargs=0, maxargs=50, numargs=None):
        self.name = name
        self.format = format
        if numargs is None:
            self.minArgs = minargs
            self.maxArgs = maxargs
        else:
            self.minArgs = numargs
            self.maxArgs = numargs
        Command.commands[self.name] = self

    def _check(self, arguments):
        if len(arguments) < self.minArgs:
            return (False, "<<< %s: not enough arguments >>>" % self.name)
        if len(arguments) > self.maxArgs:
            return (False, "<<< %s: too many arguments >>>" % self.name)
        return (True, "")

    # parse a line as a command from the interactive-shell or command-file
    def parseString(self, line):
        pass

    # format as a prettyprint string to display on an interactive-shell
    def prettyString(self, *arguments):
        self._prettyString(arguments)

    def prettyString(self, *arguments):
        ok, err = self._check(arguments)
        if not ok: return err

        return ""

    # pack the arguments into a string to be sent to the server
    def prepare(self, *arguments):
        self._prepare(arguments)

    def _prepare(self, arguments):
        ok, err = self._check(arguments)
        if not ok: return err

        packed = self.name + " "
        if self.format is None:
            packed += string.join(arguments)
        else:
            packed += self.format % arguments
        packed += "\r\n"
        return packed

Nick = Command("NICK", numargs=1)
User = Command("USER", "%s robot people :%s", numargs=2)
Join = Command("JOIN", minargs=1, maxargs=2)
Pong = Command("PONG", numargs=1)
Mesg = Command("PRIVMSG", "%s :%s", numargs=2)
