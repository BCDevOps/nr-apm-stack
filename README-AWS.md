# AWS ElasticSearch Stack
- AWS ElasticSearch - Provisioning
- AWS ElasticSearch - Configuration
- Keycloak - Configuration

# Principles
- Infastructure as Code
- Configuration as Code
- GitOps:
  - Describe the entire system declaratively
  - Version the canonical desired system state in Git
  - Automatically apply approved changes to the desired state
  - Ensure correctness and alert on divergence with software agents


# Environment Variables:
## AWS
As documented in the [AWS CLI documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) which can be obtained from the [Cloud PathFinder login page](https://oidc.gov.bc.ca/auth/realms/umafubc9/protocol/saml/clients/amazon-aws) and clicking on "Click for Credentials" of the appropriate project/environment.
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`
- `AWS_DEFAULT_REGION`

## Keycloak
You will need a client service account with realm admin privilege.
- `KEYCLOAK_BASEURL`: The base URL ending with "/auth"
- `KEYCLOAK_REALM_NAME`
- `KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET`


## Deployment
```
# npx @bcgov/bcdk cloud aws-login --space=tygsv5-dev --output=~/.aws/credentials.env && source ~/.aws/credentials.env && source .env.local

npx @bcgov/nrdk deploy --pr=0 --env=dev
```