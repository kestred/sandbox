from tornadio2 import SocketConnection, event

class WRTC:
    instance = None
    def __init__(self, router, core):
        WRTC.instance = self
        self.router = router
        self.core = core
        router.addEndpoint('/rtc', RTCConnection)

    @staticmethod
    def getInstance():
        return WRTC.instance

class RTCConnection(SocketConnection):
    def on_event(self, event, args = None, kwargs = {}):
        # Handle authenticate event
        if event == 'authenticate':
            core = WRTC.getInstance().core
            if(core.validIdPair(kwargs)):
                core.clients[kwargs['publicId']].sockets['rtc'] = self
                self.client = core.clients[kwargs['publicId']]

        # Handle RTC syn event
        elif event == 'syn':
            core = WRTC.getInstance().core
            if('targetId' in kwargs
               and kwargs['targetId'] in core.clients):
                target = core.clients[kwargs['targetId']].sockets['rtc']
                target.emit('syn', {'callerId': self.client.publicId
                                  , 'callerDesc': kwargs['callerDesc']})

        #Handle RTC ack event
        elif event == 'ack':
            core = WRTC.getInstance().core
            if('targetId' in kwargs
               and kwargs['targetId'] in core.clients):
                target = core.clients[kwargs['targetId']].sockets['rtc']
                target.emit('ack', {'calleeId': self.client.publicId
                                  , 'calleeDesc': kwargs['calleeDesc']})

        #Handle RTC ice event
        elif event == 'ice':
            core = WRTC.getInstance().core
            for clientId in core.clients:
                client = core.clients[clientId]
                if 'rtc' in client.sockets:
                    client.sockets['rtc'].emit('ice'
                                   , {'candidateId': client.publicId
                                    , 'candidate': kwargs['candidate']})
