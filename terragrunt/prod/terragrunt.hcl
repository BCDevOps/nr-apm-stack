# [Environment]::SetEnvironmentVariable("TERRAGRUNT_DOWNLOAD", "C:\.terragrunt-cache")
# npx @bcgov/bcdk cloud aws-login --space=tygsv5-prod --output=~/.aws/credentials.prod.ps1; . ~/.aws/credentials.prod.ps1; . ..\..\.env.prod.local.ps1

terraform {
    source = "../..//terraform"
}

generate "backend" {
  path = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents = <<EOF
terraform {
  backend "remote" {
    organization = "bcgov"
    workspaces {
        name = "tygsv5-prod"
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
  env = "prod"
  pr = "0"
  suffix = "-prod"
  iit_lambda_code_bucket_key_version = "m2WQ7ixHMkV7WZ8HDH0JeJNDFuiOGvzV"
  master_node_instance_count = 3
  master_node_instance_type = "c5.large.elasticsearch"
  data_node_instance_count = 9
  data_node_instance_type = "r5.large.elasticsearch"
  data_node_volume_size = 300
  custom_endpoint = "apm.io.nrs.gov.bc.ca"
  custom_endpoint_certificate_arn = "arn:aws:acm:ca-central-1:578527843179:certificate/a03a0a1b-120b-43ab-ab9d-e1bc84c693c4"
  kinesis_shards = 6
EOF
}

/*
generate "backend" {
  path = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents = <<EOF
terraform {
  backend "local" { }
}
EOF
}
remote_state {
    backend = "local"
    config = {
        path = "${get_terragrunt_dir()}/terraform.tfstate"
    }
}
*/
