import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';


@injectable()
export class RemoveMetadataField implements Parser {
  matches(record: any): boolean {
    return !lodash.isNil(record['@metadata']);
  }
  apply(record: any): void {
    delete record['@metadata'];
  }
}
