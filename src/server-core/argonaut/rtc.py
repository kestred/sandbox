from socketio.namespace import BaseNamespace
from socketio.mixins import BroadcastMixin

class WRTC:
    instance = None
    def __init__(self, app, core):
        WRTC.instance = self
        self.app = app
        self.core = core
        app.hookNamespace('/rtc', RTCNamespace)

    @staticmethod
    def getInstance():
        return WRTC.instance

class RTCNamespace(BaseNamespace, BroadcastMixin):
    def on_authenticate(self, data):
        core = WRTC.getInstance().core
        if(core.validIdPair(data)):
            client = core.clients[data['publicId']]
            client.sockets['rtc'] = self
            self.socket.session['client'] = client

    def on_syn(self, data):
        core = WRTC.getInstance().core
        if('targetId' in data
           and data['targetId'] in core.clients):
            callerId = self.socket.session['client'].publicId
            target = core.clients[data['targetId']].sockets['rtc']
            target.emit('syn', {'callerId': callerId
                              , 'callerDesc': data['callerDesc']})

    def on_ack(self, data):
        core = WRTC.getInstance().core
        if('targetId' in data
           and data['targetId'] in core.clients):
            calleeId = self.socket.session['client'].publicId
            target = core.clients[data['targetId']].sockets['rtc']
            target.emit('ack', {'calleeId': calleeId
                              , 'calleeDesc': data['calleeDesc']})

    def on_ice(self, data):
        core = WRTC.getInstance().core
        candidateId = self.socket.session['client'].publicId
        self.broadcast_event('ice', {'candidateId': candidateId
                                   , 'candidate': data['candidate']})
