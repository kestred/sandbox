import fnmatch, os, tempfile, shutil, sys, string

def autotab(msg):
    parts = string.split(msg, "\n")
    return string.join(parts, "\n\t")

### Helper functions to get filename
def nickDir(nick):
    return os.path.join(tempfile.gettempdir(), "potion-%s" % nick)
def nickFile(nick, fname):
    return os.path.join(nickDir(nick), fname)
def pidFile(nick):
    return nickDir(nick) + ".pid"
def nickFromDir(nickdir):
    tmpdir = nickDir("")
    nick = nickdir[len(tmpdir):]
    return string.strip(nick, "/")

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
    return findDirs("potion-%s" % nick, tempfile.gettempdir())
def findNickFiles(nick, pattern):
    result = []
    tmpdirs = findNickDirs(nick)
    for tmpdir in tmpdirs:
        result += findFiles(pattern, tmpdir)
    return result
def existsNickDir(nick):
    return len(findNickDirs(nick)) > 0
def existsNickFile(nick, pattern):
    return len(findNickFiles(nick, pattern)) > 0

### atexit ###
def cleanRoutine(nick):
    def cleanup():
        try: shutil.rmtree(nickDir(nick), ignore_errors=True)
        except: pass
        try: os.remove(pidFile(nick))
        except: pass
    return cleanup
