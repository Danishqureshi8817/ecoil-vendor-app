import {StackNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {
  clearSession,
  getStoredUser,
  isSessionValid,
} from '@/utils/sessionStorage';
import {hasCompletedOnboarding} from '@/utils/onboardingStorage';
import {resetAndNavigate} from '@/utils/NavigationUtils';

export async function resolvePostSplashRoute(): Promise<void> {
  if (isSessionValid()) {
    const user = getStoredUser();
    if (user) {
      useAuthStore.getState().setUser(user);
    }
    resetAndNavigate(StackNav.Main, 0);
    return;
  }

  clearSession();
  useAuthStore.getState().logout();

  if (!hasCompletedOnboarding()) {
    resetAndNavigate(StackNav.Onboarding, 0);
    return;
  }

  resetAndNavigate(StackNav.Login, 0);
}
