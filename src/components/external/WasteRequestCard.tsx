import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {
  parseWasteCategories,
  wasteBranchDisplay,
  wasteFirmName,
  wasteRequestDateTime,
  isWasteRequestOwnedByUser,
  type WasteRequestRow,
} from '@/api/wasteApi';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useMemo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

type Props = {
  row: WasteRequestRow;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

function MetaRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.metaRow}>
      <CustomText
        variant="h7"
        fontFamily={Fonts.montserrat.medium}
        style={styles.metaLabel}>
        {label}
      </CustomText>
      <CustomText
        variant="h7"
        fontFamily={Fonts.montserrat.semiBold}
        style={styles.metaValue}
        numberOfLine={2}>
        {value}
      </CustomText>
    </View>
  );
}

export function WasteRequestCard({row, onComplete, onEdit, onDelete}: Props) {
  const categories = useMemo(() => parseWasteCategories(row), [row]);
  const owned = isWasteRequestOwnedByUser(row);
  const branchName = wasteBranchDisplay(row);

  return (
    <View style={styles.card}>
      <CustomText
        variant="h6"
        fontFamily={Fonts.montserrat.bold}
        style={styles.title}
        numberOfLine={2}>
        {wasteFirmName(row)}
      </CustomText>

      <View style={styles.divider} />

      {branchName ? <MetaRow label="Branch" value={branchName} /> : null}

      {categories.length === 0 ? (
        <MetaRow label="Category" value="—" />
      ) : categories.length === 1 ? (
        <MetaRow label="Category" value={categories[0].name} />
      ) : (
        categories.map((category, index) => (
          <MetaRow
            key={`${category.waste_category_id}-${index}`}
            label={`Category-${index + 1}`}
            value={category.name}
          />
        ))
      )}

      <MetaRow label="Request date" value={wasteRequestDateTime(row)} />

      {owned && (onEdit || onDelete) ? (
        <>
          <View style={styles.divider} />
          <View style={styles.actionRow}>
          {onEdit ? (
            <Pressable
              style={({pressed}) => [
                styles.secondaryBtn,
                styles.actionHalf,
                pressed && styles.pressed,
              ]}
              onPress={onEdit}>
              <Ionicons
                name="create-outline"
                size={moderateScale(16)}
                color={Colors.brand}
              />
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.semiBold}
                style={styles.secondaryBtnText}>
                Edit
              </CustomText>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable
              style={({pressed}) => [
                styles.dangerBtn,
                styles.actionHalf,
                pressed && styles.pressed,
              ]}
              onPress={onDelete}>
              <Ionicons
                name="trash-outline"
                size={moderateScale(16)}
                color={Colors.error}
              />
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.semiBold}
                style={styles.dangerBtnText}>
                Delete
              </CustomText>
            </Pressable>
          ) : null}
        </View>
        </>
      ) : null}

      {onComplete ? (
        <>
          <View style={styles.divider} />
          <Pressable
            style={({pressed}) => [styles.actionBtn, pressed && styles.pressed]}
            onPress={onComplete}>
            <CustomText
              variant="h7"
              fontFamily={Fonts.montserrat.semiBold}
              style={styles.actionText}>
              Process Request
            </CustomText>
            <Ionicons
              name="arrow-forward"
              size={moderateScale(18)}
              color={Colors.white}
            />
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.line,
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {opacity: 0.92},
  title: {
    color: Colors.black,
    fontSize: RFValue(14),
    marginBottom: moderateScaleVertical(12),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginBottom: moderateScaleVertical(10),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: moderateScale(12),
    marginBottom: moderateScaleVertical(8),
  },
  metaLabel: {
    color: Colors.muted,
    fontSize: RFValue(11),
    width: moderateScale(88),
  },
  metaValue: {
    color: Colors.black,
    fontSize: RFValue(11),
    flex: 1,
    textAlign: 'right',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
    backgroundColor: Colors.buttonPrimary,
    borderRadius: moderateScale(12),
    minHeight: moderateScaleVertical(44),
    marginTop: moderateScaleVertical(4),
  },
  actionText: {
    color: Colors.white,
    fontSize: RFValue(12),
  },
  actionRow: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginTop: moderateScaleVertical(4),
  },
  actionHalf: {
    flex: 1,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    borderWidth: 1,
    borderColor: Colors.brand,
    borderRadius: moderateScale(12),
    minHeight: moderateScaleVertical(44),
    backgroundColor: Colors.white,
  },
  secondaryBtnText: {
    color: Colors.brand,
    fontSize: RFValue(12),
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: moderateScale(12),
    minHeight: moderateScaleVertical(44),
    backgroundColor: '#FEF2F2',
  },
  dangerBtnText: {
    color: Colors.error,
    fontSize: RFValue(12),
  },
});
