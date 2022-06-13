variable "agent_monitor" {
  type = object({
    name = string
    server = string
    agent = string
  }) 
}

variable "webhook_destination_id" {
  type = string
}

variable "automation_destination_id" {
  type = string
}