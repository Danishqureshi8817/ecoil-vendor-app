import {
  fetchAndStoreFcmToken,
  getInitialNotification,
  getNotificationBody,
  getNotificationTitle,
  subscribeToFcmTokenRefresh,
  subscribeToForegroundMessages,
  subscribeToNotificationOpen,
} from '@/services/pushNotificationService';
import {useToastMessage} from '@/utils/useToastMessage';
import {useEffect} from 'react';

function logFcmToken(token: string | null) {
  if (__DEV__ && token) {
    console.log('[FCM] Device token:', token);
  }
}

export default function usePushNotifications() {
  const {toastInfo} = useToastMessage();

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const token = await fetchAndStoreFcmToken();
        if (active) {
          logFcmToken(token);
        }
      } catch (err) {
        if (__DEV__) {
          console.log('[FCM] init error:', err);
        }
      }
    };

    init();

    const unsubscribeToken = subscribeToFcmTokenRefresh(token => {
      logFcmToken(token);
    });

    const unsubscribeForeground = subscribeToForegroundMessages(message => {
      const title = getNotificationTitle(message);
      const body = getNotificationBody(message);
      const text = body ? `${title}: ${body}` : title;
      if (__DEV__) {
        console.log('[FCM] foreground message:', text);
      }
      // if (text.trim()) {
      //   toastInfo(text);
      // }
    });

    const unsubscribeOpen = subscribeToNotificationOpen(message => {
      if (__DEV__) {
        console.log('[FCM] Notification opened:', message.data);
      }
    });

    getInitialNotification()
      .then(message => {
        if (message && __DEV__) {
          console.log('[FCM] App opened from quit state:', message.data);
        }
      })
      .catch(err => {
        if (__DEV__) {
          console.log('[FCM] getInitialNotification error:', err);
        }
      });

    return () => {
      active = false;
      unsubscribeToken();
      unsubscribeForeground();
      unsubscribeOpen();
    };
  }, [toastInfo]);
}
