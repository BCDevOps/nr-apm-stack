variable "tenant" {
  description = "Tenant details"
  type        = object({
    role_name = string
    description = string
    tenant_permissions = object ({
      tenant_patterns = list(string)
      allowed_actions = list(string)
    })
  })
}
