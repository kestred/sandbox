from tornadio2 import SocketConnection, event
import os, binascii, re, sys

class Util:
    @staticmethod
    def socketError(socket, message):
        errorMessage = '[serverError]' + message
        socket.emit('error', None, {'message': errorMessage})

    @staticmethod
    def randomKey(length):
        return binascii.b2a_hex(os.urandom(length/2))

    @staticmethod
    def validPrivateId(privateId):
        result = re.match(r"^[a-f0-9]{32}$", privateId)
        if result is not None:
            return True
        return False

    @staticmethod
    def validPublicId(publicId):
        result = re.match(r"^[a-f0-9]{16}$", publicId)
        if result is not None:
            return True
        return False

class Client:
    def __init__(self, publicId, privateId):
        self.publicId = publicId
        self.privateId = privateId
        self.sockets = {}

    def authenticate(self, privateId):
        if not Util.validPrivateId(privateId):
            return False
        return self.privateId == privateId

class Core:
    instance = None
    def __init__(self, router):
        Core.instance = self
        self.router = router
        self.clients = {}
        router.addEndpoint('/core', CoreConnection)

    def validIdPair(self, data):
        if not 'publicId' in data:
            return False
        if not 'privateId' in data:
            return False
        if not Util.validPublicId(data['publicId']):
            return False
        if not Util.validPrivateId(data['privateId']):
            return False
        if not data['publicId'] in self.clients:
            return False
        client = self.clients[data['publicId']]
        return client.privateId == data['privateId']

    def stderr(self, message):
        socket = None  # TODO: Default to gamemaster
        if(hasattr(client, 'sockets')):
            socket = client.sockets['core']
        else:
            socket = self.clients[client].sockets['core']
        Util.socketError(socket, message)

    @staticmethod
    def getInstance():
        return Core.instance

class CoreConnection(SocketConnection):
    def on_open(self, request):
        self.emit('ready')

    def on_event(self, event, args = None, kwargs = {}):
        # Handle authenticate event
        if event == 'authenticate':
            core = Core.getInstance()
            if not 'publicId' in kwargs:
                Util.socketError(self, 'Missing public key.')
                return

            publicId = kwargs['publicId']
            if not Util.validPublicId(publicId):
                Util.socketError(self, 'Invalid public key.')
                return
            if publicId in core.clients:
                if not core.validIdPair(kwargs):
                    self.emit('authenticate', {'status': 'fail'})
                    return
                client = core.clients[publicId]
                client.sockets['core'] = self
                self.emit('authenticate', {'status': 'success'})
                return

            secret = None
            if('privateId' in kwargs
               and Util.validPrivateId(kwargs['privateId'])):
                secret = kwargs['privateId']
            else:
                secret = Util.randomKey(32)
            self.client = Client(publicId, secret)
            self.client.sockets['core'] = self
            core.clients[publicId] = self.client
            sys.stderr.write('AUTHENTICATE: '+publicId+'\n')
            self.emit('authenticate', {'status': 'success'
                                     , 'privateId': secret})

        # Handle sessionInfo event
        elif event == 'sessionInfo':
            core = Core.getInstance()
            clients = core.clients.keys()
            if self.client.publicId in clients:
                clients.remove(self.client.publicId)
            self.emit('sessionInfo', {'players': clients
                                    , 'gamemaster': None})

        # Handle ready event
        elif event == 'ready':
            core = Core.getInstance()
            for clientId in core.clients:
                client = core.clients[clientId]
                client.sockets['core'].emit('player-joined'
                                         , {'id': self.client.publicId})

    def on_close(self):
        core = Core.getInstance()
        if hasattr(self, 'client'):
            publicId = self.client.publicId
            if publicId in core.clients:
                del core.clients[publicId]
            for clientId in core.clients:
                client = core.clients[clientId]
                client.sockets['core'].emit('player-left'
                                          , {'id': publicId})
