#!/usr/bin/python
import sys, socket, argparse, string

procname = "easyirc"

# Define argument parser
parser = argparse.ArgumentParser(description='A command line interface to IRC, for bots',
  formatter_class=lambda prog: argparse.HelpFormatter(prog,max_help_position=36))
subparsers = parser.add_subparsers(help='Command-line options help')

## Create a subparser for connecting to an irc network ##
connParser = subparsers.add_parser('connect', help='Connect to an IRC network',
  formatter_class=lambda prog: argparse.HelpFormatter(prog,max_help_position=36))

### Add a hidden argument so we can check if we are using this subparser ###
connParser.add_argument('--doConnect',  default=True, help=argparse.SUPPRESS)

### Define "connect" arguments ###
iactGroup = connParser.add_mutually_exclusive_group()
iactGroup.add_argument('-q', '--quiet', action='store_true',
                       help="don't show any output")
iactGroup.add_argument('-i', '--interactive', action='store_true',
                       help="start %s in interactive mode" % procname)
iactGroup.add_argument('-x', '--disable-curses', action='store_true',
                       help="don't use curses or ANSI-style color")
connParser.add_argument('-H', '--host', default=None,
                        help='the irc host to connect to')
connParser.add_argument('-P', '--port', type=int, default=6667,
                        help='a non-standard connection port')
connParser.add_argument('-N', '--nick', default=None,
                        help='the nickname to use while connecting')
connParser.add_argument('-I', '--ident', default=None,
                        help='the ident string to use when connecting')
connParser.add_argument('-R', '--name', metavar="REALNAME", default='IRC CLI Bot',
                        help='the whois display name of the connection')
connParser.add_argument('-C', '--channel', default=None,
                        help='the channel to connect to (w/o "#" prefix)')
connParser.add_argument('-K', '--keyword', default=None,
                        help='the keyword (password) for the channel')
connParser.add_argument('-F', '--file', type=file, default=None,
                        help='a file that commands are read from')

## Create a subparse for sending commands on an existing connection ##
cmdParser = subparsers.add_parser('command', help='Send IRC commands over an existing connection',
  formatter_class=lambda prog: argparse.HelpFormatter(prog,max_help_position=40))

### Add a hidden argument so we can check if we are using this subparser ###
cmdParser.add_argument('doCommand',  default=True, help=argparse.SUPPRESS)

### Define "command" arguments ###
iactGroup = cmdParser.add_mutually_exclusive_group()
iactGroup.add_argument('-q', '--quiet', action='store_true',
                       help="don't show any output")
iactGroup.add_argument('-x', '--disable-curses', action='store_true',
                       help="don't use curses or ANSI-style color")
cmdParser.add_argument('-F', '--file', required=True, type=file,
                       help='the command file of a connection')
cmdParser.add_argument('-C', '--command', metavar="CMD", required=True, default='status',
                       help="the commands to send to irc")
cmdParser.add_argument('-A', '--arguments', metavar="ARGS", required=True, default=[],
                       help="the arguments for the irc command")


# Get provided arguments
args = parser.parse_args()
args.ident = args.ident if args.ident is not None else args.nick

# IRC Constants
RPL_WELCOME = '001'
RPL_MOTD = '372'

# Define helper methods
def log(msg, severity = None):
    if args.quiet:
        return

    CLOG = '\033[32m' # green
    CEND = '\033[0m' # auto

    # Prepare log prefix
    output = ""
    if args.disable_curses:
        output += procname
    else:
        output += CLOG + procname

    if "doConnect" in args:
        output += " connect: "
    if "doCommand" in args:
        output += " command: "

    # Don't do color, if curses-style output is disabled
    if args.disable_curses:
        output += msg
        print output
        return
    else:
        output += CEND

    # Color and append log message
    if severity is "fatal":
        COLOR = '\033[31m' # red
        output += COLOR + msg + CEND
    elif severity is "warning":
        COLOR = '\033[33m' # orange
        output += COLOR + msg + CEND
    elif severity is "info":
        COLOR = '\033[36m' # blue
        output += COLOR + msg + CEND
    else:
        output += msg

    # Print output
    print output

def checkHost():
    if args.host is None:
        log("no host provided", "fatal")
        return False
    return True

def checkNick():
    if args.nick is None:
        log("no nick provided", "fatal")
        return False
    return True

# Define primary methods
def connect():
    if args.interactive:
        print "TODO: foo"
    else:
        err = ""
        if args.host is None:
            err += "no host provided"
        if args.nick is None:
            err += ", " if err != "" else ""
            err += "no nick provided"

        if err != "":
            log(err, "fatal")
            log("try `%s connect --help`" % procname, "info")
            sys.exit(1)

        s = socket.socket()
        s.connect((args.host, args.port))
        s.send("NICK %s \r\n" % args.nick)
        s.send("USER %s %s bla :%s\r\n" % (args.ident, args.host, args.name))

        if args.channel is not None:
            if args.keyword is not None:
                s.send("JOIN #%s %s\r\n" % (args.channel, args.keyword))
            else:
                s.send("JOIN #%s\r\n" % args.channel)

        log("Trying to connect...")

        readBuffer = ""
        while True:
            readBuffer = readBuffer + s.recv(1024)
            temp = string.split(readBuffer, "\n")
            readBuffer = temp.pop()

            for line in temp:
                line = string.rstrip(line)
                line = string.split(line)

                if line[0] == 'PING':
                    s.send("PONG %s\r\n" % line[1])
                elif line[1] == RPL_WELCOME:
                    log("Connected to \"%s\" successfully!" % args.host)
                elif line[1] == 'JOIN':
                    log("Joined channel \"%s\" succesfully!" % args.channel)

if "doConnect" in args:
    connect()
if "doCommand" in args:
    print "TODO: bar"
