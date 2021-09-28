import lodash from 'lodash';
import * as path from 'path';

export function expandFileAttributesFromPath(filePath:string, targetFileObject: any): any {
  const fileName = path.basename(filePath);
  lodash.set(targetFileObject, 'directory', path.dirname(filePath));
  lodash.set(targetFileObject, 'name', fileName);
  const indexOfLastDotInFileName = fileName.lastIndexOf('.');
  if (indexOfLastDotInFileName >0) {
    const fileExt = fileName.substring(indexOfLastDotInFileName+1).trim();
    if (fileExt.length>0) {
      lodash.set(targetFileObject, 'extension', fileName.substring(indexOfLastDotInFileName+1));
    }
  }
}
