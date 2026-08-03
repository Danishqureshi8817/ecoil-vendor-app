import type {ScrapRequestRow} from '@/api/scrapApi';
import type {WasteRequestRow} from '@/api/wasteApi';

export const TabNav = {
  Home: 'Home',
  Services: 'Services',
  Requests: 'Requests',
  Collect: 'Collect',
  Scrap: 'Scrap',
  Waste: 'Waste',
} as const;

export const StackNav = {
  Splash: 'Splash',
  Login: 'Login',
  Main: 'Main',
  CollectRequestList: 'CollectRequestList',
  CollectRequestDetail: 'CollectRequestDetail',
  MyCertificates: 'MyCertificates',
  MyRewards: 'MyRewards',
  PaymentDetails: 'PaymentDetails',
  Agreement: 'Agreement',
  ScrapRequests: 'ScrapRequests',
  CreateScrapRequest: 'CreateScrapRequest',
  ProcessScrapRequest: 'ProcessScrapRequest',
  WasteRequests: 'WasteRequests',
  CreateWasteRequest: 'CreateWasteRequest',
  ProcessWasteRequest: 'ProcessWasteRequest',
} as const;

export type RootStackParamList = {
  [StackNav.Splash]: undefined;
  [StackNav.Login]: undefined;
  [StackNav.Main]: {screen?: keyof MainTabParamList} | undefined;
  [StackNav.CollectRequestList]: undefined;
  [StackNav.CollectRequestDetail]: {id: string};
  [StackNav.MyCertificates]: undefined;
  [StackNav.MyRewards]: undefined;
  [StackNav.PaymentDetails]: undefined;
  [StackNav.Agreement]: undefined;
  [StackNav.ScrapRequests]: undefined;
  [StackNav.CreateScrapRequest]: {request?: ScrapRequestRow} | undefined;
  [StackNav.ProcessScrapRequest]: {request: ScrapRequestRow};
  [StackNav.WasteRequests]: undefined;
  [StackNav.CreateWasteRequest]: {request?: WasteRequestRow} | undefined;
  [StackNav.ProcessWasteRequest]: {request: WasteRequestRow};
};

export type MainTabParamList = {
  [TabNav.Home]: undefined;
  [TabNav.Services]: undefined;
  [TabNav.Requests]: undefined;
  [TabNav.Collect]: undefined;
  [TabNav.Scrap]: undefined;
  [TabNav.Waste]: undefined;
};
