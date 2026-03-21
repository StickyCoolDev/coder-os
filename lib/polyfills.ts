import { Buffer } from 'buffer';
import EventEmitter from 'events';

// @ts-ignore
global.Buffer = Buffer;
// @ts-ignore
global.EventEmitter = EventEmitter;
global.process = global.process || {};
global.process.browser = true;

console.log('[DEBUG] Polyfills Loaded');

