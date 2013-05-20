import os, binascii, re

def socketError(socket, message):
    errorMessage = '[serverError]' + message
    socket.emit('error', None, {'message': errorMessage})

def randomKey(length):
    return binascii.b2a_hex(os.urandom(length/2))

def validPrivateId(privateId):
    result = re.match(r"^[a-f0-9]{32}$", privateId)
    if result is not None:
        return True
    return False

def validPublicId(publicId):
    result = re.match(r"^[a-f0-9]{16}$", publicId)
    if result is not None:
        return True
    return False
