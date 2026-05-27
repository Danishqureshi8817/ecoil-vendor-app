import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type TabIcon = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<string, {label: string; icon: TabIcon}> = {
  Home: {label: 'Home', icon: 'home-outline'},
  Services: {label: 'Services', icon: 'sunny-outline'},
  Requests: {label: 'Requests', icon: 'document-text-outline'},
  Collect: {label: 'Collection', icon: 'basket-outline'},
};

/** Vendor dashboard style — white bar, green top indicator on active tab */
export function VendorTabBar({state, descriptors, navigation}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, moderateScaleVertical(8));

  return (
    <View style={[styles.bar, {paddingBottom: bottomPad}]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined &&
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : TAB_CONFIG[route.name]?.label ?? route.name;

        const iconName = TAB_CONFIG[route.name]?.icon ?? 'ellipse-outline';
        const color = focused ? Colors.brand : '#6b7280';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}>
            {focused ? <View style={styles.indicator} /> : <View style={styles.indicatorSpacer} />}
            <Ionicons name={iconName} size={24} color={color} />
            <CustomText
              variant="h7"
              fontFamily={focused ? Fonts.inter.semiBold : Fonts.inter.regular}
              style={[styles.label, {color}]}>
              {label}
            </CustomText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    paddingTop: moderateScaleVertical(4),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: moderateScaleVertical(6),
    paddingBottom: moderateScaleVertical(4),
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: moderateScale(32),
    height: moderateScale(3),
    borderRadius: moderateScale(2),
    backgroundColor: Colors.brand,
  },
  indicatorSpacer: {
    height: moderateScale(3),
    marginBottom: 0,
  },
  label: {
    marginTop: moderateScaleVertical(4),
    fontSize: 11,
  },
});
