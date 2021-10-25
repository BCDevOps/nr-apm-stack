/* istanbul ignore file */

import {injectable} from 'inversify';
import {CityResponse, Reader} from 'maxmind';
import * as path from 'path';
import * as fs from 'fs';
import {MaxmindLookupService} from './maxmindLookup.service';
@injectable()
export class MaxmindCityLookupService implements MaxmindLookupService<CityResponse> {
    private cityLookup: Reader<CityResponse>;
    public constructor() {
      const dbPath = process.env.MAXMIND_DB_DIR || path.join(__dirname, '../asset');
      this.cityLookup = new Reader<CityResponse>(fs.readFileSync(path.join(dbPath, 'GeoLite2-City.mmdb')));
    }
    public lookup(ipAddress: string): CityResponse | null {
      return this.cityLookup.get(ipAddress);
    }
}
