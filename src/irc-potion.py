#!/usr/bin/python
from potion import *
import signal, sys, atexit

def quitOnInterrupt(logger):
    def signal_handler(signal, frame):
        print
        logger.log("Received SIGINT (^C); exiting.", "fail")
        sys.exit(0)
    signal.signal(signal.SIGINT, signal_handler)

def runRobot(args=None, logger=None):
    if args is None:
        args = arguments.parse()
    if args.daemon:
        pass

    if logger is None:
        verbosity = -1 if args.quiet else (1 if args.verbose else 0)
        logPipe = Pipe(args.nick, "log.txt", output=True)
        logger = Logger(logPipe, args.subcommand, verbosity, not args.no_color)

    quitOnInterrupt(logger)
    atexit.register(util.cleanRoutine(args.nick))

    magic._options['logger'] = logger

    handlers._options['logger'] = logger
    handlers._options['nick'] = args.nick


    cnxn = irc.Connection(args)
    cnxn.addHandler(irc.RPL_WELCOME, handlers.welcomeHandler)
    cnxn.addHandler(irc.RPL_MOTD_START, handlers.motdHandler)
    cnxn.addHandler(irc.RPL_MOTD_TEXT, handlers.motdHandler)
    cnxn.addHandler(irc.RPL_MOTD_END, handlers.motdHandler)
    cnxn.addHandler("NOTICE", handlers.ignoreHandler)
    cnxn.addHandler("MODE", handlers.modeHandler)
    cnxn.addHandler("JOIN", handlers.joinHandler)
    cnxn.addHandler("PRIVMSG", handlers.msgHandler)

    cnxn.connect()

    magicPipe = Pipe(args.nick, "magic", logger)
    while True:
        magic.readSpell(magicPipe.readline())

def main():
    args = arguments.parse()
    verbosity = -1 if args.quiet else (1 if args.verbose else 0)
    logger = Logger(sys.stdout, args.subcommand, verbosity, not args.no_color)
    handlers._options['logger'] = logger
    magic._options['logger'] = logger

    if args.subcommand is 'robot':
        if args.daemon:
            daemonize(pid=util.pidFile(args.nick),
                      action=runRobot,
                      keep_fds=[sys.stderr.fileno()])
        else:
            runRobot(args, logger)
    elif args.subcommand is 'magic':
        magic.writeSpell(args)

if __name__ == '__main__':
    main()
