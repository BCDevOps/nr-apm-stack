#!/bin/bash

curl -s -X POST -H "Content-Type: application/json" -d @app-dispatch-api-war-catalina-single.json localhost:3000
