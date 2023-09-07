# Why Onboard to Observability?

The Natural Resource Information and Digital Services Division (NRIDs) collects data as logs when users interact with Natural Resource Ministries’ (NRM) applications.

These logs provide valuable information about events: what happened, when, who did it, were they successful, was there an error message, etc. Individually, logs are incredibly useful for solving bugs and troubleshooting application issues. Collectively, logs provide valuable information on usage, performance, and trends that can indicate and even predict server and application health problems, and security vulnerabilities.

If you onboard to observability, you will be able to unlock the potential from your application logs to showcase your application's activity. We currently use AWS OpenSearch to allow users to view, query and analyze application events.

## Application/Project Team Responsibilities

Your application's events will go on a journey from being created, sent over HTTP to AWS, parsed by a Lambda function and finally added to OpenSearch. The creation of suitable event documents and sending them to add to OpenSearch is your team's responsibility. Your team should explore what are the valuable events in your application, how you will dispatch the events, how you will meet your data management requirements, and how you plan on forwarding the events to OpenSearch. OpenSearch is not data archive system. The documents sent to OpenSearch are subject to field manipulation and lifecycle management to increase value and decrease service costs.

It is also your team's responsibility that the documents stored in OpenSearch can be correlated with other logs. You are free to internally call your production environment a fun name like "RazzleDazzle." But, if you send that as the environment values your logs won't show up when someone searches for the infinitely more boring "production." The same problem occurs if you put that environment value in a non-standard field.

### Where to Start

Your team should attend an onboarding session and explore the existing schemas (indices) and the values stored in OpenSearch.

## Support from OneTeam

Our Observability initiative is creating a community of users from across the NRM who have a vested interest in ensuring the health, performance, and security of NRM applications and servers. We can provide examples of workflows on-premise and cloud from teams that are using Observability to display their application's events in OpenSearch. We assist with mapping the your application events to the existing schemas or creating new schemas for you. We can provide advice on manipulating your field values to be consistent with the values sent by other applications.