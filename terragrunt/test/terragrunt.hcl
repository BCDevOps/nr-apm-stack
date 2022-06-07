
# Login: npx @bcgov/bcdk cloud aws-login --space=tygsv5-dev --output=~/.aws/credentials.dev.env && source ~/.aws/credentials.dev.env

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
        name = "tygsv5-test"
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
  env = "test"
  pr = "0"
  suffix = "-test"
  custom_endpoint = "test-apm-io.nrs.gov.bc.ca"
  prevent_data_destroy = false
EOF
}
