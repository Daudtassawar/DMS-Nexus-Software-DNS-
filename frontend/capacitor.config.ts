import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hamdaan.dms',
  appName: 'Hamdaan Traders',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true
  },
  server: {
    cleartext: true
  }
};

export default config;
