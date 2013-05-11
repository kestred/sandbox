import os, sys
from tornado import web, httpclient
from tornadio2 import SocketConnection, TornadioRouter, SocketServer

class IndexHandler(web.RequestHandler):
    def get(self):
        self.render("./client.html")

class SocketIOHandler(web.RequestHandler):
    def get(self):
        self.set_header("Content-Type", "text/javascript")
        self.render("./socket.io/socket.io.js")

class VendorHandler(web.RequestHandler):
    def get(self, result):
        path = "." + self.request.path
        if os.path.dirname(path) == "./vendor" and os.path.isfile(path):
            ext = os.path.splitext(path)[1]
            if ext == ".css":
                self.set_header("Content-Type", "text/css")
            elif ext == ".js":
                self.set_header("Content-Type", "text/javascript")
            try:
                self.render(path)
            except IOError:
                self.set_status(404)
        else:
            self.set_status(404)

class JavascriptHandler(web.RequestHandler):
    def get(self, result):
        path = "." + self.request.path
        if os.path.dirname(path) == "./js" and os.path.isfile(path):
            try:
                self.set_header("Content-Type", "text/javascript")
                self.render(path)
            except IOError:
                self.set_status(404)
        else:
            self.set_status(404)

class StylesheetHandler(web.RequestHandler):
    def get(self, result):
        path = "." + self.request.path
        if os.path.dirname(path) == "./css" and os.path.isfile(path):
            try:
                self.set_header("Content-Type", "text/css")
                self.render(path)
            except IOError:
                self.set_status(404)
        else:
            self.set_status(404)

class RouterConnection(SocketConnection):
    def on_message(self, message):
        pass

Router = TornadioRouter(RouterConnection)

app = web.Application(
    Router.apply_routes(
        [(r"/", IndexHandler),
         (r"/socket.io/socket.io.js", SocketIOHandler),
         (r"/js/(.*)", JavascriptHandler),
         (r"/css/(.*)", StylesheetHandler),
         (r"/vendor/(.*)", VendorHandler)]),
    socket_io_port = 6058)

if __name__ == "__main__":
    sys.stdout.write("[Argonaut] Starting server...\n")
    sys.stdout.flush()
    SocketServer(app)
