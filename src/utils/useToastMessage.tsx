import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {Toast} from 'toastify-react-native';

const ICON_SIZE = 22;

const TOAST_COLORS = {
  success: {
    backgroundColor: '#047857',
    textColor: '#FFFFFF',
    progressBarColor: '#FFFFFF',
    iconColor: '#FFFFFF',
    closeIconColor: '#FFFFFF',
  },
  error: {
    backgroundColor: '#F44336',
    textColor: '#FFFFFF',
    progressBarColor: '#FFFFFF',
    iconColor: '#FFFFFF',
    closeIconColor: '#FFFFFF',
  },
  warning: {
    backgroundColor: '#FFC107',
    textColor: '#000000',
    progressBarColor: '#FFFFFF',
    iconColor: '#FFFFFF',
    closeIconColor: '#000000',
  },
  info: {
    backgroundColor: '#2196F3',
    textColor: '#FFFFFF',
    progressBarColor: '#FFFFFF',
    iconColor: '#FFFFFF',
    closeIconColor: '#FFFFFF',
  },
} as const;

function toastIcon(
  name: React.ComponentProps<typeof Ionicons>['name'],
  color: string,
) {
  return <Ionicons name={name} size={ICON_SIZE} color={color} />;
}

function closeIcon(color: string) {
  return <Ionicons name="close-outline" size={ICON_SIZE} color={color} />;
}

export function useToastMessage() {
  const toastSuccess = (message: string) => {
    const colors = TOAST_COLORS.success;
    Toast.show({
      type: 'success',
      text1: message,
      icon: toastIcon('checkmark-circle', colors.iconColor),
      closeIcon: closeIcon(colors.closeIconColor),
      ...colors,
    });
  };

  const toastError = (message: string) => {
    const colors = TOAST_COLORS.error;
    Toast.show({
      type: 'error',
      text1: message,
      icon: toastIcon('alert-circle', colors.iconColor),
      closeIcon: closeIcon(colors.closeIconColor),
      ...colors,
    });
  };

  const toastInfo = (message: string) => {
    const colors = TOAST_COLORS.info;
    Toast.show({
      type: 'info',
      text1: message,
      icon: toastIcon('information-circle', colors.iconColor),
      closeIcon: closeIcon(colors.closeIconColor),
      ...colors,
    });
  };

  const toastWarning = (message: string) => {
    const colors = TOAST_COLORS.warning;
    Toast.show({
      type: 'warn',
      text1: message,
      icon: toastIcon('warning', colors.iconColor),
      closeIcon: closeIcon(colors.closeIconColor),
      ...colors,
    });
  };

  return {toastSuccess, toastError, toastInfo, toastWarning};
}
