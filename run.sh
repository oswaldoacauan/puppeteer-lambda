#!/bin/bash -e

source env.sh

# export DISPLAY=:0.0
url=`node ./run.js 2>/dev/null`
echo "'$url',"

