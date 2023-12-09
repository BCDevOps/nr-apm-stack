import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import AwsService from './aws.service';
import {WorkflowSettings} from './opensearch-domain.service';

export interface MonitorConfig {
  name: string;
  server: string;
  agent: string;
  query_level_trigger_id: string;
  teams_channel_action_id: string;
  automation_queue_action_id: string;
}

const MONITORS_URL = 'https://raw.githubusercontent.com/bcgov-nr/nr-funbucks/main/monitor/monitors.json';
const MONITORS_FILE = path.resolve(__dirname, '../../agent-monitor.json');
const MONITORS_PREFIX = 'nrids_agent_fluentbit_';

export default class OpenSearchMonitorService extends AwsService {
  public async syncMonitors(settings: WorkflowSettings): Promise<any> {
    const monitors: MonitorConfig[] = (await axios.get(MONITORS_URL)).data;
    // console.log(monitors);
    const curMonitorSet = new Set(monitors.map((monitor) => monitor.name));

    const existingMonitorReq = await this.executeSignedHttpRequest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'host': settings.hostname,
      },
      hostname: settings.hostname,
      path: '/_plugins/_alerting/monitors/_search',
      body: JSON.stringify({
        'query': {
          'match_bool_prefix': {
            'monitor.name': MONITORS_PREFIX,
          },
        },
      }),
    }).then((res) => this.waitAndReturnResponseBody(res, [404]));
    const existingMonitorHits = JSON.parse(existingMonitorReq.body).hits.hits;
    const removeHits = existingMonitorHits.filter((hit: any) => !curMonitorSet.has(hit._source.name));

    for (const removeHit of removeHits) {
      console.log(`Remove monitor: ${removeHit._source.name}`);
      // DELETE _plugins/_alerting/monitors/<monitor_id>
      await this.executeSignedHttpRequest({
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'host': settings.hostname,
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
          'host': settings.hostname,
        },
        hostname: settings.hostname,
        path: '/_plugins/_alerting/monitors/_search',
        body: JSON.stringify({
          'query': {
            'term': {
              'monitor.name': monitor.name,
            },
          },
        }),
      }).then((res) => this.waitAndReturnResponseBody(res, [404]));

      const body = JSON.parse(existing.body);
      // console.log(body);
      const monitorJson = JSON.parse(fs.readFileSync(MONITORS_FILE, {encoding: 'utf8'}));
      monitorJson.name = monitor.name;
      monitorJson.inputs[0].search.query.query.bool.filter[1].term['host.hostname'].value = monitor.server;
      monitorJson.inputs[0].search.query.query.bool.filter[2].term['agent.name'].value = monitor.agent;
      monitorJson.triggers[0].query_level_trigger.id = monitor.query_level_trigger_id;
      monitorJson.triggers[0].query_level_trigger.name =
        `No logs from server ${monitor.server}, agent ${monitor.agent}`;
      monitorJson.triggers[0].query_level_trigger.actions[0].id = monitor.teams_channel_action_id;
      monitorJson.triggers[0].query_level_trigger.actions[0].destination_id = '031jXoEBrs4PMVtpxqUP';
      monitorJson.triggers[0].query_level_trigger.actions[1].id = monitor.automation_queue_action_id;
      monitorJson.triggers[0].query_level_trigger.actions[1].destination_id = 'JOSvT4EBMZyC3ZT-Xubu';
      // eslint-disable-next-line max-len
      monitorJson.triggers[0].query_level_trigger.actions[1].message_template.source = `{ \"type\": \"agent_down\", \"server\": \"${monitor.server}\", \"agent\": \"${monitor.agent}\", \"periodStart\": \"{{ctx.periodStart}}\", \"periodEnd\": \"{{ctx.periodEnd}}\" }`;

      // console.log(JSON.stringify(monitorJson));

      if (body.hits.total.value === 0) {
        // Add
        // POST _plugins/_alerting/monitors
        console.log(`Add monitor: ${monitor.name}`);
        await this.executeSignedHttpRequest({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'host': settings.hostname,
          },
          hostname: settings.hostname,
          path: '/_plugins/_alerting/monitors',
          body: JSON.stringify(monitorJson),
        }).then((res) => this.waitAndReturnResponseBody(res, [404]));
      } else {
        // Update
        // PUT _plugins/_alerting/monitors/<monitor_id>
        console.log(`Update monitor: ${monitor.name}`);
        if (!body.hits.hits[0]._source.enabled) {
          // Do not re-enable
          monitorJson.enabled = false;
        }
        await this.executeSignedHttpRequest({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'host': settings.hostname,
          },
          hostname: settings.hostname,
          path: `/_plugins/_alerting/monitors/${body.hits.hits[0]._id}`,
          body: JSON.stringify(monitorJson),
        }).then((res) => this.waitAndReturnResponseBody(res, [404]));
      }
    }
  }
}
