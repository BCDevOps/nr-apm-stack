/* istanbul ignore file */
import {injectable} from 'inversify';
import {randomBytes} from 'crypto';

@injectable()
export class RandomizerService {
  randomBytes(size: number): Buffer {
    return randomBytes(size);
  }
}
