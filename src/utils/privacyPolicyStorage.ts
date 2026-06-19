import {storage} from '@/states/storage';

const PRIVACY_POLICY_KEY = 'privacy_policy_accepted';

export function hasAcceptedPrivacyPolicy(): boolean {
  return storage.getBoolean(PRIVACY_POLICY_KEY) ?? false;
}

export function setPrivacyPolicyAccepted(): void {
  storage.set(PRIVACY_POLICY_KEY, true);
}
