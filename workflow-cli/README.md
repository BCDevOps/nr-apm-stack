workflow-cli
=================

AWS Deployment Workflow CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g workflow-cli
$ workflow-cli COMMAND
running command...
$ workflow-cli (--version)
workflow-cli/1.0.0 darwin-x64 node-v17.3.1
$ workflow-cli --help [COMMAND]
USAGE
  $ workflow-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`workflow-cli help [COMMAND]`](#workflow-cli-help-command)
* [`workflow-cli keycloak-sync`](#workflow-cli-keycloak-sync)
* [`workflow-cli lambda-asset-download [FILE]`](#workflow-cli-lambda-asset-download-file)
* [`workflow-cli opensearch-sync`](#workflow-cli-opensearch-sync)
* [`workflow-cli plugins`](#workflow-cli-plugins)
* [`workflow-cli plugins:inspect PLUGIN...`](#workflow-cli-pluginsinspect-plugin)
* [`workflow-cli plugins:install PLUGIN...`](#workflow-cli-pluginsinstall-plugin)
* [`workflow-cli plugins:link PLUGIN`](#workflow-cli-pluginslink-plugin)
* [`workflow-cli plugins:uninstall PLUGIN...`](#workflow-cli-pluginsuninstall-plugin)
* [`workflow-cli plugins update`](#workflow-cli-plugins-update)
* [`workflow-cli reindex`](#workflow-cli-reindex)

## `workflow-cli help [COMMAND]`

Display help for workflow-cli.

```
USAGE
  $ workflow-cli help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for workflow-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `workflow-cli keycloak-sync`

Sync keycloak client details

```
USAGE
  $ workflow-cli keycloak-sync --adminId <value> --adminSecret <value> --realm <value> --targetId <value>
    --targetUrl <value> --url <value>

FLAGS
  --adminId=<value>      (required) Keycloak client id
  --adminSecret=<value>  (required) Keycloak client secret
  --realm=<value>        (required) Keycloak realm
  --targetId=<value>     (required) Target client id
  --targetUrl=<value>    (required) Target client url
  --url=<value>          (required) Keycloak url

DESCRIPTION
  Sync keycloak client details

EXAMPLES
  $ workflow-cli keycloak-sync
```

## `workflow-cli lambda-asset-download [FILE]`

Download assets used by the lambda to process data

```
USAGE
  $ workflow-cli lambda-asset-download [FILE] -l <value>

FLAGS
  -l, --license=<value>  (required) MaxMind License

DESCRIPTION
  Download assets used by the lambda to process data

EXAMPLES
  $ workflow-cli lambda-asset-download
```

## `workflow-cli opensearch-sync`

Sync OpenSearch settings

```
USAGE
  $ workflow-cli opensearch-sync -u <value> -d <value> --region <value> --accessId <value> --accessKey <value> [--arn
    <value>]

FLAGS
  -d, --domainName=<value>  (required) OpenSearch Domain
  -u, --hostname=<value>    (required) OpenSearch url
  --accessId=<value>        (required) AWS access key id
  --accessKey=<value>       (required) AWS secret access key
  --arn=<value>             AWS ARN
  --region=<value>          (required) AWS region

DESCRIPTION
  Sync OpenSearch settings

EXAMPLES
  $ workflow-cli opensearch-sync
```

## `workflow-cli plugins`

List installed plugins.

```
USAGE
  $ workflow-cli plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ workflow-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `workflow-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ workflow-cli plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ workflow-cli plugins:inspect myplugin
```

## `workflow-cli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ workflow-cli plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ workflow-cli plugins add

EXAMPLES
  $ workflow-cli plugins:install myplugin 

  $ workflow-cli plugins:install https://github.com/someuser/someplugin

  $ workflow-cli plugins:install someuser/someplugin
```

## `workflow-cli plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ workflow-cli plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ workflow-cli plugins:link myplugin
```

## `workflow-cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ workflow-cli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ workflow-cli plugins unlink
  $ workflow-cli plugins remove
```

## `workflow-cli plugins update`

Update installed plugins.

```
USAGE
  $ workflow-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `workflow-cli reindex`

Bulk reindex runner

```
USAGE
  $ workflow-cli reindex -u <value> -d <value> --region <value> --accessId <value> --accessKey <value> [--arn
    <value>]

FLAGS
  -d, --domainName=<value>  (required) OpenSearch Domain
  -u, --hostname=<value>    (required) OpenSearch url
  --accessId=<value>        (required) AWS access key id
  --accessKey=<value>       (required) AWS secret access key
  --arn=<value>             AWS ARN
  --region=<value>          (required) AWS region

DESCRIPTION
  Bulk reindex runner

EXAMPLES
  $ workflow-cli reindex
```
<!-- commandsstop -->
