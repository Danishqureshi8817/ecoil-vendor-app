import {VENDOR_API_BASE} from '@/services/config';
import {AUTH_KEYS, tokenStorage} from '@/states/storage';
import Axios, {AxiosRequestConfig} from 'axios';
import DeviceInfo from 'react-native-device-info';

export const fetcher = async (config: AxiosRequestConfig, baseURL?: string) => {
  const {url, method, data, headers} = config;
  const token = tokenStorage.getString(AUTH_KEYS.token) || '';
  const appVersion = DeviceInfo.getVersion();

  return Axios.request({
    baseURL: baseURL ?? VENDOR_API_BASE,
    url,
    method: method ?? 'GET',
    data,
    ...config,
    headers: {
      appVersion,
      Authorization: token ? `Bearer ${token}` : undefined,
      Accept: 'application/json',
      ...config?.headers,
      ...headers,
    },
  });
};
