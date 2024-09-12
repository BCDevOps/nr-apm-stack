import { GenericError } from './generic.error';

export class ParserError extends GenericError {
  constructor(
    message: string,
    public parser: string,
    source?: Error | undefined,
    public options?: { skipDlq: boolean },
  ) {
    super(message, source);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
