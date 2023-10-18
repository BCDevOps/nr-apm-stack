# NR APM (Application Performance and Monitoring) Stack

[NR APM (Application Performance and Monitoring) Stack](https://apm.io.nrs.gov.bc.ca/_plugin/_dashboards) allows teams to tactically respond to potential issues and strategically investigate their KPIs. It is delivered using OpenSearch hosted on AWS. OpenSearch is a open source search and analytics suite derived from Elasticsearch & Kibana.

<b>This README is for developers deploying NR APM Stack. See our Github site for [integration documentation](https://bcdevops.github.io/nr-apm-stack/).</b>

# More Documentation

OpenSearch documentation is located here:

https://opensearch.org/docs/latest/

For end-users, our training, use cases and testimonials are located here:

https://apps.nrs.gov.bc.ca/int/confluence/x/GaRvBQ

For developers and product owners, our integration documentation is located here:

https://bcdevops.github.io/nr-apm-stack/

# Getting Started

The product runs using AWS services. The CI/CD pipeline uses Github actions.

## Built With

### AWS Services

* [Amazon OpenSearch Service](https://aws.amazon.com/opensearch-service)
* [Amazon Lambda](https://aws.amazon.com/lambda/)
* [Amazon S3](https://aws.amazon.com/s3/)
* [Amazon Kinesis](https://aws.amazon.com/kinesis/)

### Deployment Stack

* [Amazon SAM](https://aws.amazon.com/serverless/sam/)
* [Amazon Cloudformation](https://aws.amazon.com/cloudformation/)
* [Github Actions](https://github.com/features/actions)

### Languages

* [Typescript](https://www.typescriptlang.org)

## Local Deployment Setup

If you want to run SAM locally, you will need to install the CLI. For production, running the deployment locally is not recommended.

SAM requires that you setup a number of environment variables.

### AWS - Environment Variables

As documented in the [AWS CLI documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) which can be obtained from the [Cloud PathFinder login page](http://login.nimbus.cloud.gov.bc.ca/) and clicking on "Click for Credentials" of the appropriate project/environment.

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`
- `AWS_DEFAULT_REGION`

# Principles
- Infrastructure as Code
- Configuration as Code
- GitOps:
  - Describe the entire system declaratively
  - Version the canonical desired system state in Git
  - Automatically apply approved changes to the desired state
  - Ensure correctness and alert on divergence with software agents
