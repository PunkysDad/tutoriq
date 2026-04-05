import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles } from '../theme';

export default function LoginScreen() {
  return (
    <View style={[commonStyles.container, commonStyles.centered]}>
      <Text style={commonStyles.heading2}>Login</Text>
    </View>
  );
}
