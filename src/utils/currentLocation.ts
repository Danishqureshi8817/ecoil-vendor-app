import Geolocation from '@react-native-community/geolocation';
import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

export type CurrentCoords = {
  latitude: number;
  longitude: number;
};

/** Open system Location / GPS settings (Android) or app Settings (iOS). */
async function openLocationSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
      return;
    } catch {
      // fall through to app settings
    }
  }
  await Linking.openSettings();
}

function promptTurnOnLocation(): Promise<boolean> {
  return new Promise(resolve => {
    Alert.alert(
      'Location is off',
      'Please turn on Location / GPS to continue processing this request.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Turn On',
          onPress: () => {
            void openLocationSettings().finally(() => resolve(false));
          },
        },
      ],
      {cancelable: true, onDismiss: () => resolve(false)},
    );
  });
}

/**
 * After permission: check device Location/GPS is on.
 * If off, prompt user to turn it on (opens system location settings).
 */
export async function ensureLocationServicesOn(): Promise<boolean> {
  let enabled = true;
  try {
    enabled = await DeviceInfo.isLocationEnabled();
  } catch {
    // If check fails, still attempt GPS fetch.
    return true;
  }
  if (enabled) {
    return true;
  }
  await promptTurnOnLocation();
  return false;
}

/** Ask location permission early (Process screen mount). */
export async function requestLocationAccess(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    // iOS prompts on first getCurrentPosition via Info.plist usage string.
    return true;
  }
  return requestAndroidLocationAccess();
}

async function requestAndroidLocationAccess(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const fine = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  const coarse = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;

  const hasFine = await PermissionsAndroid.check(fine);
  if (hasFine) {
    return true;
  }

  const result = await PermissionsAndroid.requestMultiple([fine, coarse]);
  const fineStatus = result[fine];
  const coarseStatus = result[coarse];
  const granted =
    fineStatus === PermissionsAndroid.RESULTS.GRANTED ||
    coarseStatus === PermissionsAndroid.RESULTS.GRANTED;

  if (granted) {
    return true;
  }

  const blocked =
    fineStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
    coarseStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

  Alert.alert(
    'Location permission required',
    blocked
      ? 'Location access is blocked. Please enable it in Settings to submit the request.'
      : 'Please allow location access so we can attach your current location to the process request.',
    [
      {text: 'Cancel', style: 'cancel'},
      ...(blocked
        ? [
            {
              text: 'Open Settings',
              onPress: () => {
                void Linking.openSettings();
              },
            },
          ]
        : []),
    ],
  );
  return false;
}

/**
 * Current device coordinates for scrap/waste submit (latitude / longitude).
 * 1) Permission → 2) Location/GPS on → 3) read coords.
 * Returns null if permission denied, GPS off, or unavailable.
 */
export async function getCurrentCoords(): Promise<CurrentCoords | null> {
  const allowed = await requestAndroidLocationAccess();
  if (!allowed) {
    return null;
  }

  const servicesOn = await ensureLocationServicesOn();
  if (!servicesOn) {
    return null;
  }

  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          (latitude === 0 && longitude === 0)
        ) {
          resolve(null);
          return;
        }
        resolve({latitude, longitude});
      },
      error => {
        // Permission OK but GPS still off / unavailable → ask to turn on.
        if (error?.code === 2 || error?.code === 3) {
          void promptTurnOnLocation().finally(() => resolve(null));
          return;
        }
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 20_000,
        maximumAge: 10_000,
      },
    );
  });
}
