export const TabNav = {
  Home: 'Home',
  Services: 'Services',
  Requests: 'Requests',
  Collect: 'Collect',
} as const;

export const StackNav = {
  Splash: 'Splash',
  Login: 'Login',
  Main: 'Main',
  CollectRequestList: 'CollectRequestList',
  CollectRequestDetail: 'CollectRequestDetail',
  MyCertificates: 'MyCertificates',
  PaymentDetails: 'PaymentDetails',
  Agreement: 'Agreement',
} as const;

export type RootStackParamList = {
  [StackNav.Splash]: undefined;
  [StackNav.Login]: undefined;
  [StackNav.Main]:
    | {screen?: keyof MainTabParamList}
    | undefined;
  [StackNav.CollectRequestList]: undefined;
  [StackNav.CollectRequestDetail]: {id: string};
  [StackNav.MyCertificates]: undefined;
  [StackNav.PaymentDetails]: undefined;
  [StackNav.Agreement]: undefined;
};

export type MainTabParamList = {
  [TabNav.Home]: undefined;
  [TabNav.Services]: undefined;
  [TabNav.Requests]: undefined;
  [TabNav.Collect]: undefined;
};
