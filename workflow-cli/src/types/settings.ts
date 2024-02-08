
export interface OpenSearchApiSettings {
  hostname: string;
  domainName: string;
  region: string;
  accessId: string;
  accessKey: string;
  arn: string | undefined;
}

export interface OpenSearchIndicesUsageSettings {
  hostname: string;
  domainName: string;
  region: string;
  accessId: string;
  accessKey: string;
  accountNumber: string,
  arn: string | undefined;
  indicesname: string;
  fieldname: string;
}

export interface OpenSearchNotificationsSettings {
  hostname: string;
  region: string;
  accountNumber: string;
  configId: string;
  configIdName: string;
  configNameLong: string;
  configDescription: string;
  configType: string;
  isEnabled: boolean;
  configTopicArnId: string;
  configRoleArnId: string;
}

export interface OpenSearchSnapshotSettings extends OpenSearchApiSettings {
  accountNumber: string;
}
