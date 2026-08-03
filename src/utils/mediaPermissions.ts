import {
  Alert,
  Linking,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

export function isImagePickerNativeAvailable(): boolean {
  return NativeModules.ImagePicker != null;
}

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

export async function requestCameraAccess(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    // iOS permission is prompted by the native camera picker.
    return true;
  }

  const status = await requestAndroidPermission(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera permission',
      message: 'Ecoil needs camera access to take scrap pictures.',
    },
  );

  if (status === 'granted') {
    return true;
  }

  Alert.alert(
    'Camera permission required',
    status === 'blocked'
      ? 'Camera access is blocked. Please enable it in Settings to take photos.'
      : 'Please allow camera access to take scrap pictures.',
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

export async function requestGalleryAccess(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  // Android 13+ photo access. Older versions use storage permission.
  const permission =
    typeof Platform.Version === 'number' && Platform.Version >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  // If the constant is missing on this RN build, let the picker prompt itself.
  if (!permission) {
    return true;
  }

  const status = await requestAndroidPermission(permission, {
    title: 'Photos permission',
    message: 'Ecoil needs photo access to choose scrap pictures from gallery.',
  });

  if (status === 'granted') {
    return true;
  }

  Alert.alert(
    'Photos permission required',
    status === 'blocked'
      ? 'Photo access is blocked. Please enable it in Settings to choose images.'
      : 'Please allow photo access to choose scrap pictures.',
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
                void requestGalleryAccess();
              },
            },
          ]),
    ],
  );
  return false;
}
