# Import library modules
from tornadio2 import SocketServer
from tornado import web

# Import local modules
from argonaut.router import ArgonautRouter
from argonaut.httphandlers import *
from argonaut.core import Core
from argonaut.chat import Chat
from argonaut.rtc import WRTC

# Serve static files
router = ArgonautRouter()
app = web.Application(
    router.apply_routes(
        [(r"/", IndexHandler),
         (r"/socket.io/socket.io.js", SocketIOHandler),
         (r"/js/(.*)", JavascriptHandler),
         (r"/css/(.*)", StylesheetHandler),
         (r"/img/(.*)", ImageHandler),
         (r"/vendor/(.*)", VendorHandler)]),
    socket_io_port = 6058)

# Setup Argonaut
core = Core(router)
chat = Chat(router, core)
wrtc = WRTC(router, core)

# Start server
if __name__ == "__main__":
    sys.stdout.write("[Argonaut] Starting server...\n")
    sys.stdout.flush()
    SocketServer(app)
