import {isAxiosError} from 'axios';

const UNAVAILABLE_MSG =
  'Service is temporarily unavailable. Please try again in a few minutes.';
const OFFLINE_MSG =
  'Unable to connect right now. Please check your internet connection and try again.';

type ApiErrorBody = {
  message?: string | string[];
  status?: string;
};

function extractResponseMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const body = data as ApiErrorBody;

  if (body.status === 'Error' && typeof body.message === 'string' && body.message.trim()) {
    return body.message.trim();
  }

  if (Array.isArray(body.message)) {
    const text = body.message.map(m => String(m).trim()).filter(Boolean).join(', ');
    if (text) {
      return text;
    }
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message.trim();
  }

  return null;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const fromBody = extractResponseMessage(err.response?.data);
    if (fromBody) {
      return fromBody;
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
    if (status === 502 || status === 503 || (status != null && status >= 500)) {
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
