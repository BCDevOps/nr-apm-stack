import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import ejs from 'ejs';

import AwsService from './aws.service';
import { WorkflowSettings } from './opensearch-domain.service';
import { BrokerApi } from '../broker/broker.api';
import { GraphServerInstallInstanceDto } from '../broker/dto/graph-server-installs-rest.dto';
import { inject, injectable } from 'inversify';
import { TYPES } from '../inversify.types';
import { dryRun } from '../flags';

const ID_MAX_LENGTH = 20;

export interface MonitorConfig {
  name: string;
  server: string;
  agent: string;
  query_level_trigger_id: string;
  teams_channel_action_id: string;
  automation_queue_action_id: string;
}

const ALERT_CONFIG_DIR = path.resolve(
  __dirname,
  '../../configuration-opensearch/alerting',
);
const MONITORS_PREFIX = 'nrids_agent_';

@injectable()
export default class OpenSearchMonitorService extends AwsService {
  constructor(@inject(TYPES.BrokerApi) private brokerApi: BrokerApi) {
    super();
  }

  private getFluentBitInstance(
    instances: GraphServerInstallInstanceDto[],
  ): GraphServerInstallInstanceDto | undefined {
    return instances.find((instance) => instance.service.name === 'fluent-bit');
  }

  private getAgentCount(instance: GraphServerInstallInstanceDto) {
    if (instance.edgeProp['agent_count']) {
      return Number.parseInt(instance.edgeProp['agent_count']);
    }
    return 1;
  }
  public async sync(settings: WorkflowSettings): Promise<any> {
    const servers = await this.brokerApi.getProjectServices();
    let monitors: any[] = [];

    for (const alertFile of fs.readdirSync(ALERT_CONFIG_DIR)) {
      if (!alertFile.endsWith('config.json')) {
        continue;
      }
      const alertConfigStr = fs.readFileSync(
        path.resolve(ALERT_CONFIG_DIR, alertFile),
        { encoding: 'utf8' },
      );
      const alertConfig = JSON.parse(alertConfigStr);
      const alertMonitorStr = fs.readFileSync(
        path.join(ALERT_CONFIG_DIR, `${alertFile.slice(0, -12)}.monitor.json`),
        { encoding: 'utf8' },
      );

      for (const server of servers) {
        const fbInstance = this.getFluentBitInstance(server.instances);
        if (!fbInstance) {
          // skip
          continue;
        }
        const agentCount = this.getAgentCount(fbInstance);
        const idgen = (...args: any) => {
          return crypto
            .createHash('sha256')
            .update(args.join())
            .digest('hex')
            .substring(0, ID_MAX_LENGTH);
        };
        const installHas = (id: string) => {
          return (
            fbInstance.edgeProp &&
            fbInstance.edgeProp['app_ids'] &&
            fbInstance.edgeProp['app_ids'].split(',').indexOf(id) !== -1
          );
        };
        const serverTag = (tag: string) => {
          return server.tags && server.tags.indexOf(tag) !== -1;
        };

        const context: any = {
          server,
          instance: fbInstance,
          idgen,
          installHas,
          serverTag,
        };

        if (alertConfig.type === 'agent') {
          for (let agentIndex = 0; agentIndex < agentCount; agentIndex++) {
            monitors.push(
              JSON.parse(
                ejs.render(alertMonitorStr, {
                  agent: {
                    index: agentIndex,
                  },
                  ...context,
                }),
              ),
            );
          }
        } else if (alertConfig.type === 'server') {
          monitors.push(JSON.parse(ejs.render(alertMonitorStr, context)));
        }
      }
    }

    // Remove objects that have a key '$$OMIT' that equals 'true'
    monitors = monitors
      .map((monitor) => {
        // Wrap monitor in an object so that predicate works on object root (and then unwrap)
        return this.recursiveOmit(
          { monitor },
          (key: any, value: any) =>
            typeof value === 'object' &&
            value !== null &&
            value['$$OMIT'] === 'true',
          ['$$OMIT'],
        ).monitor;
      })
      // Strip out monitors where root key '$$OMIT' was 'true'
      .filter((monitor) => monitor !== undefined);

    const monitorNameSet = new Set(monitors.map((monitor) => monitor.name));

    const existingMonitorReq = await this.executeSignedHttpRequest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        host: settings.hostname,
      },
      hostname: settings.hostname,
      path: '/_plugins/_alerting/monitors/_search',
      body: JSON.stringify({
        size: 1000,
        query: {
          match_bool_prefix: {
            'monitor.name': MONITORS_PREFIX,
          },
        },
      }),
    }).then((res) => this.waitAndReturnResponseBody(res, [404]));
    const existingMonitorHits = JSON.parse(existingMonitorReq.body).hits.hits;
    const removeHits = existingMonitorHits.filter(
      (hit: any) => !monitorNameSet.has(hit._source.name),
    );

    // console.log(removeHits);
    // console.log(JSON.stringify(monitors));
    // return;
    for (const removeHit of removeHits) {
      console.log(`Remove monitor: ${removeHit._source.name}`);
      if (!dryRun) {
        // DELETE _plugins/_alerting/monitors/<monitor_id>
        await this.executeSignedHttpRequest({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            host: settings.hostname,
          },
          hostname: settings.hostname,
          path: `/_plugins/_alerting/monitors/${removeHit._id}`,
        }).then((res) => this.waitAndReturnResponseBody(res, [404]));
      }
    }

    for (const monitor of monitors) {
      const existing = await this.executeSignedHttpRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          host: settings.hostname,
        },
        hostname: settings.hostname,
        path: '/_plugins/_alerting/monitors/_search',
        body: JSON.stringify({
          query: {
            term: {
              'monitor.name': monitor.name,
            },
          },
        }),
      }).then((res) => this.waitAndReturnResponseBody(res, [404]));

      const body = JSON.parse(existing.body);

      if (body.hits.total.value === 0) {
        // Add
        // POST _plugins/_alerting/monitors
        console.log(`Add monitor: ${monitor.name}`);
        if (!dryRun) {
          await this.executeSignedHttpRequest({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              host: settings.hostname,
            },
            hostname: settings.hostname,
            path: '/_plugins/_alerting/monitors',
            body: JSON.stringify(monitor),
          }).then((res) => this.waitAndReturnResponseBody(res, [404]));
        }
      } else {
        // Update
        // PUT _plugins/_alerting/monitors/<monitor_id>
        console.log(`Update monitor: ${monitor.name}`);
        if (!dryRun) {
          if (!body.hits.hits[0]._source.enabled) {
            // Do not re-enable
            monitor.enabled = false;
          }
          await this.executeSignedHttpRequest({
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              host: settings.hostname,
            },
            hostname: settings.hostname,
            path: `/_plugins/_alerting/monitors/${body.hits.hits[0]._id}`,
            body: JSON.stringify(monitor),
          }).then((res) => this.waitAndReturnResponseBody(res, [404]));
        }
      }
    }
  }

  private recursiveOmit(object: any, predicate: any, omitKeys: string[]): any {
    if (Array.isArray(object)) {
      return object
        .filter((val: any, index) => !predicate(index, val, object))
        .map((val: any) => this.recursiveOmit(val, predicate, omitKeys));
    } else if (typeof object !== 'object') {
      return object;
    }

    const result: any = {};
    for (const key of Reflect.ownKeys(object)) {
      const descriptor = Object.getOwnPropertyDescriptor(object, key);

      if (!descriptor?.enumerable || omitKeys.indexOf(key.toString()) !== -1) {
        continue;
      }

      const value = object[key];
      if (!predicate(key, value, object)) {
        Object.defineProperty(result, key, descriptor);
        if (typeof object === 'object' && object !== null) {
          result[key] = this.recursiveOmit(result[key], predicate, omitKeys);
        }
      }
    }
    return result;
  }
}
