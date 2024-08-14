import { injectable } from 'inversify';

@injectable()
/**
 * Subset testing service
 *
 * Based off of: https://github.com/studio-b12/is-subset
 *
 * Copyright © 2015 Studio B12 GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
export class SubsetService {
  /**
   * Returns true if the first parameter is a superset of the second
   * @param superset The object to test if it is a superset
   * @param subset The object to test if it is a subset
   * @returns boolean
   */
  public isSubset(superset: any, subset: any): boolean {
    if (
      typeof superset !== 'object' ||
      superset === null ||
      typeof subset !== 'object' ||
      subset === null
    ) {
      return false;
    }

    return Object.keys(subset).every((key) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!superset.propertyIsEnumerable(key)) {
        return false;
      }

      const subsetItem = subset[key];
      const supersetItem = superset[key];
      return typeof subsetItem === 'object' && subsetItem !== null
        ? this.isSubset(supersetItem, subsetItem)
        : supersetItem === subsetItem;
    });
  }
}
