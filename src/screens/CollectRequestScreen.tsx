import CustomText from '@/components/global/CustomText';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { StackNav } from '@/navigations/NavigationKeys';
import vendorService from '@/services/vendor-service';
import {
  mapUiRequestTypeToApi,
  type ChallanFilePayload,
} from '@/api/collectionApi';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
  type DocumentPickerResponse,
} from '@react-native-documents/picker';
import { useAuthStore } from '@/states/authStore';
import { vendorUserId } from '@/utils/vendorUser';
import { screen } from '@/styles/ui';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import { push, goBack, navigate } from '@/utils/NavigationUtils';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import { useToastMessage } from '@/utils/useToastMessage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Container } from '@/components/global/Container';
import AppBar from '@/components/global/AppBar';
import { CollectionFormChallanIcon, CollectionFormDrumIcon, CollectionFormOilIcon, CollectionTypeDrumIcon, CollectionTypeNormalIcon, CollectionTypeOilIcon, UploadIcon } from '@/components/icon/icon';

const COLLECTION_REQUEST_FORM_IMG = require('@/assets/images/CollectionRequestForm.png');

const requestTypes = [
  { id: 'normal' as const, label: 'Normal', subtitle: 'Oil Pickup & Drum Drop' },
  { id: 'oil' as const, label: 'Oil Pickup Only', subtitle: '' },
  { id: 'drum' as const, label: 'Drum Drop Only', subtitle: '' },
];

function toChallanFile(
  res: DocumentPickerResponse,
  localUri?: string,
): ChallanFilePayload | null {
  const uri = localUri ?? res.uri;
  if (!uri) return null;
  return {
    uri,
    name: res.name ?? 'challan',
    type: res.type ?? 'application/octet-stream',
  };
}

