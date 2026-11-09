import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'edu.rajagiri.epde.demo',
  appName: 'RCSS Portal',
  webDir: 'dist',
  backgroundColor: '#F5F7F2',
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'never',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0F3324',
      overlaysWebView: false,
    },
  },
}

export default config
