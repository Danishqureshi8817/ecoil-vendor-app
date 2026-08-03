import type {CounterCollectionRow} from '@/api/reportsApi';
import type {ScrapRequestRow} from '@/api/scrapApi';
import type {WasteRequestRow} from '@/api/wasteApi';

export const TabNav = {
  Home: 'Home',
  Services: 'Services',
  Requests: 'Requests',
  CountersCollection: 'CountersCollection',
  Profile: 'Profile',
} as const;

export const StackNav = {
  Splash: 'Splash',
  Onboarding: 'Onboarding',
  Login: 'Login',
  Main: 'Main',
  CollectRequestList: 'CollectRequestList',
  CollectRequestDetail: 'CollectRequestDetail',
  CountersCollectionList: 'CountersCollectionList',
  CountersCollectionDetail: 'CountersCollectionDetail',
  ScrapRequests: 'ScrapRequests',
  CreateScrapRequest: 'CreateScrapRequest',
  ProcessScrapRequest: 'ProcessScrapRequest',
  WasteRequests: 'WasteRequests',
  CreateWasteRequest: 'CreateWasteRequest',
  ProcessWasteRequest: 'ProcessWasteRequest',
  MyCertificates: 'MyCertificates',
  MyRewards: 'MyRewards',
  PaymentDetails: 'PaymentDetails',
  Agreement: 'Agreement',
  MyServiceRequests: 'MyServiceRequests',
  TabNav: 'TabNav',
  CollectionRequest: 'CollectionRequest',
  ContactUs: 'ContactUs',
  PrivacyPolicy: 'PrivacyPolicy',
} as const;

export type RootStackParamList = {
  [StackNav.Splash]: undefined;
  [StackNav.Onboarding]: undefined;
  [StackNav.Login]: undefined;
  [StackNav.Main]:
  | { screen?: keyof MainTabParamList }
  | undefined;
  [StackNav.CollectRequestList]: undefined;
  [StackNav.CollectRequestDetail]: { id: string };
  [StackNav.CountersCollectionDetail]: { row: CounterCollectionRow };
  [StackNav.ScrapRequests]: undefined;
  [StackNav.CreateScrapRequest]: { request?: ScrapRequestRow } | undefined;
  [StackNav.ProcessScrapRequest]: { request: ScrapRequestRow };
  [StackNav.WasteRequests]: undefined;
  [StackNav.CreateWasteRequest]: { request?: WasteRequestRow } | undefined;
  [StackNav.ProcessWasteRequest]: { request: WasteRequestRow };
  [StackNav.MyCertificates]: undefined;
  [StackNav.MyRewards]: undefined;
  [StackNav.PaymentDetails]: undefined;
  [StackNav.Agreement]: undefined;
  [StackNav.MyServiceRequests]: undefined;
  [StackNav.ContactUs]: undefined;
  [StackNav.PrivacyPolicy]: undefined;
};

export type MainTabParamList = {
  [TabNav.Home]: undefined;
  [TabNav.Services]: undefined;
  [TabNav.Requests]: undefined;
  [TabNav.CountersCollection]: undefined;
  [TabNav.Profile]: undefined;
};
