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

    // Strip monitors where key '$$OMIT' equals true
    monitors = monitors.filter(
      (monitor) => !(monitor.$$OMIT && monitor.$$OMIT === 'true'),
    );
    for (const monitor of monitors) {
      if (monitor.$$OMIT) {
        delete monitor.$$OMIT;
      }

      // Strip monitor triggers where key '$$OMIT' equals true
      monitor.triggers = monitor.triggers.filter(
        (trigger: any) => !(trigger.$$OMIT && trigger.$$OMIT === 'true'),
      );
      for (const trigger of monitor.triggers) {
        if (trigger.$$OMIT) {
          delete trigger.$$OMIT;
        }
        trigger.query_level_trigger.actions =
          trigger.query_level_trigger.actions.filter(
            (action: any) => !(action.$$OMIT && action.$$OMIT === 'true'),
          );

        for (const action of trigger.query_level_trigger.actions) {
          if (action.$$OMIT) {
            delete action.$$OMIT;
          }
        }
      }
    }

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
    for (const removeHit of removeHits) {
      console.log(`Remove monitor: ${removeHit._source.name}`);
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
      } else {
        // Update
        // PUT _plugins/_alerting/monitors/<monitor_id>
        console.log(`Update monitor: ${monitor.name}`);
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
