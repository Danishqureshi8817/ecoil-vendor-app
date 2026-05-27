import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {theme} from '@/constants/theme';
import useCollectionRequests from '@/hooks/vendor/use-collection-requests';
import {StackNav, TabNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {card, screen} from '@/styles/ui';
import {navigateToTab, push} from '@/utils/NavigationUtils';
import {isPrimaryVendor} from '@/utils/vendorUser';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useMemo} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type QuickAction = {
  title: string;
  desc: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  onPress: () => void;
  primaryOnly?: boolean;
};

export default function HomeScreen() {
  const user = useAuthStore(s => s.user);
  const primary = isPrimaryVendor(user);
  const {data: collections} = useCollectionRequests();
  const firstName = (user?.name || 'Partner').split(/\s+/)[0];

  const quickActions: QuickAction[] = useMemo(() => {
    const actions: QuickAction[] = [
      {
        title: 'Our Services',
        desc: 'Apply for a service',
        icon: 'sunny-outline',
        iconColor: Colors.brand,
        iconBg: Colors.brandSoft,
        onPress: () => navigateToTab(TabNav.Services),
      },
      {
        title: 'Service Request',
        desc: 'Track service applications',
        icon: 'chatbubble-outline',
        iconColor: Colors.blue,
        iconBg: Colors.blueSoft,
        onPress: () => navigateToTab(TabNav.Requests),
      },
      {
        title: 'Collection',
        desc: 'New pickup request',
        icon: 'basket-outline',
        iconColor: Colors.accent,
        iconBg: Colors.accentSoft,
        onPress: () => navigateToTab(TabNav.Collect),
      },
      {
        title: 'Collections',
        desc: 'View all requests',
        icon: 'list-outline',
        iconColor: Colors.purple,
        iconBg: Colors.purpleSoft,
        onPress: () => push(StackNav.CollectRequestList),
      },
      {
        title: 'My Certificates',
        desc: 'Download CO₂ & RUCO PDFs',
        icon: 'ribbon-outline',
        iconColor: Colors.brand,
        iconBg: Colors.brandSoft,
        onPress: () => push(StackNav.MyCertificates),
      },
      {
        title: 'Payment Details',
        desc: 'View payment records',
        icon: 'card-outline',
        iconColor: Colors.blue,
        iconBg: Colors.blueSoft,
        onPress: () => push(StackNav.PaymentDetails),
        primaryOnly: true,
      },
      {
        title: 'Agreement',
        desc: 'Review & accept',
        icon: 'document-outline',
        iconColor: Colors.purple,
        iconBg: Colors.purpleSoft,
        onPress: () => push(StackNav.Agreement),
        primaryOnly: true,
      },
    ];
    return actions.filter(a => !a.primaryOnly || primary);
  }, [primary]);

  return (
    <ScrollView
      contentContainerStyle={screen.scroll}
      showsVerticalScrollIndicator={false}>
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={['#ffffff', Colors.brandSoft]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <View style={styles.heroOrb} pointerEvents="none" />
          <CustomText variant="h7" style={styles.greet}>
            Hello,
          </CustomText>
          <CustomText variant="h2" fontFamily={Fonts.inter.bold} style={styles.heroName}>
            {firstName} 👋
          </CustomText>
          <CustomText variant="h6" style={styles.sub} numberOfLine={4}>
            Your partner hub for services and oil collection.
          </CustomText>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <CustomText variant="h2" fontFamily={Fonts.inter.bold} style={styles.statNum}>
                {collections?.length ?? '—'}
              </CustomText>
              <CustomText variant="h7" fontFamily={Fonts.inter.semiBold} style={styles.statLabel}>
                Collections
              </CustomText>
            </View>
            <Pressable
              style={({pressed}) => [styles.ctaWrap, pressed && styles.pressed]}
              onPress={() => navigateToTab(TabNav.Collect)}>
              <LinearGradient
                colors={[Colors.brandDark, Colors.brand]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.cta}>
                <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.ctaText}>
                  New pickup
                </CustomText>
                <Ionicons name="chevron-forward" size={16} color={Colors.white} />
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={styles.sectionTitle}>
        Quick actions
      </CustomText>

      <View style={styles.grid}>
        {quickActions.map(action => (
          <Pressable
            key={action.title}
            style={({pressed}) => [styles.actionTile, pressed && styles.pressed]}
            onPress={action.onPress}>
            <View style={[styles.actionIcon, {backgroundColor: action.iconBg}]}>
              <Ionicons name={action.icon} size={22} color={action.iconColor} />
            </View>
            <CustomText variant="h6" fontFamily={Fonts.inter.bold} style={styles.actionTitle}>
              {action.title}
            </CustomText>
            <CustomText variant="h7" style={styles.actionDesc}>
              {action.desc}
            </CustomText>
          </Pressable>
        ))}
      </View>

      {(user?.mobile || user?.email) ? (
        <View style={[card.base, styles.accountCard]}>
          <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={styles.accountHeading}>
            Account
          </CustomText>
          {user.mobile ? (
            <View style={styles.accountRow}>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.accountLabel}>
                Mobile
              </CustomText>
              <CustomText variant="h6" fontFamily={Fonts.inter.bold} style={styles.accountValue}>
                {user.mobile}
              </CustomText>
            </View>
          ) : null}
          {user.email ? (
            <View style={[styles.accountRow, user.mobile ? styles.accountRowGap : null]}>
              <CustomText variant="h7" fontFamily={Fonts.inter.bold} style={styles.accountLabel}>
                Email
              </CustomText>
              <CustomText
                variant="h6"
                fontFamily={Fonts.inter.bold}
                style={styles.accountValue}
                numberOfLine={1}>
                {user.email}
              </CustomText>
            </View>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    marginBottom: moderateScaleVertical(20),
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    ...theme.shadow,
    borderWidth: 1,
    borderColor: 'rgba(4, 120, 87, 0.15)',
  },
  heroCard: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScaleVertical(22),
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute',
    top: -moderateScale(30),
    right: -moderateScale(30),
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: 999,
    backgroundColor: 'rgba(4, 120, 87, 0.12)',
  },
  greet: {color: Colors.muted, fontWeight: '600'},
  heroName: {
    color: Colors.black,
    marginTop: 4,
    letterSpacing: -0.5,
    fontSize: moderateScale(26),
  },
  sub: {
    color: Colors.muted,
    marginTop: moderateScaleVertical(8),
    marginBottom: moderateScaleVertical(18),
    lineHeight: 22,
  },
  statsRow: {flexDirection: 'row', alignItems: 'center', gap: moderateScale(12)},
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(14),
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(16),
    ...theme.shadow,
  },
  statNum: {color: Colors.brand, letterSpacing: -0.3, fontSize: moderateScale(24)},
  statLabel: {color: Colors.muted, marginTop: 2},
  ctaWrap: {
    flexShrink: 0,
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    shadowColor: Colors.brand,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(18),
    borderRadius: moderateScale(14),
  },
  ctaText: {color: Colors.white},
  sectionTitle: {marginBottom: moderateScaleVertical(12), letterSpacing: -0.3},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(12),
    marginBottom: moderateScaleVertical(20),
  },
  actionTile: {
    width: '47.5%',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    paddingVertical: moderateScaleVertical(16),
    paddingHorizontal: moderateScale(14),
    borderWidth: 1,
    borderColor: Colors.line,
    ...theme.shadow,
  },
  actionIcon: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScaleVertical(8),
  },
  actionTitle: {letterSpacing: -0.2},
  actionDesc: {
    color: Colors.muted,
    marginTop: moderateScaleVertical(6),
    lineHeight: 16,
    fontSize: moderateScale(11),
  },
  pressed: {opacity: 0.92, transform: [{scale: 0.97}]},
  accountCard: {marginBottom: moderateScaleVertical(8)},
  accountHeading: {marginBottom: moderateScaleVertical(12), letterSpacing: -0.3},
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: moderateScale(12),
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(14),
    backgroundColor: Colors.bg,
  },
  accountRowGap: {marginTop: moderateScaleVertical(10)},
  accountLabel: {
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: moderateScale(12),
  },
  accountValue: {color: Colors.black, flexShrink: 1, textAlign: 'right'},
});
