import { injectable } from "inversify";
import { Parser } from "./parser.isvc";
import * as lodash from 'lodash'
@injectable()
export class ThreatPhpImpl implements Parser  {
    matches(_record: any): boolean {
        return true
    }
    apply(record: any): void {
        const url_original: string = (lodash.get(record, 'url.original', '') as string).toLowerCase()
        if (url_original.indexOf('<php') >=0  || url_original.indexOf('%3Cphp') >=0) {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('/wp-content/') >=0 || url_original.indexOf('/wp-content/plugins/wp-file-manager') >=0 || url_original.indexOf('wp-login') >=0 ) {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('phpmyadmin') >=0) {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('/_ignition/execute-solution') >=0) {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('xdebug_session_start') >=0 || url_original.indexOf('phpstorm') >=0) {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('phpunit') >=0 ) {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('/solr/admin/info') >=0 ) {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('token=') >=0 || url_original.indexOf('password=') >=0 ) {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 10))
        }
        if (url_original.indexOf('/jsonws/invoke') >=0 ) {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('win.ini') >=0 || url_original.indexOf('system32') >=0 ) {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('etc/passwd') >=0) {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('<script>') >=0 || url_original.indexOf('%3Cscript%3E') >=0 || url_original.indexOf('<meta') >=0 )  {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('<') >=0 || url_original.indexOf('>') >=0 || url_original.indexOf('%3C') >=0 || url_original.indexOf('%3E') >=0 )  {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (url_original.indexOf('bitrix') >=0 )  {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
        if (!record.http?.request?.method)  {
            lodash.set(record, 'event.risk_score', Math.max(lodash.get(record, 'event.risk_score', 0), 1))
        }
    }
}