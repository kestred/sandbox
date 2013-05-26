from socketio.namespace import BaseNamespace
from socketio.mixins import BroadcastMixin, RoomsMixin
import cgi

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
    def announcement(self, message):
        self.emit('announcement', {'message': message})
        self.emit_to_room('main', 'announcement', {'message': message})

    def on_authenticate(self, data):
        core = Chat.getInstance().core
        if(core.validIdPair(data)):
            client = core.clients[data['publicId']]
            client.sockets['chat'] = self
            self.socket.session['client'] = client
            self.join('main') # Join the main room
            self.announcement(client.name + ' has joined.');

    def on_pm(self, data):
        core = Chat.getInstance().core
        if('client' in self.socket.session
           and 'targetId' in data
           and 'message' in data
           and data['targetId'] in core.clients
           and 'chat' in core.clients[data['targetId']].sockets):
            senderId = self.socket.session['client'].publicId
            cleanMessage = cgi.escape(data['message'], True)
            targetSocket = core.clients[data['targetId']].sockets['chat']
            targetSocket.emit('pm', {'senderId': senderId
                                   , 'message': cleanMessage})

    def recv_message(self, message):
        if 'client' in self.socket.session:
            core = Chat.getInstance().core
            playerId = self.socket.session['client'].publicId
            cleanMessage = cgi.escape(message, True)
            self.emit('chat', {'room': 'main'
                             , 'playerId': playerId
                             , 'message': cleanMessage})
            self.emit_to_room('main', 'chat', {'room': 'main'
                                             , 'playerId': playerId
                                             , 'message': cleanMessage})
