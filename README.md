Argonaut Tabletop
========

An open source engine for tabletop playing RPGs for the web.

Argonaut is being developed as a no-download application (no plugins, no exe/jar) to play tabletop Role-Playing Games long-distance without losing out on the funnest parts of the games. Additionally, its intended to facilitate easy math in math or dice heavy tabletop role-playing games.

Initial development will be focused on the core architecture and the PDQ# system, follow by the Shadowrun system.
The core architecture is intended to be Game-System and Setting neutral, and instead be highly extensible to support any specific ruleset and setting.

## Installing the Environment

Argonaut primarily uses the nodejs environment, and has a number of required packages.
* Required Packages: Express, Socket.io, & Optimist
* Support for a Python/Tornado environment is an option, but it needs more contributors!

On Ubuntu machines, just clone the repo and run the setup script:

**For normal use**
```
git clone git://github.com/kestred/argonaut-tabletop.git argonaut
argonaut/tools/setup-ubuntu.sh --production
```
**For development**
```
git clone git://github.com/kestred/argonaut-tabletop.git argonaut
argonaut/tools/setup-ubuntu.sh --development
```

## Compiling & Running Argonaut

With the repository cloned Argonaut can be compiled and run manually:
```
tools/compile.sh
node build/server.js
```

While developing it is often convenient to autorun the server:
```
tools/compile.sh --clean --debug --autorun
```
