import os, errno, sys, tornado

def printIOError(ioex):
    sys.stderr.write('[IOError - ' + str(ioex.errno) + '] ')
    sys.stderr.write(os.strerror(ioex.errno) + ":\n")
    sys.stderr.write("\t(" + os.path.abspath(path) + ")\n")

class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("../client.html")

class SocketIOHandler(tornado.web.RequestHandler):
    def get(self):
        self.set_header("Content-Type", "text/javascript")
        self.render("../socket.io/socket.io.js")

class VendorHandler(tornado.web.RequestHandler):
    def get(self, result):
        path = "." + self.request.path
        if os.path.dirname(path) == "./vendor" and os.path.isfile(path):
            ext = os.path.splitext(path)[1]
            if ext == ".css":
                self.set_header("Content-Type", "text/css")
            elif ext == ".js":
                self.set_header("Content-Type", "text/javascript")
            try:
                self.render(os.path.abspath(path))
            except IOError, ioex:
                printIOError(ioex)
                self.set_status(404)
        else:
            self.set_status(404)

class ImageHandler(tornado.web.RequestHandler):
    def get(self, result):
        path = "." + self.request.path
        if os.path.dirname(path) == "./img" and os.path.isfile(path):
            ext = os.path.splitext(path)[1]
            if ext == ".bmp":
                self.set_header("Content-Type", "image/bmp")
            elif ext == ".png":
                self.set_header("Content-Type", "image/png")
            elif ext == ".gif":
                self.set_header("Content-Type", "image/gif")
            elif ext == ".tif" or ext == ".tiff":
                self.set_header("Content-Type", "image/tiff")
            elif ext == ".jpg" or ext == ".jpeg" or ext == ".jpe":
                self.set_header("Content-Type", "image/jpeg")
            try:
                img = open(os.path.abspath(path), 'r')
                self.write(img.read())
            except IOError, ioex:
                printIOError(ioex)
                self.set_status(404)
        else:
            self.set_status(404)

class JavascriptHandler(tornado.web.RequestHandler):
    def get(self, result):
        path = "." + self.request.path
        if os.path.dirname(path) == "./js" and os.path.isfile(path):
            try:
                self.set_header("Content-Type", "text/javascript")
                self.render(os.path.abspath(path))
            except IOError, ioex:
                printIOError(ioex)
                self.set_status(404)
        else:
            self.set_status(404)

class StylesheetHandler(tornado.web.RequestHandler):
    def get(self, result):
        path = "." + self.request.path
        if os.path.dirname(path) == "./css" and os.path.isfile(path):
            try:
                self.set_header("Content-Type", "text/css")
                self.render(os.path.abspath(path))
            except IOError, ioex:
                printIOError(ioex)
                self.set_status(404)
           # except Exception, gex:
           #     sys.stderr.write('WAT??? \n');
           #     self.set_status(500)
        else:
            self.set_status(404)
