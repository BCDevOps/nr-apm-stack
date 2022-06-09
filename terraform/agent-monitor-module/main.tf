terraform {
  required_providers {
    elasticsearch = {
      source = "phillbaker/elasticsearch"
      version = "2.0.2"
    }
  }
}

# Create destination for agent monitors
resource "elasticsearch_opensearch_destination" "agent_monitor_destination" {
  body = <<EOF
{
  "type": "custom_webhook",
  "name": "appinfra_incoming_webhook",
  "custom_webhook": {
    "header_params": {
      "Content-Type": "application/json"
    },
    "scheme": "HTTPS",
    "method" : "POST",
    "url" : "${var.destination_url}"
  }
}
EOF
}

output "destination_id" {
  description = "The OpenSearch destination ID"
  value = elasticsearch_opensearch_destination.agent_monitor_destination.id
  sensitive = true
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
                                            "value": "${var.agent_monitor.server}"
                                        }
                                    }
                                },
                                {
                                    "term": {
                                        "agent.name": {
                                            "value": "${var.agent_monitor.agent}"
                                        }
                                    }
                                },
                                {
                                    "term": {
                                        "event.dataset": {
                                            "value": "process.info"
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
            "name": "No logs from ${var.agent}",
            "severity": "1",
            "condition": {
                "script": {
                    "source": "ctx.results[0].hits.total.value == 0",
                    "lang": "painless"
                }
            },
            "actions": [
                {
                    "name": "Notify Teams Channel",
                    "destination_id": "${module.agent-monitor-module.destination_id}",
                    "message_template": {
                        "source": """{ "text": "Monitor {{ctx.monitor.name}} just entered alert status. Please investigate the issue.
  - Trigger: {{ctx.trigger.name}}
  - Severity: {{ctx.trigger.severity}}
  - Period start: {{ctx.periodStart}}
  - Period end: {{ctx.periodEnd}}" }""",
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
    ]
}
EOF
}
