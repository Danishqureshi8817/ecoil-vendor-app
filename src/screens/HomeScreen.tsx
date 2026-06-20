import type {CollectionRequestRow} from '@/api/collectionApi';
import {collectionRequestLabel, collectionRequestStatus} from '@/api/collectionApi';
import CustomText from '@/components/global/CustomText';
import {
  HomeNextPickupIcon,
  HomeRecentDonePickupIcon,
  HomeRecentTruckIcon,
  HomeThisMonthCollectQuantityIcon,
  HomeThisMonthGreenPointsIcon,
  HomeThisMonthRequestCountIcon,
} from '@/components/icon/icon';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {theme} from '@/constants/theme';
import useCollectionRequests from '@/hooks/vendor/use-collection-requests';
import {useVendorCoins} from '@/hooks/vendor/use-scratch-cards';
import {StackNav, TabNav} from '@/navigations/NavigationKeys';
import type {PublicService} from '@/api/publicApi';
import publicService from '@/services/public-service';
import {useServiceNavigationStore} from '@/states/serviceNavigationStore';
import {screen} from '@/styles/ui';
import {
  computeHomeMetrics,
  formatActivityTimestamp,
  formatKg,
  formatPoints,
  sortRecentCollections,
} from '@/utils/homeMetrics';
import {getHomeServiceIcon} from '@/utils/homeServiceIconMap';
import {navigateToTab, push} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useQuery} from '@tanstack/react-query';
import React, {useMemo} from 'react';
import {RFValue} from 'react-native-responsive-fontsize';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

const GREEN_CARD_BG = require('@/assets/images/bggreenpointcard.png');
const GREEN_CARD_ART = require('@/assets/images/homeGreenPointBg.png');

const HOME_SERVICES_LIMIT = 5;

function ServiceTileIcon({serviceName}: {serviceName: string}) {
  const Icon = getHomeServiceIcon(serviceName);
  if (Icon) {
    return <Icon width={moderateScale(36)} height={moderateScale(40)} />;
  }
  return (
    <View style={styles.serviceEmptyIcon}>
      <Ionicons name="ellipse-outline" size={moderateScale(30)} color={Colors.line} />
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTopRow}>
        <View style={styles.statIconWrap}>{icon}</View>
        <CustomText
          variant="h7"
          fontFamily={Fonts.montserrat.medium}
          style={styles.statLabel}
          numberOfLine={2}>
          {label}
        </CustomText>
      </View>
      <CustomText variant="h5" fontFamily={Fonts.montserrat.bold} style={styles.statValue}>
        {value}
      </CustomText>
    </View>
  );
}

