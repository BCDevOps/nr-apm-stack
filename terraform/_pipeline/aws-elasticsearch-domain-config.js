module.exports.process = function (p) {
    return {
    "DomainName": p.DomainName,
    "ElasticsearchVersion": "7.9",
    "ElasticsearchClusterConfig": {
        "InstanceType": "r6g.large.elasticsearch",
        "InstanceCount": 2,
        "DedicatedMasterEnabled": false,
        "ZoneAwarenessEnabled": true,
        "ZoneAwarenessConfig": {
          "AvailabilityZoneCount": 2
        },
        "WarmEnabled": false
    },
    "EBSOptions": {
        "EBSEnabled": true,
        "VolumeType": "gp2",
        "VolumeSize": 10
    },

    "AccessPolicies": JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [
            { // Must Allow all/anonymous users so that autehntication can be handled by Kibana/Keycloak
                "Effect": "Allow",
                "Principal": {
                    "AWS": '*'
                },
                "Action": "es:*",
                "Resource": `arn:aws:es:ca-central-1:${p.stsCallerIdentity.Account}:domain/${p.DomainName}/*`
            },
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": p.stsCallerIdentity.AssumedRole
                },
                "Action": "es:*",
                "Resource": `arn:aws:es:ca-central-1:${p.stsCallerIdentity.Account}:domain/${p.DomainName}/*`
            },
        ]
    }),
    "SnapshotOptions": {
        "AutomatedSnapshotStartHour": 0
    },
    "CognitoOptions": {
        "Enabled": false
    },
    "EncryptionAtRestOptions": {
        "Enabled": true
    },
    "NodeToNodeEncryptionOptions": {
        "Enabled": true
    },
    "AdvancedOptions": {
        "rest.action.multi.allow_explicit_index": "true"
    },
    "LogPublishingOptions": {},
    "DomainEndpointOptions": {
        "EnforceHTTPS": true,
        "TLSSecurityPolicy": "Policy-Min-TLS-1-2-2019-07",
        "CustomEndpointEnabled": false
    },
    "AdvancedSecurityOptions": {
        "Enabled": true,
        "InternalUserDatabaseEnabled": false,
        "MasterUserOptions": {
            "MasterUserARN": p.stsCallerIdentity.AssumedRole
        },
        "SAMLOptions": {
            "Enabled": true,
            "Idp": {
              "MetadataContent": p.samlOptions.MetadataContent,
              "EntityId": p.samlOptions.EntityId
            },
            "SubjectKey": "",
            "RolesKey": "roles",
            "SessionTimeoutMinutes": 60,
            "MasterBackendRole": "all_access"
          }
    }
    }
}
