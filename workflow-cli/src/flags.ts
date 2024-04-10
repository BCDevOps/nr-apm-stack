import { Flags } from '@oclif/core';

export const help = {
  help: Flags.help({ char: 'h' }),
};

export const brokerApiUrl = {
  'broker-api-url': Flags.string({
    default: 'https://broker.io.nrs.gov.bc.ca/',
    description: 'The broker api base url',
    env: 'BROKER_API_URL',
  }),
};

export const brokerToken = {
  'broker-token': Flags.string({
    required: true,
    description: 'The broker JWT',
    env: 'BROKER_TOKEN',
  }),
};

export const hostname = {
  hostname: Flags.string({
    char: 'u',
    description: 'OpenSearch url',
    env: 'OS_URL',
    required: true,
  }),
};

export const domainName = {
  domainName: Flags.string({
    char: 'd',
    description: 'OpenSearch Domain',
    env: 'OS_DOMAIN',
    required: true,
  }),
};

export const region = {
  region: Flags.string({
    description: 'AWS region',
    env: 'AWS_REGION',
    required: true,
  }),
};

export const accessId = {
  accessId: Flags.string({
    description: 'AWS access key id',
    env: 'AWS_ACCESS_KEY_ID',
    required: true,
  }),
};

export const accessKey = {
  accessKey: Flags.string({
    description: 'AWS secret access key',
    env: 'AWS_SECRET_ACCESS_KEY',
    required: true,
  }),
};

export const accountNumber = {
  accountNumber: Flags.string({
    description: 'AWS account number',
    env: 'AWS_ACCOUNT_NUMBER',
    required: true,
  }),
};

export const arn = {
  arn: Flags.string({ description: 'AWS ARN', env: 'AWS_ASSUME_ROLE' }),
};

export const dryRun = {
  dryRun: Flags.boolean({
    description: 'Disable deletion of messages',
    env: 'AWS_SQS_DRY_RUN',
    default: false,
  }),
};

// export const configPath = {
//   'config-path': flags.string({
//     default: './config',
//     description: 'The path to the config directory',
//     env: 'AUTH_SYNC_CONFIG_PATH',
//   }),
// };
