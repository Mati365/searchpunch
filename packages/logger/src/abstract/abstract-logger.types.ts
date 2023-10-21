import { AbstractFpTsLogger } from './abstract-fp-ts-logger';

/* eslint-disable @typescript-eslint/brace-style */
export type AbstractLoggerLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug';

export type AbstractLoggerLogOptions = {
  level: AbstractLoggerLevel;
};

export type AbstractLogFn = (message: string) => void;

export abstract class AbstractLogger
  implements Record<AbstractLoggerLevel, AbstractLogFn>
{
  constructor(readonly prefix: string) {}

  abstract log(level: AbstractLoggerLevel): AbstractLogFn;

  fatal = this.log('fatal');

  error = this.log('error');

  warn = this.log('warn');

  info = this.log('info');

  debug = this.log('debug');

  get fp() {
    return new AbstractFpTsLogger(this);
  }
}
