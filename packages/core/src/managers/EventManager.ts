import { EventEmitter } from 'node:events';

import type { Logger } from '../utils/index.js';

interface EventManagerOptions {
  logger: Logger;
}

// Wrapper for events.  Will eventually keep track of registered events.
export class EventManager {
  events: EventEmitter;
  private logger: Logger;

  constructor({ logger }: EventManagerOptions) {
    this.events = new EventEmitter();
    this.logger = logger;
  }

  on(eventName: string, cb: (...args: any[]) => void) {
    this.logger.log('DEBUG', '[EventManager]', 'on');

    this.events.on(eventName, cb);
  }

  once(eventName: string, cb: (...args: any[]) => void) {
    this.logger.log('DEBUG', '[EventManager]', 'once');

    this.events.once(eventName, cb);
  }

  off(eventName: string, cb: (...args: any[]) => void) {
    this.logger.log('DEBUG', '[EventManager]', 'off');

    this.events.off(eventName, cb);
  }

  emit(eventName: string, val: any) {
    this.logger.log('DEBUG', '[EventManager]', 'emit');

    this.events.emit(eventName, val);
  }
}