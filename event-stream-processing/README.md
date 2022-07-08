# Lambda Event Stream Processing

## Local Testing

The following will start an http server listening on port 3000.

```
npm run start
```

The root (/) will respond with the processed JSON. If for some reason you can't see the response (using fluentbit), you can have it print by setting the query parameter 'print' to be 'true' (?print=true).

The provided dockerfile is capable of running the server as well

```
docker build -t esp .
docker run --rm -p 3000:3000 esp
```

### Sending Test Data - curl

The simpliest way is to just use a curl command. Switch to the samples directory and run:

```
curl -s -X POST -H "Content-Type: application/json" -d @samples/deployment-metrics.json localhost:3000
```
or
```
curl -s -X POST -H "Content-Type: application/json" -d @samples/deployment-metrics.json "http://localhost:3000?print=true"
```

### Sending Test Data - fluentbit

Fluentbit can also send data to an http endpoint. In the samples directory, `metrics-docker.sh` will run fluentbit in a container and send data to the local endpoint. The lambda must first be running. If the lambda is not running in a container there will a networking issue.
