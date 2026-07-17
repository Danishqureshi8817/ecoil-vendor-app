import { useEffect, useRef } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import InAppUpdates, { IAUUpdateKind, StartUpdateOptions } from 'sp-react-native-in-app-updates';
import DeviceInfo from 'react-native-device-info';
import useGetSetting from '@/hooks/home/get-setting';

const IOS_APP_STORE_ID = '6502945020';
const IOS_APP_STORE_URL = `itms-apps://apps.apple.com/app/id${IOS_APP_STORE_ID}`;
const IOS_APP_STORE_WEB_URL = `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`;

/**
 * Returns true when liveVersion is greater than currentVersion.
 */
export const isUpdateRequired = (currentVersion: string, liveVersion: string): boolean => {
  const current = currentVersion.split('.').map(Number);
  const live = liveVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(current.length, live.length); i++) {
    const currentPart = current[i] || 0;
    const livePart = live[i] || 0;

    if (livePart > currentPart) return true;
    if (livePart < currentPart) return false;
  }

  return false;
};

const openIOSAppStore = async () => {
  try {
    await Linking.openURL(IOS_APP_STORE_URL);
  } catch (error) {
    console.log('iOS App Store open error:', error);
    await Linking.openURL(IOS_APP_STORE_WEB_URL);
  }
};

const showIOSUpdateAlert = (liveVersion: string) => {
  Alert.alert(
    'Update Available',
    `A new version (${liveVersion}) is available on the App Store. Please update to get the latest features and improvements.`,
    [
      {
        text: 'Update Now',
        onPress: () => {
          openIOSAppStore();
        },
      },
      {
        text: 'Later',
        style: 'cancel',
      },
    ],
    { cancelable: false },
  );
};

/**
 * Check Android Play Store for updates
 */
const checkAndroidUpdate = async () => {
  try {
    const inAppUpdates = new InAppUpdates(false); // false = not debug mode

    // Check for available updates on Google Play
    const result = await inAppUpdates.checkNeedsUpdate();
    
    if (result.shouldUpdate) {
      const updateOptions: StartUpdateOptions = {
        updateType: IAUUpdateKind.IMMEDIATE, // or FLEXIBLE
      };
      inAppUpdates.startUpdate(updateOptions);
    }
  } catch (err) {
    console.log('Android In-App Update Error: ', err);
    // Silently fail - don't interrupt user experience
  }
};

const useInAppUpdate = () => {
  const { data: settingData } = useGetSetting();
  const hasShownIOSUpdateAlert = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      checkAndroidUpdate();
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios' || hasShownIOSUpdateAlert.current) {
      return;
    }

    const liveVersion = 
      settingData?.data?.result?.[0]?.generalSettings?.app_version_ios;

    if (!liveVersion) {
      return;
    }

    const currentVersion = DeviceInfo.getVersion();
    if (isUpdateRequired(currentVersion, liveVersion)) {
      hasShownIOSUpdateAlert.current = true;
      showIOSUpdateAlert(liveVersion);
    }
  }, [settingData]);
};

export default useInAppUpdate;
