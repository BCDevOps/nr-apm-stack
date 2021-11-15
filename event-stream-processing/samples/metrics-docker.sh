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
docker run --rm \
	-v "${PWD}/metrics-conf:/config" \
	-v "/proc/stat:/proc/stat:ro" \
	-e FLUENT_VERSION=1.8.9 \
	-e FLUENT_LABEL_ENV=undefined \
	-e HOST_* \
	--network=host \
	fluent/fluent-bit /fluent-bit/bin/fluent-bit -c /config/fluent-bit.conf

