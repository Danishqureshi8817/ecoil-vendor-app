import {useCallback} from 'react';
import {StackNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {clearSession, getStoredUser, isSessionValid} from '@/utils/sessionStorage';
import {resetAndNavigate} from '@/utils/NavigationUtils';

export default function useCheckSession() {
  const checkSession = useCallback(async (): Promise<boolean> => {
    if (!isSessionValid()) {
      clearSession();
      useAuthStore.getState().logout();
      resetAndNavigate(StackNav.Login, 0);
      return false;
    }

    const user = getStoredUser();
    if (user) {
      useAuthStore.getState().setUser(user);
    }

    resetAndNavigate(StackNav.Main, 0);
    return true;
  }, []);

  return {checkSession};
}
