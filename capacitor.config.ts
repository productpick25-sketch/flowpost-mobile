import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'app.saccommunity.mobile',
  appName: 'SAC Community',
  webDir: 'dist/client',
  android: { allowMixedContent: false },
  ios: { contentInset: 'automatic' },
  plugins: { SystemBars: { insetsHandling: 'css', initialViewportFitValueHint: 'cover', style: 'DARK' } },
};
export default config;
