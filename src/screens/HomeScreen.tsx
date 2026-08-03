import CustomText from '@/components/global/CustomText';
import {
  HomeNextPickupIcon,
  HomeRecentDonePickupIcon,
  HomeRecentTruckIcon,
  HomeThisMonthCollectQuantityIcon,
  HomeThisMonthGreenPointsIcon,
  HomeThisMonthRequestCountIcon,
} from '@/components/icon/icon';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import useVendorDashboard from '@/hooks/vendor/use-vendor-dashboard';
import { useVendorCoins } from '@/hooks/vendor/use-scratch-cards';
import { StackNav, TabNav } from '@/navigations/NavigationKeys';
import type { PublicService } from '@/api/publicApi';
import type { VendorDashboardNotification } from '@/api/dashboardApi';
import publicService from '@/services/public-service';
import { useAuthStore } from '@/states/authStore';
import { useServiceNavigationStore } from '@/states/serviceNavigationStore';
import {
  formatDashboardCount,
  formatDashboardQty,
  formatNextPickupDate,
  formatNotificationBody,
  formatPoints,
} from '@/utils/homeMetrics';
import { ServiceIconImage } from '@/components/service/ServiceIconImage';
import { navigate, navigateToTab, push } from '@/utils/NavigationUtils';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import { isScrapVendor } from '@/utils/vendorUser';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Container } from '@/components/global/Container';
import Body from '@/components/global/Body';
import HomeHeader from '@/components/global/HomeHeader';
import {MetricLoadingLottie} from '@/components/global/MetricLoadingLottie';
import { HomeBannerCarousel } from '@/components/home/HomeBannerCarousel';

const GREEN_CARD_BG = require('@/assets/images/bggreenpointcard.png');
const GREEN_CARD_ART = require('@/assets/images/homeGreenPointBg.png');
const OIL_REQUEST_IMG = require('@/assets/images/oilRequest.png');

const HOME_SERVICES_LIMIT = 4;

function ServiceTileIcon({ service }: { service: PublicService }) {
  return (
    <ServiceIconImage
      service={service}
      width={moderateScale(36)}
      height={moderateScale(40)}
      emptyIconSize={moderateScale(30)}
      borderRadius={moderateScale(6)}
    />
  );
}

function StatCard({
  icon,
  label,
  value,
  loading = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading?: boolean;
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
      {loading ? (
        <MetricLoadingLottie size="sm" style={styles.statValueLoader} />
      ) : (
        <CustomText variant="h5" fontFamily={Fonts.montserrat.bold} style={styles.statValue}>
          {value}
        </CustomText>
      )}
    </View>
  );
}

