import {storage} from '@/states/storage';

const ONBOARDING_KEY = 'onboarding_completed';

export function hasCompletedOnboarding(): boolean {
  return storage.getBoolean(ONBOARDING_KEY) ?? false;
}

export function setOnboardingCompleted(): void {
  storage.set(ONBOARDING_KEY, true);
}
