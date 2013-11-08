from potion import handlers, util
import string

_options = {}
_options['logger'] = None

def _handleMotd(line):
    if handlers.motdData['state'] == "received":
        _options['logger'].write(handlers.motdData['message'], autotab=True)
    elif handlers.motdData['state'] == "receiving":
        _options['logger'].log("MotD in progress, try again", "warn")
    else:
        _options['logger'].log("No motd received.")

def _formatSimple(args):
    return "!" + args.magic_word

### Input from magic to `potion robot` ###
_spellHandlers = {
    '!motd':_handleMotd
}
def readSpell(line):
    line = string.split(line)
    word = line[0]
    if word in _spellHandlers:
        handler = _spellHandlers[word](line)
    else:
        _options['logger'].log("Recevied unknown magic word: %s" % line[0], "warn")


### Output to robot from `potion magic` ###
_spellFormatters = {
    'status':_formatSimple,
    'motd':_formatSimple
}
def writeSpell(args):
    spell = _spellFormatters[args.magic_word](args)
