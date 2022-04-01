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
export FLUENT_VERSION="1.9.0"
export FLUENT_CONF_HOME="/config"
export FUNBUCKS_HOME="${FUNBUCKS_HOME}"

# Run in foreground, passing vars
#
# Example mounts for logs:
# -v "/mnt/c/tmp/logs/apache:/tmp/logs/apache"
# -v "/mnt/c/tmp/logs/dispatch/dispatch-api-war:/tmp/logs/dispatch/dispatch-api-war"
podman run --rm \
    -v "${FUNBUCKS_HOME}/output:/config" \
    -v "/mnt/c/tmp/logs/wfdm/wfdm-document-management-api:/data/WFDM/wfdm-document-management-api" \
    -v "/proc/stat:/proc/stat:ro" \
    -e FLUENT_VERSION=${FLUENT_VERSION} \
    -e HOST_* \
    -e FLUENT_CONF_HOME=${FLUENT_CONF_HOME} \
    --network=host \
    fluent/fluent-bit:${FLUENT_VERSION} /fluent-bit/bin/fluent-bit -c /config/fluent-bit.conf
