import { describe, expect, it } from 'vitest';
import config from '../../capacitor.config';

describe('native mobile configuration', () => {
  it('opens bundled screens without loading a website', () => {
    expect(config.server?.url).toBeUndefined();
  });
  it('does not allow insecure or arbitrary in-app navigation', () => {
    expect(config.server?.cleartext).not.toBe(true);
    expect(config.android?.allowMixedContent).toBe(false);
    expect(config.server?.allowNavigation).toBeUndefined();
  });
  it('packages the current app screens', () => {
    expect(config.webDir).toBe('dist/client');
  });
});