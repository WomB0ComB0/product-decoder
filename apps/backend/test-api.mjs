#!/usr/bin/env node
// Simple test to verify the API structure
import { app } from './src/app.js';

console.log('✅ App imported successfully');
console.log('App type:', typeof app);
console.log('App methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(app)).filter(name => typeof app[name] === 'function').slice(0, 5));

export { app as default };
