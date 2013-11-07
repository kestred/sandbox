#!/usr/bin/python
from easy.arguments import parseArguments
from easy.Logger import Logger
from irc.Connection import Connection

def main():
    args = parseArguments()
    logger = Logger(args.subcommand, not args.no_color)


    if args.subcommand is 'robot':
        cnxn = Connection(args)

        # TODO: add handlers

        cnxn.connect()
        while True:
            pass # TODO: add command reader

if __name__ == '__main__':
    main()