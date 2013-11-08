from potion import handlers, util, NewOutput, Pipe
import string, sys

_options = {}
_options['nick'] = ""
_options['logger'] = None

### Input from magic to `potion robot` ###
def _handleMotd(line):
    log, f = None, None # Set logging function
    if _options['daemon']:
        if util.existsNickFile(_options['nick'], ".motd"):
            f = open(util.nickFile(_options['nick'], ".motd"), "w")
            log = f.write
        else:
            return
    else: log = _options['logger'].log

    # Log the Message of the Day
    if handlers.motdData['state'] == "received":
        log(util.autotab(handlers.motdData['message']))
    elif handlers.motdData['state'] == "receiving":
        log("MotD in progress, try again")
    else:
        log("No motd received.")

    if _options['daemon']:
        try: f.close()
        except: pass

def _handleStatus(line):
    log, f = None, None # Set logging function
    if _options['daemon']:
        if util.existsNickFile(_options['nick'], ".status"):
            f = open(util.nickFile(_options['nick'], ".status"), "w")
            log = f.write
        else:
            return
    else: log = _options['logger'].log

    log("Status: Running.")
    if _options['daemon']:
        try: f.close()
        except: pass

def _handleStop(line):
    _options['logger'].log("Stopping.", verbose=True)
    sys.exit(0)

_robotHandlers = {
    '!motd': _handleMotd,
    '!status': _handleStatus,
    '!stop': _handleStop
}
def readSpell(line):
    print line
    line = string.split(line)
    word = line[0]
    if word in _robotHandlers:
        handler = _robotHandlers[word](line)
    else:
        _options['logger'].log("Recevied unknown magic word: %s" % line[0], "warn")


### Output to robot from `potion magic` ###
def _writeToDaemon(name, line):
    if util.existsNickFile(name, "magic"):
        with open(util.nickFile(name, "magic"), "w") as f:
            f.write(line + "\n")
            f.flush()
        return

    _options['logger'].log("No such robot `%s`." % _options['nick'], "warn")
    sys.exit(5)

def _formatSimple(opts):
    return "!" + opts.magic_word

def _getMotd(opts, pipe):
    _options['logger'].log(pipe.read())

def _getStatus(opts, pipe):
    _options['logger'].log(util.autotab(pipe.read()))

def _getStop(opts, pipe):
    _options['logger'].log("Daemon stopped.")

_magicFormatters = {
    'stop': _formatSimple,
    'status': _formatSimple,
    'motd': _formatSimple
}
_magicPipes = {
    'status': ".status",
    'motd': ".motd"
}
_magicEffects = {
    'status': _getStatus,
    'motd': _getMotd,
    'stop': _getStop
}
def writeSpell(opts):
    pipe = None
    if opts.magic_word in _magicFormatters:
        spell = _magicFormatters[opts.magic_word](opts)
        if opts.magic_word in _magicPipes:
            pipe = Pipe(opts.nick, _magicPipes[opts.magic_word], logger=_options['logger'])
        _writeToDaemon(opts.nick, spell)

    if opts.magic_word in _magicEffects:
        _magicEffects[opts.magic_word](opts, pipe)

    if pipe is not None:
        pipe.destroy()
