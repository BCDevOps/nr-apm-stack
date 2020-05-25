# How to install
IMPORTANT: helm chart does NOT support variable reference within `values.yaml` so we need to pre-process `values.yaml` with `sed`. Please not that `nr-ess` is repeated in the `sed` substitution and in the helm execution.

```
sed -E 's/{{\s*\.Release\.Name\s*}}/nr-ess/g' chart/values.yaml | helm install nr-ess chart/ -f -

```

# Applying Configurations
```
( cd configurations && ./apply.sh )
```

# How to uninstall
```
helm uninstall nr-ess; oc delete pvc --all
```
TODO: make that `oc delete` more specific! it is kinda dangerous as is.