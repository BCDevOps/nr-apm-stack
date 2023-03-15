variable "jwt_token_monitor" {
  type = object({
    name = string
    bucket_level_trigger_id = string
    severity = string
    action_id = string    
  })
}

variable "destination_id" {
  type = string
}
