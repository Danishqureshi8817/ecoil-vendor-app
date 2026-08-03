import AppBar from '@/components/global/AppBar';
import {Container} from '@/components/global/Container';
import CustomText from '@/components/global/CustomText';
import {
  parseWasteCategories,
  wasteBranchDisplay,
  wasteCollectionId,
  wasteFirmName,
  type WasteCategorySubmitItem,
  type WastePicturePayload,
  type WasteRequestRow,
} from '@/api/wasteApi';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {useCompleteWasteRequest} from '@/hooks/vendor/use-waste-requests';
import {StackNav} from '@/navigations/NavigationKeys';
import type {RootStackParamList} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {
  isImagePickerNativeAvailable,
  requestCameraAccess,
  requestGalleryAccess,
} from '@/utils/mediaPermissions';
import {goBack, resetToDrawerScreen} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import {vendorUserId} from '@/utils/vendorUser';
import {useToastMessage} from '@/utils/useToastMessage';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
  type DocumentPickerResponse,
} from '@react-native-documents/picker';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackNav.ProcessWasteRequest
>;

type PictureKey =
  | 'waste_picture1'
  | 'waste_picture2'
  | 'waste_picture3'
  | 'waste_picture4';

const PICTURE_KEYS: PictureKey[] = [
  'waste_picture1',
  'waste_picture2',
  'waste_picture3',
  'waste_picture4',
];

function emptyCategoryForm(waste_category_id: string): WasteCategorySubmitItem {
  return {
    waste_category_id,
    weight: '',
    waste_picture1: null,
    waste_picture2: null,
    waste_picture3: null,
    waste_picture4: null,
  };
}

function toPicturePayload(
  uri: string,
  name: string,
  type: string,
): WastePicturePayload {
  return {uri, name, type};
}

function fromDocument(
  res: DocumentPickerResponse,
  localUri: string | undefined,
  slot: number,
): WastePicturePayload | null {
  const uri = localUri ?? res.uri;
  if (!uri) {
    return null;
  }
  return toPicturePayload(
    uri,
    res.name ?? `waste_picture${slot}.jpg`,
    res.type ?? 'image/jpeg',
  );
}

function getImagePicker() {
  if (!isImagePickerNativeAvailable()) {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-image-picker') as typeof import('react-native-image-picker');
  } catch {
    return null;
  }
}

function showPermissionSettingsAlert(title: string, message: string) {
  Alert.alert(title, message, [
    {text: 'Cancel', style: 'cancel'},
    {
      text: 'Open Settings',
      onPress: () => {
        void Linking.openSettings();
      },
    },
  ]);
}

async function pickFromGallery(slot: number): Promise<WastePicturePayload | null> {
  const imagePicker = getImagePicker();

  // Preferred: native gallery with system permission dialog.
  if (imagePicker?.launchImageLibrary) {
    const allowed = await requestGalleryAccess();
    if (!allowed) {
      return null;
    }

    const result = await imagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.didCancel) {
      return null;
    }
    if (result.errorCode === 'permission') {
      showPermissionSettingsAlert(
        'Photos permission required',
        'Please allow photo access in Settings to choose waste pictures.',
      );
      return null;
    }
    if (result.errorCode) {
      throw new Error(result.errorMessage ?? 'Could not open gallery');
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      throw new Error('Could not read selected image');
    }
    const ext =
      asset.fileName?.split('.').pop() ||
      (asset.type?.includes('png') ? 'png' : 'jpg');
    return toPicturePayload(
      asset.uri,
      asset.fileName ?? `waste_picture${slot}.${ext}`,
      asset.type ?? 'image/jpeg',
    );
  }

  // Fallback: system document picker (does not need storage permission).
  const [picked] = await pick({
    type: [types.images],
    mode: 'import',
    allowMultiSelection: false,
  });

  const [localCopy] = await keepLocalCopy({
    files: [
      {
        uri: picked.uri,
        fileName: picked.name ?? `waste_picture${slot}.jpg`,
      },
    ],
    destination: 'cachesDirectory',
  });

  if (localCopy.status === 'error') {
    throw new Error(localCopy.copyError ?? 'Could not copy selected image');
  }

  return fromDocument(picked, localCopy.localUri, slot);
}

