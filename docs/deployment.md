# Deployment

## Deploy Fluent Bit configuration for Linux and Windows Servers

[Polaris Jenkins](https://oneteam-jenkins.apps.silver.devops.gov.bc.ca/job/fluentbit/job/fluentbit-deploy/)

Choose a server from the fluentbitHost list -> run the job

After job completed and succeed, logs in the server will pop in OpenSearch

## Deploy Fluent Bit Configuration for OpenShift Application
[Funbucks for Flentbit Configuration](./fluentbit.md) on Section 'Generate Fluent Bit Configuration Files'

Run Example 4 command to generate a ConfigMap and Volume for pasting into a Kubernetes deployment config for deployment

