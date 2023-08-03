# Fluentbit Configuration with Funbucks
Funbucks is tool for generating Fluent Bit templated configurations for servers and Kubernetes (OpenShift) deployments.

Using repo: [nr-funbucks](https://github.com/bcgov-nr/nr-funbucks) to configure Fluentbit configuration for your application or server. Funbucks helps you to generate Fluentbit input, parser, filter and outputs. 

## Prerequisition

* Create/Modify [server](https://github.com/bcgov-nr/nr-funbucks/tree/main/config/server) configuration 
* Choose correct [template](https://github.com/bcgov-nr/nr-funbucks/tree/main/config/templates) for log type 

| Type                  | Description                                            |
|-----------------------|--------------------------------------------------------|
| activemq              | active mq audit log                                    |
| apachie_reverse_proxy | apache reverse proxy access log                        |
| app_spar_postgres     | OpenShift spar application log                         |
| fme                   | fme server log                                         |
| hashicorp_vault       | hashicorp vault log                                    |
| tomcat                | tomcat access, localhost, catalina and application log |
| winiis                | Windows IIS log                                        |
| wso2                  | WSO2 carbon log                                        |

* Modify application portion in the server json, including regex or log path for individual application.
  
  For example:
    ```
    "contTomcatParserRegex": "/^[ \\ta-zA-Z\\D\\r].*|^\\d+\\s+[<>]+.*/"
    "!logs_path": "{% if localLogsPathPrefix %}{{localLogsPathPrefix}}/nrprd{% else %}/sw_ux/httpd01/logs/hot{% endif %}/*-access*.log"
    ```

    - Linux Server Metrics and Application Logs Configuration: [server](https://github.com/bcgov-nr/nr-funbucks/blob/main/config/server/between.json) configuration 
    

    - Windows Server Metrics and IIS Logs Configuration: [server](https://github.com/bcgov-nr/nr-funbucks/blob/main/config/server/tension.json) configuration  

    - OpenShift Application Logs Configuration[server](https://github.com/bcgov-nr/nr-funbucks/blob/main/config/server/app_spar.json) configuration 

## Funbucks Configuration

Understand [Common Schema](./commonschema.md)

### Essential Fields for OpenSearch
There are essential [fields](./onboarding.md) for OpensSearch
* @timestamp
* event.dataset
* event.category
* event.kind
* service.name
* service.type


## Generate Fluentbit Configuration Files
You can generate all the output files with (from Funbucks repo root dir): 

Example 1: Generate for a server
```
$ ./bin/dev gen -l -s localhost
```
The '-l' flag here ensures log paths are setup for local testing in a Podman container. It also sends the output to a local http server instead of the production location. This is useful for sending to a locally running version of the event-driven compute (AWS Lambda) that will process the output.

Example 2: Generate for a server and a specific application
```
$ ./bin/dev gen -l -s syncronicity -a metrics_isss
```
The '-a' flag here limits the generated output to only this "application" id. This may be useful if you are dealing with a server with many applications on it.

Example 3: Generate for a server (local testing and override some context variables)
```
$ ./bin/dev gen -l -s localhost -c deploy_1:inputPath//metrics/\* -c outputAwsKinesisEnabled/true -c outputLocalLambdaEnabled/
```
Finally, you can override the context sent to the template engine to try out values.

Example 4: Generate for OpenShift
```
$ ./bin/dev gen -s app_spar
$ ./bin/dev oc -s app_spar
```
The output_pack folder will now contain a ConfigMap and Volume for pasting into a Kubernetes deployment config.

## Running a configuration against the local lambda (nr-apm-stack/event-stream-processing)
* Generate your server's configuration using the local (-l) flag and (-a) flag from previous steps
* Place any documents in ./lambda/data. You will need to lay the files out relative to the log directory like they would be on the server. Check the generated files (inputs.conf) in ./output if you are confused.
* Ensure the local lambda(apm-stack) is running. See: local [Lambda Testing](./testing.md) on portion 'Testing with Funbucks'
* Run ./lambda/podman-run.sh

In nr-funbucks side, log files under ./lambda/data have been read and parsed.

In nr-apm-stack/event-stream-processing, the output simulates each record that Fluentbit processed will be received for OpenSearch