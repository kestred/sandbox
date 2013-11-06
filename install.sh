#!/bin/sh

mkdir -p /usr/local/lib/easyirc
cp src/easyirc.py /usr/local/lib/easyirc/
ln -s /usr/local/lib/easyirc/easyirc.py /usr/local/bin/easyirc

cp man/easyirc.1 /usr/share/man/
