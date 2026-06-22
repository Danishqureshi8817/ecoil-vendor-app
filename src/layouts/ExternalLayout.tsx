import { VendorHeader } from '@/components/layout/VendorHeader';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/states/authStore';
import type { NavItem } from '@/utils/vendorNavItems';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';

type Props = {
  title: string;
  children: React.ReactNode;
  navItems: NavItem[];
  activeKey: string;
  onLogout: () => void;
  showBottomNav?: boolean;
  bottomNav?: React.ReactNode;
  headerLeading?: 'menu' | 'back';
  onHeaderLeadingPress?: () => void;
  headerEyebrow?: string;
  headerHideAvatar?: boolean;
  headerCenterTitle?: boolean;
  headerTrailing?: React.ReactNode;
};

export function ExternalLayout({
  title,
  children,
  headerLeading,
  onHeaderLeadingPress,
  headerEyebrow,
  headerHideAvatar = false,
  headerCenterTitle = false,
  headerTrailing,
}: Props) {
  const user = useAuthStore(s => s.user);
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  const initials = (user?.name || 'V')
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const resolvedHeaderLeading = headerLeading ?? (canGoBack ? 'back' : 'menu');

  const handleLeadingPress = onHeaderLeadingPress ?? (() => {
    if (resolvedHeaderLeading === 'back') {
      navigation.goBack();
    } else {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  });

  return (
    <View style={styles.root}>
      <VendorHeader
        title={title}
        initials={initials}
        leading={resolvedHeaderLeading}
        onLeadingPress={handleLeadingPress}
        eyebrowText={headerEyebrow}
        hideAvatar={headerHideAvatar}
        centerTitle={headerCenterTitle}
        trailing={headerTrailing}
      />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1 },
});

