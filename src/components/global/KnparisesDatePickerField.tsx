import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {formatKnparisesDate, parseKnparisesDate} from '@/utils/knparisesDate';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, {useMemo, useState} from 'react';
import {Modal, Platform, Pressable, StyleSheet, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  hideLabel?: boolean;
  compact?: boolean;
  variant?: 'default' | 'outlined';
};

export function KnparisesDatePickerField({
  label,
  value,
  onChange,
  maximumDate,
  minimumDate,
  hideLabel = false,
  compact = false,
  variant = 'default',
}: Props) {
  const outlined = variant === 'outlined';
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(
    () => parseKnparisesDate(value) ?? new Date(),
    [value],
  );

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setOpen(false);
    }
    if (event.type === 'dismissed' || !date) {
      return;
    }
    onChange(formatKnparisesDate(date));
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, outlined && styles.wrapOutlined]}>
      {!hideLabel ? (
        <CustomText
          variant="h7"
          fontFamily={outlined ? Fonts.montserrat.medium : Fonts.inter.bold}
          style={outlined ? styles.outlinedLabel : styles.label}>
          {label}
        </CustomText>
      ) : null}
      <Pressable
        style={({pressed}) => [
          styles.field,
          compact && styles.fieldCompact,
          outlined && styles.fieldOutlined,
          pressed && styles.fieldPressed,
        ]}
        onPress={() => setOpen(true)}>
        {/* {outlined ? (
          <Ionicons name="calendar-outline" size={moderateScale(18)} color={Colors.brand} />
        ) : null} */}
        <CustomText
          variant={compact ? 'h7' : 'h6'}
          numberOfLine={1}
          style={
            outlined
              ? compact
                ? [styles.valueOutlined, styles.valueCompact]
                : styles.valueOutlined
              : compact
                ? [styles.value, styles.valueCompact]
                : styles.value
          }>
          {value}
        </CustomText>
        {outlined ? (
          <Ionicons name="chevron-down" size={moderateScale(16)} color={Colors.muted} />
        ) : null}
      </Pressable>

      {Platform.OS === 'android' && open ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="calendar"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
              <View style={styles.sheetHeader}>
                <CustomText variant="h6" fontFamily={Fonts.inter.bold}>
                  {label}
                </CustomText>
                <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                  <CustomText variant="h6" fontFamily={Fonts.inter.bold} style={styles.done}>
                    Done
                  </CustomText>
                </Pressable>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="inline"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                onChange={handleChange}
                style={styles.iosPicker}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: moderateScaleVertical(6), flex: 1, minWidth: 0},
  wrapCompact: {gap: 0},
  wrapOutlined: {gap: moderateScaleVertical(8)},
  label: {marginTop: moderateScaleVertical(4)},
  outlinedLabel: {
    color: Colors.black,
    fontSize: RFValue(12),
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(12),
    backgroundColor: Colors.bg,
  },
  fieldOutlined: {
    justifyContent: 'flex-start',
    gap: moderateScale(8),
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(12),
    backgroundColor: Colors.white,
  },
  fieldCompact: {
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(10),
  },
  fieldPressed: {opacity: 0.92},
  value: {color: Colors.black, textAlign: 'center'},
  valueOutlined: {
    flex: 1,
    color: Colors.black,
    textAlign: 'left',
    fontSize: RFValue(12),
    fontFamily: Fonts.montserrat.regular,
  },
  valueCompact: {fontSize: moderateScale(11)},
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingBottom: moderateScaleVertical(24),
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(16),
    paddingBottom: moderateScaleVertical(8),
  },
  done: {color: Colors.brand},
  iosPicker: {alignSelf: 'center'},
});
