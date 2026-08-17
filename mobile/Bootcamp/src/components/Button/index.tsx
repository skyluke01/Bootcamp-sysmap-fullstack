import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors } from '../../theme/colors';

type Props = TouchableOpacityProps & {
  title: string;
};

export function Button({ title, ...rest }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{
        height: 48,
        borderRadius: 3,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
      {...rest}
    >
      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}