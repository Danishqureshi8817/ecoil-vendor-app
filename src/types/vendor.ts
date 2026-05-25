export type ExternalVendorUser = {
  name: string;
  email?: string;
  mobile?: string;
  firm_name?: string;
  [key: string]: unknown;
};

export type ExternalAuthSession = {
  token: string;
  expiry: string | null;
  user: ExternalVendorUser;
};

export type KnparisesEnvelope<T = unknown> = {
  status?: string;
  message?: string;
  data?: T;
};
