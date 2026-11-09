import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

export const isNative = Capacitor.isNativePlatform()
export const platform = Capacitor.getPlatform() // 'ios' | 'android' | 'web'

/** Native look-and-feel on iOS/Android; installable offline web app elsewhere. */
export async function setupPlatform() {
  document.documentElement.dataset.platform = platform
  if (isNative) {
    try {
      await StatusBar.setStyle({ style: Style.Dark })
      if (platform === 'android') await StatusBar.setBackgroundColor({ color: '#0F3324' })
      await SplashScreen.hide()
    } catch {
      /* plugin unavailable: carry on */
    }
    return
  }
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  }
}

/** Dark status-bar text on the light sign-in screen, light text on the green app header. */
export async function setStatusBarForSignedIn(signedIn: boolean) {
  if (!isNative) return
  try {
    await StatusBar.setStyle({ style: signedIn ? Style.Dark : Style.Light })
    if (platform === 'android') await StatusBar.setBackgroundColor({ color: signedIn ? '#0F3324' : '#F5F7F2' })
  } catch {
    /* ignore */
  }
}
