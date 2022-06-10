terraform {
  required_providers {
    elasticsearch = {
      source = "phillbaker/elasticsearch"
      version = "2.0.2"
    }
  }
}


resource "elasticsearch_opensearch_role" "tenant_role" {
  role_name   = var.tenant["role_name"]
  description = var.tenant["description"]
  tenant_permissions {
    tenant_patterns = var.tenant["tenant_permissions"]["tenant_patterns"]
    allowed_actions = var.tenant["tenant_permissions"]["allowed_actions"]
  }
}

resource "elasticsearch_opensearch_roles_mapping" "tenant_write_all_mapper" {
  role_name     = elasticsearch_opensearch_role.tenant_role.id
  description   = "Mapping Keycloak role to ES role"
  backend_roles = [var.tenant["role_name"]]
}
