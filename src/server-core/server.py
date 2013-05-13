from tornadio2 import SocketConnection, TornadioRouter, SocketServer
from tornado import web
from argonaut.httphandlers import *

from argonaut.core import CoreConnection
from argonaut.rtc import RTCConnection
class SocketRouter(SocketConnection):
    __endpoints__ = {'/core': CoreConnection, '/rtc': RTCConnection}
    def addEndpoint(route, handler):
        __endpoints__[route] = handler

# Serve static files
router = TornadioRouter(SocketRouter)
app = web.Application(
    router.apply_routes(
        [(r"/", IndexHandler),
         (r"/socket.io/socket.io.js", SocketIOHandler),
         (r"/js/(.*)", JavascriptHandler),
         (r"/css/(.*)", StylesheetHandler),
         (r"/img/(.*)", ImageHandler),
         (r"/vendor/(.*)", VendorHandler)]),
    socket_io_port = 6058)

# Start server
if __name__ == "__main__":
    sys.stdout.write("[Argonaut] Starting server...\n")
    sys.stdout.flush()
    SocketServer(app)
