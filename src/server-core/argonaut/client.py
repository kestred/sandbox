from util import validPrivateId

class Client:
    def __init__(self, publicId, privateId):
        self.publicId = publicId
        self.privateId = privateId
        self.sockets = {}

    def authenticate(self, privateId):
        if not validPrivateId(privateId):
            return False
        return self.privateId == privateId
