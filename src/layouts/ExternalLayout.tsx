import CustomText from '@/components/global/CustomText';
import {VendorHeader, HEADER_GRADIENT} from '@/components/layout/VendorHeader';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {useAuthStore} from '@/states/authStore';
import type {NavItem} from '@/utils/vendorNavItems';
import {moderateScale, moderateScaleVertical, width} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useState} from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

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

const DRAWER_WIDTH = Math.min(width * 0.75, 320);

function isItemActive(item: NavItem, activeKey: string): boolean {
  if (item.disabled) {
    return false;
  }
  if (activeKey === item.key) {
    return true;
  }
  return false;
}

export function ExternalLayout({
  title,
  children,
  navItems,
  activeKey,
  onLogout,
  headerLeading = 'menu',
  onHeaderLeadingPress,
  headerEyebrow,
  headerHideAvatar = false,
  headerCenterTitle = false,
  headerTrailing,
}: Props) {
  const user = useAuthStore(s => s.user);
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (user?.name || 'V')
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const displayName = user?.name?.trim() || 'Store Manager';
  const roleLabel = user?.firm_name?.trim()
    ? `(${user.firm_name})`
    : '( Vendor )';

  return (
    <View style={styles.root}>
      <VendorHeader
        title={title}
        initials={initials}
        leading={headerLeading}
        onLeadingPress={onHeaderLeadingPress ?? (() => setMenuOpen(true))}
        eyebrowText={headerEyebrow}
        hideAvatar={headerHideAvatar}
        centerTitle={headerCenterTitle}
        trailing={headerTrailing}
      />

      <View style={styles.content}>{children}</View>

      <Modal visible={menuOpen} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
        <View
          style={[
            styles.drawer,
            {paddingBottom: insets.bottom + moderateScaleVertical(12)},
          ]}>
          <LinearGradient
            colors={[...HEADER_GRADIENT.colors]}
            start={HEADER_GRADIENT.start}
            end={HEADER_GRADIENT.end}
            style={[
              styles.drawerHeader,
              {paddingTop: moderateScaleVertical(16)},
            ]}>
            <View style={styles.profileRow}>
              <View style={styles.logoRing}>
                <View style={styles.logoCircle}>
                  <Image
                    source={require('@/assets/images/ecoilIcon.png')}
                    style={styles.drawerLogo}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <View style={styles.profileText}>
                <CustomText
                  variant="h5"
                  fontFamily={Fonts.inter.bold}
                  style={styles.profileName}
                  numberOfLine={1}>
                  {displayName}
                </CustomText>
                <CustomText variant="h7" style={styles.profileRole} numberOfLine={1}>
                  {roleLabel}
                </CustomText>
                <TouchableOpacity style={styles.profileLink} activeOpacity={0.8}>
                  <CustomText
                    variant="h7"
                    fontFamily={Fonts.inter.regular}
                    style={styles.profileLinkText}>
                    View / Change Profile
                  </CustomText>
                  <View style={styles.profileLinkIcon}>
                    <Ionicons name="chevron-forward" size={11} color={Colors.white} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.drawerNav}
            contentContainerStyle={styles.drawerNavContent}
            showsVerticalScrollIndicator={false}>
            {navItems.map(item => {
              const active = isItemActive(item, activeKey);
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.navLink, item.disabled && styles.navLinkDisabled]}
                  onPress={() => {
                    if (item.disabled || !item.onPress) {
                      return;
                    }
                    setMenuOpen(false);
                    item.onPress();
                  }}
                  activeOpacity={item.disabled ? 1 : 0.75}
                  disabled={item.disabled}>
                  <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={active ? Colors.white : Colors.brand}
                    />
                  </View>
                  <CustomText
                    variant="h6"
                    fontFamily={active ? Fonts.inter.semiBold : Fonts.inter.regular}
                    style={
                      item.disabled
                        ? [styles.navLabel, styles.navLabelDisabled]
                        : styles.navLabel
                    }>
                    {item.label}
                  </CustomText>
                  {!item.disabled ? (
                    <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                setMenuOpen(false);
                onLogout();
              }}
              activeOpacity={0.85}>
              <Ionicons name="log-out-outline" size={22} color={Colors.black} />
              <CustomText variant="h6" fontFamily={Fonts.inter.medium} style={styles.logoutText}>
                Logout
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.bg},
  content: {flex: 1},
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.white,
    shadowColor: '#0f172a',
    shadowOffset: {width: 4, height: 0},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  drawerHeader: {
    paddingHorizontal: moderateScale(18),
    paddingBottom: moderateScaleVertical(16),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(14),
  },
  logoRing: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  logoCircle: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    backgroundColor: Colors.onboardingIllustrationGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLogo: {
    width: moderateScale(34),
    height: moderateScale(34),
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    color: Colors.white,
  },
  profileRole: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: moderateScaleVertical(2),
  },
  profileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScaleVertical(10),
    gap: moderateScale(8),
  },
  profileLinkText: {
    color: Colors.white,
    opacity: 0.95,
  },
  profileLinkIcon: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerNav: {
    flex: 1,
    paddingHorizontal: moderateScale(14),
    paddingTop: moderateScaleVertical(10),
  },
  drawerNavContent: {
    paddingBottom: moderateScaleVertical(8),
  },
  drawerFooter: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(8),
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(8),
    gap: moderateScale(12),
  },
  navLinkDisabled: {
    opacity: 0.45,
  },
  navIconWrap: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    backgroundColor: Colors.drawerIconBgColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    backgroundColor: Colors.brand,
  },
  navLabel: {
    flex: 1,
    color: Colors.black,
  },
  navLabelDisabled: {
    color: Colors.muted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
    paddingVertical: moderateScaleVertical(14),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.bg,
  },
  logoutText: {
    color: Colors.black,
  },
});
