import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import type {ServiceFormPayload, ServiceFormQuestion} from '@/api/publicApi';
import {serviceUi} from '@/styles/serviceUi';
import type {ExternalVendorUser} from '@/types/vendor';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import {useToastMessage} from '@/utils/useToastMessage';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  form: ServiceFormPayload;
  user: ExternalVendorUser | null;
  saving: boolean;
  onSubmit: (answers: {questionId: string; value: string}[]) => void;
  onBack: () => void;
};

/** Profile prefill only for plain text fields with obvious vendor/contact labels. */
function guessPrefill(
  label: string,
  user: ExternalVendorUser | null,
  questionType: ServiceFormQuestion['type'],
): string {
  if (!user) {
    return '';
  }
  // Dropdowns & checkboxes must start empty — options are service-specific.
  if (questionType === 'DROPDOWN' || questionType === 'CHECKBOX') {
    return '';
  }

  const l = label.toLowerCase().trim();

  if (
    (l.includes('firm') || l.includes('company') || l.includes('business')) &&
    user.firm_name
  ) {
    return user.firm_name;
  }

  // Avoid "NAME COIL CATEGORY" etc. — "name" is part of the field title, not vendor name.
  const blocksVendorName =
    /\b(category|categor|coil|type|product|brand|model|sku|price|qty|quantity|oil|drum|volume|liter|litre|kg)\b/.test(
      l,
    );
  const isVendorNameField =
    !blocksVendorName &&
    (/^(full\s*name|your\s*name|vendor\s*name|contact\s*name|applicant\s*name|customer\s*name|name)$/.test(
      l,
    ) ||
      /^name\s+of\s+(the\s+)?(vendor|applicant|contact|customer|partner)/.test(l));

  if (isVendorNameField && user.name) {
    return user.name;
  }

  if (
    (l.includes('mobile') || l.includes('phone') || l.includes('contact')) &&
    !l.includes('category') &&
    user.mobile
  ) {
    return String(user.mobile);
  }
  if (l.includes('email') && user.email) {
    return String(user.email);
  }
  return '';
}

