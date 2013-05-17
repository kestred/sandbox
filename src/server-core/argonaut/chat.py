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
    def on_event(self, event, args = None, kwargs = {}):
        # Handle authenticate event
        if event == 'authenticate':
            core = Chat.getInstance().core
            if(core.validIdPair(kwargs)):
                core.clients[kwargs['publicId']].sockets['chat'] = self
                self.client = core.clients[kwargs['publicId']]

    def on_message(self, message):
        if hasattr(self, 'client'):
            core = Chat.getInstance().core
            for clientId in core.clients:
                client = core.clients[clientId]
                if 'chat' in client.sockets:
                    client.sockets['chat'].emit('chat'
                                   , {'playerId': self.client.publicId
                                    , 'message': message})
