module.exports.process = function (p) {
    return {
    "DomainName": p.DomainName,
    "ElasticsearchVersion": "7.9",
    "ElasticsearchClusterConfig": {
        "InstanceType": "r5.large.elasticsearch",
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
        "Enabled": true,
        "KmsKeyId": "arn:aws:kms:ca-central-1:675958891276:key/c13394c2-88c5-4c0c-b4bf-194d0f5bd637"
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
              "MetadataContent": "<EntitiesDescriptor Name=\"urn:keycloak\" xmlns=\"urn:oasis:names:tc:SAML:2.0:metadata\"\r\n\t\t\t\t\txmlns:dsig=\"http://www.w3.org/2000/09/xmldsig#\">\r\n\t<EntityDescriptor entityID=\"https://oidc.gov.bc.ca/auth/realms/ichqx89w\">\r\n\t\t<IDPSSODescriptor WantAuthnRequestsSigned=\"true\"\r\n\t\t\tprotocolSupportEnumeration=\"urn:oasis:names:tc:SAML:2.0:protocol\">\r\n                        <KeyDescriptor use=\"signing\">\r\n                          <dsig:KeyInfo>\r\n                            <dsig:KeyName>NylCG2Z1NxJmuqsBN8T01d9DJHicxqZJfenLTXbbKg4</dsig:KeyName>\r\n                            <dsig:X509Data>\r\n                              <dsig:X509Certificate>MIICnzCCAYcCBgF0wZuC+zANBgkqhkiG9w0BAQsFADATMREwDwYDVQQDDAhpY2hxeDg5dzAeFw0yMDA5MjQxOTMyMDhaFw0zMDA5MjQxOTMzNDhaMBMxETAPBgNVBAMMCGljaHF4ODl3MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5VIw6ZMkzZQdo4ZDeTS3d3cmqFTsotfvXMAi44PB2qhdIced1N4iOqwgcH+QSt68bhRqMuiNmL6YhxI8kiPUqpW3Xh2myWPNT2rHmMjSf9zba9DjFoLhdBP7IMuZg7IIgjdi8fMo4daBRL/84XmK+HpqFSOtzuhrbJK9RFIsM/TBsd6xeGO597wQMT+DWFyzSBF8hWVKyyUDXOxvLWx/t/KdCzJ0B7ncbm7rlBKCfEDwPK4o/Cl4LloG8ZRQNyNnU/JNPeGVo08iDPGPa/yfUQmGNY6USYxq1LSCiT0bzS4Zz1du3aq2fg6yGzgqj/3MuO02lc+FnyEMjdDGpZkCPQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQB4BrqYTD5kI6G+Evfd9pAdyEPJ4haj89oIXI+WNVjJm2qFzMDyB2wA+2prgwHKQ99e9LWJWwG2YepKqoRMMQSkfuH/LoW+kmLuRABfZiKjl7ysN/e7JnDa6PvsBysMXR8WQwOWM6qmjHTvuQfEtpEGwr3haLfu2z7e0252DJKkPL6gWaBOiXOJnOZy7LcUnY6G++lFTczGb0BK8eaD1kTglFd+cGPJs9XVzS3TRj42pxMwSWkq4FHmB1d8JUPchUd9NQvSazkTxeg6z53jNgn6Bxuelh4wZcWL9fD3z0UiCZD9K8+rifcztkeaLIcKOeAZ9+yC5tFxULJyFbScdN0H</dsig:X509Certificate>\r\n                            </dsig:X509Data>\r\n                          </dsig:KeyInfo>\r\n                        </KeyDescriptor>\r\n\r\n\t\t\t<SingleLogoutService\r\n\t\t\t\t\tBinding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST\"\r\n\t\t\t\t\tLocation=\"https://oidc.gov.bc.ca/auth/realms/ichqx89w/protocol/saml\" />\r\n\t\t\t<SingleLogoutService\r\n\t\t\t\t\tBinding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect\"\r\n\t\t\t\t\tLocation=\"https://oidc.gov.bc.ca/auth/realms/ichqx89w/protocol/saml\" />\r\n\t\t\t<NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</NameIDFormat>\r\n\t\t\t<NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:transient</NameIDFormat>\r\n\t\t\t<NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified</NameIDFormat>\r\n\t\t\t<NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>\r\n\t\t\t<SingleSignOnService Binding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST\"\r\n\t\t\t\tLocation=\"https://oidc.gov.bc.ca/auth/realms/ichqx89w/protocol/saml\" />\r\n\t\t\t<SingleSignOnService\r\n\t\t\t\tBinding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect\"\r\n\t\t\t\tLocation=\"https://oidc.gov.bc.ca/auth/realms/ichqx89w/protocol/saml\" />\r\n\t\t\t<SingleSignOnService\r\n\t\t\t\tBinding=\"urn:oasis:names:tc:SAML:2.0:bindings:SOAP\"\r\n\t\t\t\tLocation=\"https://oidc.gov.bc.ca/auth/realms/ichqx89w/protocol/saml\" />\r\n\t\t</IDPSSODescriptor>\r\n\t</EntityDescriptor>\r\n</EntitiesDescriptor> ",
              "EntityId": "https://dev.oidc.gov.bc.ca/auth/realms/ichqx89w"
            },
            "SubjectKey": "",
            "RolesKey": "roles",
            "SessionTimeoutMinutes": 60
          }
    }
    }
}
