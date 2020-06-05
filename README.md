# Elastic Search + Kibana
## How to install
IMPORTANT: helm chart does NOT support variable reference within `values.yaml` so we need to pre-process `values.yaml` with `sed`. Please note that `nr-ess` is repeated in the `sed` substitution and in the helm execution. So, if you want to use a different release name, make sure to update both places

## Install repository and fetch dependencies
> Note: exec below first initial time only
```
( cd chart && helm repo add elastic https://helm.elastic.co && helm dependency build )
```
> then exec below
```
( sed -E 's/{{\s*\.Release\.Name\s*}}/nr-ess/g' chart/values.yaml | helm install --debug nr-ess chart/ -f - )
```

## How to configure
1. Create `.env` file in `configurations` folder with below content:
```
export KIBANA_URL=
export ELASTICSEARCH_USERNAME=
export ELASTICSEARCH_PASSWORD=
export ELASTICSEARCH_URL=
export IDIR=
```
2. Fill above env variables from Openshift secrets/routes
3. Finally, exec below:
```
( cd configurations && ./apply.sh )
```
> This script will configure ES templates and ingest pipeline as well as Kibana patterns

## How to uninstall
```
helm uninstall nr-ess; oc delete pvc -l 'app in (nr-ess-master, nr-ess-data, nr-ess-ingest)'
```
TODO: make that `oc delete` more specific! it is kinda dangerous as is.

# Filebeat
## How to Install on a server with logs to parse
> Download the package file
```
cd ~/
curl https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.7.0-linux-x86_64.tar.gz -o filebeat-7.7.0-linux-x86_64.tar.gz

```
> Note: if server has a firewall, so it blocks external downloading, you can upload it from your local machine
```
scp filebeat-7.7.0-linux-x86_64.tar.gz <IDIR>@<server-ip>:/home/<IDIR>/
```
> Extract the package file
```
tar -xzf filebeat-7.7.0-linux-x86_64.tar.gz
```

## How to run filebeat
1. Create a .env file at `~/filebeat-7.7.0-linux-x86_64/.env` with the same content as `.env` file above
1. Copy the `configurations/filebeat.yml` to `~/filebeat-7.7.0-linux-x86_64/`
1. Run filebeat:
```
cd ~/filebeat-7.7.0-linux-x86_64
rm -Rf data/* && rm -f nohup.out && nohup bash -c 'source .env && time ~/filebeat-7.7.0-linux-x86_64/filebeat run -e --once' &
```
> if you want to run it continuously to wait for log files updates remove --once in the command above