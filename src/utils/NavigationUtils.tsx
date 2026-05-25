import {StackNav, TabNav} from '@/navigations/NavigationKeys';
import {
  CommonActions,
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigateToMainTab(
  tabScreen: string,
  params?: object,
) {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    CommonActions.navigate({
      name: StackNav.Main,
      params:
        params !== undefined
          ? {screen: tabScreen, params}
          : {screen: tabScreen},
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
        routes: [{name: routeName}],
      }),
    );
  }
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

export {TabNav};