async function pickFromCamera(slot: number): Promise<WastePicturePayload | null> {
  const imagePicker = getImagePicker();
  if (!imagePicker?.launchCamera) {
    Alert.alert(
      'Camera unavailable',
      'Camera needs a native rebuild. Run:\nnpx react-native run-android',
      [{text: 'OK'}],
    );
    return null;
  }

  const allowed = await requestCameraAccess();
  if (!allowed) {
    return null;
  }

  const result = await imagePicker.launchCamera({
    mediaType: 'photo',
    quality: 0.8,
    saveToPhotos: false,
    cameraType: 'back',
  });

  if (result.didCancel) {
    return null;
  }
  if (result.errorCode === 'permission') {
    showPermissionSettingsAlert(
      'Camera permission required',
      'Please allow camera access in Settings to take waste pictures.',
    );
    return null;
  }
  if (result.errorCode) {
    throw new Error(result.errorMessage ?? 'Could not open camera');
  }

  const asset = result.assets?.[0];
  if (!asset?.uri) {
    throw new Error('Could not read camera image');
  }

  const ext =
    asset.fileName?.split('.').pop() ||
    (asset.type?.includes('png') ? 'png' : 'jpg');

  return toPicturePayload(
    asset.uri,
    asset.fileName ?? `waste_picture${slot}.${ext}`,
    asset.type ?? 'image/jpeg',
  );
}

