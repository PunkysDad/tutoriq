import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles } from '../theme';

export default function RegisterScreen() {
  return (
    <View style={[commonStyles.container, commonStyles.centered]}>
      <Text style={commonStyles.heading2}>Register</Text>
    </View>
  );
}
