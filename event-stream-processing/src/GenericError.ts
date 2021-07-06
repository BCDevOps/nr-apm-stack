class ExtendedError extends Error {
  constructor(message:string) {
    super(message);
    this.name = this.constructor.name;
    // Cleaner stack trace for v8
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export class GenericError extends ExtendedError {
    source: Error
    constructor(message: string, source?: Error) {
      super(message);
      Object.setPrototypeOf(this, GenericError.prototype);
      if (source) {
        this.source = source;
        // this.stack_before_rethrow = this.stack
        const messageLines = (this.message.match(/\n/g)||[]).length + 1;
        this.stack = this.stack.split('\n').slice(0, messageLines+1).join('\n') + '\n' + source.stack;
      }
    }
}
