terraform {
  required_providers {
    elasticsearch = {
      source = "phillbaker/elasticsearch"
      version = "2.0.2"
    }
  }
}

# Create app alert monitor
resource "elasticsearch_opensearch_monitor" "app_monitor" {
  body = <<EOF
{
    "type": "monitor",
    "name": "${var.app_monitor.app}-${var.app_monitor.server}-monitor-${var.app_monitor.errormsg}",
    "monitor_type": "query_level_monitor",
    "enabled": true,
    "schedule": {
        "period": {
            "interval": 5,
            "unit": "MINUTES"
        }
    },
    "inputs": [
        {
         "search": {
            "indices": [
               "nrm-app-generic-*"
            ],
            "query": {
               "size": 0,
               "query": {
                  "bool": {
                     "must": [
                        {
                           "match": {
                              "message": {
                                 "query": "${var.app_monitor.errormsg}",
                                 "operator": "OR",
                                 "prefix_length": 0,
                                 "max_expansions": 50,
                                 "fuzzy_transpositions": true,
                                 "lenient": false,
                                 "zero_terms_query": "NONE",
                                 "auto_generate_synonyms_phrase_query": true,
                                 "boost": 1
                              }
                           }
                        }
                     ],
                     "filter": [
                        {
                           "range": {
                              "@timestamp": {
                                 "from": "{{period_end}}||-5m",
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
                              "host.hostname": {
                                 "value": "${var.app_monitor.server}",
                                 "boost": 1
                              }
                           }
                        },
                        {
                           "term": {
                              "labels.project": {
                                 "value": "${var.app_monitor.app}",
                                 "boost": 1
                              }
                           }
                        }
                     ],
                     "adjust_pure_negative": true,
                     "boost": 1
                  }
               },
               "aggregations": {}
            }
         }
      }
    ],
    "triggers": [
        {
          "query_level_trigger": {
            "id": "${var.app_monitor.query_level_trigger_id}",
            "name": "Error logs from server ${var.app_monitor.server}, application ${var.app_monitor.app} - ${var.app_monitor.errormsg}",
            "severity": "1",
            "condition": {
                "script": {
                    "source": "ctx.results[0].hits.total.value > 0",
                    "lang": "painless"
                }
            },
            "actions": [
                {
                    "id": "${var.app_monitor.automation_queue_action_id}",
                    "name": "Notify Email Alert",
                    "destination_id": "${var.automation_destination_id}",
                    "message_template": {
                        "source": "Monitor {{ctx.monitor.name}} just entered alert status. Please investigate the issue.\n  - Trigger: {{ctx.trigger.name}}\n  - Severity: {{ctx.trigger.severity}}\n  - Period start: {{ctx.periodStart}}\n  - Period end: {{ctx.periodEnd}}",
                        "lang" : "mustache"
                    },
                    "throttle_enabled": true,
                    "throttle": {
                        "value": 60,
                        "unit": "MINUTES"
                    },
                    "subject_template": {
                        "source": "Email Alert {{ctx.monitor.name}} ",
                        "lang" : "mustache"
                    }
                }
            ]
        }
        }
    ]
}
EOF
}