function NotificationActivityRow({ item }: { item: VendorDashboardNotification }) {
  const title = item.title?.trim() || 'Activity';
  const body = formatNotificationBody(item.notification);
  const completed = title.toLowerCase().includes('complete');
  const badgeText = completed ? 'Completed' : 'Update';

  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIcon, { backgroundColor: '#E6EDE7' }]}>
        {completed ? <HomeRecentDonePickupIcon /> : <HomeRecentTruckIcon />}
      </View>
      <View style={styles.activityBody}>
        <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} numberOfLine={1}>
          {title}
        </CustomText>
        <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.activitySub} numberOfLine={3}>
          {body || '—'}
        </CustomText>
      </View>
      <View style={styles.activityMeta}>
        <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.activityTime} numberOfLine={2}>
          {item.added_date?.trim() || '—'}
        </CustomText>
        <View style={[styles.badge, completed ? styles.badgeCompleted : styles.badgeNew]}>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.badgeText} numberOfLine={1}>
            {badgeText}
          </CustomText>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const user = useAuthStore(s => s.user);
  const scrapVendor = isScrapVendor(user);
  const {
    data: dashboard,
    isPending: dashboardPending,
    refetch: refetchDashboard,
  } = useVendorDashboard();
  const {
    data: coins,
    isPending: coinsPending,
    refetch: refetchCoins,
  } = useVendorCoins();

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: [publicService.queryKeys.services],
    queryFn: () => publicService.getServices(),
    enabled: !scrapVendor,
  });

  const { data: homeBanners = [] } = useQuery({
    queryKey: [publicService.queryKeys.homeBanners],
    queryFn: () => publicService.getHomeBanners(),
  });

  useFocusEffect(
    useCallback(() => {
      void refetchDashboard();
      if (!scrapVendor) {
        void refetchCoins();
      }
    }, [refetchDashboard, refetchCoins, scrapVendor]),
  );

  const counters = dashboard?.counters;
  const recentNotifications = useMemo(
    () => (dashboard?.notifications ?? []).slice(0, 5),
    [dashboard?.notifications],
  );
  const homeServices = useMemo(
    () => services.slice(0, HOME_SERVICES_LIMIT),
    [services],
  );
  const scrapCategoryStats = useMemo(() => {
    const byCat = counters?.WeightByCategories;
    if (!byCat || typeof byCat !== 'object') {
      return [];
    }
    return Object.entries(byCat).map(([name, stats]) => ({
      name,
      pickedToday: stats?.PickedToday,
      pickedThisMonth: stats?.PickedThisMonth,
    }));
  }, [counters?.WeightByCategories]);

  function handleHomeServicePress(service: PublicService) {
    useServiceNavigationStore.getState().openService(service.id);
    navigateToTab(TabNav.Services);
  }

  // Prefer scratch-wallet coins; fall back to dashboard carbon credits when coins are empty.
  const greenPoints = useMemo(() => {
    const fromCoins = coins?.coinTotal;
    if (fromCoins != null && !Number.isNaN(Number(fromCoins)) && Number(fromCoins) > 0) {
      return Number(fromCoins);
    }
    const fromDash = parseFloat(
      String(counters?.CarbonCreditTotalPicked ?? '')
        .replace(/,/g, '')
        .trim(),
    );
    if (Number.isFinite(fromDash)) {
      return fromDash;
    }
    return fromCoins != null ? Number(fromCoins) : null;
  }, [coins?.coinTotal, counters?.CarbonCreditTotalPicked]);

  const monthPoints = useMemo(() => {
    const fromCoins = coins?.currentMonthCoins;
    if (fromCoins != null && !Number.isNaN(Number(fromCoins)) && Number(fromCoins) > 0) {
      return Number(fromCoins);
    }
    const fromDash = parseFloat(
      String(counters?.CarbonCreditMonth ?? '')
        .replace(/,/g, '')
        .trim(),
    );
    if (Number.isFinite(fromDash)) {
      return fromDash;
    }
    return fromCoins != null ? Number(fromCoins) : null;
  }, [coins?.currentMonthCoins, counters?.CarbonCreditMonth]);

  return (
    <Container
      backgroundColor={Colors.bg}
      fullScreen
      statusBarStyle="light-content"
      statusBarBackgroundColor="transparent"
    >
      <HomeHeader onNotificationPress={() => push(StackNav.MyRewards)} />

      <Body contentContainerStyle={{ paddingHorizontal: moderateScale(15), paddingTop: moderateScaleVertical(15) }}>

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
                    {scrapVendor ? 'Total Pickedup Weight' : 'Total Green Points'}
                  </CustomText>
                  <Ionicons name="information-circle-outline" size={15} color="rgba(255,255,255,0.92)" />
                </View>
                {scrapVendor ? (
                  dashboardPending ? (
                    <MetricLoadingLottie tint="light" size="lg" style={styles.pointsLoader} />
                  ) : (
                    <CustomText variant="h1" fontFamily={Fonts.montserrat.bold} style={styles.greenPoints}>
                      {formatDashboardQty(counters?.TotalPickedWeight)}
                    </CustomText>
                  )
                ) : coinsPending ? (
                  <MetricLoadingLottie tint="light" size="lg" style={styles.pointsLoader} />
                ) : (
                  <CustomText variant="h1" fontFamily={Fonts.montserrat.bold} style={styles.greenPoints}>
                    {formatPoints(greenPoints)}
                  </CustomText>
                )}
                {!scrapVendor ? (
                  <Pressable
                    style={({ pressed }) => [styles.redeemBtn, pressed && styles.pressed]}
                    onPress={() => navigate(StackNav.MyRewards)}>
                    <Ionicons name="gift-outline" size={15} color={Colors.black} />
                    <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.redeemText}>
                      Redeem Now
                    </CustomText>
                  </Pressable>
                ) : null}
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
          {scrapVendor ? (
            <View style={styles.oilBarStack}>
              <View style={styles.oilBar}>
                <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.oilBarLabel}>
                  Total Scrap Collection
                </CustomText>
                {dashboardPending ? (
                  <MetricLoadingLottie size="sm" style={styles.oilBarLoader} />
                ) : (
                  <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.oilBarValue}>
                    {formatDashboardQty(counters?.TotalPickedScrap)}
                  </CustomText>
                )}
              </View>
              <View style={[styles.oilBar, styles.oilBarDivider]}>
                <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.oilBarLabel}>
                  Total Waste Collected
                </CustomText>
                {dashboardPending ? (
                  <MetricLoadingLottie size="sm" style={styles.oilBarLoader} />
                ) : (
                  <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.oilBarValue}>
                    {formatDashboardQty(counters?.TotalPickedWaste)}
                  </CustomText>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.oilBar}>
              <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.oilBarLabel}>
                Total Oil Collection
              </CustomText>
              {dashboardPending ? (
                <MetricLoadingLottie size="sm" style={styles.oilBarLoader} />
              ) : (
                <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.oilBarValue}>
                  {formatDashboardQty(counters?.TotalPickedQty)}
                </CustomText>
              )}
            </View>
          )}
        </View>

        {scrapVendor ? (
          <>
            <View style={styles.statsGrid}>
              <StatCard
                icon={<HomeThisMonthRequestCountIcon width={26} height={26} />}
                label="Completed Requests"
                value={formatDashboardCount(counters?.CompletedRequests)}
                loading={dashboardPending}
              />
              <StatCard
                icon={<HomeThisMonthRequestCountIcon width={26} height={26} />}
                label="Pending Requests"
                value={formatDashboardCount(counters?.PendingRequests)}
                loading={dashboardPending}
              />
              <StatCard
                icon={<HomeThisMonthCollectQuantityIcon width={22} height={28} />}
                label="Weight Picked Today"
                value={formatDashboardQty(counters?.WeightPickedToday)}
                loading={dashboardPending}
              />
              <StatCard
                icon={<HomeThisMonthCollectQuantityIcon width={22} height={28} />}
                label="Weight Picked This Month"
                value={formatDashboardQty(counters?.WeightPickedThisMonth)}
                loading={dashboardPending}
              />
            </View>

            <HomeBannerCarousel banners={homeBanners} />

            {scrapCategoryStats.map(category => (
              <View key={category.name} style={styles.categoryBlock}>
                <CustomText variant="h5" fontFamily={Fonts.montserrat.bold} style={styles.sectionTitle}>
                  {category.name}
                </CustomText>
                <View style={styles.statsGrid}>
                  <StatCard
                    icon={<HomeThisMonthCollectQuantityIcon width={22} height={28} />}
                    label="Picked Today"
                    value={formatDashboardQty(category.pickedToday)}
                    loading={dashboardPending}
                  />
                  <StatCard
                    icon={<HomeThisMonthCollectQuantityIcon width={22} height={28} />}
                    label="Picked This Month"
                    value={formatDashboardQty(category.pickedThisMonth)}
                    loading={dashboardPending}
                  />
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard
                icon={<HomeThisMonthCollectQuantityIcon width={22} height={28} />}
                label="This Month Collected Quantity"
                value={formatDashboardQty(counters?.MonthPickedQty)}
                loading={dashboardPending}
              />
              <StatCard
                icon={<HomeThisMonthGreenPointsIcon width={28} height={28} />}
                label="Green Points Earned This month"
                value={formatPoints(monthPoints)}
                loading={coinsPending}
              />
              <StatCard
                icon={<HomeThisMonthRequestCountIcon width={26} height={26} />}
                label="Currently Open Request Count"
                value={formatDashboardCount(counters?.OpenRequests)}
                loading={dashboardPending}
              />
              <StatCard
                icon={<HomeNextPickupIcon width={26} height={26} />}
                label="Next Pickup Scheduled Date"
                value={formatNextPickupDate(counters?.NextPickUpDate)}
                loading={dashboardPending}
              />
            </View>

            <HomeBannerCarousel banners={homeBanners} />

            <CustomText variant="h5" fontFamily={Fonts.montserrat.bold} style={styles.sectionTitle}>
              Our Services
            </CustomText>

            <View style={styles.servicesGrid}>
              <Pressable
                style={({ pressed }) => [styles.serviceTile, pressed && styles.pressed]}
                onPress={() => navigate(StackNav.CollectionRequest)}>
                <Image
                  source={OIL_REQUEST_IMG}
                  style={styles.oilRequestIcon}
                  resizeMode="contain"
                />
                <CustomText
                  variant="h7"
                  fontFamily={Fonts.montserrat.semiBold}
                  style={styles.serviceLabel}
                  numberOfLine={3}>
                  Oil Collection Request
                </CustomText>
              </Pressable>
              {servicesLoading ? (
                <ActivityIndicator color={Colors.brand} style={styles.servicesLoader} />
              ) : (
                <>
                  {homeServices.map(service => (
                    <Pressable
                      key={service.id}
                      style={({ pressed }) => [styles.serviceTile, pressed && styles.pressed]}
                      onPress={() => handleHomeServicePress(service)}>
                      <ServiceTileIcon service={service} />
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
                    style={({ pressed }) => [styles.serviceTile, pressed && styles.pressed]}
                    onPress={() => {
                      useServiceNavigationStore.getState().clearPendingService();
                      navigate(TabNav.Services)
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

            {dashboardPending ? (
              <ActivityIndicator color={Colors.brand} style={styles.activityLoader} />
            ) : recentNotifications.length === 0 ? (
              <View style={styles.activityEmpty}>
                <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.activitySub}>
                  No recent activity yet.
                </CustomText>
              </View>
            ) : (
              recentNotifications.map((item, index) => (
                <NotificationActivityRow
                  key={`${item.added_date ?? 'activity'}-${index}`}
                  item={item}
                />
              ))
            )}

            <View style={styles.footer}>
              <Ionicons name="leaf" size={20} color={Colors.brand} />
              <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.footerText}>
                EVERY DROP COUNTS TOWARDS A GREENER TOMORROW.
              </CustomText>
            </View>
          </>
        )}
      </Body>
    </Container>
  );
}

const styles = StyleSheet.create({
  greenCardWrap: {
    marginBottom: moderateScaleVertical(14),
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    ...theme.shadow,
    backgroundColor: '#E2F5E8',
    borderWidth: 0,
    // borderColor: 'red',
  },
  greenCardTop: {
    // minHeight: moderateScaleVertical(164),
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: moderateScale(4),
    borderColor: '#57AB6F',
    borderRadius: moderateScale(14),
  },
  greenCardBgImage: {
    // borderRadius: moderateScale(14),
    // borderWidth: moderateScale(4),
    // borderColor: '#57AB6F',
    // borderColor: 'red',
    overflow: 'hidden',
  },
  greenCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',

  },
  greenCardArtWrap: {
    width: '42%',
    // height: moderateScaleVertical(158),
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: moderateScale(4),
    paddingBottom: moderateScaleVertical(2),
    overflow: 'hidden',
  },
  greenCardArt: {
    width: moderateScale(160),
    height: moderateScale(140),
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
    marginTop: moderateScaleVertical(8),
    marginBottom: moderateScaleVertical(4),
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  redeemText: {
    color: Colors.black,
    fontSize: RFValue(11),
  },
  oilBarStack: {
    backgroundColor: '#E2F5E8',
  },
  oilBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E2F5E8',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(11),
  },
  oilBarDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 100, 55, 0.18)',
  },
  oilBarLabel: {
    color: Colors.drawerGradientEnd,
    fontSize: RFValue(11),
  },
  oilBarValue: {
    color: Colors.drawerGradientEnd,
    fontSize: RFValue(12),
  },
  oilBarLoader: {
    alignSelf: 'flex-end',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(10),
    marginBottom: moderateScaleVertical(20),
  },
  categoryBlock: {
    marginBottom: moderateScaleVertical(4),
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
  statValueLoader: {
    marginTop: moderateScaleVertical(8),
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
  oilRequestIcon: {
    width: moderateScale(40),
    height: moderateScale(44),
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
    transform: [{ scale: 0.98 }],
  },
});
