go.xmpp - a Complete XMPP Package
-------------------------------

> ## WARNING ##
> Code in this repository is incomplete. Work hasn't been active since Aug 2013.
> If you would like to use this as a base for your own work, or contribute to this project
> then I am readily available on GitHub and would be happy to continue work on the project.


Package xmpp implements the XMPP protocol as defined in RFC 6120, 6121, 6122 and common extensions, with interopability to the RFC 3920... specifcation.

The package provides a complete XMPP API to build extensible XMPP Clients and Servers.
Simple client and server implementations are provided in the client and server subpackages.

### Purpose ###
This package is heavily inspired by both "code.gooogle.com/p/goexmpp" and "github.com/mattn/go-xmpp".
While both good packages in their own rights, both are RFC 3920 client-only implementations with client-oriented design.

This repository (arguably a fork of "code.google.com/p/goexmpp") was started to provide a clean XMPP implmentation for the [gibber server](https://github.com/kestred/gibber)

### Contributing ###
Bugs, Feature Requests, and Discussions are all excepted in the projects [Issues](https://github.com/kestred/go.xmpp).

Pull requests for this project should include:

 - Code in pull request should have been formatted by `gofmt`
 - Code in pull request should generally follow golang [best practices](http://talks.golang.org/2013/bestpractices.slide)
 - Code in pull request should update old or make new doc-comments if necessary.

Also its recommended to update the AUTHORS file in a pull-request by a first time contributor.
