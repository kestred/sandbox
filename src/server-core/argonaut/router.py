from tornadio2 import SocketConnection, TornadioRouter

class SocketRouter(SocketConnection):
    @staticmethod
    def addEndpoint(route, handler):
        SocketRouter.__endpoints__[route] = handler

class ArgonautRouter(TornadioRouter):
    def __init__(self
               , user_settings = dict()
               , namespace = 'socket.io'
               , io_loop = None):
        TornadioRouter.__init__(self
                              , SocketRouter
                              , user_settings
                              , namespace
                              , io_loop)

    def addEndpoint(self, route, handler):
        SocketRouter.addEndpoint(route, handler)
