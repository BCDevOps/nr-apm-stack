#!/usr/bin/env bash

ecs_verion=1.12

curl -L -qq https://github.com/elastic/ecs/archive/refs/heads/${ecs_verion}.zip --output ecs.zip

unzip -qq -j -o ecs.zip "ecs-${ecs_verion}/generated/elasticsearch/component/*" -d ecs_${ecs_verion}

rm ecs.zip