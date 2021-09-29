/* istanbul ignore file */
import {injectable} from 'inversify';
import {AsnResponse, Reader} from 'maxmind';
import * as path from 'path';
import * as fs from 'fs';
import {MaxmindLookupService} from './maxmindLookup.service';

@injectable()
export class MaxmindAsnLookupService implements MaxmindLookupService<AsnResponse> {
    private cityLookup: Reader<AsnResponse>;
    public constructor() {
      const dbPath = process.env.MAXMIND_DB_DIR || path.join(__dirname, '../asset');
      this.cityLookup = new Reader<AsnResponse>(fs.readFileSync(path.join(dbPath, 'GeoLite2-ASN.mmdb')));
    }
    public lookup(ipAddress:string): AsnResponse | null {
      return this.cityLookup.get(ipAddress);
    }
}
