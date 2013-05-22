from socketio.namespace import BaseNamespace
from socketio.mixins import BroadcastMixin, RoomsMixin

class Chat:
    instance = None
    def __init__(self, app, core):
        Chat.instance = self
        self.app = app
        self.core = core
        app.hookNamespace('/chat', ChatNamespace)

    @staticmethod
    def getInstance():
        return Chat.instance

class ChatNamespace(BaseNamespace, BroadcastMixin, RoomsMixin):
    def on_authenticate(self, data):
        core = Chat.getInstance().core
        if(core.validIdPair(data)):
            client = core.clients[data['publicId']]
            client.sockets['chat'] = self
            self.socket.session['client'] = client
            self.join('main') # Join the main room

    def recv_message(self, message):
        if 'client' in self.socket.session:
            core = Chat.getInstance().core
            playerId = self.socket.session['client'].publicId
            self.emit_to_room('main', 'chat', {'room': 'main'
											 , 'playerId': playerId
                                             , 'message': message})
