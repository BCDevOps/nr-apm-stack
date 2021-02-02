# Reference & Examples:
# * https://hands-on.cloud/terraform-recipe-how-to-create-aws-elasticsearch-cluster/
# * https://medium.com/neiman-marcus-tech/building-a-secure-aws-managed-elasticsearch-cluster-using-terraform-ea876f79d297
# * https://github.com/BCDevOps/terraform-octk-aws-sea-network-info/blob/master/main.tf

variable "region" {
  type = string
  description = "AWS Region, where to deploy ELK cluster."
  default = "ca-central-1"
}

variable "suffix" {
  type = string
  description = "Suffix appended to all managed resource names"
  default = "-dev"
}

provider "aws" {
  region = var.region
}

# Creates a randomized password to be used as local admin
resource "random_password" "es_master_password" {
  length = 16
  special = true
  override_special = "_%@"
  min_special = 2
  min_lower = 2
  min_upper = 2
  min_numeric = 2
}
locals {
  aws_space_name = "Dev"
  aws_vpc_main_name       = "${local.aws_space_name}_vpc"
  aws_availability_zones  = list("a", "b")
  aws_web_subnet_names   = [for az in local.aws_availability_zones : "Web_${local.aws_space_name}_az${az}_net"]
}

# Retrieve the main VPC
data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = [local.aws_vpc_main_name]
  }
}
# Retrieve the web subnets in the main VPC
data "aws_subnet_ids" "web" {
  vpc_id = data.aws_vpc.main.id
  filter {
    name   = "tag:Name"
    values = local.aws_web_subnet_names
  }
}

# Retrieve the security groups
data "aws_security_groups" "web" {
  filter {
    name   = "tag:Name"
    values = ["Web_sg"]
  }
}

resource "aws_elasticsearch_domain" "es" {
  domain_name           = "ess${var.suffix}"
  elasticsearch_version = "7.9"
  vpc_options {
    subnet_ids         = data.aws_subnet_ids.web.ids
    security_group_ids = data.aws_security_groups.web.ids
  }
  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }
  encrypt_at_rest {
    enabled = true
  }
  advanced_security_options {
    enabled = true
    internal_user_database_enabled = true
    master_user_options {
      master_user_name = "admin"
      master_user_password = random_password.es_master_password.result
    }
  }
  cluster_config {
    dedicated_master_enabled = false
    warm_enabled = false
    instance_count = 2
    instance_type = "t3.small.elasticsearch"
    # instance_type = "r5.large.elasticsearch"
    zone_awareness_enabled = true
    zone_awareness_config {
      availability_zone_count = 2
    }
  }
  ebs_options {
    ebs_enabled = true
    volume_size = 10
  }
  node_to_node_encryption {
    enabled = true
  }
}

output "ess_admin_password" {
  value = random_password.es_master_password.result
  description = "The password for the 'admin' account."
}
