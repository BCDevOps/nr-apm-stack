
## Best practices in sending your documents

Any tool that can login to AWS and send signed HTTP requests can send your events. The preferred tool for sending this data is FluentBit. If you are sending on-premise logs then it is your only option.

FluentBit is a highly flexible tool. If you have questions about how to run or configure it then please refer to the FluentBit documentation. There is a fair amount of copy-paste configuration that every solution should send like information about the host. 1Team will be able to provide sample configurations and work with your team to help get FluentBit sending data successfully.

### Sending data directly

Your event stream can be directly sent using code without ever logging to a file and having a tool like FluentBit read it. Your code will need to login to AWS, renew its token and sign the requests sent to Kinesis.

## Data Lifecycle

Your team is responsible for your data's lifecycle. Teams are encouraged to independently store and manage the event stream you are sending to OpenSearch. We do not store the data as sent. If there are errors or dropped data, you will need to resend the data.

The data lifecycles of indices in OpenSearch are optimized for capacity and performance. The lifecycles may be altered in the future for these reasons.

## Funbucks

Our solution for generating the FluentBit configuration logs is called Funbucks. The tool was created to consistenly output the configuration across on-permise and OpenShift servers. It enables rapid configuration of OpenShift products by allowing you to run FluentBit locally for testing and then transform the files into a yaml configuration.

## Pipeline

You should have a robust pipeline that can accomodate multiple destinations for your event stream documents.
