import usePushNotifications from '@/hooks/usePushNotifications';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export function PushNotificationProvider({children}: Props) {
  usePushNotifications();
  return <>{children}</>;
}
