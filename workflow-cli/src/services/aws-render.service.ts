import * as fs from 'fs';
import * as path from 'path';
import ejs from 'ejs';
import { inject, injectable } from 'inversify';
import NotificationService from './notification.service';
import { TYPES } from '../inversify.types';

const TEMPLATE_DIR = path.resolve(__dirname, '../../..');

@injectable()
export default class AwsRenderService {
  constructor(
    @inject(TYPES.NotificationService)
    private notificationService: NotificationService,
  ) {}

  render() {
    const templateStr = fs.readFileSync(
      path.resolve(TEMPLATE_DIR, 'template.yaml.tpl'),
      { encoding: 'utf8' },
    );

    const val = ejs.render(templateStr, {
      notifications: this.notificationService.renderConfigs({}),
    });

    console.log(val);

    fs.writeFileSync(path.resolve(TEMPLATE_DIR, 'template.yaml'), val, {
      encoding: 'utf8',
    });
  }
}
