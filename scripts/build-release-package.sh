#!/bin/bash

# Get current path of this file, no matter how it was called.
# @See: http://stackoverflow.com/a/246128/59087
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

# Build release package.
echo "Building release package..."
cd $DIR/../foundation-database && make
#tar czf $DIR/../packages/nodejsshim.gz -C "$DIR/../database/" source
echo "Node.js Shim package available at:"
echo "$DIR/../packages/nodejsshim.gz"