function ActivityRow({row}: {row: CollectionRequestRow}) {
  const status = collectionRequestStatus(row);
  const statusLower = status.toLowerCase();
  const completed =
    statusLower.includes('complete') ||
    statusLower.includes('done') ||
    statusLower.includes('closed');

  const iconName = completed ? 'checkmark-circle' : 'bus-outline';
  const iconColor = completed ? Colors.brand : Colors.accent;
  const iconBg = completed ? Colors.brandSoft : Colors.accentSoft;

  const badgeStyle = completed ? styles.badgeCompleted : styles.badgeNew;
  const badgeText = completed ? 'Completed' : status === '—' ? 'New' : status;

  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIcon, {backgroundColor: '#E6EDE7'}]}>
        {completed ? <HomeRecentDonePickupIcon /> : <HomeRecentTruckIcon  />}
      </View>
      <View style={styles.activityBody}>
        <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} numberOfLine={1}>
          {collectionRequestLabel(row)}
        </CustomText>
        <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.activitySub} numberOfLine={2}>
          {completed
            ? 'Pickup request has been completed successfully.'
            : 'A new pickup request has been submitted.'}
        </CustomText>
      </View>
      <View style={styles.activityMeta}>
        <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.activityTime} numberOfLine={2}>
          {formatActivityTimestamp(row)}
        </CustomText>
        <View style={[styles.badge, badgeStyle]}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.badgeText} numberOfLine={1}>
            {badgeText}
          </CustomText>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const {data: collections, isLoading: collectionsLoading} = useCollectionRequests();
  const {data: coins, isLoading: coinsLoading} = useVendorCoins();

  const {data: services = [], isLoading: servicesLoading} = useQuery({
    queryKey: [publicService.queryKeys.services],
    queryFn: () => publicService.getServices(),
  });

  const metrics = useMemo(() => computeHomeMetrics(collections), [collections]);
  const recentActivity = useMemo(() => sortRecentCollections(collections, 5), [collections]);
  const homeServices = useMemo(
    () => services.slice(0, HOME_SERVICES_LIMIT),
    [services],
  );

  function handleHomeServicePress(service: PublicService) {
    useServiceNavigationStore.getState().openService(service.id);
    navigateToTab(TabNav.Services);
  }

  const greenPoints = coins?.coinTotal ?? null;
  const monthPoints = '00';

  return (
    <ScrollView
      contentContainerStyle={[screen.scroll,{backgroundColor:'#FDFDFD'}]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.greenCardWrap}>
        <ImageBackground
          source={GREEN_CARD_BG}
          style={styles.greenCardTop}
          imageStyle={styles.greenCardBgImage}
          resizeMode="cover">
          <View style={styles.greenCardTopRow}>
            <View style={styles.greenCardCopy}>
              <View style={styles.greenLabelRow}>
                <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.greenLabel}>
                  Total Green Points
                </CustomText>
                <Ionicons name="information-circle-outline" size={15} color="rgba(255,255,255,0.92)" />
              </View>
              {coinsLoading ? (
                <ActivityIndicator color={Colors.white} style={styles.pointsLoader} />
              ) : (
                <CustomText variant="h1" fontFamily={Fonts.montserrat.bold} style={styles.greenPoints}>
                  {formatPoints(greenPoints)}
                </CustomText>
              )}
              <Pressable
                style={({pressed}) => [styles.redeemBtn, pressed && styles.pressed]}
                onPress={() => push(StackNav.MyRewards)}>
                <Ionicons name="gift-outline" size={15} color={Colors.black} />
                <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.redeemText}>
                  Redeem Now
                </CustomText>
              </Pressable>
            </View>
            <View style={styles.greenCardArtWrap}>
              <View style={{}}>
                <Image
                  source={GREEN_CARD_ART}
                  style={styles.greenCardArt}
                  resizeMode='stretch'
                />
              </View>
            </View>
          </View>
        </ImageBackground>
        <View style={styles.oilBar}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.oilBarLabel}>
            Total Oil Collection
          </CustomText>
          <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.oilBarValue}>
            {collectionsLoading ? '—' : formatKg(metrics.totalOilKg)}
          </CustomText>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon={<HomeThisMonthCollectQuantityIcon width={22} height={28} />}
          label="This Month Collected Quantity"
          value={collectionsLoading ? '—' : formatKg(metrics.monthOilKg)}
        />
        <StatCard
          icon={<HomeThisMonthGreenPointsIcon width={28} height={28} />}
          label="Green Points Earned This month"
          value={coinsLoading ? '—' : monthPoints}
        />
        <StatCard
          icon={<HomeThisMonthRequestCountIcon width={26} height={26} />}
          label="Currently Open Request Count"
          value={collectionsLoading ? '—' : String(metrics.openRequestCount)}
        />
        <StatCard
          icon={<HomeNextPickupIcon width={26} height={26} />}
          label="Next Pickup Scheduled Date"
          value={collectionsLoading ? '—' : metrics.nextPickupLabel}
        />
      </View>

      <CustomText variant="h5" fontFamily={Fonts.montserrat.bold} style={styles.sectionTitle}>
        Our Services
      </CustomText>

      <View style={styles.servicesGrid}>
        {servicesLoading ? (
          <ActivityIndicator color={Colors.brand} style={styles.servicesLoader} />
        ) : (
          <>
            {homeServices.map(service => (
              <Pressable
                key={service.id}
                style={({pressed}) => [styles.serviceTile, pressed && styles.pressed]}
                onPress={() => handleHomeServicePress(service)}>
                <ServiceTileIcon serviceName={service.name} />
                <CustomText
                  variant="h7"
                  fontFamily={Fonts.montserrat.semiBold}
                  style={styles.serviceLabel}
                  numberOfLine={3}>
                  {service.name}
                </CustomText>
              </Pressable>
            ))}
            <Pressable
              style={({pressed}) => [styles.serviceTile, pressed && styles.pressed]}
              onPress={() => {
                useServiceNavigationStore.getState().clearPendingService();
                navigateToTab(TabNav.Services);
              }}>
              <View style={styles.viewAllCircle}>
                <Ionicons name="arrow-forward" size={22} color={Colors.brand} />
              </View>
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.semiBold}
                style={styles.serviceLabel}
                numberOfLine={2}>
                See all services
              </CustomText>
            </Pressable>
          </>
        )}
      </View>

      <CustomText variant="h5" fontFamily={Fonts.montserrat.bold} style={styles.sectionTitle}>
        Recent Activity
      </CustomText>

      {collectionsLoading ? (
        <ActivityIndicator color={Colors.brand} style={styles.activityLoader} />
      ) : recentActivity.length === 0 ? (
        <View style={styles.activityEmpty}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.activitySub}>
            No recent activity yet.
          </CustomText>
        </View>
      ) : (
        recentActivity.map((row, index) => {
          const id =
            row.id ??
            row.request_id ??
            row.collection_request_id ??
            row.coll_req_id ??
            index;
          return <ActivityRow key={String(id)} row={row} />;
        })
      )}

      <View style={styles.footer}>
        <Ionicons name="leaf" size={20} color={Colors.brand} />
        <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.footerText}>
          EVERY DROP COUNTS TOWARDS A GREENER TOMORROW.
        </CustomText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  greenCardWrap: {
    marginBottom: moderateScaleVertical(14),
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    ...theme.shadow,
    backgroundColor: '#E2F5E8',
  },
  greenCardTop: {
    // minHeight: moderateScaleVertical(164),
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  greenCardBgImage: {
   borderRadius: moderateScale(14),
    borderWidth: moderateScale(4),
    borderColor: '#57AB6F',
    overflow: 'hidden',
  },
  greenCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',

  },
  greenCardArtWrap: {
    width: '44%',
    // height: moderateScaleVertical(158),
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: moderateScale(4),
    paddingBottom: moderateScaleVertical(2),
    overflow: 'hidden',
  },
  greenCardArt: {
    width: moderateScale(160),
    height: moderateScale(135),
  },
  greenCardCopy: {
    flex: 1,
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(16),
    paddingBottom: moderateScaleVertical(14),
    paddingRight: moderateScale(4),
  },
  greenLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(5),
  },
  greenLabel: {
    color: Colors.white,
    fontSize: RFValue(11),
  },
  greenPoints: {
    color: Colors.white,
    marginTop: moderateScaleVertical(4),
    fontSize: RFValue(28),
    lineHeight: RFValue(34),
    letterSpacing: -0.5,
  },
  pointsLoader: {
    alignSelf: 'flex-start',
    marginVertical: moderateScaleVertical(10),
  },
  redeemBtn: {
    marginTop: moderateScaleVertical(10),
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(22),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(7),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  redeemText: {
    color: Colors.black,
    fontSize: RFValue(11),
  },
  oilBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E2F5E8',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(11),
  },
  oilBarLabel: {
    color: Colors.drawerGradientEnd,
    fontSize: RFValue(11),
  },
  oilBarValue: {
    color: Colors.drawerGradientEnd,
    fontSize: RFValue(12),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(10),
    marginBottom: moderateScaleVertical(20),
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(12),
    ...theme.shadow,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(8),
  },
  statIconWrap: {
    width: moderateScale(28),
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: moderateScaleVertical(2),
    flexShrink: 0,
  },
  statLabel: {
    flex: 1,
    color: Colors.muted,
    // lineHeight: RFValue(14),
    fontSize: RFValue(9),
  },
  statValue: {
    marginTop: moderateScaleVertical(8),
    color: Colors.black,
    fontSize: RFValue(13),
    letterSpacing: -0.2,
  },
  sectionTitle: {
    marginBottom: moderateScaleVertical(12),
    letterSpacing: -0.3,
    fontSize: RFValue(14),
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(10),
    marginBottom: moderateScaleVertical(20),
  },
  servicesLoader: {
    marginVertical: moderateScaleVertical(20),
    width: '100%',
  },
  serviceTile: {
    width: '31%',
    minHeight: moderateScaleVertical(108),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(12),
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  serviceLabel: {
    marginTop: moderateScaleVertical(8),
    textAlign: 'center',
    color: Colors.black,
    fontSize: RFValue(9),
  },
  serviceEmptyIcon: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  viewAllCircle: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    borderWidth: 1,
    borderColor: '#E4E4E4',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: Colors.bg,
  },
  activityLoader: {
    marginBottom: moderateScaleVertical(16),
  },
  activityEmpty: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(14),
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(16),
    borderWidth: 1,
    borderColor: Colors.line,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(14),
    marginBottom: moderateScaleVertical(10),
    gap: moderateScale(10),
    ...theme.shadow,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  activityIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBody: {
    flex: 1,
    paddingRight: moderateScale(4),
  },
  activitySub: {
    color: Colors.muted,
    marginTop: moderateScaleVertical(4),
    fontSize: RFValue(10),
    lineHeight: RFValue(14),
  },
  activityMeta: {
    alignItems: 'flex-end',
    maxWidth: '34%',
  },
  activityTime: {
    color: Colors.muted,
    textAlign: 'right',
    fontSize: RFValue(9),
    lineHeight: RFValue(13),
  },
  badge: {
    marginTop: moderateScaleVertical(6),
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(3),
  },
  badgeNew: {
    backgroundColor: '#DBEDD4',
  },
  badgeCompleted: {
    backgroundColor: '#DBEDD4',
  },
  badgeText: {
    color: Colors.brandDark,
    fontSize: RFValue(9),
  },
  footer: {
    alignItems: 'center',
    marginTop: moderateScaleVertical(40),
    marginBottom: moderateScaleVertical(12),
    gap: moderateScaleVertical(6),
  },
  footerText: {
    color: '#D1D8E1',
    textAlign: 'center',
    letterSpacing: 0.6,
    fontSize: RFValue(16),
    // lineHeight: RFValue(12),
    paddingHorizontal: moderateScale(5),
  },
  pressed: {
    opacity: 0.92,
    transform: [{scale: 0.98}],
  },
});
