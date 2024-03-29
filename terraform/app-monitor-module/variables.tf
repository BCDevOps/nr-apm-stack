variable "app_monitor" {
  type = object({
    name = string
    index = string
    query_level_trigger_id = string
    automation_queue_action_id = string
    interval = number
    severity = string
    destination_id = string
    throttle = number
    trigger_source = string
    queryblock = string
  })
}
