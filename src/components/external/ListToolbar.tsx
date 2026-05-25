import CustomText from '@/components/global/CustomText';
import {Fonts} from '@/constants/fonts';
import {externalUi} from '@/styles/externalUi';
import React from 'react';
import {View} from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function ListToolbar({title, subtitle, actions}: Props) {
  return (
    <View style={externalUi.card}>
      <View style={externalUi.toolbar}>
        <View>
          <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={externalUi.cardTitle}>
            {title}
          </CustomText>
          {subtitle ? (
            <CustomText variant="h7" style={externalUi.muted}>
              {subtitle}
            </CustomText>
          ) : null}
        </View>
        {actions ? <View style={externalUi.toolbarActions}>{actions}</View> : null}
      </View>
    </View>
  );
}
