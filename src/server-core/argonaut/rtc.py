from tornadio2 import SocketConnection, event

class RTCConnection(SocketConnection):
    @event
    def syn(self, data):
        pass

    @event
    def ack(self, data):
        pass

    @event
    def ice(self, data):
        pass
