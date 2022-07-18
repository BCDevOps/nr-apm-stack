#!/bin/bash

cd "${0%/*}"

podman build -t nr-esp .
