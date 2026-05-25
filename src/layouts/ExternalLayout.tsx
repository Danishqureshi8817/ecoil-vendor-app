import CustomText from '@/components/global/CustomText';
import {VendorHeader} from '@/components/layout/VendorHeader';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {theme} from '@/constants/theme';
import {useAuthStore} from '@/states/authStore';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
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

type NavItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
};

type Props = {
  title: string;
  children: React.ReactNode;
  navItems: NavItem[];
  activeKey: string;
  onLogout: () => void;
  showBottomNav?: boolean;
  bottomNav?: React.ReactNode;
};

export function ExternalLayout({
  title,
  children,
  navItems,
  activeKey,
  onLogout,
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

  return (
    <View style={styles.root}>
      <VendorHeader
        title={title}
        initials={initials}
        onMenuPress={() => setMenuOpen(true)}
      />

      <View style={styles.content}>{children}</View>

      <Modal visible={menuOpen} transparent animationType="slide">
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
        <View style={[styles.drawer, {paddingBottom: insets.bottom + 8}]}>
          <View style={[styles.drawerHero, {paddingTop: insets.top + 16}]}>
            <View style={styles.drawerOrb} />
            <View style={styles.drawerLogoWrap}>
              <Image
                source={require('@/assets/images/ecoilIcon.png')}
                style={styles.drawerLogo}
                resizeMode="contain"
              />
            </View>
            <CustomText variant="h4" fontFamily={Fonts.inter.bold} style={styles.drawerTitle}>
              Ecoil Vendor
            </CustomText>
            <CustomText variant="h7" style={styles.drawerSub} numberOfLine={2}>
              Partner portal
            </CustomText>
            {user?.name ? (
              <View style={styles.drawerUserPill}>
                <Ionicons name="person-outline" size={16} color={Colors.white} />
                <CustomText
                  variant="h7"
                  fontFamily={Fonts.inter.semiBold}
                  style={styles.drawerUserText}
                  numberOfLine={1}>
                  {user.name}
                </CustomText>
              </View>
            ) : null}
          </View>

          <ScrollView style={styles.drawerNav} showsVerticalScrollIndicator={false}>
            <CustomText variant="h7" style={styles.navSection}>
              Menu
            </CustomText>
            {navItems.map(item => {
              const active = activeKey === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.navLink, active && styles.navLinkActive]}
                  onPress={() => {
                    setMenuOpen(false);
                    item.onPress();
                  }}>
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
                    style={{color: active ? Colors.brandDark : Colors.black, flex: 1}}>
                    {item.label}
                  </CustomText>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={active ? Colors.brand : Colors.muted}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
            <CustomText
              variant="h6"
              fontFamily={Fonts.inter.semiBold}
              style={styles.logoutText}>
              Sign out
            </CustomText>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '86%',
    maxWidth: 320,
    backgroundColor: Colors.white,
    ...theme.shadow,
  },
  drawerHero: {
    backgroundColor: Colors.brandDark,
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScaleVertical(22),
    overflow: 'hidden',
  },
  drawerOrb: {
    position: 'absolute',
    width: moderateScale(140),
    height: moderateScale(140),
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -moderateScale(40),
    right: -moderateScale(30),
  },
  drawerLogoWrap: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScaleVertical(12),
  },
  drawerLogo: {width: moderateScale(36), height: moderateScale(36)},
  drawerTitle: {color: Colors.white},
  drawerSub: {color: 'rgba(255,255,255,0.8)', marginTop: 4},
  drawerUserPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginTop: moderateScaleVertical(14),
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(8),
    borderRadius: moderateScale(20),
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  drawerUserText: {color: Colors.white, flex: 1},
  drawerNav: {flex: 1, paddingHorizontal: moderateScale(12), paddingTop: moderateScaleVertical(12)},
  navSection: {
    color: Colors.muted,
    marginLeft: moderateScale(8),
    marginBottom: moderateScaleVertical(8),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(14),
    marginBottom: moderateScaleVertical(4),
    gap: moderateScale(12),
  },
  navLinkActive: {
    backgroundColor: Colors.brandSoft,
  },
  navIconWrap: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    backgroundColor: Colors.brand,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
    marginHorizontal: moderateScale(16),
    marginBottom: moderateScaleVertical(8),
    paddingVertical: moderateScaleVertical(14),
    borderRadius: moderateScale(14),
    backgroundColor: Colors.errorSoft,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {color: Colors.error},
});
