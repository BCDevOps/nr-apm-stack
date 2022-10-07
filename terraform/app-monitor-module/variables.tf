variable "app_monitor" {
  type = object({
    server = string
    app = string
    query_level_trigger_id = string
    automation_queue_action_id = string
    errormsg = string
  }) 
}

variable "automation_destination_id" {
  type = string
}