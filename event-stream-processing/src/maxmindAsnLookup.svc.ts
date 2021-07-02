/* istanbul ignore file */
import {injectable} from 'inversify';
import {AsnResponse, Reader} from 'maxmind';
import * as path from 'path';
import * as fs from 'fs';
import {MaxmindAsnLookup} from './maxmindLookup.isvc';

@injectable()
export class MaxmindAsnLookupImpl implements MaxmindAsnLookup {
    private _cityLookup: Reader<AsnResponse>;
    public constructor() {
        const db_path = process.env.MAXMIND_DB_DIR || path.join(__dirname, '../asset')
        this._cityLookup = new Reader<AsnResponse>(fs.readFileSync(path.join(db_path, 'GeoLite2-ASN.mmdb')));
    }
    public lookup(ipAddress:string): AsnResponse {
      return this._cityLookup.get(ipAddress);
    }
}
