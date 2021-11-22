#!/bin/bash

curl -s -X POST -H "Content-Type: application/json" -d @metric-cpu.json localhost:3000
