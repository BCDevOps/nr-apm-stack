import { Host } from './host';
import { Log } from './log';
import { Event } from './event';

export interface Record {
  /**
   * This is the Elastic Search document _id and it is used for performing upserts which enables deduplication
   * @see {@link https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-id-field.html}
   */
  _id: string;
  /**
   * Date/time when the event originated.
   * @see {@link https://www.elastic.co/guide/en/ecs/current/ecs-base.html#field-timestamp}
   */
  '@timestamp': string;
  /**
   * For log events the message field contains the log message, optimized for viewing in a log viewer.
   * @see {@link https://www.elastic.co/guide/en/ecs/current/ecs-base.html#field-message}
   */
  message: string;
  /**
   * @deprecated This attribute has moved to {@link Log}
   */
  offset?: number;
  event: Event;
  log?: Log;
  host?: Host;
}
