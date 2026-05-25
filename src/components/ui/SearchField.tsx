import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {input} from '@/styles/ui';
import {moderateScale} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search…',
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[input.row, focused && input.rowFocused, styles.wrap]}>
      <Ionicons
        name="search-outline"
        size={20}
        color={focused ? Colors.brand : Colors.muted}
        style={styles.icon}
      />
      <TextInput
        style={[input.field, {fontFamily: Fonts.inter.regular}]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeHolderColor}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 ? (
        <Ionicons
          name="close-circle"
          size={20}
          color={Colors.muted}
          onPress={() => onChangeText('')}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {marginBottom: moderateScale(14)},
  icon: {marginRight: moderateScale(8)},
});
