/* istanbul ignore file */

import {injectable} from 'inversify';
import {CityResponse, Reader} from 'maxmind';
import * as path from 'path';
import * as fs from 'fs';
import {MaxmindCityLookup} from './maxmindLookup.isvc';

@injectable()
export class MaxmindCityLookupmpl implements MaxmindCityLookup {
    private _cityLookup: Reader<CityResponse>;
    public constructor() {
      const dbPath = process.env.MAXMIND_DB_DIR || path.join(__dirname, '../asset');
      this._cityLookup = new Reader<CityResponse>(fs.readFileSync(path.join(dbPath, 'GeoLite2-City.mmdb')));
    }
    public lookup(ipAddress:string): CityResponse {
      return this._cityLookup.get(ipAddress);
    }
}
