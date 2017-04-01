#!/bin/sh

PRG=$(readlink -f $0)
PRG_DIR=`dirname "$PRG"`

MODULES=`find ./lib -maxdepth 1 -type d`
for d in $MODULES; do
  if [ -f $d/package.json ] ;then
  echo "install $d"
   npm install $d
fi
done

