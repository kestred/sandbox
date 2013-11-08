from datetime import datetime
import string

class Logger:
    colors = {
        "base":  '\033[0m',  # white
        "logs":  '\033[32m', # green
        "warn": '\033[33m', # orange
        "fail": '\033[31m', # red
        "info": '\033[36m', # blue
    }

    def __init__(self, writer, logname, verbosity=0, ansi=True, formatFile=None):
        self.writer = writer
        if ansi: self.logprefix = self.color("easyirc %s: " % logname, "logs")
        else: self.logprefix = "easyirc %s: " % logname
        self.ansi = ansi
        self.verbosity = verbosity

    def _print(self, msg):
        self.writer.write(msg + "\n")
        self.writer.flush()

    def color(self, msg, sev):
        return "%s%s%s" % (self.colors[sev], msg, self.colors["base"])


    def write(self, msg, autotab=False):
        if autotab:
            parts = string.split(msg, "\n")
            msg = string.join(parts, "\n\t")
        self._print(msg)

    def log(self, msg, sev=None, verbose=False, autotab=False):
        if autotab:
            parts = string.split(msg, "\n")
            msg = string.join(parts, "\n\t")
        if self.verbosity >= (1 if verbose else 0):
            if self.ansi and sev is not None:
               self._print(self.logprefix + self.color(msg, sev))
            else:
               self._print(self.logprefix + msg)

    def message(self, sender, msg):
        if self.verbosity >= 1:
            time = datetime.now().strftime("%H:%M:%S")
            if self.ansi:
                self.print_(self.color("%s from<%s>: " % (time, sender), "info") + msg)
            else:
                self.print_("%s from<%s> %s" % (time, sender, msg))
