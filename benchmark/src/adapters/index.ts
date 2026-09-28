import type { Adapter } from '../types.js';
import { genericAdapter } from './generic.js';
import { nucleiAdapter } from './nuclei.js';
import { g3Adapter } from './g3.js';

const adapters: Record<string, Adapter> = {
  generic: genericAdapter,
  nuclei: nucleiAdapter,
  g3: g3Adapter,
};

export function getAdapter(name: string): Adapter {
  const adapter = adapters[name];
  if (!adapter) {
    const available = Object.keys(adapters).join(', ');
    throw new Error(`Unknown adapter "${name}". Available: ${available}`);
  }
  return adapter;
}

export function listAdapters(): string[] {
  return Object.keys(adapters);
}
