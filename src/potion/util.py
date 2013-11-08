import fnmatch, os, tempfile, shutil, sys

### Helper functions to get filename
def nickDir(nick):
    return os.path.join(tempfile.gettempdir(), "potion-%s" % nick)
def nickFile(nick, fname):
    return os.path.join(nickDir(nick), fname)
def pidFile(nick):
    return nickDir(nick) + ".pid"

### Helper functions to find existing files
def findFiles(pattern, path):
    result = []
    for root, dirs, files in os.walk(path):
        for name in files:
            if fnmatch.fnmatch(name, pattern):
                result.append(os.path.join(root, name))
    return result
def findDirs(pattern, path):
    result = []
    for root, dirs, files in os.walk(path):
        for name in dirs:
            if fnmatch.fnmatch(name, pattern):
                result.append(os.path.join(root, name))
    return result
def findNickDirs(nick):
    return _findDirs("robot-%s" % nick, tempfile.gettempdir())
def findNickFiles(nick, pattern):
    result = []
    tmpdirs = _findNickDirs(nick)
    for tmpdir in tmpdirs:
        result += _findFile(pattern, tmpdir)
    return result

### atexit ###
def cleanRoutine(nick):
    def cleanup():
        try: shutil.rmtree(nickDir(nick), ignore_errors=True)
        except: pass
        #try: os.remove(pidFile(nick))
        #except: pass
    return cleanup
