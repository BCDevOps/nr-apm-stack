# Lambda Event Stream Processing

## Local Testing

The following will start an http server listening on port 3000.

```
npm run start
```

The root (/) will respond with the processed JSON. If for some reason you can't see the response (using fluentbit), you can have it print by setting the query parameter 'print' to be 'true' (?print=true).

The Dockerfile is capable of running the server as well

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

These instructions assume you are using podman. Run the following to build the local lambda image.

```
./podman-build.sh
```

Next, start the local lambda listening on the podman machine's port 3000. If you are not running podman on Linux, this may be the podman machine's port (not your machine's port).

```
./podman-run.sh
```

Finally, start up a fluentbit server using podman with a rendered funbucks configuration. See the Funbucks repository for how to do that.
