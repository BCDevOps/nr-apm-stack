terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "4.16.0"
    }
    elasticsearch = {
      source = "phillbaker/elasticsearch"
      version = "2.0.1"
    }
  }
}


resource "elasticsearch_opensearch_role" "tenant_role" {
  role_name   = var.tenant["role_name"]
  description = var.tenant["description"]
  tags = {
    Refresh  = var.tag_refresh_value
  }
  tenant_permissions {
    tenant_patterns = var.tenant["tenant_permissions"]["tenant_patterns"]
    allowed_actions = var.tenant["tenant_permissions"]["allowed_actions"]
  }
}

resource "elasticsearch_opensearch_roles_mapping" "tenant_write_all_mapper" {
  role_name     = elasticsearch_opensearch_role.tenant_role.id
  description   = "Mapping KC role to ES role"
  tags = {
    Refresh  = var.tag_refresh_value
  }
  backend_roles = [var.tenant["role_name"]]
}
