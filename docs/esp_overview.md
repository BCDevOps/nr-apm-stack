# Event Streaming Processing Overview

How to utilize the Event Streaming Processing Lambda to manipulate your events and place them in the correct index in OpenSearch.

## When to use lambda

We encourage using the Lambda-based parsers for data-enrichment. It is not recommended that teams implement things like:

* GeoIP lookup
* User Agent parsing

There are certain "awkward" or commonly needed tasks that we also provide parsers for:

* key to path (transforming a key like "data.key" to an object)
* field hashing
* and more

Activating this parsing is done by either sending metadata to enable it or working with us to define standard parsing to do based on your data's fingerprint. Functionally, there is no difference to sending the metadata or relying on the fingerprint to define the parsing. Metadata sent will override the fingerprint metadata.

# Fingerprint your data

Teams should discuss the data they plan on sending and work out the fields and values to send so that the data is recognized as belonging to a supported schema and put into the correct index. This also allows us to setup standard processing for your fingerprint if desired.

The following table summarizes why you might want to let the fingerprint define the processing rather than sending the desired processing with the data.

| Configuration | Pro | Con |
| ---	| --- | --- |
| Client | <ul><li>Flexible and agile</li></ul> | <ul><li>Getting it right is up to you</li><li>Rolling out to multiple clients/projects is harder</li><li>Slightly more data sent</li></ul> |
| Fingerprint | <ul><li>Immediately leverage improvements</li><li>No client rollout required</li></ul> | <ul><li>Opaque</li><li>Improvements could break your logs</li><li>No control over change timing</li><li>Fingerprint conflicts</li></ul> |

### Index, ID and Hashes

We insist that the data fingerprint be used to determine the index. This is so we can centrally control having the data sent to the appropriate index. Index management is central to managing cost and performance.

We recommend that the data fingerprint be used to determine the ID and hash. In some cases, it may be necessary to tweak these on the client-side.
