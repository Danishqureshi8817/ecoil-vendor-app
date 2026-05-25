import {isAxiosError} from 'axios';

const UNAVAILABLE_MSG =
  'Service is temporarily unavailable. Please try again in a few minutes.';
const OFFLINE_MSG =
  'Unable to connect right now. Please check your internet connection and try again.';

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 502 || status === 503) {
      return UNAVAILABLE_MSG;
    }
    if (status === 504) {
      return 'Request timed out. Please check your connection and try again.';
    }
    if (!err.response) {
      const code = err.code ?? '';
      if (code === 'ERR_NETWORK' || code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
        return OFFLINE_MSG;
      }
    }
    const data = err.response?.data as
      | {message?: string | string[]; status?: string}
      | undefined;
    if (data?.status === 'Error' && typeof data.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data?.message)) {
      return data.message.join(', ');
    }
    if (typeof data?.message === 'string') {
      return data.message;
    }
    if (status && status >= 500) {
      return UNAVAILABLE_MSG;
    }
    if (status) {
      return fallback;
    }
  }
  if (err instanceof Error && err.message && !err.message.startsWith('Request failed')) {
    return err.message;
  }
  return fallback;
}
