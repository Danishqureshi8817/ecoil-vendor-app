import type {PublicService} from '@/api/publicApi';
import {Colors} from '@/constants/colors';
import {resolveServiceIconUrl} from '@/utils/serviceIconUrl';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';

type Props = {
  service: Pick<PublicService, 'icon' | 'iconUrl'>;
  width: number;
  height: number;
  emptyIconSize?: number;
  borderRadius?: number;
};

export function ServiceIconImage({
  service,
  width,
  height,
  emptyIconSize,
  borderRadius = 0,
}: Props) {
  const uri = resolveServiceIconUrl(service);
  const [failed, setFailed] = useState(false);
  const fallbackSize = emptyIconSize ?? Math.min(width, height) * 0.75;

  if (!uri || failed) {
    return (
      <View style={[styles.empty, {width, height, borderRadius}]}>
        <Ionicons name="ellipse-outline" size={fallbackSize} color={Colors.line} />
      </View>
    );
  }

  return (
    <Image
      source={{uri}}
      style={{width, height, borderRadius}}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.line,
  },
});
