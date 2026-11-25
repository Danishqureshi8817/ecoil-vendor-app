import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type AssignmentFilter = 'all' | 'assigned' | 'unassigned';
export type StatusFilter =
  | ''
  | 'pending'
  | 'inprocess'
  | 'completed'
  | 'cancelled';

type FilterOption<T extends string> = {value: T; label: string};

const ASSIGNMENT_OPTIONS: FilterOption<AssignmentFilter>[] = [
  {value: 'all', label: 'All'},
  {value: 'assigned', label: 'Assigned'},
  {value: 'unassigned', label: 'Unassigned'},
];

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  {value: '', label: 'All status'},
  {value: 'pending', label: 'Pending'},
  {value: 'inprocess', label: 'InProcess'},
  {value: 'completed', label: 'Completed'},
  {value: 'cancelled', label: 'CancelRequest'},
];

type Props = {
  assignment: AssignmentFilter;
  status: StatusFilter;
  onAssignmentChange: (value: AssignmentFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
  /** Hide assignment dropdown. */
  showAssignment?: boolean;
};

type OpenSheet = 'assignment' | 'status' | null;

function labelFor<T extends string>(
  options: FilterOption<T>[],
  value: T,
): string {
  return options.find(o => o.value === value)?.label ?? 'Select';
}

export function RequestListFilters({
  assignment,
  status,
  onAssignmentChange,
  onStatusChange,
  showAssignment = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);

  const sheetTitle =
    openSheet === 'assignment' ? 'Assignment' : 'Status';
  const sheetOptions = useMemo(() => {
    if (openSheet === 'assignment') {
      return ASSIGNMENT_OPTIONS as FilterOption<string>[];
    }
    if (openSheet === 'status') {
      return STATUS_OPTIONS as FilterOption<string>[];
    }
    return [];
  }, [openSheet]);
  const selectedValue =
    openSheet === 'assignment' ? assignment : openSheet === 'status' ? status : null;

  function closeSheet() {
    setOpenSheet(null);
  }

  function handleSelect(value: string) {
    if (openSheet === 'assignment') {
      onAssignmentChange(value as AssignmentFilter);
    } else if (openSheet === 'status') {
      onStatusChange(value as StatusFilter);
    }
    closeSheet();
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {showAssignment ? (
          <Pressable
            style={({pressed}) => [
              styles.field,
              styles.fieldHalf,
              pressed && styles.pressed,
            ]}
            onPress={() => setOpenSheet('assignment')}>
            <View style={styles.fieldTextWrap}>
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.medium}
                style={styles.fieldLabel}>
                Assignment
              </CustomText>
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.semiBold}
                style={styles.fieldValue}
                numberOfLine={1}>
                {labelFor(ASSIGNMENT_OPTIONS, assignment)}
              </CustomText>
            </View>
            <Ionicons
              name="chevron-down"
              size={moderateScale(18)}
              color={Colors.muted}
            />
          </Pressable>
        ) : null}

        <Pressable
          style={({pressed}) => [
            styles.field,
            showAssignment ? styles.fieldHalf : styles.fieldFull,
            pressed && styles.pressed,
          ]}
          onPress={() => setOpenSheet('status')}>
          <View style={styles.fieldTextWrap}>
            <CustomText
              variant="h7"
              fontFamily={Fonts.montserrat.medium}
              style={styles.fieldLabel}>
              Status
            </CustomText>
            <CustomText
              variant="h7"
              fontFamily={Fonts.montserrat.semiBold}
              style={styles.fieldValue}
              numberOfLine={1}>
              {labelFor(STATUS_OPTIONS, status)}
            </CustomText>
          </View>
          <Ionicons
            name="chevron-down"
            size={moderateScale(18)}
            color={Colors.muted}
          />
        </Pressable>
      </View>

      <Modal
        visible={openSheet != null}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          <View
            style={[
              styles.sheet,
              {paddingBottom: Math.max(insets.bottom, moderateScaleVertical(12))},
            ]}>
            <View style={styles.handle} />
            <CustomText
              variant="h6"
              fontFamily={Fonts.montserrat.bold}
              style={styles.sheetTitle}>
              {sheetTitle}
            </CustomText>
            <FlatList
              data={sheetOptions}
              keyExtractor={item => item.value || 'all'}
              keyboardShouldPersistTaps="handled"
              renderItem={({item}) => {
                const selected = item.value === selectedValue;
                return (
                  <Pressable
                    style={({pressed}) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleSelect(item.value)}>
                    <CustomText
                      variant="h7"
                      fontFamily={
                        selected
                          ? Fonts.montserrat.semiBold
                          : Fonts.montserrat.medium
                      }
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}>
                      {item.label}
                    </CustomText>
                    {selected ? (
                      <Ionicons
                        name="checkmark"
                        size={moderateScale(18)}
                        color={Colors.brand}
                      />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: moderateScaleVertical(10),
  },
  row: {
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: moderateScale(12),
    backgroundColor: Colors.white,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(10),
    minHeight: moderateScaleVertical(52),
  },
  fieldHalf: {
    flex: 1,
  },
  fieldFull: {
    flex: 1,
  },
  fieldTextWrap: {
    flex: 1,
    gap: moderateScaleVertical(2),
  },
  fieldLabel: {
    color: Colors.muted,
    fontSize: RFValue(10),
  },
  fieldValue: {
    color: Colors.black,
    fontSize: RFValue(12),
  },
  pressed: {opacity: 0.92},
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(10),
    maxHeight: '55%',
  },
  handle: {
    alignSelf: 'center',
    width: moderateScale(40),
    height: moderateScaleVertical(4),
    borderRadius: moderateScale(2),
    backgroundColor: Colors.line,
    marginBottom: moderateScaleVertical(12),
  },
  sheetTitle: {
    color: Colors.black,
    fontSize: RFValue(15),
    marginBottom: moderateScaleVertical(8),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(4),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
  },
  optionSelected: {
    backgroundColor: Colors.brandSoft,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    borderBottomWidth: 0,
    marginBottom: moderateScaleVertical(4),
  },
  optionText: {
    color: Colors.black,
    fontSize: RFValue(13),
  },
  optionTextSelected: {
    color: Colors.brand,
  },
});
