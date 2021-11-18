vault {
  address = "https://vault-iit.apps.silver.devops.gov.bc.ca"
  renew_token = true
}

secret {
    no_prefix = true
    path = "apps/prod/fluent/fluent-bit"
}
