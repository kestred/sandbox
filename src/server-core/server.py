import sys
from tornado import web, httpclient
from tornadio2 import SocketConnection, TornadioRouter, SocketServer

class IndexHandler(web.RequestHandler):
    def get(self):
        self.render("./client.html")

class JavascriptHandler(web.RequestHandler):
    def get(self, stuff):
        path = self.request.path
        sys.stdout.write("PATH: " + path +"\n")
        sys.stdout.flush()
        if(path == "/vendor/jquery-1.9.1.min.js" or
           path == "/vendor/bootstrap.min.js" or
           path == "/socket.io/socket.io.js" or
           path == "/core.js"):
               self.set_header("Content-Type", "text/javascript")
               self.render('.' + path)
        else:
            raise httpclient.HTTPError(404)

class CSSHandler(web.RequestHandler):
    def get(self, stuff):
        path = self.request.path
        sys.stdout.write("PATH: " + path +"\n")
        sys.stdout.flush()
        if(path == "/vendor/bootstrap.min.css" or
           path == "/core.css"):
               self.set_header("Content-Type", "text/css")
               self.render('.' + path)
        else:
            raise httpclient.HTTPError(404)

class RouterConnection(SocketConnection):
    def on_message(self, message):
        pass

Router = TornadioRouter(RouterConnection)

app = web.Application(
    Router.apply_routes(
        [(r"/", IndexHandler),
         (r"/(.*).js", JavascriptHandler),
         (r"/(.*).css", CSSHandler)]),
    socket_io_port = 6058)

if __name__ == "__main__":
    sys.stdout.write("[Argonaut] Starting server...\n")
    sys.stdout.flush()
    SocketServer(app)
