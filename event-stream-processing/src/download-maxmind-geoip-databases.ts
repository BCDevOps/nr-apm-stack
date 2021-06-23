/**
 * Example:
Powershell:
$MAXMIND_LICENSE_KEY = Read-Host -Prompt 'Input your MaxMind License Key'
[Environment]::SetEnvironmentVariable("MAXMIND_LICENSE_KEY", $MAXMIND_LICENSE_KEY)
*/
import * as http from 'https'
import * as fs from 'fs'
import * as path from 'path'


function download(url:string, dest: string) {
    // console.log(`Downloading ${url}`) // careful!!! download URL contains license key!!!
    http.get(url, function(response) {
        if (response.statusCode === 200){
            console.log(`Request succesfful! Saving to ${dest}`)
            const stream = fs.createWriteStream(dest)
            response.pipe(stream)
            stream.on('finish', function() {
                stream.close()
            })
        }else{
            throw new Error(`Download URL returned ${response.statusCode}`)
        }
    })
}

const db_asn_url = `https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-ASN&license_key=${process.env.MAXMIND_LICENSE_KEY}&suffix=tar.gz`
const db_asn_path = path.resolve(__dirname, '../asset/GeoLite2-ASN.mmdb')

const db_city_url = `https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${process.env.MAXMIND_LICENSE_KEY}&suffix=tar.gz`
const db_city_path = path.resolve(__dirname, '../asset/GeoLite2-City.mmdb')

fs.mkdirSync(path.dirname(db_asn_path), {recursive: true})
download(db_asn_url, db_asn_path)
download(db_city_url, db_city_path)
