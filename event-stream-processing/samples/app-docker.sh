#!/bin/bash

# Host Metadata - OS
#
export HOST_OS_KERNEL="$(uname -r)"
export HOST_OS_TYPE="$(uname)"

# Host Metadata - General
#
export HOST_ARCH="$(uname -m)"
export HOST_HOSTNAME="$(hostname -s)"
export HOST_ID="$(hostname -f)"
export HOST_NAME="${HOST_HOSTNAME}"
export HOST_DOMAIN="$(echo ${HOST_HOSTNAME#[[:alpha:]]*.})"

# Run in foreground, passing vars
#
# Example mounts for logs:
# -v "/mnt/c/tmp/logs/apache:/tmp/logs/apache"
# -v "/mnt/c/tmp/logs/dispatch/dispatch-api-war:/tmp/logs/dispatch/dispatch-api-war"
docker run --rm \
    -v "${PWD}/app-conf:/config" \
    -v "/mnt/c/tmp/logs/dispatch/dispatch-api-war:/tmp/logs/dispatch/dispatch-api-war" \
    -v "/proc/stat:/proc/stat:ro" \
    -e FLUENT_VERSION=1.8.7 \
    -e HOST_* \
    --network=host \
    fluent/fluent-bit:1.8.7 /fluent-bit/bin/fluent-bit -c /config/fluent-bit.conf
