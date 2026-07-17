import {useCallback, useEffect, useMemo, useRef} from 'react';
import {Linking, Platform} from 'react-native';
import InAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
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

/** Android Play in-app update flow (native Google Play UI). */
async function startAndroidInAppUpdate() {
  try {
    const inAppUpdates = new InAppUpdates(false);
    const result = await inAppUpdates.checkNeedsUpdate();
    if (!result.shouldUpdate) {
      return;
    }
    const updateOptions: StartUpdateOptions = {
      updateType: IAUUpdateKind.IMMEDIATE,
    };
    await inAppUpdates.startUpdate(updateOptions);
  } catch (err) {
    console.log('Android In-App Update Error:', err);
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
    return isUpdateRequired(currentVersion, liveVersion);
  }, [liveVersion]);

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
