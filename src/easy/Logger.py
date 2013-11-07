class Logger:
    colors = {
        "base":  '\033[0m',  # white
        "logs":  '\033[32m', # green
        "warn": '\033[33m', # orange
        "fail": '\033[31m', # red
        "info": '\033[36m', # blue
    }

    def __init__(self, logname, ansi=True, formatFile=None):
        if ansi: self.logprefix = self.color("easyirc %s: " % logname, "logs")
        else: self.logprefix = "easyirc %s: " % logname
        self.ansi = ansi

    def color(self, msg, sev):
        return "%s%s%s" % (self.colors[sev], msg, self.colors["base"])

    def log(self, msg, sev=None):
        msg = self.logprefix + msg
        if self.ansi and sev is not None:
            print self.color(msg, sev)
        else:
            print msg
