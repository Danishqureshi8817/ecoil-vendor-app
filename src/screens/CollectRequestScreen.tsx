import CustomText from '@/components/global/CustomText';
import {ListToolbar} from '@/components/external/ListToolbar';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {StackNav} from '@/navigations/NavigationKeys';
import vendorService from '@/services/vendor-service';
import {externalUi} from '@/styles/externalUi';
import {screen} from '@/styles/ui';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {push} from '@/utils/NavigationUtils';
import {moderateScaleVertical} from '@/utils/responsiveSize';
import {useToastMessage} from '@/utils/useToastMessage';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function CollectRequestScreen() {
  const [enteredDrumsQty, setEnteredDrumsQty] = useState('');
  const [enteredVolume, setEnteredVolume] = useState('');
  const [emptyDrumsQty, setEmptyDrumsQty] = useState('');
  const [notesForTeam, setNotesForTeam] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const {toastSuccess} = useToastMessage();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: vendorService.submitCollection,
    onSuccess: async () => {
      toastSuccess('Collection request submitted');
      setSuccess('Collection request submitted successfully.');
      await queryClient.invalidateQueries({
        queryKey: [vendorService.queryKeys.collectionRequests],
      });
      setEnteredDrumsQty('');
      setEnteredVolume('');
      setEmptyDrumsQty('');
      setNotesForTeam('');
      setTimeout(() => push(StackNav.CollectRequestList), 1200);
    },
    onError: (err: unknown) => {
      setError(getApiErrorMessage(err, 'Could not submit request'));
      setSuccess('');
    },
  });

  function onSubmit() {
    setError('');
    setSuccess('');
    const drums = Number(enteredDrumsQty);
    const volume = Number(enteredVolume);
    const emptyDrums = Number(emptyDrumsQty);

    if (!Number.isFinite(drums) || drums < 0) {
      setError('Enter a valid drums quantity');
      return;
    }
    if (!Number.isFinite(volume) || volume < 0) {
      setError('Enter a valid volume');
      return;
    }
    if (!Number.isFinite(emptyDrums) || emptyDrums < 0) {
      setError('Enter a valid empty drums quantity');
      return;
    }

    submitMutation.mutate({
      entered_drums_qty: drums,
      entered_volume: volume,
      empty_drums_qty: emptyDrums,
      notes_for_team: notesForTeam,
    });
  }

  function renderField(
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    options?: {keyboardType?: 'numeric'; placeholder?: string; multiline?: boolean},
  ) {
    const focused = focusedField === id;
    return (
      <View style={externalUi.field}>
        <CustomText variant="h7" style={externalUi.fieldLabel}>
          {label}
        </CustomText>
        <TextInput
          style={[
            externalUi.formInput,
            options?.multiline && externalUi.formTextarea,
            focused && externalUi.formInputFocused,
          ]}
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField(null)}
          placeholder={options?.placeholder}
          placeholderTextColor={Colors.placeHolderColor}
          keyboardType={options?.keyboardType}
          multiline={options?.multiline}
          numberOfLines={options?.multiline ? 4 : 1}
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={screen.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View style={externalUi.card}>
        <CustomText variant="h5" fontFamily={Fonts.inter.bold} style={externalUi.cardTitle}>
          New collection request
        </CustomText>
        <CustomText variant="h7" style={externalUi.muted}>
          Submit oil collection details. Uses your login Bearer token automatically.
        </CustomText>
      </View>

      <View style={externalUi.card}>
        {error ? (
          <View style={externalUi.alertError}>
            <CustomText variant="h7" style={externalUi.alertErrorText}>
              {error}
            </CustomText>
          </View>
        ) : null}
        {success ? (
          <View style={externalUi.alertSuccess}>
            <CustomText variant="h7" style={externalUi.alertSuccessText}>
              {success}
            </CustomText>
          </View>
        ) : null}

        {renderField('drums', 'ENTERED DRUMS QTY', enteredDrumsQty, setEnteredDrumsQty, {
          keyboardType: 'numeric',
          placeholder: 'e.g. 15',
        })}
        {renderField('volume', 'ENTERED VOLUME', enteredVolume, setEnteredVolume, {
          keyboardType: 'numeric',
          placeholder: 'e.g. 150',
        })}
        {renderField('empty', 'EMPTY DRUMS QTY', emptyDrumsQty, setEmptyDrumsQty, {
          keyboardType: 'numeric',
          placeholder: 'e.g. 2',
        })}
        {renderField('notes', 'NOTES FOR TEAM', notesForTeam, setNotesForTeam, {
          multiline: true,
          placeholder: 'Any comments for the collection team',
        })}

        <Pressable
          style={[externalUi.submitBtn, submitMutation.isPending && styles.submitDisabled]}
          onPress={onSubmit}
          disabled={submitMutation.isPending}>
          <LinearGradient
            colors={[Colors.brandDark, Colors.brand, Colors.brandMid]}
            locations={[0, 0.55, 1]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={externalUi.submitBtnInner}>
            {submitMutation.isPending ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <CustomText variant="h5" style={externalUi.submitBtnText}>
                Submit request
              </CustomText>
            )}
          </LinearGradient>
        </Pressable>

        <View style={externalUi.formFooter}>
          <Pressable onPress={() => push(StackNav.CollectRequestList)}>
            <CustomText variant="h7" style={externalUi.formFooterLink}>
              View all requests →
            </CustomText>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  submitDisabled: {opacity: 0.55},
});
