# Import library modules
from socketio.namespace import BaseNamespace
from socketio.mixins import BroadcastMixin

# Import local modules
from client import Client
import util

class Core:
    instance = None
    def __init__(self, app):
        Core.instance = self
        self.app = app
        self.clients = {}
        app.hookNamespace('/core', CoreNamespace)

    def validIdPair(self, data):
        if not 'publicId' in data:
            return False
        if not 'privateId' in data:
            return False
        if not util.validPublicId(data['publicId']):
            return False
        if not util.validPrivateId(data['privateId']):
            return False
        if not data['publicId'] in self.clients:
            return False
        client = self.clients[data['publicId']]
        return client.privateId == data['privateId']

    def stderr(self, message, client):
        socket = None  # TODO: Default to gamemaster
        if hasattr(client, 'sockets'):
            socket = client.sockets['core']
        else:
            socket = self.clients[client].sockets['core']
        Util.socketError(socket, message)

    @staticmethod
    def getInstance():
        return Core.instance

class CoreNamespace(BaseNamespace, BroadcastMixin):
    def recv_connect():
        self.emit('ready')

    def on_authenticate(self, data):
        core = Core.getInstance()

        # Check Public ID
        if not 'publicId' in data:
            util.socketError(self, 'Missing public key.')
            return
        publicId = data['publicId']
        if not util.validPublicId(publicId):
            util.socketError(self, 'Invalid public key.')
            return

        # Handle reconnection
        if publicId in core.clients:
            if not core.validIdPair(data):
                self.emit('authenticate', {'status': 'fail'})
                return
            client = core.clients[publicId]
            client.sockets['core'] = self
            self.socket.session['client'] = client
            self.emit('authenticate', {'status': 'success'})
            return

        # Distribute privateId
        secret = None
        if('privateId' in data
           and util.validPrivateId(kwargs['privateId'])):
            secret = data['privateId']
        else:
            secret = Util.randomKey(32)
        self.client = Client(publicId, secret)
        self.client.sockets['core'] = self
        core.clients[publicId] = self.client
        self.emit('authenticate', {'status': 'success'
                                 , 'privateId': secret})

    def on_sessionInfo(self):
        core = Core.getInstance()
        clients = core.clients.keys()
        if self.client.publicId in clients:
            clients.remove(self.client.publicId)
        self.emit('sessionInfo', {'players': clients
                                , 'gamemaster': None})

    def on_ready(self):
        core = Core.getInstance()
        playerId = self.socket.session['client'].publicId
        self.broadcast_event('player-joined', {'id': playerId})

   # def on_close(self):
   #     core = Core.getInstance()
   #     if 'client' in self.socket.session:
   #         playerId = self.socket.session['client'].publicId
   #         if publicId in core.clients:
   #             del core.clients[publicId]
   #         for clientId in core.clients:
   #             client = core.clients[clientId]
   #             client.sockets['core'].emit('player-left'
   #                                     , {'id': publicId})
