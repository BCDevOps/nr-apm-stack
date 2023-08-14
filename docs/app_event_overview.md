
## Best practices on creating and logging application events.

* Ensure messages are informative, necessary and logged at an appropriate level (More information: https://sematext.com/blog/logging-levels/)
* Event messages are messages. Don't dillute (pollute) your message with data structures, telemetry, metrics or other things that should be logged in different fields and/or events.
* Ensure your logs are understandable when output at any level.

## Determine if you need additional event streams

An application will have more than one event stream. Things like trace analytics, metrics and reporting should go into separate streams with their own format and be sent to an indices dedicated to storing that type of data. Your team should work with 1Team to determine if new or existing indices will handle your event stream.

## Commercial off-the-shelf Software

It is unlikely your application will directly log to Elastic Common Schema. It is becoming more common for applications to have the option of logging to JSON. A good first step is to check your configuration options.

## Other activities

All servers sending documents should regularly synchronize their clock. In most cases, the server will have been setup to do this already.