export default function CollectRequestScreen() {
  const user = useAuthStore(s => s.user);

  // Custom styled inputs state
  const [requestType, setRequestType] = useState<'normal' | 'oil' | 'drum'>('normal');
  const [enteredDrumsQty, setEnteredDrumsQty] = useState('');
  const [enteredVolume, setEnteredVolume] = useState('');
  const [emptyDrumsQty, setEmptyDrumsQty] = useState('');
  const [challanFile, setChallanFile] = useState<ChallanFilePayload | null>(null);
  const [challanFileName, setChallanFileName] = useState('');
  const [challanNumber, setChallanNumber] = useState('');
  const [challanRequired, setChallanRequired] = useState<'yes' | 'no'>('no');
  const [notesForTeam, setNotesForTeam] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { toastSuccess } = useToastMessage();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: vendorService.submitCollection,
    onSuccess: async () => {
      toastSuccess('Collection request submitted');
      setSuccess('Collection request submitted successfully.');
      await queryClient.invalidateQueries({
        queryKey: [vendorService.queryKeys.collectionRequests],
      });
      // Reset form fields
      setEnteredDrumsQty('');
      setEnteredVolume('');
      setEmptyDrumsQty('');
      setChallanFile(null);
      setChallanFileName('');
      setChallanNumber('');
      setChallanRequired('no');
      setNotesForTeam('');
      setRequestType('normal');
      setTimeout(() => navigate(StackNav.CollectRequestList), 1200);
    },
    onError: (err: unknown) => {
      setError(getApiErrorMessage(err, 'Could not submit request'));
      setSuccess('');
    },
  });

  const handleBrowseChallan = async () => {
    try {
      const [picked] = await pick({
        type: [types.images, types.pdf],
        mode: 'import',
        allowMultiSelection: false,
      });

      const [localCopy] = await keepLocalCopy({
        files: [
          {
            uri: picked.uri,
            fileName: picked.name ?? 'challan',
          },
        ],
        destination: 'cachesDirectory',
      });

      if (localCopy.status === 'error') {
        setError(localCopy.copyError ?? 'Could not copy selected file');
        return;
      }

      const file = toChallanFile(picked, localCopy.localUri);
      if (!file) {
        setError('Could not read selected file');
        return;
      }
      setChallanFile(file);
      setChallanFileName(file.name);
      setError('');
      toastSuccess('Challan file selected');
    } catch (err: unknown) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      setError(getApiErrorMessage(err, 'Could not select challan file'));
    }
  };

  const showPickupFields = requestType === 'normal' || requestType === 'oil';
  const showDropFields = requestType === 'normal' || requestType === 'drum';

  const onSubmit = () => {
    setError('');
    setSuccess('');

    const drums = Number(enteredDrumsQty || 0);
    const volume = Number(enteredVolume || 0);
    const emptyDrums = Number(emptyDrumsQty || 0);

    if (showPickupFields) {
      if (!enteredDrumsQty || !Number.isFinite(drums) || drums <= 0) {
        setError('Enter a valid filled drums quantity');
        return;
      }
      if (!enteredVolume || !Number.isFinite(volume) || volume <= 0) {
        setError('Enter a valid oil quantity (kg)');
        return;
      }
    }

    if (showDropFields) {
      if (!emptyDrumsQty || !Number.isFinite(emptyDrums) || emptyDrums <= 0) {
        setError('Enter a valid drums quantity to drop');
        return;
      }
    }

    if (challanRequired === 'yes' && !challanFile) {
      setError('Please select a delivery challan file');
      return;
    }

    const vid = vendorUserId(user);

    submitMutation.mutate({
      request_type: mapUiRequestTypeToApi(requestType),
      entered_drums_qty: showPickupFields ? drums : 0,
      entered_volume: showPickupFields ? volume : 0,
      empty_drums_qty: showDropFields ? emptyDrums : 0,
      notes_for_team: notesForTeam.trim(),
      challan_number: challanNumber.trim(),
      challan_required: challanRequired === 'yes' ? 1 : 0,
      challan_file: challanFile,
      vendorUserId: vid,
      vendorName: user?.name ?? user?.firm_name ?? String(vid),
    });
  };

  return (
    <Container fullScreen statusBarStyle="light-content">
      <AppBar title="Collection Requests Entry" leading="close" />

      <ScrollView
        style={screen.pageBg}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sub-header Banner */}
        <View style={styles.bannerContainer}>
          {/* <View style={styles.bannerLeft}>
            <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.bannerTitle}>
              Add / Edit Collection Request
            </CustomText>
            <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.bannerSubtitle}>
              Provide the details below to schedule a pickup.
            </CustomText>
          </View> */}
          <Image source={COLLECTION_REQUEST_FORM_IMG} style={styles.bannerImage} resizeMode="contain" />
        </View>

        {/* Alerts */}
        {error ? (
          <View style={styles.alertError}>
            <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.alertErrorText}>
              {error}
            </CustomText>
          </View>
        ) : null}
        {success ? (
          <View style={styles.alertSuccess}>
            <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.alertSuccessText}>
              {success}
            </CustomText>
          </View>
        ) : null}

        {/* Request Type Selection */}
        <View style={styles.sectionHeader}>
          <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.sectionTitle}>
            Request Type
          </CustomText>
        </View>

        <View style={styles.typeSelectorRow}>
          {requestTypes.map(item => {
            const isSelected = requestType === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setRequestType(item.id)}
                style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                activeOpacity={0.85}
              >
                {/* Radio Indicator */}
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                {/* Icon */}
                {
                  item?.id == 'normal'
                    ? <CollectionTypeNormalIcon /> :
                    item?.id == 'oil'
                      ? <CollectionTypeOilIcon />
                      : item?.id == 'drum'
                        ? <CollectionTypeDrumIcon />
                        : null
                }
                {/* Label */}
                <CustomText
                  variant="h7"
                  fontFamily={Fonts.montserrat.medium}
                  style={[styles.typeCardLabel, isSelected && styles.typeCardLabelSelected]}
                >
                  {item.label}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input Fields — shown per request type */}
        {showPickupFields ? (
          <>
            <CustomFieldRow
              label="Filled Drums Quantity (To pickup)"
              value={enteredDrumsQty}
              onChange={setEnteredDrumsQty}
              placeholder="Enter quantity"
              icon="cube-outline"
              rightText="Nos."
              keyboardType="numeric"
            />

            <CustomFieldRow
              label="Oil Quantity (kg) (To pickup)"
              value={enteredVolume}
              onChange={setEnteredVolume}
              placeholder="Enter quantity"
              icon="water-outline"
              rightText="Kg"
              keyboardType="numeric"
            />
          </>
        ) : null}

        {showDropFields ? (
          <CustomFieldRow
            label="Drums Quantity (To drop)"
            value={emptyDrumsQty}
            onChange={setEmptyDrumsQty}
            placeholder="Enter quantity"
            icon="cube-outline"
            rightText="Nos."
            keyboardType="numeric"
          />
        ) : null}

        <CustomFieldRow
          label="Delivery Challan"
          value={challanFileName}
          placeholder="Select delivery challan"
          icon="document-text-outline"
          isReadOnly
          rightButton={{
            label: 'Browse',
            icon: 'upload',
            onPress: handleBrowseChallan,
          }}
        />

        <CustomFieldRow
          label="Challan Number"
          value={challanNumber}
          onChange={setChallanNumber}
          placeholder="Enter challan number"
          iconText="#"
          keyboardType="default"
        />

        <CustomFieldRow
          label="Additional Info (Optional)"
          value={notesForTeam}
          onChange={setNotesForTeam}
          placeholder="Add any additional information..."
          iconText="#"
          multiline
        />

        <View style={styles.sectionHeader}>
          <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.sectionTitle}>
            Challan Required
          </CustomText>
        </View>
        <View style={styles.challanRequiredRow}>
          {(['yes', 'no'] as const).map(option => {
            const selected = challanRequired === option;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => setChallanRequired(option)}
                style={[styles.challanRequiredOption, selected && styles.challanRequiredSelected]}
                activeOpacity={0.85}>
                <View
                  style={[
                    styles.challanRadioCircle,
                    selected && styles.challanRadioCircleSelected,
                  ]}>
                  {selected ? <View style={styles.challanRadioDot} /> : null}
                </View>
                <CustomText
                  variant="h7"
                  fontFamily={Fonts.montserrat.medium}
                  style={styles.challanRequiredLabel}>
                  {option === 'yes' ? 'Yes' : 'No'}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cancel / Save Bottom Actions */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => goBack()}
            activeOpacity={0.8}
          >
            <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.cancelBtnText}>
              Cancel
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, submitMutation.isPending && styles.submitDisabled]}
            onPress={onSubmit}
            disabled={submitMutation.isPending}
            activeOpacity={0.85}
          >
            {submitMutation.isPending ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color={Colors.white} style={{ marginRight: 8 }} />
                <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.saveBtnText}>
                  Save / Update
                </CustomText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}

