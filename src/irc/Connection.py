from irc.Command import Nick, User, Join, Pong
import string, socket, thread

def handlePing(conn, message):
    conn.doCommand(Pong, message[1])

class Connection:
    def __init__(self, options):
        self.s = socket.socket()
        self.opts = options
        self.buffer = ""
        self.handlers = {}
        self.addHandler("PING", handlePing)
        self.defaultHandler = None

    def connect():
        log("Trying to connect...")
        self.s.connect((self.opts.host, self.opts.port))
        self.doCommand(Nick, self.opts.nick)
        self.doCommand(User, self.opts.ident, self.opts.host, self.opts.name)
        if self.opts.channel is not None:
            channel = self.opts.channel if (channel[0] is '#') else ("#" + self.opts.channel)
            if self.opts.keyword is not None:
                self.doCommand(Join, channel, self.opts.keyword)
            else:
                self.doCommand(Join, channel)

        # Receive messages from IRC and pass them to the handler
        thread.start_new_thread(listenForever, (self))

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
            self.buffer = self.buffer + s.recv(1024)
            temp = string.split(readBuffer, "\n")
            readBuffer = temp.pop()

            for line in temp:
                line = string.rstrip(line)
                line = string.split(line)
                msgtype = line[0]
                if line[0][0] is ':':
                    msgtype = line[1]
                if msgtype in self.handlers.keys():
                    self.handlers[msgtype](self, line)
                elif defaultHandler is not None:
                    self.defaultHandler(self, line)
