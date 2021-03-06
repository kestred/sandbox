# Import library modules
from gevent import monkey; monkey.patch_all()
from socketio import socketio_manage
from socketio.server import SocketIOServer
import sys, os, re, argparse, time, select

# Import local modules
from argonaut.httphandlers import *
from argonaut.core import Core
from argonaut.chat import Chat
from argonaut.rtc import WRTC

# Switch to working directory
SCRIPT = os.path.realpath(__file__)
ROOT = os.path.dirname(SCRIPT)
os.chdir(ROOT)

class Application(object):
    def __init__(self):
        self.buffer = []
        self.request = { 'nicknames': [], }
        self.namespaces = {}

    # Serve static files
    def __call__(self, environ, start_response):
        path = environ['PATH_INFO'].strip('/')

        if not path: # Serve index
            return getIndex(start_response)

        if path.startswith("socket.io"):
            if(path == 'socket.io/socket.io.js'
               or path == 'socket.io/websocket.swf'):
                return getFile(start_response, path)
            socketio_manage(environ, self.namespaces, self.request)

        pathExp = r"^(js|vendor|css|img|font)/" # Folders
        pathExp += r"[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*\.[a-z]{2,4}$"
        if re.match(pathExp, path):
            return getFile(start_response, path)
        else:
            return error404(start_response)

    # Socket.IO attachment
    def hookNamespace(self, namespace, handler):
        self.namespaces[namespace] = handler;

# Setup Argonaut
app = Application()
core = Core(app)
chat = Chat(app, core)
wrtc = WRTC(app, core)

colors = {
    'blue'    : '\x1B[34m'
  , 'cyan'    : '\x1B[36m'
  , 'green'   : '\x1B[32m'
  , 'magenta' : '\x1B[35m'
  , 'red'     : '\x1B[31m'
  , 'yellow'  : '\x1B[33m'
}
def color(string, colorName):
    return colors[colorName] + string + '\x1B[39m'

# Non Blocking raw_input for use with eventlets
def raw_input(message):
    sys.stdout.write(message)
    sys.stdout.flush()

    select.select([sys.stdin], [], [])
    return sys.stdin.readline()
   
if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description = 'Starts an Argonaut tabletop gaming server.')
    parser.add_argument('--debug', '-d', action = 'store_true'
      , help = 'Sends logging information to stderr')
    parser.add_argument('--log-file', '-L', dest = 'log', metavar="path"
      , help = 'Sets log file location. (Default: /dev/null)'
      , nargs = '?', default = '/dev/null', const = ROOT + '/log')
    args = parser.parse_args()
    if args.debug is False:
        if args.log == '/dev/null':
            sys.stderr = open(os.devnull, 'w')
        else:
            sys.stderr = open(args.log, 'w')

    options = {'resource': 'socket.io'
             , 'policy_server': True
             , 'policy_listener': ('0.0.0.0', 10843)}

    # Start server
    sys.stdout.write(color('Argonaut - ', 'cyan'))
    sys.stdout.write(color('Starting server...\n', 'blue'))
    sys.stdout.write(color('   Ports - ', 'cyan'))
    sys.stdout.write(color('App: ', 'blue') + color('6058  ', 'red'))
    sys.stdout.write(color('Flash: ', 'blue') + color('843\n', 'red'))
    sys.stdout.flush()
    server = SocketIOServer(('0.0.0.0', 6058), app, **options)
    server.start()

    # Start server-side prompt
    prompt = color('Argonaut', 'cyan') + color('$ ', 'blue')
    while True:
        cmd = raw_input(prompt)
        if cmd.startswith('exit'):
           server.stop()
           exit(0)