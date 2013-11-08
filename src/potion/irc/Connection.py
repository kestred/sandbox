from Command import Nick, User, Join, Pong
import string, socket, thread, sys

def handlePing(conn, line, namespace=None):
    conn.doCommand(Pong, line[1])

def handleError(conn, line, namespace=None):
    line = line[1:]
    line[1] = line[1][1:]
    print "Error: " + string.join(line)
    sys.exit(1)

class Connection:
    def __init__(self, options):
        self.s = socket.socket()
        self.opts = options
        self.buffer = ""
        self.handlers = {}
        self.addHandler("PING", handlePing)
        self.defaultHandler = None

    def connect(self):
        self.s.connect((self.opts.host, self.opts.port))
        self.doCommand(Nick, self.opts.nick)
        self.doCommand(User, self.opts.ident, self.opts.name)
        if self.opts.channel is not None:
            channel = self.opts.channel if (self.opts.channel[0] is '#') else ("#" + self.opts.channel)
            if self.opts.keyword is not None:
                self.doCommand(Join, channel, self.opts.keyword)
            else:
                self.doCommand(Join, channel)

        # Receive messages from IRC and pass them to the handler
        thread.start_new_thread(self.listenForever, ())

    def addHandler(self, key, handler):
        self.handlers[key] = handler

    def addHandlers(self, handlers):
        self.handler = dict(self.handlers, **handlers)

    def setDefaultHandler(self, handler):
        self.defaultHandler = handler

    def doCommand(self, command, *arguments):
        self.s.send(command._prepare(arguments))

    def listenForever(self):
        while True:
            self.buffer = self.buffer + self.s.recv(1024)
            temp = string.split(self.buffer, "\n")
            self.buffer = temp.pop()

            for line in temp:
                line = string.rstrip(line)
                line = string.split(line)

                # Get namespace
                namespace = None
                if line[0][0] is ':':
                    namespace = string.lstrip(line[0], ':')
                    line = line[1:]

                # Call message handler
                msgtype = line[0]
                if msgtype in self.handlers.keys():
                    self.handlers[msgtype](self, line, namespace)
                elif self.defaultHandler is not None:
                    self.defaultHandler(self, line, namespace)
