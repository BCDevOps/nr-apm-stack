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
  suffix = "-0"
  iit_lambda_code_bucket_key_version = "BGBXBdWj2d5QkBPqSiuAHifShr9m6qBE"
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
inputs = {
  env = "prod"
  pr = "0"
  suffix = ""
  iit_lambda_code_bucket_key_version = "BGBXBdWj2d5QkBPqSiuAHifShr9m6qBE"
}
*/