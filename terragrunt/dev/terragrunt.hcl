
# Login: npx @bcgov/bcdk cloud aws-login --space=tygsv5-dev --output=~/.aws/credentials.dev.env && source ~/.aws/credentials.dev.env

terraform {
    source = "../../terraform"
}

remote_state {
    backend = "local"
    config = {
        path = "./dev.tfstate"
    }
}

inputs = {
  suffix = "-dev"
}
