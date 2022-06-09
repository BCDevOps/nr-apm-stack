variable "destination_url" {
  description = "The URL for the destination"
  type = string
  sensitive = true
}

variable "agent_monitor" {
  name = string
  server = string
  agent = string 
}
