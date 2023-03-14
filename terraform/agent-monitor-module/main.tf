terraform {
  required_providers {
    elasticsearch = {
      source = "phillbaker/elasticsearch"
      version = "2.0.2"
    }
  }
}

# Create agent monitor
resource "elasticsearch_opensearch_monitor" "agent_monitor" {
  body = <<EOF
{
    "type": "monitor",
    "name": "${var.agent_monitor.name}",
    "monitor_type": "query_level_monitor",
    "enabled": true,
    "schedule": {
        "period": {
            "interval": 1,
            "unit": "MINUTES"
        }
    },
    "inputs": [
        {
            "search": {
                "indices": [
                    "nrm-metrics"
                ],
                "query": {
                    "size": 0,
                    "aggregations": {},
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "range": {
                                        "@timestamp": {
                                            "from": "{{period_end}}||-5m",
                                            "to": "{{period_end}}",
                                            "include_lower": true,
                                            "include_upper": true,
                                            "format": "epoch_millis",
                                            "boost": 1.0
                                        }
                                    }
                                },
                                {
                                    "term": {
                                        "host.hostname": {
                                            "value": "${var.agent_monitor.server}",
                                            "boost": 1.0
                                        }
                                    }
                                },
                                {
                                    "term": {
                                        "agent.name": {
                                            "value": "${var.agent_monitor.agent}",
                                            "boost": 1.0
                                        }
                                    }
                                },
                                {
                                    "term": {
                                        "event.dataset": {
                                            "value": "process.info",
                                            "boost": 1.0
                                        }
                                    }
                                }
                            ],
                            "adjust_pure_negative": true,
                            "boost": 1.0
                        }
                    }
                }
            }
        }
    ],
    "triggers": [
        {
          "query_level_trigger": {
            "id": "${var.agent_monitor.query_level_trigger_id}",
            "name": "No logs from server ${var.agent_monitor.server}, agent ${var.agent_monitor.agent}",
            "severity": "1",
            "condition": {
                "script": {
                    "source": "ctx.results[0].hits.total.value == 0",
                    "lang": "painless"
                }
            },
            "actions": [
                {
                    "id": "${var.agent_monitor.teams_channel_action_id}",
                    "name": "Notify Teams Channel",
                    "destination_id": "${var.webhook_destination_id}",
                    "message_template": {
                        "source": "{ \"text\": \"Monitor {{ctx.monitor.name}} just entered alert status. Please investigate the issue.\n  - Trigger: {{ctx.trigger.name}}\n  - Severity: {{ctx.trigger.severity}}\n  - Period start: {{ctx.periodStart}}\n  - Period end: {{ctx.periodEnd}}\" }",
                        "lang" : "mustache"
                    },
                    "throttle_enabled": true,
                    "throttle": {
                        "value": 10,
                        "unit": "MINUTES"
                    },
                    "subject_template": {
                        "source": "",
                        "lang" : "mustache"
                    }
                },
                {
                    "id": "${var.agent_monitor.automation_queue_action_id}",
                    "name": "Notify Automation Queue",
                    "destination_id": "${var.automation_destination_id}",
                    "message_template": {
                        "source": "{ \"type\": \"agent_down\", \"server\": \"${var.agent_monitor.server}\", \"agent\": \"${var.agent_monitor.agent}\", \"periodStart\": \"{{ctx.periodStart}}\", \"periodEnd\": \"{{ctx.periodEnd}}\" }",
                        "lang" : "mustache"
                    },
                    "throttle_enabled": true,
                    "throttle": {
                        "value": 10,
                        "unit": "MINUTES"
                    },
                    "subject_template": {
                        "source": "",
                        "lang" : "mustache"
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