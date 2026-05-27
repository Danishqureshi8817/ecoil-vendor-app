const KNPARISES_ASSETS_BASE = 'https://app.knparises.com';
const GATE_PASS_UPLOAD_PATH = '/assets/uploads/gatepass';

export function gatePassImageUrl(gatePass: string): string {
  const raw = gatePass.trim();
  if (!raw) {
    return '';
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  if (raw.startsWith('assets/')) {
    return `${KNPARISES_ASSETS_BASE}/${raw.replace(/^\/+/, '')}`;
  }
  const file = raw.replace(/^\/+/, '').split('/').pop() || raw;
  return `${KNPARISES_ASSETS_BASE}${GATE_PASS_UPLOAD_PATH}/${encodeURIComponent(file)}`;
}

export function gatePassFileName(gatePass: string): string {
  const raw = gatePass.trim();
  if (!raw) {
    return 'gate-pass.jpg';
  }
  if (/^https?:\/\//i.test(raw)) {
    const segment = raw.split('/').pop();
    return segment && segment.length > 0 ? decodeURIComponent(segment) : 'gate-pass.jpg';
  }
  const file = raw.replace(/^\/+/, '').split('/').pop() || raw;
  return decodeURIComponent(file);
}
