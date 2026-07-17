import {useCallback, useEffect, useMemo, useRef} from 'react';
import {Linking, Platform, TurboModuleRegistry} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import useAppSettings from '@/hooks/useAppSettings';

const IOS_APP_STORE_ID = '6502945020';
const IOS_APP_STORE_URL = `itms-apps://apps.apple.com/app/id${IOS_APP_STORE_ID}`;
const IOS_APP_STORE_WEB_URL = `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`;

const ANDROID_PACKAGE = 'com.arises.knp';
const ANDROID_PLAY_URL = `market://details?id=${ANDROID_PACKAGE}`;
const ANDROID_PLAY_WEB_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

/** Returns true when liveVersion is greater than currentVersion. */
export const isUpdateRequired = (
  currentVersion: string,
  liveVersion: string,
): boolean => {
  const current = currentVersion.split('.').map(part => Number(part) || 0);
  const live = liveVersion.split('.').map(part => Number(part) || 0);

  for (let i = 0; i < Math.max(current.length, live.length); i++) {
    const currentPart = current[i] || 0;
    const livePart = live[i] || 0;

    if (livePart > currentPart) {
      return true;
    }
    if (livePart < currentPart) {
      return false;
    }
  }

  return false;
};

async function openStore() {
  if (Platform.OS === 'ios') {
    try {
      await Linking.openURL(IOS_APP_STORE_URL);
    } catch {
      await Linking.openURL(IOS_APP_STORE_WEB_URL);
    }
    return;
  }

  try {
    await Linking.openURL(ANDROID_PLAY_URL);
  } catch {
    await Linking.openURL(ANDROID_PLAY_WEB_URL);
  }
}

/**
 * Android Play in-app update.
 * Lazy-loads native module so missing/unlinked SpInAppUpdates does not crash the app.
 */
async function startAndroidInAppUpdate() {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    const native = TurboModuleRegistry.get('SpInAppUpdates');
    if (!native) {
      console.log(
        '[InAppUpdate] SpInAppUpdates native module not linked yet — rebuild Android app',
      );
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('sp-react-native-in-app-updates') as {
      default: new (isDebug: boolean) => {
        checkNeedsUpdate: () => Promise<{shouldUpdate: boolean}>;
        startUpdate: (options: {updateType: number}) => Promise<void>;
      };
      IAUUpdateKind: {IMMEDIATE: number; FLEXIBLE: number};
    };

    const inAppUpdates = new mod.default(false);
    const result = await inAppUpdates.checkNeedsUpdate();
    if (!result.shouldUpdate) {
      return;
    }
    await inAppUpdates.startUpdate({
      updateType: mod.IAUUpdateKind.IMMEDIATE,
    });
  } catch (err) {
    console.log('[InAppUpdate] Android In-App Update Error:', err);
  }
}

export type InAppUpdateState = {
  updateRequired: boolean;
  liveVersion: string;
  onUpdatePress: () => void;
};

/**
 * Compares installed app version with settings API versions.
 * Shows a fixed update modal on both platforms when outdated.
 * On Android also triggers Play Store in-app update when available.
 */
const useInAppUpdate = (): InAppUpdateState => {
  const {data: settings} = useAppSettings();
  const androidInAppStarted = useRef(false);

  // useEffect(() => {
  //   console.log('[InAppUpdate] current app version', {
  //     platform: Platform.OS,
  //     currentVersion: DeviceInfo.getVersion(),
  //     buildNumber: DeviceInfo.getBuildNumber(),
  //     bundleId: DeviceInfo.getBundleId(),
  //   });
  // }, []);

  const liveVersion = useMemo(() => {
    if (!settings) {
      return '';
    }
    return Platform.OS === 'ios'
      ? settings.app_ios_version?.trim() || ''
      : settings.app_android_version?.trim() || '';
  }, [settings]);

  const updateRequired = useMemo(() => {
    if (!liveVersion) {
      return false;
    }
    const currentVersion = DeviceInfo.getVersion();
    const required = isUpdateRequired(currentVersion, liveVersion);
    console.log('[InAppUpdate] version check', {
      platform: Platform.OS,
      currentVersion,
      liveVersion,
      settingsAndroid: settings?.app_android_version,
      settingsIos: settings?.app_ios_version,
      updateRequired: required,
    });
    return required;
  }, [liveVersion, settings?.app_android_version, settings?.app_ios_version]);

  useEffect(() => {
    if (
      Platform.OS !== 'android' ||
      !updateRequired ||
      androidInAppStarted.current
    ) {
      return;
    }
    androidInAppStarted.current = true;
    void startAndroidInAppUpdate();
  }, [updateRequired]);

  const onUpdatePress = useCallback(() => {
    void openStore();
  }, []);

  return {
    updateRequired,
    liveVersion,
    onUpdatePress,
  };
};

export default useInAppUpdate;
