import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';
import {PUSH_KEYS, storage} from '@/states/storage';

export type PushNotificationData = Record<string, string | undefined>;

export function getStoredFcmToken(): string | null {
  return storage.getString(PUSH_KEYS.fcmToken) ?? null;
}

export function storeFcmToken(token: string) {
  storage.set(PUSH_KEYS.fcmToken, token);
}

export function clearStoredFcmToken() {
  storage.remove(PUSH_KEYS.fcmToken);
}

export function getNotificationTitle(
  message: FirebaseMessagingTypes.RemoteMessage,
): string {
  return (
    message.notification?.title ??
    (typeof message.data?.title === 'string' ? message.data.title : '') ??
    'Ecoil Partner'
  );
}

export function getNotificationBody(
  message: FirebaseMessagingTypes.RemoteMessage,
): string {
  return (
    message.notification?.body ??
    (typeof message.data?.body === 'string' ? message.data.body : '') ??
    ''
  );
}

async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function requestPushPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  const androidGranted = await requestAndroidNotificationPermission();
  if (!androidGranted) {
    return false;
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function fetchAndStoreFcmToken(): Promise<string | null> {
  if (Platform.OS !== 'android') {
    return null;
  }

  const hasPermission = await requestPushPermission();
  if (!hasPermission) {
    return null;
  }

  const token = await messaging().getToken();
  if (token) {
    storeFcmToken(token);
  }
  return token;
}

export function subscribeToFcmTokenRefresh(
  onToken: (token: string) => void,
): () => void {
  return messaging().onTokenRefresh(token => {
    storeFcmToken(token);
    onToken(token);
  });
}

export function subscribeToForegroundMessages(
  onMessage: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): () => void {
  return messaging().onMessage(onMessage);
}

export function subscribeToNotificationOpen(
  onOpen: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): () => void {
  return messaging().onNotificationOpenedApp(onOpen);
}

export async function getInitialNotification(): Promise<FirebaseMessagingTypes.RemoteMessage | null> {
  return messaging().getInitialNotification();
}
