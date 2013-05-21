import os, errno, sys

MIME = {
    '.js'  : 'text/javascript'
  , '.css' : 'text/css'
  , '.html': 'text/html'
  , '.swf' : 'application/x-shockwave-flash'
  , '.bmp' : 'image/bmp'
  , '.png' : 'image/png'
  , '.gif' : 'image/gif'
  , '.tif' : 'image/tif'
  , '.tiff': 'image/tiff'
  , '.jpg' : 'image/jpeg'
  , '.jpeg': 'image/jpeg'
  , '.jpe' : 'image/jpe'
}

def logIOError(ioex, filepath):
    sys.stderr.write('[IOError - ' + str(ioex.errno) + '] ')
    sys.stderr.write(os.strerror(ioex.errno) + ":\n")
    sys.stderr.write("\t(" + os.path.abspath(filepath) + ")\n")

def error404(response):
    response('404 Not Found', [])
    return ""

def error500(response):
    response('500 Internal Server Error', [])
    return ""

def getFile(response, path):
    try:
        ext = os.path.splitext(path)[1]
        data = open(path).read()
    except IOError, ioex:
        logIOError(ioex, path)
        return error404(response)
    except Exception:
        return error500(response)
    response('200 OK', [('Content-Type', MIME.get(ext, 'text/html'))])
    return [data]

def getIndex(response):
    return getFile(response, './client.html')
