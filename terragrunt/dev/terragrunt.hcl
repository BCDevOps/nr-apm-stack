terraform {
    source = "../..//terraform"
}

locals {
  target_env = "dev"
}

generate "backend" {
  path = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents = <<EOF
terraform {
  backend "remote" {
    organization = "bcgov"
    workspaces {
        name = "tygsv5-${local.target_env}"
    }
  }
}
EOF
}

remote_state {
    backend = "remote"
    config = { }
}

generate "inputs" {
  path = "inputs.auto.tfvars"
  if_exists = "overwrite_terragrunt"
  contents = <<EOF
  env = "${local.target_env}"
  pr = "2"
  suffix = "-dev-2"
EOF
}
