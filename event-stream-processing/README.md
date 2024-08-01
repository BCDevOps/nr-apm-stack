# Event Stream Processing Lambda

## Local Testing - SAM

SAM can be used to test the application like it is running on AWS.

The sam deployment can be build by running:

```
sam build
```

In the root of the repository, run the following after you build (sam build).

```
sam local generate-event kinesis get-records --data "$(jq -c <event-stream-processing/samples/access-logs.json)" | sam local invoke -e - --skip-pull-image --parameter-overrides LambdaHandler="index.kinesisStreamDummyHandler" LogLevel="debug"
```

If you are running Podman, you may need to export DOCKER_HOST for this to work.

## Local Testing - Server

The following will start an http server listening on port 3000.

```
npm run start
```

The root (/) will respond with the processed JSON. If for some reason you can't see the response (using Fluent Bit), you can have it print by setting the query parameter 'print' to be 'true' (?print=true).

### Sending Test Data - curl

The simpliest way is to just use a curl command. Switch to the samples directory and run:

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
