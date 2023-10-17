/* eslint-disable @typescript-eslint/restrict-template-expressions */
/**
 * Example:
Powershell:
$MAXMIND_LICENSE_KEY = Read-Host -Prompt 'Input your MaxMind License Key'
[Environment]::SetEnvironmentVariable("MAXMIND_LICENSE_KEY", $MAXMIND_LICENSE_KEY)
*/
import * as http from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar-stream';
import * as zlib from 'zlib';

const BASE_PATH = path.resolve(__dirname, '../../../layer/maxmind-geoip-db/nodejs/asset');

export default class LambdaAssetDownloadService {
  public async doMaxMindDownload(licenseKey: string): Promise<void> {
    const maxMindDownloadUrl = 'https://download.maxmind.com/app/geoip_download';
    // eslint-disable-next-line max-len
    const dbAsnUrl = `${maxMindDownloadUrl}?edition_id=GeoLite2-ASN&license_key=${licenseKey}&suffix=tar.gz`;
    const dbAsnPath = path.resolve(BASE_PATH, 'GeoLite2-ASN.mmdb');

    // eslint-disable-next-line max-len
    const dbCityUrl = `${maxMindDownloadUrl}?edition_id=GeoLite2-City&license_key=${licenseKey}&suffix=tar.gz`;
    const dbCityPath = path.resolve(BASE_PATH, 'GeoLite2-City.mmdb');

    fs.mkdirSync(BASE_PATH, {recursive: true});
    await Promise.all([
      this.download(dbAsnUrl, dbAsnPath),
      this.download(dbCityUrl, dbCityPath),
    ]);
  }

  private download(url: string, dest: string) {
    const extract = tar.extract();
    const basename = path.basename(dest);
    const chunks: Uint8Array[] = [];
    // console.log(`Downloading ${url}`) // careful!!! download URL contains license key!!!
    return new Promise<void>((resolve) => {
      http.get(url, function(response) {
        if (response.statusCode === 200) {
          console.log(`Request succesful! Saving to ${dest}`);
          response
            .pipe(zlib.createGunzip())
            .pipe(extract);
          extract.on('entry', function(header, stream, cb) {
            if (header.name.endsWith(basename)) {
              stream.on('data', function(chunk) {
                chunks.push(chunk);
              });
            }

            stream.on('end', function() {
              cb();
            });

            stream.resume();
          });
          extract.on('finish', function() {
            if (chunks.length) {
              const data = Buffer.concat(chunks);
              fs.writeFileSync(dest, data);
            }
            resolve();
          });
        } else {
          throw new Error(`Download URL returned ${response.statusCode}`);
        }
      });
    });
  }
}
