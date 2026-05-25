import {Colors} from '@/constants/colors';
import React from 'react';
import {ActivityIndicator, Modal, StyleSheet, View} from 'react-native';

type Props = {visible: boolean};

export default function LoadingModal({visible}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
