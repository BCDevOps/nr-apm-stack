variable "agent_monitor" {
  type = object({
    name = string
    server = string
    agent = string
    query_level_trigger_id = string
    teams_channel_action_id = string
    automation_queue_action_id = string
  }) 
}

variable "webhook_destination_id" {
  type = string
}

variable "automation_destination_id" {
  type = string
}