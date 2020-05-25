#!/usr/bin/env bash
set -Eeuo pipefail
#set -x

source .env
# The following variables must be set in the .env file
: "$ES_URL"
: "$ES_USERNAME"
: "$ES_PASSWORD"
: "$KIBANA_URL"

#curl -kSsL --user "${ES_USERNAME}:${ES_PASSWORD}" \
#    -XGET -H 'Content-Type: application/json' \
#    "${ES_URL}/_cluster/health?pretty" -o /dev/null

curl -kSsL --user "${ES_USERNAME}:${ES_PASSWORD}" -w "\n" \
    -X PUT -H 'Content-Type: application/json' --data-binary @api-index-template.json \
    "${ES_URL}/_template/logs-access"


curl -kSsL --user "${ES_USERNAME}:${ES_PASSWORD}" -w "\n" \
    -X PUT -H 'Content-Type: application/json' --data-binary @api-pipeline.json \
    "${ES_URL}/_ingest/pipeline/filebeat-7.6.2-apache-access-default"

#set -x
#curl  -kSsL -u "${ES_USERNAME}:${ES_PASSWORD}" \
#      -X GET -H "Content-Type: application/json" -H "kbn-xsrf:true" \
#      "${KIBANA_URL}/api/saved_objects/index-pattern/logs-access-*" | jq -M '.' > api-index-pattern.json
echo "POST"
curl  -kSsL -u "${ES_USERNAME}:${ES_PASSWORD}" \
      -X POST -H "Content-Type: application/json" -H "kbn-xsrf:true" --data-binary @api-index-pattern.json \
      "${KIBANA_URL}/api/saved_objects/index-pattern/logs-access-*" -o /dev/null

echo "PUT"
curl  -kSsL -u "${ES_USERNAME}:${ES_PASSWORD}" \
      -X PUT -H "Content-Type: application/json" -H "kbn-xsrf:true" --data-binary @api-index-pattern.json \
      "${KIBANA_URL}/api/saved_objects/index-pattern/logs-access-*" -o /dev/null

echo "done"