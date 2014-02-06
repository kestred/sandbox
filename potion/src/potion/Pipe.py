from potion import util
import os, sys, string

class Pipe:
    def __init__(self, nickname, fname, logger=None, output=False):
        self.logger = logger
        self.fpath = util.nickFile(nickname, fname)
        if self.logger is not None:
            logger.log("Input pipe is %s." % self.fpath, verbose=True)

        try: os.mkdir(util.nickDir(nickname))
        except: pass

        if output: self._initOutput()
        else: self._initInput()

    def _initOutput(self):
        self.file = open(self.fpath, "w+")

    def _initInput(self):
        try: os.mkfifo(self.fpath)
        except OSError, e:
            if self.logger is not None:
                self.logger.log("Could not open a pipe at %s." % self.fpath)
                sys.exit(1)
        self.fd = os.open(self.fpath, os.O_RDONLY | os.O_NONBLOCK)
        self.file = os.fdopen(self.fd)

    def write(self, msg):
        self.file.write(msg)

    def flush(self):
        self.file.flush()

    def _readlineEOF(self):
        self.file.close()
        self.fd = os.open(self.fpath, os.O_RDONLY)
        self.file = os.fdopen(self.fd)
        return self.file.readline()

    def readline(self):
        line = self.file.readline()
        if len(line) is 0:
            line = self._readlineEOF()
        line = string.rstrip(line)
        return line

    def _readEOF(self):
        self.file.close()
        self.fd = os.open(self.fpath, os.O_RDONLY)
        self.file = os.fdopen(self.fd)
        return self.file.read()

    def read(self):
        msg = self.file.read()
        if len(msg) is 0:
            msg = self._readEOF()
        return msg

    def destroy(self):
        try:
            self.file.close()
            os.remove(self.fpath)
        except: pass