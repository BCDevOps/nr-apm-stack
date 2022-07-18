#!/bin/bash

# Run ./podman-build.sh first!

# Run in foreground, passing vars

podman run --rm \
    --network=host \
	  --security-opt label=disable \
    nr-esp

# podman run --rm \
#     --network=host \
#     --security-opt label=disable \
#     -e ECHOSERVER_PORT=3000 erikcc02/echo-server