export default function ProcessWasteRequestScreen({route}: Props) {
  const request = route.params.request as WasteRequestRow;
  const user = useAuthStore(s => s.user);
  const {toastSuccess} = useToastMessage();
  const completeMutation = useCompleteWasteRequest();

  const categories = useMemo(() => parseWasteCategories(request), [request]);
  const branchName = useMemo(() => wasteBranchDisplay(request), [request]);

  const [forms, setForms] = useState<WasteCategorySubmitItem[]>(() =>
    categories.map(c => emptyCategoryForm(c.waste_category_id)),
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [pickerSlot, setPickerSlot] = useState<PictureKey | null>(null);

  const isPreviewStep = showPreview;
  const totalSteps = categories.length;
  const currentCategory = categories[stepIndex];
  const currentForm = forms[stepIndex];

  function updateCurrent(patch: Partial<WasteCategorySubmitItem>) {
    setForms(prev =>
      prev.map((item, i) => (i === stepIndex ? {...item, ...patch} : item)),
    );
  }

  function validateCurrentStep(): boolean {
    if (!currentForm) {
      return false;
    }
    const weight = Number(currentForm.weight);
    if (!currentForm.weight.trim() || Number.isNaN(weight) || weight <= 0) {
      setError('Enter a valid weight greater than 0');
      return false;
    }
    const hasPicture = PICTURE_KEYS.some(key => currentForm[key] != null);
    if (!hasPicture) {
      setError('Add at least one waste picture');
      return false;
    }
    setError('');
    return true;
  }

  function onNext() {
    if (!validateCurrentStep()) {
      return;
    }
    if (stepIndex < totalSteps - 1) {
      setStepIndex(i => i + 1);
      return;
    }
    setShowPreview(true);
  }

  function onBack() {
    setError('');
    if (isPreviewStep) {
      setShowPreview(false);
      return;
    }
    if (stepIndex > 0) {
      setStepIndex(i => i - 1);
      return;
    }
    goBack();
  }

  async function pickImage(from: 'camera' | 'gallery') {
    if (!pickerSlot) {
      return;
    }
    const slot = pickerSlot;
    const slotNumber = Number(slot.replace('waste_picture', ''));
    setPickerSlot(null);
    setError('');

    try {
      const picture =
        from === 'camera'
          ? await pickFromCamera(slotNumber)
          : await pickFromGallery(slotNumber);

      if (!picture) {
        return;
      }
      updateCurrent({[slot]: picture});
    } catch (err: unknown) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      setError(getApiErrorMessage(err, 'Could not pick image'));
    }
  }

  async function onSubmit() {
    const collectionId = wasteCollectionId(request);
    if (!collectionId) {
      setError('Missing waste_collection_id');
      return;
    }

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const weight = Number(form.weight);
      if (!form.weight.trim() || Number.isNaN(weight) || weight <= 0) {
        setShowPreview(false);
        setStepIndex(i);
        setError(`Enter a valid weight for ${categories[i]?.name ?? 'category'}`);
        return;
      }
      if (!PICTURE_KEYS.some(key => form[key] != null)) {
        setShowPreview(false);
        setStepIndex(i);
        setError(
          `Add at least one picture for ${categories[i]?.name ?? 'category'}`,
        );
        return;
      }
    }

    try {
      await completeMutation.mutateAsync({
        waste_collection_id: collectionId,
        scrap_vendor_id: request.scrap_vendor_id ?? null,
        vendor_id: request.vendor_id ?? null,
        vendorUserId: vendorUserId(user),
        categories: forms,
      });
      toastSuccess('Waste Request submitted');
      resetToDrawerScreen(StackNav.WasteRequests);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not submit Waste Request'));
    }
  }

  if (categories.length === 0) {
    return (
      <Container fullScreen statusBarStyle="light-content">
        <AppBar title="Process Waste Request" leading="back" />
        <View style={styles.emptyWrap}>
          <CustomText
            variant="h6"
            fontFamily={Fonts.montserrat.semiBold}
            style={styles.emptyTitle}>
            No waste categories found
          </CustomText>
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.regular}
            style={styles.muted}>
            This request has no waste categories to process.
          </CustomText>
        </View>
      </Container>
    );
  }

  return (
    <Container fullScreen statusBarStyle="light-content">
      <AppBar
        title={isPreviewStep ? 'Preview & Submit' : 'Process Waste Request'}
        leading="back"
        onLeadingPress={onBack}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <CustomText
              variant="h6"
              fontFamily={Fonts.montserrat.bold}
              style={styles.headerTitle}
              numberOfLine={2}>
              {wasteFirmName(request)}
            </CustomText>
            {branchName ? (
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.medium}
                style={styles.muted}>
                {branchName}
              </CustomText>
            ) : null}
            {!isPreviewStep ? (
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.semiBold}
                style={styles.stepLabel}>
                Category {stepIndex + 1} of {totalSteps}
              </CustomText>
            ) : null}
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <CustomText variant="h7" style={styles.errorText}>
                {error}
              </CustomText>
            </View>
          ) : null}

          {isPreviewStep ? (
            <View style={styles.previewList}>
              {forms.map((form, index) => (
                <View
                  key={form.waste_category_id + index}
                  style={styles.previewCard}>
                  <CustomText
                    variant="h6"
                    fontFamily={Fonts.montserrat.bold}
                    style={styles.previewTitle}>
                    {categories[index]?.name ?? form.waste_category_id}
                  </CustomText>
                  <CustomText
                    variant="h7"
                    fontFamily={Fonts.montserrat.medium}
                    style={styles.previewWeight}>
                    Weight: {form.weight} kg
                  </CustomText>
                  <CustomText
                    variant="h7"
                    fontFamily={Fonts.montserrat.regular}
                    style={styles.muted}>
                    Pictures:{' '}
                    {PICTURE_KEYS.filter(k => form[k] != null).length} / 4
                  </CustomText>
                  <Pressable
                    onPress={() => {
                      setShowPreview(false);
                      setStepIndex(index);
                    }}
                    style={styles.editLink}>
                    <CustomText
                      variant="h7"
                      fontFamily={Fonts.montserrat.semiBold}
                      style={styles.editLinkText}>
                      Edit
                    </CustomText>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.formCard}>
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.medium}
                style={styles.fieldLabel}>
                Waste Category
              </CustomText>
              <View style={styles.readOnlyField}>
                <CustomText
                  variant="h6"
                  fontFamily={Fonts.montserrat.semiBold}
                  style={styles.readOnlyText}>
                  {currentCategory?.name ?? currentForm?.waste_category_id}
                </CustomText>
              </View>

              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.medium}
                style={styles.fieldLabel}>
                Weight (kg)
              </CustomText>
              <TextInput
                style={styles.input}
                value={currentForm?.weight ?? ''}
                onChangeText={text =>
                  updateCurrent({weight: text.replace(/[^0-9.]/g, '')})
                }
                placeholder="Enter weight"
                placeholderTextColor={Colors.placeHolderColor}
                keyboardType="decimal-pad"
              />

              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.medium}
                style={styles.fieldLabel}>
                Waste Pictures
              </CustomText>
              <View style={styles.pictureGrid}>
                {PICTURE_KEYS.map((key, index) => {
                  const picture = currentForm?.[key] ?? null;
                  return (
                    <Pressable
                      key={key}
                      style={styles.pictureSlot}
                      onPress={() => setPickerSlot(key)}>
                      {picture ? (
                        <>
                          <Image
                            source={{uri: picture.uri}}
                            style={styles.picturePreview}
                          />
                          <Pressable
                            style={styles.clearPic}
                            onPress={() => updateCurrent({[key]: null})}
                            hitSlop={8}>
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color={Colors.error}
                            />
                          </Pressable>
                        </>
                      ) : (
                        <View style={styles.pictureEmpty}>
                          <Ionicons
                            name="camera-outline"
                            size={26}
                            color={Colors.brand}
                          />
                          <CustomText
                            variant="h7"
                            fontFamily={Fonts.montserrat.medium}
                            style={styles.pictureHint}>
                            Picture {index + 1}
                          </CustomText>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({pressed}) => [
              styles.secondaryBtn,
              pressed && styles.pressed,
            ]}
            onPress={onBack}>
            <CustomText
              variant="h7"
              fontFamily={Fonts.montserrat.semiBold}
              style={styles.secondaryBtnText}>
              {isPreviewStep || stepIndex > 0 ? 'Back' : 'Cancel'}
            </CustomText>
          </Pressable>

          {isPreviewStep ? (
            <Pressable
              style={({pressed}) => [
                styles.primaryBtn,
                pressed && styles.pressed,
                completeMutation.isPending && styles.disabled,
              ]}
              disabled={completeMutation.isPending}
              onPress={() => void onSubmit()}>
              {completeMutation.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <CustomText
                  variant="h7"
                  fontFamily={Fonts.montserrat.bold}
                  style={styles.primaryBtnText}>
                  Submit
                </CustomText>
              )}
            </Pressable>
          ) : (
            <Pressable
              style={({pressed}) => [
                styles.primaryBtn,
                pressed && styles.pressed,
              ]}
              onPress={onNext}>
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.bold}
                style={styles.primaryBtnText}>
                {stepIndex < totalSteps - 1 ? 'Next' : 'Preview'}
              </CustomText>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={pickerSlot != null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerSlot(null)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPickerSlot(null)}>
          <View style={styles.sheet}>
            <CustomText
              variant="h6"
              fontFamily={Fonts.montserrat.bold}
              style={styles.sheetTitle}>
              Add Waste Picture
            </CustomText>
            <Pressable
              style={styles.sheetBtn}
              onPress={() => void pickImage('camera')}>
              <Ionicons name="camera-outline" size={22} color={Colors.brand} />
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.semiBold}
                style={styles.sheetBtnText}>
                Take photo
              </CustomText>
            </Pressable>
            {/* Gallery — enable when required
            <Pressable
              style={styles.sheetBtn}
              onPress={() => void pickImage('gallery')}>
              <Ionicons name="image-outline" size={22} color={Colors.brand} />
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.semiBold}
                style={styles.sheetBtnText}>
                Choose from gallery
              </CustomText>
            </Pressable>
            */}
            <Pressable
              style={styles.sheetCancel}
              onPress={() => setPickerSlot(null)}>
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.medium}
                style={styles.muted}>
                Cancel
              </CustomText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(16),
    paddingBottom: moderateScaleVertical(24),
  },
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: Colors.line,
    padding: moderateScale(14),
    marginBottom: moderateScaleVertical(14),
  },
  headerTitle: {
    color: Colors.black,
    fontSize: RFValue(14),
    marginBottom: moderateScaleVertical(4),
  },
  muted: {
    color: Colors.muted,
    fontSize: RFValue(11),
  },
  stepLabel: {
    color: Colors.brand,
    fontSize: RFValue(11),
    marginTop: moderateScaleVertical(10),
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(8),
    backgroundColor: Colors.errorSoft,
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(12),
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: Colors.error,
    flex: 1,
    fontSize: RFValue(11),
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: Colors.line,
    padding: moderateScale(14),
  },
  fieldLabel: {
    color: Colors.muted,
    fontSize: RFValue(11),
    marginBottom: moderateScaleVertical(6),
    marginTop: moderateScaleVertical(8),
  },
  readOnlyField: {
    backgroundColor: Colors.bg,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(14),
  },
  readOnlyText: {
    color: Colors.black,
    fontSize: RFValue(13),
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(12),
    fontFamily: Fonts.montserrat.regular,
    fontSize: RFValue(14),
    color: Colors.black,
  },
  pictureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(10),
    marginTop: moderateScaleVertical(4),
  },
  pictureSlot: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.bg,
  },
  picturePreview: {
    width: '100%',
    height: '100%',
  },
  pictureEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    minHeight: moderateScale(120),
  },
  pictureHint: {
    color: Colors.muted,
    fontSize: RFValue(10),
  },
  clearPic: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  previewList: {
    gap: moderateScaleVertical(10),
  },
  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: Colors.line,
    padding: moderateScale(14),
  },
  previewTitle: {
    color: Colors.black,
    fontSize: RFValue(13),
    marginBottom: moderateScaleVertical(6),
  },
  previewWeight: {
    color: Colors.black,
    fontSize: RFValue(12),
    marginBottom: moderateScaleVertical(4),
  },
  editLink: {
    alignSelf: 'flex-start',
    marginTop: moderateScaleVertical(8),
  },
  editLinkText: {
    color: Colors.drawerGradientEnd,
    fontSize: RFValue(12),
  },
  footer: {
    flexDirection: 'row',
    gap: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(12),
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.white,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: moderateScaleVertical(48),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  secondaryBtnText: {
    color: Colors.black,
    fontSize: RFValue(13),
  },
  primaryBtn: {
    flex: 1.2,
    minHeight: moderateScaleVertical(48),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonPrimary,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: RFValue(13),
  },
  disabled: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.9,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(24),
  },
  emptyTitle: {
    color: Colors.black,
    marginBottom: moderateScaleVertical(8),
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(18),
    paddingBottom: moderateScaleVertical(28),
  },
  sheetTitle: {
    color: Colors.black,
    fontSize: RFValue(14),
    marginBottom: moderateScaleVertical(14),
  },
  sheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
    paddingVertical: moderateScaleVertical(14),
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  sheetBtnText: {
    color: Colors.black,
    fontSize: RFValue(13),
  },
  sheetCancel: {
    alignItems: 'center',
    paddingTop: moderateScaleVertical(16),
  },
});
