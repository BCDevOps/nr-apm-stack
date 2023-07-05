terraform {
  required_providers {
    elasticsearch = {
      source = "phillbaker/elasticsearch"
      version = "2.0.7"
    }
  }
}

# Create jwt token monitor
resource "elasticsearch_opensearch_monitor" "jwt_token_monitor" {
  body = <<EOF
{
   "name": "${var.jwt_token_monitor.name}",
   "type": "monitor",
   "monitor_type": "bucket_level_monitor",
   "enabled": true,
   "schedule": {
      "period": {
         "unit": "HOURS",
         "interval": 24
      }
   },
   "inputs": [
      {
         "search": {
            "indices": [
               "nrm-audit-broker"
            ],
            "query": {
               "size": 0,
               "query": {
                  "bool": {
                     "must": [
                        {
                            "range": {
                                "@timestamp": {
                                    "from": "{{period_end}}||-7d",
                                    "to": "{{period_end}}",
                                    "include_lower": true,
                                    "include_upper": true,
                                    "format": "epoch_millis",
                                    "boost": 1
                                }
                            }
                        },
                        {
                           "term": {
                              "event.action": {
                                 "value": "intention-open",
                                 "boost": 1
                              }
                           }
                        },
                        {
                           "term": {
                              "service.environment": {
                                 "value": "production",
                                 "boost": 1
                              }
                           }
                        }
                     ],
                     "filter": [
                        {
                           "script": {
                              "script": {
                                 "source": "long currentDateSecond = (new Date().getTime())/1000; doc.containsKey('auth.exp') && doc['auth.exp'].size() > 0 && (doc['auth.exp'].value - currentDateSecond) < 259200;",
                                 "lang": "painless"
                              },
                              "boost": 1
                           }
                        }
                     ],
                     "adjust_pure_negative": true,
                     "boost": 1
                  }
               },
               "_source": {
                  "includes": [],
                  "excludes": []
               },
               "aggregations": {
                  "jwt_token_expiring_or_expired": {
                     "composite": {
                        "size": 10,
                        "sources": [
                           {
                              "client_id": {
                                 "terms": {
                                    "field": "auth.client_id",
                                    "missing_bucket": false,
                                    "order": "asc"
                                 }
                              }
                           },
                           {
                              "jti": {
                                 "terms": {
                                    "field": "auth.jti",
                                    "missing_bucket": false,
                                    "order": "asc"
                                 }
                              }
                           }
                        ]
                     }
                  }
               }
            }
         }
      }
   ],
   "triggers": [
      {
         "bucket_level_trigger": {
            "id": "${var.jwt_token_monitor.bucket_level_trigger_id}",
            "name": "JWT token expiring or expired",
            "severity": "${var.jwt_token_monitor.severity}",
            "condition": {
               "buckets_path": {
                  "count_var": "_count"
               },
               "parent_bucket_path": "jwt_token_expiring_or_expired",
               "script": {
                  "source": "params.count_var > 0",
                  "lang": "painless"
               },
               "gap_policy": "skip"
            },
            "actions": [
               {
                  "id": "${var.jwt_token_monitor.action_id}",
                  "name": "Notify product team of expiring or expired JWT tokens",
                  "destination_id": "${var.destination_id}",
                  "message_template": {
                     "source": "The following JWT tokens are expiring or expired:\n{{#ctx.newAlerts}}\n  - client_id,jti: {{bucket_keys}}\n{{/ctx.newAlerts}}\n{{#ctx.dedupedAlerts}}\n  - client_id,jti: {{bucket_keys}}\n{{/ctx.dedupedAlerts}}",
                     "lang": "mustache"
                  },
                  "throttle_enabled": false,
                  "subject_template": {
                     "source": "JWT token expiring or expired",
                     "lang": "mustache"
                  },
                  "action_execution_policy": {
                     "action_execution_scope": {
                        "per_alert": {
                           "actionable_alerts": [
                              "DEDUPED",
                              "NEW"
                           ]
                        }
                     }
                  }
               }
            ]
         }
      }
   ],
   "data_sources": {
        "alerts_history_index": ".opendistro-alerting-alert-history-write",
        "alerts_history_index_pattern": "<.opendistro-alerting-alert-history-{now/d}-1>",
        "alerts_index": ".opendistro-alerting-alerts",
        "findings_enabled": false,
        "findings_index": ".opensearch-alerting-finding-history-write",
        "findings_index_pattern": "<.opensearch-alerting-finding-history-{now/d}-1>",
        "query_index": ".opensearch-alerting-queries",
        "query_index_mappings_by_type": {}
    },
    "owner": "alerting"
}
EOF
}