function CustomFieldRow({
  label,
  value,
  onChange,
  placeholder,
  icon,
  iconText,
  rightText,
  rightButton,
  keyboardType,
  multiline,
  isReadOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder: string;
  icon?: string;
  iconText?: string;
  rightText?: string;
  rightButton?: {
    label: string;
    icon: string;
    onPress: () => void;
  };
  keyboardType?: 'numeric' | 'default';
  multiline?: boolean;
  isReadOnly?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldContainer}>
      <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.fieldLabel}>
        {label}
      </CustomText>
      <View style={styles.fieldRow}>
        <View style={styles.iconCircle}>
          {icon == 'cube-outline' ? (
            <CollectionFormDrumIcon />
          ) : icon == 'water-outline' ? (
            <CollectionFormOilIcon />) :
            icon == 'document-text-outline' ? (
              <CollectionFormChallanIcon />
            ) : (
              <CustomText style={styles.iconCircleText}>{iconText}</CustomText>
            )}
        </View>

        {multiline ? (
          <View style={[styles.textareaWrapper, focused && styles.inputWrapperFocused]}>
            <TextInput
              style={styles.textarea}
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor={Colors.placeHolderColor}
              multiline
              maxLength={250}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <CustomText style={styles.charLimitText}>
              {value.length}/250
            </CustomText>
          </View>
        ) : (
          <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor={Colors.placeHolderColor}
              keyboardType={keyboardType}
              editable={!isReadOnly}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {rightText && (
              <View style={styles.unitBadge}>
                <CustomText style={styles.unitBadgeText}>{rightText}</CustomText>
              </View>
            )}
            {rightButton && (
              <TouchableOpacity
                onPress={rightButton.onPress}
                style={styles.browseButton}
                activeOpacity={0.8}
              >
                {rightButton?.label == 'Browse' && <UploadIcon />}
                <CustomText style={styles.browseButtonText}>{rightButton.label}</CustomText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: moderateScaleVertical(32),
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: 'red',
    // paddingHorizontal: moderateScale(16),
    // paddingVertical: moderateScaleVertical(12),
    marginBottom: moderateScaleVertical(16),

  },
  bannerLeft: {
    flex: 1,
    paddingRight: moderateScale(8),
  },
  bannerTitle: {
    color: '#007D41',
    fontSize: RFValue(12.5),
    marginBottom: moderateScaleVertical(4),
  },
  bannerSubtitle: {
    color: '#64748B',
    fontSize: RFValue(9.5),
  },
  bannerImage: {
    width: '100%',
    height: moderateScale(74),
  },
  sectionHeader: {
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScaleVertical(8),
  },
  sectionTitle: {
    color: Colors.black,
    fontSize: RFValue(11),
  },
  typeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScaleVertical(16),
  },
  typeCard: {
    flex: 1,
    marginHorizontal: moderateScale(4),
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(10),
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(4),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    position: 'relative',
    minHeight: moderateScaleVertical(100),
    gap: moderateScale(10)
  },
  typeCardSelected: {
    borderColor: '#007D41',
    backgroundColor: '#F4FAF5',
  },
  radioCircle: {
    position: 'absolute',
    top: moderateScaleVertical(8),
    left: moderateScale(8),
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(7),
    borderWidth: 1.2,
    borderColor: '#A0AEC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.buttonPrimary,
  },
  radioDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: Colors.buttonPrimary,
  },
  typeCardIcon: {
    marginTop: moderateScaleVertical(8),
    marginBottom: moderateScaleVertical(6),
  },
  typeCardLabel: {
    color: Colors.black,
    fontSize: RFValue(10),
    textAlign: 'center',
    lineHeight: RFValue(14),
  },
  typeCardLabelSelected: {
    color: Colors.black,
  },
  fieldContainer: {
    marginBottom: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(16),
  },
  fieldLabel: {
    color: Colors.black,
    fontSize: RFValue(11),
    marginBottom: moderateScaleVertical(8),
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: '#F5FAF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  iconCircleText: {
    color: '#095227',
    fontFamily: Fonts.montserrat.bold,
    fontSize: RFValue(14),
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(8),
    backgroundColor: Colors.white,
    height: moderateScaleVertical(44),
  },
  inputWrapperFocused: {
    borderColor: '#007D41',
  },
  input: {
    flex: 1,
    paddingHorizontal: moderateScale(12),
    fontSize: RFValue(12),
    color: Colors.black,
    fontFamily: Fonts.montserrat.medium,
  },
  unitBadge: {
    backgroundColor: '#EDF7ED',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(14),
    borderTopRightRadius: moderateScale(7),
    borderBottomRightRadius: moderateScale(7),
  },
  unitBadgeText: {
    color: Colors.buttonPrimary,
    fontFamily: Fonts.montserrat.semiBold,
    fontSize: RFValue(10),
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF4EA',
    height: '100%',
    paddingHorizontal: moderateScale(16),
    borderTopRightRadius: moderateScale(7),
    borderBottomRightRadius: moderateScale(7),
    borderLeftWidth: 1.2,
    borderLeftColor: '#E2E8F0',
    gap: moderateScale(7)
  },
  browseButtonText: {
    color: Colors.buttonPrimary,
    fontFamily: Fonts.montserrat.semiBold,
    fontSize: RFValue(11),
  },
  textareaWrapper: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(8),
    backgroundColor: Colors.white,
    height: moderateScaleVertical(90),
    padding: moderateScale(8),
    justifyContent: 'space-between',
  },
  textarea: {
    flex: 1,
    fontSize: RFValue(12),
    color: Colors.black,
    fontFamily: Fonts.montserrat.medium,
    textAlignVertical: 'top',
    padding: 0,
  },
  charLimitText: {
    alignSelf: 'flex-end',
    fontSize: RFValue(9),
    color: '#A0AEC0',
    fontFamily: Fonts.montserrat.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    marginVertical: moderateScaleVertical(24),
  },
  cancelBtn: {
    flex: 1,
    marginRight: moderateScale(8),
    height: moderateScaleVertical(46),
    borderRadius: moderateScale(23),
    borderWidth: 1.2,
    borderColor: '#A0AEC0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  cancelBtnText: {
    color: Colors.black,
    fontSize: RFValue(12),
  },
  saveBtn: {
    flex: 1,
    marginLeft: moderateScale(8),
    height: moderateScaleVertical(46),
    borderRadius: moderateScale(23),
    backgroundColor: '#074825',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: RFValue(12),
  },
  submitDisabled: {
    opacity: 0.55,
  },
  alertError: {
    backgroundColor: '#FDE8E8',
    borderColor: '#F8B4B4',
    borderWidth: 1.2,
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginHorizontal: moderateScale(16),
    marginBottom: moderateScaleVertical(16),
  },
  alertErrorText: {
    color: '#9B1C1C',
    fontSize: RFValue(11),
  },
  alertSuccess: {
    backgroundColor: '#DEF7EC',
    borderColor: '#31C48D',
    borderWidth: 1.2,
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginHorizontal: moderateScale(16),
    marginBottom: moderateScaleVertical(16),
  },
  alertSuccessText: {
    color: '#03543F',
    fontSize: RFValue(11),
  },
  challanRequiredRow: {
    flexDirection: 'row',
    gap: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScaleVertical(8),
  },
  challanRequiredOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(8),
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(16),
    backgroundColor: Colors.white,
  },
  challanRequiredSelected: {
    borderColor: '#007D41',
    backgroundColor: '#F4FAF5',
  },
  challanRadioCircle: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    borderWidth: 1.5,
    borderColor: '#A0AEC0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  challanRadioCircleSelected: {
    borderColor: Colors.buttonPrimary,
  },
  challanRadioDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: Colors.buttonPrimary,
  },
  challanRequiredLabel: {
    color: Colors.black,
    fontSize: RFValue(12),
  },
});