export function ServiceDynamicForm({form, user, saving, onSubmit, onBack}: Props) {
  const {toastError} = useToastMessage();
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [dropdownAnswers, setDropdownAnswers] = useState<Record<string, string>>({});
  const [checkboxAnswers, setCheckboxAnswers] = useState<Record<string, string[]>>({});
  const [dropdownModalId, setDropdownModalId] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const sortedQuestions = useMemo(
    () => [...form.questions].sort((a, b) => a.sortOrder - b.sortOrder),
    [form.questions],
  );

  const activeDropdown = sortedQuestions.find(q => q.id === dropdownModalId);

  useEffect(() => {
    const text: Record<string, string> = {};
    const dropdown: Record<string, string> = {};
    const checks: Record<string, string[]> = {};
    for (const q of sortedQuestions) {
      const pre = guessPrefill(q.label, user, q.type);
      if (q.type === 'TEXT') {
        text[q.id] = pre;
      } else if (q.type === 'DROPDOWN') {
        dropdown[q.id] = pre;
      } else {
        checks[q.id] = pre ? [pre] : [];
      }
    }
    setTextAnswers(text);
    setDropdownAnswers(dropdown);
    setCheckboxAnswers(checks);
  }, [form.serviceId, sortedQuestions, user]);

  function toggleCheckbox(questionId: string, optionLabel: string) {
    setCheckboxAnswers(prev => {
      const set = new Set(prev[questionId] ?? []);
      if (set.has(optionLabel)) {
        set.delete(optionLabel);
      } else {
        set.add(optionLabel);
      }
      return {...prev, [questionId]: [...set]};
    });
  }

  function handleSubmit() {
    const answers: {questionId: string; value: string}[] = [];
    for (const q of sortedQuestions) {
      let value = '';
      if (q.type === 'TEXT') {
        value = textAnswers[q.id]?.trim() ?? '';
      } else if (q.type === 'DROPDOWN') {
        value = dropdownAnswers[q.id]?.trim() ?? '';
      } else {
        value = (checkboxAnswers[q.id] ?? []).join(', ');
      }

      if (q.required && !value) {
        toastError(`Please answer: ${q.label}`);
        return;
      }
      if (value) {
        answers.push({questionId: q.id, value});
      }
    }
    if (!answers.length) {
      toastError('Please fill at least one field');
      return;
    }
    onSubmit(answers);
  }

  function renderQuestion(q: ServiceFormQuestion) {
    const focused = focusedField === q.id;

    if (q.type === 'TEXT') {
      return (
        <TextInput
          style={[serviceUi.formInput, focused && serviceUi.formInputFocused]}
          value={textAnswers[q.id] ?? ''}
          onChangeText={v => setTextAnswers({...textAnswers, [q.id]: v})}
          onFocus={() => setFocusedField(q.id)}
          onBlur={() => setFocusedField(null)}
          placeholderTextColor={Colors.placeHolderColor}
        />
      );
    }

    if (q.type === 'DROPDOWN') {
      const value = dropdownAnswers[q.id] ?? '';
      return (
        <Pressable
          style={[serviceUi.formInput, serviceUi.dropdown, focused && serviceUi.formInputFocused]}
          onPress={() => setDropdownModalId(q.id)}>
          <CustomText
            variant="h6"
            style={{color: value ? Colors.black : Colors.placeHolderColor}}>
            {value || 'Select…'}
          </CustomText>
          <Ionicons name="chevron-down" size={20} color={Colors.muted} />
        </Pressable>
      );
    }

    const half = q.options.length === 2;
    return (
      <View style={serviceUi.checkboxGroup}>
        {q.options.map(o => {
          const checked = (checkboxAnswers[q.id] ?? []).includes(o.label);
          return (
            <Pressable
              key={o.id}
              style={[
                serviceUi.checkboxPill,
                half && serviceUi.checkboxPillHalf,
                checked && serviceUi.checkboxPillChecked,
              ]}
              onPress={() => toggleCheckbox(q.id, o.label)}>
              <Ionicons
                name={checked ? 'checkbox' : 'checkbox-outline'}
                size={20}
                color={checked ? Colors.brand : Colors.muted}
              />
              <CustomText
                variant="h7"
                fontFamily={Fonts.inter.semiBold}
                style={
                  checked ? serviceUi.checkboxPillTextChecked : serviceUi.checkboxPillText
                }>
                {o.label}
              </CustomText>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={serviceUi.card}>
      <Pressable style={serviceUi.backBtn} onPress={onBack}>
        <CustomText variant="h6" style={serviceUi.backBtnText}>
          ← Back to services
        </CustomText>
      </Pressable>

      <View style={serviceUi.selectedBanner}>
        <CustomText variant="h6" style={serviceUi.selectedBannerLabel}>
          Selected:{' '}
          <CustomText style={serviceUi.selectedBannerName}>{form.serviceName}</CustomText>
        </CustomText>
      </View>

      {form.title ? (
        <CustomText variant="h7" style={styles.formTitle} numberOfLine={3}>
          {form.title}
        </CustomText>
      ) : null}

      {!sortedQuestions.length ? (
        <CustomText variant="h7" style={styles.muted}>
          No form fields configured for this service yet.
        </CustomText>
      ) : (
        <>
          {sortedQuestions.map(q => (
            <View key={q.id} style={serviceUi.field}>
              <CustomText variant="h7" style={serviceUi.fieldLabel}>
                {q.label.toUpperCase()}
                {q.required ? ' *' : ''}
              </CustomText>
              {renderQuestion(q)}
            </View>
          ))}

          <Pressable
            style={[serviceUi.submitBtn, saving && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={saving}>
            <LinearGradient
              colors={[Colors.brandDark, Colors.brand, Colors.brandMid]}
              locations={[0, 0.55, 1]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={serviceUi.submitBtnInner}>
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <CustomText variant="h5" style={serviceUi.submitBtnText}>
                  Submit application
                </CustomText>
              )}
            </LinearGradient>
          </Pressable>
        </>
      )}

      <Modal
        visible={dropdownModalId !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDropdownModalId(null)}>
        <Pressable style={serviceUi.modalBackdrop} onPress={() => setDropdownModalId(null)}>
          <Pressable style={serviceUi.modalSheet} onPress={e => e.stopPropagation()}>
            <CustomText
              variant="h5"
              fontFamily={Fonts.inter.bold}
              style={styles.modalTitle}
              numberOfLine={2}>
              {activeDropdown?.label}
            </CustomText>
            <ScrollView>
              <Pressable
                style={serviceUi.modalOption}
                onPress={() => {
                  if (dropdownModalId) {
                    setDropdownAnswers({...dropdownAnswers, [dropdownModalId]: ''});
                  }
                  setDropdownModalId(null);
                }}>
                <CustomText variant="h6" style={styles.muted}>
                  Select…
                </CustomText>
              </Pressable>
              {activeDropdown?.options.map(o => (
                <Pressable
                  key={o.id}
                  style={serviceUi.modalOption}
                  onPress={() => {
                    if (dropdownModalId) {
                      setDropdownAnswers({...dropdownAnswers, [dropdownModalId]: o.label});
                    }
                    setDropdownModalId(null);
                  }}>
                  <CustomText variant="h6" fontFamily={Fonts.inter.semiBold}>
                    {o.label}
                  </CustomText>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  formTitle: {
    color: Colors.muted,
    marginBottom: moderateScaleVertical(14),
    lineHeight: 20,
  },
  muted: {color: Colors.muted},
  submitDisabled: {opacity: 0.55},
  modalTitle: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(18),
    paddingBottom: moderateScaleVertical(10),
  },
});
