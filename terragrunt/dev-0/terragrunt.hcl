
# Login: npx @bcgov/bcdk cloud aws-login --space=tygsv5-dev --output=~/.aws/credentials.dev.env && source ~/.aws/credentials.dev.env

terraform {
    source = "../..//terraform"
}

remote_state {
    backend = "local"
    config = {
        path = "${get_terragrunt_dir()}/terraform.tfstate"
    }
}

inputs = {
  env = "dev"
  pr = "0"
  suffix = "-dev-0"
}
