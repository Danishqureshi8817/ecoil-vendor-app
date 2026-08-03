import { StackNav, TabNav } from '@/navigations/NavigationKeys';
import {
  CommonActions,
  createNavigationContainerRef,
  StackActions,
  type NavigationState,
  type PartialState,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

type NavState = NavigationState | PartialState<NavigationState> | undefined;

/** Deepest active route name — used for Crashlytics screen attribute. */
export function getActiveRouteName(state: NavState): string {
  if (!state || !('routes' in state) || !state.routes?.length) {
    return 'unknown';
  }
  const index = state.index ?? state.routes.length - 1;
  const route = state.routes[index];
  if (route?.state) {
    return getActiveRouteName(route.state);
  }
  return route?.name ?? 'unknown';
}

export function navigateToMainTab(
  tabScreen: string,
  params?: object,
) {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    CommonActions.navigate(StackNav.Main, {
      screen: StackNav.TabNav,
      params:
        params !== undefined
          ? { screen: tabScreen, params }
          : { screen: tabScreen },
    }),
  );
}

/** Navigate to a tab inside the authenticated Main stack. */
export function navigateToTab(tabScreen: string) {
  navigateToMainTab(tabScreen);
}

export async function navigate(routeName: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate(routeName, params));
  }
}

export async function resetAndNavigate(routeName: string, index = 0) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes: [{ name: routeName }],
      }),
    );
  }
}

/** Reset root stack to Main drawer opened on a specific drawer screen (clears ProcessScrapRequest etc.). */
export async function resetToDrawerScreen(drawerScreen: string) {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: StackNav.Main,
          state: {
            index: 1,
            routes: [
              {name: StackNav.TabNav},
              {name: drawerScreen},
            ],
          },
        },
      ],
    }),
  );
}

export async function push(routeName: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(routeName, params));
  }
}

export async function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.goBack());
  }
}

export { TabNav };
