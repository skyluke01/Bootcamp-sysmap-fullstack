import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../../theme/colors';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, ...rest }: Props) {
  return (
    <View style={{ width: '100%', marginBottom: 14 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
        {label} <Text style={{ color: colors.danger }}>*</Text>
      </Text>

      <TextInput
        placeholderTextColor="#C7C7C7"
        style={{
          height: 50,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: 4,
          paddingHorizontal: 12,
          marginTop: 6,
          fontSize: 12,
          color: colors.text,
        }}
        {...rest}
      />

      {!!error && (
        <Text style={{ marginTop: 4, fontSize: 11, color: colors.danger }}>
          {error}
        </Text>
      )}
    </View>
  );
}