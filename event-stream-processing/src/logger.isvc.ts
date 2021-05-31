export interface Logger {
    /**
     * Prints to `stdout` with newline.
     */
     log(message?: any, ...optionalParams: any[]): void;
}
