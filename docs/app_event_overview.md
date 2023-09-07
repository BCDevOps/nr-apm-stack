# Best Practices on Creating and Logging Application Events

## Event Streams

An application will have more than one type of events. Your application's message, access, trace analytics, metrics and audit reporting should be thought of as separate event streams.

It is highly impractical to combine multiple event streams into a single log or output stream (stdout, stderr, etc.) unless the streams can be unambiguously separated. It is highly recommended to only combine event streams if the content is single-line JSON documents in a standardized format like Elastic Common Schema and the streams have similar archival requirements.

### ECS or not to ECS?

There is no requirement that your application create and output events using the Elastic Common Schema (ECS) that the Observability platform uses. Other formats are much more compact and will save considerable disk space. As well, your application's logging will probably require additional code and libraries to support outputting it.

The flip-side is that ECS provides a extensible structure that can unambiguously separate events. So, everything can be logged to a single log file or stream and pushed to the APM Kinesis endpoint without the need for extensive manipulation.

Your team should work with 1Team to determine if new or existing indices will handle your event stream.

### Output Streams (stdio) Versus Files

Especially with containers, there is a movement away from logging to files and instead doing all logging through an output stream (stdio). This works well if you control the machine (virtual or real) software stack so that the output stream is captured and saved (at least temporarily) on the machine and then archived. This hides the complexity of saving to a log file from your application.

The downside is that different event streams (types of events) may have vastly different requirements for archival and post-processing. Your container platform may not provide hooks to capture the events from the output stream and push to Observability. You are also at the mercy of libraries (and your own code) not polluting the output stream with unexpected text that results in a poor game of whack-a-mole trying to suppress errors.

Files can offer a guarantee about their content. If you log access logs to unique path then you don't need to worry about other types of events appearing in that file. The unique path provides an entry point to your archiving process as well.

The reality is that the output stream approach is fine for the text messages in your application logs, but, falls apart with events with structured fields (access, audit, and more). The observability stack considers the application log stream of low value. If the platform you are on already captures application logs from stdio, there may be no value in pushing them.

### Commercial off-the-shelf Software

It is unlikely your application will directly log to Elastic Common Schema (ECS). It is becoming more common for applications to have the option of logging to JSON. A good first step is to check your configuration options.

## Data Lifecycle

Your team is responsible for your data's lifecycle. Teams are encouraged to independently store and manage the event stream you are sending to OpenSearch. We do not store the data as sent. If there are errors or dropped data, you will need to resend the data.

The data lifecycles of indices in OpenSearch are optimized for capacity and performance. The lifecycles may be altered in the future for these reasons.

The bottomline is that your application should have a robust pipeline that can accommodate multiple destinations for your event stream documents. OpenSearch is only one of those destinations.

## Event Stream Specific Advice

### Application-specific Audit Trail

These are a record of your application's activities.

* High value logs
* Your team should work with 1Team to define the index that will handle your event stream

### Access Logs

These record your application's HTTP requests and responses.

* High value logs
* No work required with 1Team as existing indices for access logs will be sufficient for all applications

### Application Logs

These are textual messages intended to be read by a human.

* Low value logs unless developers or support staff outside your team require access
* Ensure messages are informative, necessary and logged at an appropriate level (More information: https://sematext.com/blog/logging-levels/)
* Event messages are messages. Don't dilute (pollute) your message with data structures, telemetry, metrics or other things that should be logged in different fields and/or events.
* Ensure your logs are understandable when output at any level.
* No work required with 1Team as existing indices will be sufficient for all applications

### Metrics

These are instantaneous readings of the application/server health.

* Low to medium value unless developers or support staff outside your team require access
* Probably no work required with 1Team as existing indices will be sufficient for all applications

### Observability w/ OpenTelemetry

These are logs that trace activity within your application.

* High value logs
* Pathfinding work ongoing with 1Team

# Additional Topics

## Synchronize Your Clock!

All servers sending documents should regularly synchronize their clock. In most cases, the server will have been setup to do this already. Failure to correctly synchronize your clocks will result in events being rejected if they are too far in the future or past.