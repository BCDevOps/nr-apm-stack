# Event Stream Processing Lambda

Github: [BCDevOps/nr-apm-stack/event-stream-processing](https://github.com/BCDevOps/nr-apm-stack/tree/main/event-stream-processing)

## Local Testing

The following will start an http server listening on port 3000.

```
podman run --rm -p 3000:3000 ghcr.io/bcdevops/nr-apm-stack-lambda:main
```

The root (/) will respond with the processed JSON. If for some reason you can't see the response (using Fluent Bit), you can have it print by setting the query parameter 'print' to be 'true' (?print=true).

### Sending Test Data - curl

The simpliest way is to just use a curl command. Switch to the [event-stream-processing directory](https://github.com/BCDevOps/nr-apm-stack/tree/main/event-stream-processing) and run:

```
curl -s -X POST -H "Content-Type: application/json" -d @samples/access-logs.json localhost:3000
```
or
```
curl -s -X POST -H "Content-Type: application/json" -d @samples/access-logs.json "http://localhost:3000?print=true"
```

## Testing with Funbucks

Funbucks is tool for generating Fluent Bit templated configurations for servers and Kubernetes (OpenShift) deployments. The Fluent Bit configuration can be setup to read in a sample file and send to a locally running Event Stream Processing Lambda for testing.

You simply start up the Event Stream Processing Lambda as above. In the Funbucks repo, you generate a configuration for your server using the '-l' flag. Finally, you run Fluenbit either locally or in a container to send the output to the Event Stream Processing Lambda. See the Funbucks repository for more details: https://github.com/bcgov-nr/nr-funbucks#readme
