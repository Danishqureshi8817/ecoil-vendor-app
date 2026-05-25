import type {KnparisesEnvelope} from '@/types/vendor';

export function unwrapKnparises<T>(body: KnparisesEnvelope<T>): T {
  if (body.status === 'Error') {
    throw new Error(body.message || 'Request failed');
  }
  if (body.data === undefined || body.data === null) {
    throw new Error(body.message || 'Empty response from server');
  }
  return body.data;
}
