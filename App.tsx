import AppNavigator from '@/navigations/AppNavigator';
import ErrorBoundary from '@/components/global/ErrorBoundary';
import {QueryProvider} from '@/providers/QueryProvider';
import {PushNotificationProvider} from '@/providers/PushNotificationProvider';
import {initCrashReporting, setCrashUser} from '@/services/crashReporting';
import {useAuthStore} from '@/states/authStore';
import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import ToastProvider from 'toastify-react-native';

const TOAST_ICONS = {
  success: <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />,
  error: <Ionicons name="alert-circle" size={22} color="#FFFFFF" />,
  info: <Ionicons name="information-circle" size={22} color="#FFFFFF" />,
  warn: <Ionicons name="warning" size={22} color="#FFFFFF" />,
  default: <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />,
};

const CLOSE_ICON = <Ionicons name="close-outline" size={22} color="#FFFFFF" />;

function App() {
  const userId = useAuthStore(s => {
    const u = s.user;
    if (!u) {
      return null;
    }
    const raw = u.id ?? u.user_id ?? u.mobile ?? u.email;
    return raw != null ? String(raw) : null;
  });

  useEffect(() => {
    void initCrashReporting();
  }, []);

  useEffect(() => {
    setCrashUser(userId);
  }, [userId]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ErrorBoundary>
        <ToastProvider
          position="bottom"
          showCloseIcon
          icons={TOAST_ICONS}
          closeIcon={CLOSE_ICON}
        />
        <SafeAreaProvider>
          <QueryProvider>
            <PushNotificationProvider>
              <AppNavigator />
            </PushNotificationProvider>
          </QueryProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default App;
