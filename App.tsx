import AppNavigator from '@/navigations/AppNavigator';
import {QueryProvider} from '@/providers/QueryProvider';
import React from 'react';
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
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ToastProvider
        position="bottom"
        showCloseIcon
        icons={TOAST_ICONS}
        closeIcon={CLOSE_ICON}
      />
      <SafeAreaProvider>
        <QueryProvider>
          <AppNavigator />
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
