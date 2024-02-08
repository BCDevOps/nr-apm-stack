/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'fs';
import * as path from 'path';
import AwsService from './aws.service';
import {OpenSearchApiSettings} from '../types/settings';

export default class OpenSearchTemplateService extends AwsService {
  public async syncComponentTemplates(settings: OpenSearchApiSettings): Promise<any> {
    await Promise.all([
      this.syncEcsComponentTemplates(settings, '8.4'),
      this.syncEcsComponentTemplates(settings, '8.9'),
      this.syncNrmEcsComponentTemplates(settings),
    ]);

    await this.syncIndexTemplates(settings);
  }

  public async syncEcsComponentTemplates(settings: OpenSearchApiSettings, version: string): Promise<any> {
    const componentDir = path.resolve(__dirname, `../../configuration-opensearch/ecs_${version}`);
    for (const filePath of fs.readdirSync(componentDir)) {
      if (!filePath.endsWith('.json')) {
        continue;
      }
      const basename = path.basename(filePath, '.json');
      // Read ECS file
      // Replaces match_only_text with text as OpenSearch does not support it.
      const text = fs.readFileSync(path.resolve(componentDir, filePath), {encoding: 'utf8'})
        .replace(/match\_only\_text/g, 'text')
        .replace(/wildcard/g, 'keyword')
        .replace(/constant_keyword/g, 'keyword')
        .replace(/flattened/g, 'flat_object');

      await this.executeSignedHttpRequest({
        method: 'PUT',
        body: text,
        headers: {
          'Content-Type': 'application/json',
          'host': settings.hostname,
        },
        hostname: settings.hostname,
        path: `/_component_template/ecs_${basename}_${version}`,
      })
        .then((res) => this.waitAndReturnResponseBody(res))
        .then((res) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`[${res.statusCode}] Component Template Loaded - ecs_${basename}_${version}`);
        });
    }
  }

  public async syncNrmEcsComponentTemplates(settings: OpenSearchApiSettings): Promise<any> {
    const componentDir = path.resolve(__dirname, '../../configuration-opensearch/ecs_nrm_1.0');
    for (const filePath of fs.readdirSync(componentDir)) {
      if (!filePath.endsWith('.json')) {
        continue;
      }
      const basename = path.basename(filePath, '.json');
      await this.executeSignedHttpRequest({
        method: 'PUT',
        body: fs.readFileSync(path.resolve(componentDir, filePath), {encoding: 'utf8'}),
        headers: {
          'Content-Type': 'application/json',
          'host': settings.hostname,
        },
        hostname: settings.hostname,
        path: `/_component_template/ecs_nrm_${basename}_1.0`,
      })
        .then((res) => this.waitAndReturnResponseBody(res))
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        .then((res) => console.log(`[${res.statusCode}] Component Template Loaded - ecs_nrm_${basename}_1.0`));
    }
  }

  public async syncIndexTemplates(settings: OpenSearchApiSettings): Promise<any> {
    const templateDir = path.resolve(__dirname, '../../configuration-opensearch/index_template');
    for (const filePath of fs.readdirSync(templateDir)) {
      if (!filePath.endsWith('.json')) {
        continue;
      }
      const basename = path.basename(filePath, '.json');
      await this.executeSignedHttpRequest({
        method: 'PUT',
        body: fs.readFileSync(path.resolve(templateDir, filePath), {encoding: 'utf8'}),
        headers: {
          'Content-Type': 'application/json',
          'host': settings.hostname,
        },
        hostname: settings.hostname,
        path: `/_index_template/nrm_${basename}`,
      })
        .then((res) => this.waitAndReturnResponseBody(res))
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        .then((res) => console.log(`[${res.statusCode}] Index Template Loaded - nrm_${basename}`));
    }
  }
}
