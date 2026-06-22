import type {CounterCollectionRow} from '@/api/reportsApi';

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
  MyCertificates: 'MyCertificates',
  MyRewards: 'MyRewards',
  PaymentDetails: 'PaymentDetails',
  Agreement: 'Agreement',
  MyServiceRequests: 'MyServiceRequests',
  TabNav: 'TabNav',
  CollectionRequest: 'CollectionRequest'
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
  [StackNav.MyCertificates]: undefined;
  [StackNav.MyRewards]: undefined;
  [StackNav.PaymentDetails]: undefined;
  [StackNav.Agreement]: undefined;
  [StackNav.MyServiceRequests]: undefined;
};

export type MainTabParamList = {
  [TabNav.Home]: undefined;
  [TabNav.Services]: undefined;
  [TabNav.Requests]: undefined;
  [TabNav.CountersCollection]: undefined;
  [TabNav.Profile]: undefined;
};
