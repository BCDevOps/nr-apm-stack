/* istanbul ignore file */
import {injectable} from 'inversify';
import {Randomizer} from './randomizer.isvc';
import {randomBytes} from 'crypto';

@injectable()
export class RandomImpl implements Randomizer {
  randomBytes(size: number): Buffer {
    return randomBytes(size);
  }
}
