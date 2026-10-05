import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';

async function requestAndroidPermission(
  permission: string,
  rationale: {title: string; message: string},
): Promise<'granted' | 'denied' | 'blocked'> {
  if (Platform.OS !== 'android') {
    return 'granted';
  }

  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return 'granted';
  }

  const result = await PermissionsAndroid.request(permission, {
    title: rationale.title,
    message: rationale.message,
    buttonPositive: 'Allow',
    buttonNegative: 'Deny',
    buttonNeutral: 'Ask Me Later',
  });

  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return 'granted';
  }
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    return 'blocked';
  }
  return 'denied';
}

/**
 * Required when CAMERA is declared in AndroidManifest (react-native-image-picker docs).
 * Call before launchCamera().
 * @see https://www.npmjs.com/package/react-native-image-picker
 */
export async function requestCameraAccess(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    // iOS: NSCameraUsageDescription triggers native prompt.
    return true;
  }

  const status = await requestAndroidPermission(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera permission',
      message: 'Ecoil needs camera access to take photos.',
    },
  );

  if (status === 'granted') {
    return true;
  }

  Alert.alert(
    'Camera permission required',
    status === 'blocked'
      ? 'Camera access is blocked. Please enable it in Settings to take photos.'
      : 'Please allow camera access to take photos.',
    [
      {text: 'Cancel', style: 'cancel'},
      ...(status === 'blocked'
        ? [
            {
              text: 'Open Settings',
              onPress: () => {
                void Linking.openSettings();
              },
            },
          ]
        : [
            {
              text: 'Try again',
              onPress: () => {
                void requestCameraAccess();
              },
            },
          ]),
    ],
  );
  return false;
}
