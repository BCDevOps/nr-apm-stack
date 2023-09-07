# Events to OpenSearch Documents

## Best Practices in Sending your Documents

Any tool that can login to AWS and send signed HTTP requests can send your events. The preferred tool for sending this data is Fluent Bit. If you are sending on-premise logs then it is your only option.

### Fluent Bit

Fluent Bit is a highly flexible tool. If you have questions about how to run or configure it then please refer to the Fluent Bit documentation. There is a fair amount of copy-paste configuration that every solution should send like information about the host. 1Team will be able to provide sample configurations and work with your team to help get Fluent Bit sending data successfully.

Website: https://fluentbit.io

### Sending Data Directly

Your event stream can be directly sent using code without ever logging to a file and having a tool like Fluent Bit read it. Your code will need to login to AWS, renew its token and sign the requests sent to Kinesis.

Example: https://github.com/bcgov-nr/nr-broker/blob/main/src/kinesis/aws-kinesis.service.ts

It is highly recommended that data sent directly also be logged to disk. Your team should have the ability to recover from network and other pipeline mishaps that results in missing or incorrect data. The APM stack has no way to recover your events if they are never received, dropped or improperly parsed by the lambda. The lambda dead letter queue only handles data received and then rejected.

## Funbucks

Our solution for generating the Fluent Bit configuration logs is called Funbucks. The tool was created to consistently output the configuration across on-premise and OpenShift servers. It enables rapid configuration of OpenShift products by allowing you to run Fluent Bit locally for testing and then transform the files into a yaml configuration.

See: https://github.com/bcgov-nr/nr-funbucks
