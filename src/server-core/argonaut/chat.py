from tornadio2 import SocketConnection, event

class Chat:
    instance = None
    def __init__(self, router, core):
        Chat.instance = self
        self.router = router
        self.core = core
        router.addEndpoint('/chat', ChatConnection)

    @staticmethod
    def getInstance():
        return Chat.instance
        
class ChatConnection(SocketConnection):
    def on_message(self, message):
        pass
