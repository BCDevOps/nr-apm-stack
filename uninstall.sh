#!/usr/bin/env bash
#set -x

#this is the environment script will run on eg perrsi-test, perrsi-dev
OC_NAMESPACE=$1 
#this is the extension if any in the ebk stack objects in openshift eg 
OC_NAMESPACE_EXT=$2

if [ -z "$1" ]; then 
    echo 'Please provide the OC namespace to uninstall the EBK stack objects from and re run .e.g ./uninstall.sh perrsi-test'
    exit 1;
fi

if [ -z "$2" ]; then 
    OC_NAMESPACE_EXT=""
else
    OC_NAMESPACE_EXT=$OC_NAMESPACE_EXT'-'
fi

echo $OC_NAMESPACE_EXT

#Start here Use tools namespace to test 
# oc -n $OC_NAMESPACE delete pvc in (nr-ess-$OC_NAMESPACE_EXTmaster, nr-ess-$OC_NAMESPACE_EXTdata, nr-ess-$OC_NAMESPACE_EXTingest)
# oc -n $OC_NAMESPACE delete secret nr-ess-$OC_NAMESPACE_EXTca  nr-ess-$OC_NAMESPACE_EXTelasticsearch-cert nr-ess-$OC_NAMESPACE_EXTelasticsearch-cred nr-ess-$OC_NAMESPACE_EXTkibana-cert nr-ess-$OC_NAMESPACE_EXTkibana-key
# oc -n $OC_NAMESPACE delete serviceaccount nr-ess-$OC_NAMESPACE_EXTinstaller

echo done