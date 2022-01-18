terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "3.63.0"
    }
    elasticsearch = {
      source = "phillbaker/elasticsearch"
      version = "1.6.3"
    }
  }
}


resource "elasticsearch_opendistro_role" "tenant_role" {
  role_name   = var.tenant["role_name"]
  description = var.tenant["description"]
  tenant_permissions {
    tenant_patterns = var.tenant["tenant_patterns"]
    allowed_actions = var.tenant["allowed_actions"]
  }
  depends_on = [aws_elasticsearch_domain.es]
}

resource "elasticsearch_opendistro_roles_mapping" "tenant_write_all_mapper" {
  role_name     = elasticsearch_opendistro_role.tenant_role.id
  description   = "Mapping KC role to ES role"
  backend_roles = [var.tenant["role_name"]]
}
