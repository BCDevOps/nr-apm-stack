variable "jwt_token_monitor" {
  type = object({
    name = string
    auth_sub = string
    bucket_level_trigger_id = string
    severity = string
    action_id = string
    destination_id = string
  })
}
