#!/bin/sh

mkdir -p /usr/local/lib/easyirc
cp -r src/* /usr/local/lib/easyirc/
ln -s /usr/local/lib/easyirc/easyirc.py /usr/local/bin/easyirc

cp man/easyirc.1 /usr/share/man/man1
gzip /usr/share/man/man1/easyirc.1
