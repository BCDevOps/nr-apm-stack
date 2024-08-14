import { injectable } from 'inversify';
import lodash from 'lodash';
import { OsDocument } from '../types/os-document';
import { Parser } from '../types/parser';

@injectable()
/**
 * Parser to format IPV6 formatted ip addresses that are actually IPV4.
 * with IPV4 addresses.
 * eg: '::ffff:10.97.6.1'.
 *     '::ffff:' is designated as the IPv4 to IPv6 subnet prefix
 *
 * @deprecated
 */
export class IpvParser implements Parser {
  /**
   * Returns true if metadata has an ipv field.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].ipv);
  }

  /**
   * Parse ipv fields separated by a comma.
   * Example: "field.one,field.two"
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const ipvFieldArr = (document.data['@metadata'].ipv as string).split(',');
    for (const ipvField of ipvFieldArr) {
      const ipv = lodash.get(document.data, ipvField);
      if (typeof ipv === 'string') {
        const ipvFormatted = this.chooseIpvFormat(ipv);
        if (ipvFormatted) {
          lodash.set(document.data, ipvField, ipvFormatted);
        } else {
          // throw error?
        }
      }
    }
  }

  /**
   * Fix IPV4 output as an IPV6 formatted ip address.
   * see: https://whatismyipaddress.com/work-arounds
   * @param {string} value - the original record.ip field
   */
  public chooseIpvFormat(value: string): string | undefined {
    return value.startsWith('::ffff:')
      ? value.replace(/ /g, '').split(':').slice(-1).pop()
      : value;
  }
}
