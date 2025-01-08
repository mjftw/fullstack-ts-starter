#!/bin/bash

if [ -z "$ENTRYPOINT_JS" ]; then
  echo "Error: ENTRYPOINT_JS environment variable is not set"
  exit 1
fi

#
# Could perform tasks such as database migrations here
#

# Entrypoint JS is general so as to allow different entrypoints to be run on the same image
exec node "$ENTRYPOINT_JS"
