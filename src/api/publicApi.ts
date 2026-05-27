import axios from 'axios';
import {PUBLIC_API_BASE} from '@/config/env';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';

const publicApi = axios.create({
  baseURL: PUBLIC_API_BASE.replace(/\/$/, ''),
  timeout: 60_000,
  headers: {'Content-Type': 'application/json', Accept: 'application/json'},
});

export function normalizeVendorMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 10) {
    return digits;
  }
  return mobile.trim();
}

export type PublicService = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicSupplierDirectoryRow = {
  id: string;
  name: string;
  mobile: string;
  city: string | null;
  verified: boolean;
};

export async function fetchPublicSuppliersByCity(
  city: string,
  serviceId?: string,
): Promise<PublicSupplierDirectoryRow[]> {
  const cityQ = city.trim();
  if (!cityQ) {
    return [];
  }
  const {data} = await publicApi.get<PublicSupplierDirectoryRow[]>('/suppliers', {
    params: {
      city: cityQ,
      ...(serviceId?.trim() ? {serviceId: serviceId.trim()} : {}),
    },
  });
  return data;
}

export type FormQuestionType = 'TEXT' | 'DROPDOWN' | 'CHECKBOX';

export type ServiceFormQuestion = {
  id: string;
  label: string;
  type: FormQuestionType;
  required: boolean;
  sortOrder: number;
  options: {id: string; label: string; sortOrder: number}[];
};

export type ServiceFormPayload = {
  id: string | null;
  serviceId: string;
  serviceName: string;
  title: string | null;
  questions: ServiceFormQuestion[];
};

export async function fetchPublicServices(q?: string): Promise<PublicService[]> {
  const {data} = await publicApi.get<PublicService[]>('/services', {
    params: q?.trim() ? {q: q.trim()} : {},
  });
  return data;
}

export async function fetchPublicServiceForm(
  serviceId: string,
): Promise<ServiceFormPayload> {
  const {data} = await publicApi.get<ServiceFormPayload>(
    `/services/${serviceId}/form`,
  );
  return data;
}

export function isServiceFormAvailable(form: ServiceFormPayload): boolean {
  return Array.isArray(form.questions) && form.questions.length > 0;
}

export type VendorApplicationRow = {
  id: string;
  serviceId: string;
  serviceName: string;
  vendorId: string;
  vendorName: string;
  vendorMobile: string;
  createdAt: string;
};

export async function fetchMyApplications(
  vendorMobile: string,
): Promise<VendorApplicationRow[]> {
  const mobile = normalizeVendorMobile(vendorMobile);
  const {data} = await publicApi.get<VendorApplicationRow[]>('/my-applications', {
    params: {vendorMobile: mobile},
  });
  return data;
}

export type VendorApplicationDetail = VendorApplicationRow & {
  answers: {
    id: string;
    questionId: string;
    questionLabel: string;
    questionType: string;
    answer: string;
  }[];
};

export async function fetchMyApplicationDetail(
  id: string,
  vendorMobile: string,
): Promise<VendorApplicationDetail> {
  const mobile = normalizeVendorMobile(vendorMobile);
  const {data} = await publicApi.get<VendorApplicationDetail>(
    `/my-applications/${id}`,
    {params: {vendorMobile: mobile}},
  );
  return data;
}

export async function submitPublicServiceApplication(
  serviceId: string,
  payload: {
    vendorId?: string;
    vendorName: string;
    vendorMobile: string;
    answers: {questionId: string; value: string}[];
  },
): Promise<{id?: string; message?: string}> {
  const {data} = await publicApi.post(`/services/${serviceId}/applications`, payload);
  return data as {id?: string; message?: string};
}

export function getPublicApiError(err: unknown, fallback: string): string {
  return getApiErrorMessage(err, fallback);
}

const AVATAR_COLORS = [
  '#2d8f47',
  '#3cb371',
  '#1e6b38',
  '#5ed48a',
  '#247a3c',
  '#6366f1',
  '#0ea5e9',
];

export function serviceAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
