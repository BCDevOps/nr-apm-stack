
import { injectable } from "inversify";
import { Parser } from "./parser.isvc";
import * as lodash from 'lodash'
import {knownDomains} from './known-domains'

const knownAppContextRegex = /^(?<labels__context>\/((int)|(ext)|(pub)|(gov)|(datasets)|(appsdata))(\/((geoserver)|(pls)))?)\/(?<labels__application>[^\/]*).*$/m;

@injectable()
export class ParserApplicationClasification implements Parser  {
    matches(record: any): boolean {
        return !lodash.isNil(lodash.get(record, 'url.domain')) && !lodash.isNil(lodash.get(record, 'url.path'))
    }
    apply(record: any): void {
        const urlDomain:string = lodash.get(record, 'url.domain');
        const urlPath:string = lodash.get(record, 'url.path');
        
        //lodash.set(record, 'url.uri', '//' + lodash.get(record, 'url.domain','unknown') + lodash.get(record, 'url.path','/unknown'))
        //lodash.set(record, 'url.full', lodash.get(record, 'url.scheme','unknown') + '://' + lodash.get(record, 'url.domain','unknown') + lodash.get(record, 'url.path','/unknown'))

        for (const knownDomain of knownDomains) {
            if (lodash.isString(knownDomain.regex)) {
                knownDomain.regex = new RegExp(knownDomain.regex)
            }
            if ((knownDomain.regex as RegExp).test(urlDomain.toLowerCase())) {
                lodash.set(record, 'labels.application', knownDomain.app)
            }
        }

        if (lodash.isNil(lodash.get(record, 'labels.application'))){
            const m = knownAppContextRegex.exec(urlPath)
            if (m !== null){
                for (const gropName of Object.keys(m.groups)) {
                    const fieldName = gropName.split('__').join('.')
                    const groupValue = m.groups[gropName].toLowerCase()
                    lodash.set(record, fieldName, groupValue)
                }
            }
        }
        if (lodash.isNil(lodash.get(record, 'labels.application')) && urlPath.startsWith('/clp-cgi')){
            lodash.set(record, 'labels.application','clp-cgi')
        }
    }
}
