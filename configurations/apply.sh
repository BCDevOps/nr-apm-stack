#!/usr/bin/env bash
set -Eeuo pipefail
#set -x

source .env
# The following variables must be set in the .env file
: "$ELASTICSEARCH_URL"
: "$ELASTICSEARCH_USERNAME"
: "$ELASTICSEARCH_PASSWORD"
: "$KIBANA_URL"

#curl -kSsL --user "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
#    -XGET -H 'Content-Type: application/json' \
#    "${ELASTICSEARCH_URL}/_cluster/health?pretty" -o /dev/null

curl -kSsL --user "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" -w "\n" \
    -X PUT -H 'Content-Type: application/json' --data-binary @api-index-template.json \
    "${ELASTICSEARCH_URL}/_template/logs-access"


curl -kSsL --user "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" -w "\n" \
    -X PUT -H 'Content-Type: application/json' --data-binary @api-pipeline.json \
    "${ELASTICSEARCH_URL}/_ingest/pipeline/filebeat-7.7.0-apache-access-pipeline"

#set -x
#curl  -kSsL -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
#      -X GET -H "Content-Type: application/json" -H "kbn-xsrf:true" \
#      "${KIBANA_URL}/api/saved_objects/index-pattern/logs-access-*" | jq -M '.' > api-index-pattern.json
echo "POST"
curl  -kSsL -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
      -X POST -H "Content-Type: application/json" -H "kbn-xsrf:true" --data-binary @api-index-pattern.json \
      "${KIBANA_URL}/api/saved_objects/index-pattern/logs-access-*" -o /dev/null

echo "PUT"
curl  -kSsL -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
      -X PUT -H "Content-Type: application/json" -H "kbn-xsrf:true" --data-binary @api-index-pattern.json \
      "${KIBANA_URL}/api/saved_objects/index-pattern/logs-access-*" -o /dev/null

echo "Import Visializations"
curl  -kSsL -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
      -X POST -H "kbn-xsrf:true" --form file=@visualizations.ndjson \
      "${KIBANA_URL}/api/saved_objects/_import"

echo "Import Dashboard"
curl  -kSsL -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
      -X POST -H "kbn-xsrf:true" --form file=@dashboard.ndjson \
      "${KIBANA_URL}/api/saved_objects/_import"

echo "done"