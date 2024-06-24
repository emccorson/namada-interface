#!/usr/bin/env bash
#  Creates a ZIP file of Namadillo for publishing.
#  Usage:
#      ./scripts/package.sh <version>

if [[ -z "$1" ]]
then
    echo "no version string specified"
    exit 1
fi

VERSION="$1"
DIR="namadillo-$VERSION"

mkdir $DIR
cp -r dist $DIR
cp README-dist.md $DIR/README.md
cp CHANGELOG.md $DIR

zip -r $DIR $DIR
