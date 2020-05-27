# Elastic Search + Kibana
## How to install
IMPORTANT: helm chart does NOT support variable reference within `values.yaml` so we need to pre-process `values.yaml` with `sed`. Please not that `nr-ess` is repeated in the `sed` substitution and in the helm execution.

```
# fetch dependencies
helm dependency build
sed -E 's/{{\s*\.Release\.Name\s*}}/nr-ess/g' chart/values.yaml | helm install nr-ess chart/ -f -

```

## How to configure
```
( cd configurations && ./apply.sh )
```

## How to uninstall
```
helm uninstall nr-ess; oc delete pvc -l 'app in (nr-ess-master, nr-ess-data, nr-ess-ingest)'
```
TODO: make that `oc delete` more specific! it is kinda dangerous as is.

# Filebeat
## How to Install
Download the extract the package file
```
cd ~/
curl https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.7.0-linux-x86_64.tar.gz -o filebeat-7.7.0-linux-x86_64.tar.gz
tar -xzf filebeat-7.7.0-linux-x86_64.tar.gz

```

## How to run filebeat
1. Create a .env file at `~/filebeat-7.7.0-linux-x86_64/.env`.
1. Copy the `configurations/filebeat.yaml` to `~/filebeat-7.6.2-linux-x86_64/`
1. Run filebeat:
```
cd ~/filebeat-7.7.0-linux-x86_64
rm -Rf data/* && rm -f nohup.out && nohup bash -c 'source .env && time ~/filebeat-7.6.2-linux-x86_64/filebeat run -e --once' &
```