#!/usr/bin/python
from copy import deepcopy
import argparse

### Arguments ###
#    [-short, --long],    {help text and argument configuration options}

verbosityArguments = [
    (['-q', '--quiet'],   {'help':"don't show any output", 'action':'store_true'}),
    (['-v', '--verbose'], {'help':"print human readable messages from server", 'action':'store_true'})
]
formattingArguments = [
    #(['-w', '--format-file'], {'help':"specify a file to load formatting options from", 'type':'file'}),
    (['-x', '--no-color'],    {'help':"don't use ANSI colors in output", 'action':'store_true'})
]
connectionArguments = [
    (['-H', '--host'],    {'help':"the irc host to connect to"}),
    (['-P', '--port'],    {'help':"the port to connect to, default: 6667", 'type':int, 'default':6667}),
    (['-N', '--nick'],    {'help':"the nickname to connect as"}),
    (['-I', '--ident'],   {'help':"the ident string to use when connecting"}),
    (['-R', '--name'],    {'help':"the whois display name of the connected user", 'metavar':"REALNAME", 'default':"EasyIRC"}),
    (['-C', '--channel'], {'help':"the channel to connect to (without `#` prefix)"}),
    (['-K', '--keyword'], {'help':"the keyword (password) for the channel"})
]
robotArguments = [
    (['-d', '--daemon'], {'help':"runs the process as a daemon, returning immediately", 'action':'store_true'})
    #(['-H', '--handlers-file'], {'help':" ... TODO: somehow defines handlers"})
]

# Singleton hidden switches to help with parsing the options internally
subparserArg = (['-!', '--subcommand'], {'help':argparse.SUPPRESS})
spellbookArg = (['-~', '--magic-word'], {'help':argparse.SUPPRESS})

#    spell      help text and subparser configuration
magicParsers = [
    ('stop',   {'help':"closes the daemon"}),
    ('status', {'help':"shows the current daemon status, exits with '5' if bot not found"}),
    ('motd',   {'help':"shows the motd of the connected server"}),
    #('chat',   {'help':"send a chat message to a joined channel"}),
    #('join',   {'help':"join a channel"})
]
magicArguments = {
    'stop': [], # no arguments
    'status': [], # no arguments
    'motd': [], # no arguments
    'chat': [
        (['message'],         {'help':"the message to send in chat"}),
        (['-C', '--channel'], {'help':"the channel to send the message to"})
    ],
    'join': [
        (['channel'], {'help':"the name of the channel to join", 'metavar':"CHANNEL"})
    ],
}

### Helper Functions ###
def addArguments(group, arguments, requireds=[], defaults={}):
    arguments = deepcopy(arguments)
    for argument in arguments:
        name = argument[0][0] if (len(argument[0]) is 1) else argument[0][1][2:]
        if name in requireds:
            argument[1]['required'] = True
        elif name in defaults.keys():
            argument[1]['default'] = defaults[name]
        elif 'default' not in argument[1] and ('required' not in argument[1] or argument[1]['required'] is False):
            argument[1]['default'] = None

        group.add_argument(*argument[0], **argument[1])

### Output Parser ###
outputParser = argparse.ArgumentParser(add_help=False)
verbosityGroup = outputParser.add_mutually_exclusive_group()
addArguments(verbosityGroup, verbosityArguments)
addArguments(outputParser, formattingArguments)

### Main parser ###
formatter = lambda prog: argparse.HelpFormatter(prog, max_help_position=40)
mainParser = argparse.ArgumentParser(description='A command line interface to IRC, for people and robot-people', formatter_class=formatter)
mainSubparsers = mainParser.add_subparsers(help='easyirc command-line commands')
# parser for `easyirc human` (interactive client interface)
humanParser = mainSubparsers.add_parser('human', help='start an easyirc chat client', parents=[outputParser], formatter_class=formatter)
addArguments(humanParser, [subparserArg], defaults={'subcommand':'human'})
addArguments(humanParser, connectionArguments, defaults={'quiet':True})
# parser for `easyirc robot` (creating an ircbot daemon)
robotParser = mainSubparsers.add_parser('robot', help='start an easyirc bot daemon', parents=[outputParser], formatter_class=formatter)
addArguments(robotParser, [subparserArg], defaults={'subcommand':'robot'})
addArguments(robotParser, connectionArguments, requireds=['host', 'nick'])
addArguments(robotParser, robotArguments)
# parser for `easyirc magic` (interacting with and instruction a daemon)
magicParser = mainSubparsers.add_parser('magic', help='interact with an easyirc daemon via commandline', parents=[outputParser], formatter_class=formatter)
addArguments(magicParser, [subparserArg], defaults={'subcommand':'magic'})
magicParser.add_argument('nick', help='the nick name of the bot to send commands to', metavar="BOT_NICK")
magicSubparsers = magicParser.add_subparsers(help='the "spellbook" of commands that allows interaction with an easyirc bot')
for entry in magicParsers:
    magicWord = entry[0]
    parser = magicSubparsers.add_parser(magicWord, **entry[1])
    addArguments(parser, [spellbookArg], defaults={'magic-word':magicWord})
    addArguments(parser, magicArguments[magicWord])

def parse():
    args = mainParser.parse_args()
    if 'ident' in args: args.ident = args.ident if args.ident is not None else args.nick
    return args
