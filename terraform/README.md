# Manually Running from workstation
* Follow offical docs on how to [install terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli)
    * Open a new command prompt or PowerShell terminal and check installation by running `terraform --version`
* Visit the [BCGov AWS Login page](https://oidc.gov.bc.ca/auth/realms/umafubc9/protocol/saml/clients/amazon-aws)
* Retrieve the AWS CLI credentials by clicking on `Click for Credentials`
* Copy the provided credentails and setup the environment variables
    * You may save to a file and then [source](https://stackoverflow.com/a/19331521) it (recommended); or
    * You may also paste it directly into a linux-comatible shell interpreter (e.g.: bash)
* review terraform files
    * You may need to update `suffix` variable to install a new instance with a new name.
* run `terraform plan`
* run `teraform apply`