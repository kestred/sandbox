#!/usr/bin/python
from copy import deepcopy
import argparse

### Arguments ###
verbosityArguments = [
    (['-q', '--quiet'],   {'help':"don't show any output", 'action':'store_true'}),
#    (['-v', '--verbose'], {'help':"print human readable messages from server", 'action':'store_true'})
]

formattingArguments = [
#    (['-w', '--format-file'], {'help':"specify a file to load formatting options from", 'type':'file'}),
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
#    (['-F', '--command-file'],  {'help':"the file the bot should read commands from"})
#    (['-H', '--handlers-file'], {'help':" ... TODO: somehow defines handlers"})
]

actionArguments = [
]

subparserArg = (['-!', '--subcommand'], {'help':argparse.SUPPRESS})

### Helper Functions ###
def addArguments(group, arguments, requireds=[], defaults={}):
    arguments = deepcopy(arguments)
    for argument in arguments:
        name = argument[0][1][2:]
        if name in requireds:
            argument[1]['required'] = True
        elif name in defaults.keys():
            argument[1]['default'] = defaults[name]
        elif 'default' not in argument[1]:
            argument[1]['default'] = None
        group.add_argument(*argument[0], **argument[1])

### Output Parser ###
outputParser = argparse.ArgumentParser(add_help=False)
verbosityGroup = outputParser.add_mutually_exclusive_group()
addArguments(verbosityGroup, verbosityArguments)
addArguments(outputParser, formattingArguments)

### Main parser ###
formatter = lambda prog: argparse.HelpFormatter(prog, max_help_position=40)
parser = argparse.ArgumentParser(description='A command line interface to IRC, for people and robot-people', formatter_class=formatter)
subparsers = parser.add_subparsers(help='easyirc command-line commands')
humanSubparser = subparsers.add_parser('human', help='start an easyirc chat client', parents=[outputParser], formatter_class=formatter)
addArguments(humanSubparser, [subparserArg], defaults={'subcommand':'human'})
addArguments(humanSubparser, connectionArguments)
robotSubparser = subparsers.add_parser('robot', help='start an easyirc daemon', parents=[outputParser], formatter_class=formatter)
addArguments(robotSubparser, [subparserArg], defaults={'subcommand':'robot'})
addArguments(robotSubparser, connectionArguments, requireds=['host', 'nick'])
addArguments(robotSubparser, robotArguments)
actionSubparser = subparsers.add_parser('magic', help='send a command to an easyirc daemon')
addArguments(actionSubparser, [subparserArg], defaults={'subcommand':'magic'})
addArguments(actionSubparser, actionArguments)

def parseArguments():
    args = parser.parse_args()
    args.ident = args.ident if args.ident is not None else args.nick
    return parser.parser_args()
