// Crashlytics temporarily disabled — native module not linked on Android build.
// import crashlytics from '@react-native-firebase/crashlytics';
// import {Platform} from 'react-native';

let currentScreen = 'unknown';
// let globalHandlerInstalled = false;

export function getCurrentCrashScreen(): string {
  return currentScreen;
}

/** Keep latest screen name (local only while Crashlytics is off). */
export function setCrashScreen(screenName: string) {
  const name = screenName?.trim() || 'unknown';
  currentScreen = name;
  // try {
  //   crashlytics().setAttribute('current_screen', name);
  //   crashlytics().setAttribute('platform', Platform.OS);
  //   crashlytics().log(`Navigated to: ${name}`);
  // } catch (err) {
  //   if (__DEV__) {
  //     console.log('[Crashlytics] setCrashScreen failed:', err);
  //   }
  // }
}

export function setCrashUser(_userId: string | null | undefined) {
  // try {
  //   if (userId) {
  //     crashlytics().setUserId(String(userId));
  //   } else {
  //     crashlytics().setUserId('');
  //   }
  // } catch (err) {
  //   if (__DEV__) {
  //     console.log('[Crashlytics] setCrashUser failed:', err);
  //   }
  // }
}

export function logCrashBreadcrumb(_message: string) {
  // try {
  //   crashlytics().log(message);
  // } catch {
  //   /* ignore */
  // }
}

export function recordCrashError(
  _error: unknown,
  _context?: string,
  _fatal = false,
) {
  // try {
  //   const err =
  //     error instanceof Error
  //       ? error
  //       : new Error(typeof error === 'string' ? error : JSON.stringify(error));
  //
  //   crashlytics().setAttribute('current_screen', currentScreen);
  //   if (context) {
  //     crashlytics().setAttribute('error_context', context);
  //     crashlytics().log(`${context}: ${err.message}`);
  //   }
  //   crashlytics().recordError(err, fatal ? 'fatal' : 'non-fatal');
  // } catch (err) {
  //   if (__DEV__) {
  //     console.log('[Crashlytics] recordCrashError failed:', err);
  //   }
  // }
}

/** Install once — no-op while Crashlytics is disabled. */
export function installGlobalCrashHandlers() {
  // if (globalHandlerInstalled) {
  //   return;
  // }
  // globalHandlerInstalled = true;
  //
  // const ErrorUtils = (
  //   global as unknown as {
  //     ErrorUtils?: {
  //       getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void;
  //       setGlobalHandler?: (
  //         handler: (error: Error, isFatal?: boolean) => void,
  //       ) => void;
  //     };
  //   }
  // ).ErrorUtils;
  //
  // const previous = ErrorUtils?.getGlobalHandler?.();
  //
  // ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
  //   recordCrashError(
  //     error,
  //     `Unhandled JS (${isFatal ? 'fatal' : 'non-fatal'}) on ${currentScreen}`,
  //     Boolean(isFatal),
  //   );
  //   previous?.(error, isFatal);
  // });
}

export async function initCrashReporting() {
  // try {
  //   await crashlytics().setCrashlyticsCollectionEnabled(true);
  //   crashlytics().setAttribute('platform', Platform.OS);
  //   installGlobalCrashHandlers();
  //   if (__DEV__) {
  //     console.log('[Crashlytics] initialized');
  //   }
  // } catch (err) {
  //   if (__DEV__) {
  //     console.log('[Crashlytics] init failed:', err);
  //   }
  // }
}
