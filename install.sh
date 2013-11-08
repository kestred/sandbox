#!/bin/sh

# Add the libraries to /usr/local/lib
mkdir -p /usr/local/lib/potion
cp -r src/* /usr/local/lib/potion/

# Add the tool to /usr/local/bin
ln -s /usr/local/lib/potion/irc-potion.py /usr/local/bin/potion

# Create work directory
mkdir -p /tmp/potion/man1

# Prepare the man files
cp man/*.1 /tmp/potion/man1
gzip /tmp/potion/man1/*.1

# Add the man files to /usr/share/man
cp /tmp/potion/man1/*.1 /usr/share/man/man1

# Cleanup
rm -r /tmp/potion