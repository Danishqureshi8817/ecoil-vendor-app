import type { PublicHomeBanner } from '@/api/publicApi';
import { Colors } from '@/constants/colors';
import { resolveBannerImageUrl } from '@/utils/bannerImageUrl';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  type ViewToken,
} from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const HORIZONTAL_PAD = moderateScale(15);
const CARD_W = SCREEN_W - HORIZONTAL_PAD * 2;
const CARD_H = Math.round(CARD_W * (179 / 576));
const AUTO_MS = 4000;

type Props = {
  banners: PublicHomeBanner[];
};

export function HomeBannerCarousel({ banners }: Props) {
  const listRef = useRef<FlatList<PublicHomeBanner>>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const [failedIds, setFailedIds] = useState<Record<string, true>>({});

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % banners.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) setIndex(first.index);
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const next = Math.round(x / CARD_W);
      if (next >= 0 && next < banners.length) setIndex(next);
    },
    [banners.length],
  );

  const openLink = useCallback((url: string | null) => {
    const trimmed = url?.trim();
    if (!trimmed) return;
    void Linking.openURL(trimmed);
  }, []);

  if (!banners.length) return null;

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={banners}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W}
        snapToAlignment="start"
        getItemLayout={(_, i) => ({
          length: CARD_W,
          offset: CARD_W * i,
          index: i,
        })}
        onMomentumScrollEnd={onScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => {
          const uri = resolveBannerImageUrl(item);
          const failed = !!failedIds[item.id];
          return (
            <Pressable
              style={styles.slide}
              onPress={() => {}}
              disabled={!item.linkUrl?.trim()}>
              {uri && !failed ? (
                <Image
                  source={{ uri }}
                  style={styles.image}
                  resizeMode="stretch"
                  onError={() =>
                    setFailedIds((prev) => ({ ...prev, [item.id]: true }))
                  }
                />
              ) : null}
            </Pressable>
          );
        }}
      />
      {banners.length > 1 ? (
        <View style={styles.dots}>
          {banners.map((b, i) => (
            <View key={b.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: moderateScaleVertical(18),
  },
  slide: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    backgroundColor: Colors.line,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(6),
    marginTop: moderateScaleVertical(10),
  },
  dot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(4),
    backgroundColor: '#c5ddcb',
  },
  dotActive: {
    width: moderateScale(18),
    backgroundColor: Colors.brand,
  },
});
