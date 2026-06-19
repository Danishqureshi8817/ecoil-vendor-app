import CustomText from '@/components/global/CustomText';
import {
  getOnboardingIllustrationBg,
  ONBOARDING_SLIDES,
  type OnboardingSlide,
} from '@/constants/onboardingSlides';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {StackNav} from '@/navigations/NavigationKeys';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import {setOnboardingCompleted} from '@/utils/onboardingStorage';
import {resetAndNavigate} from '@/utils/NavigationUtils';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const ILLUSTRATION_HEIGHT_RATIO = 0.5;

function finishOnboarding() {
  setOnboardingCompleted();
  resetAndNavigate(StackNav.Login, 0);
}

function OnboardingTitle({prefix, highlight}: {prefix: string; highlight: string}) {
  return (
    <Text style={styles.title}>
      <Text style={styles.titlePrefix}>{prefix}</Text>
      <Text style={styles.titleHighlight}> {highlight}</Text>
    </Text>
  );
}

function OnboardingSlideView({
  slide,
  illustrationHeight,
  slideHeight,
}: {
  slide: OnboardingSlide;
  illustrationHeight: number;
  slideHeight: number;
}) {
  return (
    <View style={[styles.slide, {height: slideHeight}]}>
      <View
        style={[
          styles.illustrationBox,
          {
            height: illustrationHeight,
            backgroundColor: getOnboardingIllustrationBg(slide.illustrationTheme),
          },
        ]}>
        <Image source={slide.image} style={styles.illustrationImage} resizeMode="contain" />
      </View>

      <View style={styles.content}>
        <OnboardingTitle prefix={slide.titlePrefix} highlight={slide.titleHighlight} />
        <CustomText fontFamily={Fonts.montserrat.medium} variant="h6" style={styles.subtitle}>
          {slide.subtitle}
        </CustomText>

        <View style={styles.tipBox}>
          <View style={styles.tipIconWrap}>
            <Image source={slide.tipIcon} style={styles.tipIcon} resizeMode="contain" />
          </View>
          <CustomText fontFamily={Fonts.montserrat.medium} variant='h7' style={styles.tipText}>
            {slide.tip}
          </CustomText>
        </View>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);

  const footerHeight = useMemo(
    () => moderateScaleVertical(68) + Math.max(insets.bottom, moderateScaleVertical(12)),
    [insets.bottom],
  );
  const illustrationHeight = height * ILLUSTRATION_HEIGHT_RATIO;
  const slideHeight = height - footerHeight;

  const slide = ONBOARDING_SLIDES[index];
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const goTo = useCallback((nextIndex: number) => {
    const clamped = Math.max(0, Math.min(nextIndex, ONBOARDING_SLIDES.length - 1));
    setIndex(clamped);
    listRef.current?.scrollToIndex({index: clamped, animated: true});
  }, []);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setIndex(nextIndex);
    },
    [width],
  );

  const renderItem: ListRenderItem<OnboardingSlide> = useCallback(
    ({item}) => (
      <View style={{width, height: slideHeight}}>
        <OnboardingSlideView
          slide={item}
          illustrationHeight={illustrationHeight}
          slideHeight={slideHeight}
        />
      </View>
    ),
    [width, slideHeight, illustrationHeight],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.onboardingSurface} />

      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, i) => ({length: width, offset: width * i, index: i})}
        onScrollToIndexFailed={info => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
        style={{height: slideHeight}}
      />

      <View style={[styles.footer, {height: footerHeight, paddingBottom: insets.bottom}]}>
        <View style={styles.footerSide}>
          {slide.showSkip ? (
            <Pressable
              style={({pressed}) => [styles.skipBtn, pressed && styles.pressed]}
              onPress={finishOnboarding}
              accessibilityLabel="Skip onboarding">
              <CustomText fontFamily={Fonts.montserrat.semiBold} fontSize={RFValue(8)} style={styles.skipText}>
                Skip
              </CustomText>
            </Pressable>
          ) : slide.showBack ? (
            <Pressable
              style={({pressed}) => [styles.backBtn, pressed && styles.pressed]}
              onPress={() => goTo(index - 1)}
              accessibilityLabel="Go back">
              <Ionicons name="arrow-back" size={18} color={Colors.onboardingPrimary} />
              <CustomText fontFamily={Fonts.montserrat.semiBold} fontSize={RFValue(8)} style={styles.backText}>
                Back
              </CustomText>
            </Pressable>
          ) : (
            <View style={styles.footerSpacer} />
          )}
        </View>

        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((item, dotIndex) => {
            const active = dotIndex === index;
            return (
              <View
                key={item.id}
                style={[styles.dot, active ? styles.dotActive : styles.dotInactive]}
              />
            );
          })}
        </View>

        <View style={[styles.footerSide, styles.footerSideRight]}>
          <Pressable
            style={({pressed}) => [styles.nextBtn, pressed && styles.pressed]}
            onPress={() => {
              if (isLast) {
                finishOnboarding();
                return;
              }
              goTo(index + 1);
            }}
            accessibilityLabel={isLast ? 'Get started' : 'Next'}>
            <Ionicons name="arrow-forward" size={24} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.onboardingSurface,
  },
  slide: {
    backgroundColor: Colors.onboardingSurface,
  },
  illustrationBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(8),
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScaleVertical(18),
  },
  title: {
    marginBottom: moderateScaleVertical(8),
  },
  titlePrefix: {
    fontFamily: Fonts.montserrat.bold,
    fontSize: RFValue(38),
    lineHeight: RFValue(44),
    color: Colors.onboardingPrimary,
    letterSpacing: -0.5,
  },
  titleHighlight: {
    fontFamily: Fonts.montserrat.bold,
    fontSize: RFValue(28),
    lineHeight: RFValue(34),
    color: Colors.onboardingAccent,
    letterSpacing: -0.5,
  },
  subtitle: {
    lineHeight: RFValue(21),
    color: Colors.onboardingMuted,
    marginBottom: moderateScaleVertical(14),
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
    backgroundColor: Colors.onboardingTipBg,
    borderRadius: moderateScale(18),
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(14),
  },
  tipIconWrap: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.onboardingSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipIcon: {
    width: moderateScale(22),
    height: moderateScale(22),
  },
  tipText: {
    flex: 1,
    lineHeight: RFValue(19),
    color: Colors.onboardingPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScaleVertical(8),
    backgroundColor: Colors.onboardingSurface,
  },
  footerSide: {
    width: moderateScale(88),
    alignItems: 'flex-start',
  },
  footerSideRight: {
    alignItems: 'flex-end',
  },
  footerSpacer: {
    width: moderateScale(88),
    height: moderateScale(56),
  },
  skipBtn: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: Colors.onboardingBackBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: Colors.onboardingPrimary,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    minHeight: moderateScale(44),
    borderRadius: 999,
    backgroundColor: Colors.onboardingBackBg,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(10),
  },
  backText: {
    color: Colors.onboardingPrimary,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(5),
  },
  dot: {
    borderRadius: 999,
  },
  dotActive: {
    width: moderateScale(8),
    height: moderateScale(8),
    backgroundColor: Colors.onboardingDotActive,
  },
  dotInactive: {
    width: moderateScale(8),
    height: moderateScale(8),
    backgroundColor: Colors.onboardingDotInactive,
  },
  nextBtn: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: Colors.onboardingPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{scale: 0.97}],
  },
});
