import React from 'react';
import { Image, Text, TouchableOpacity } from 'react-native';
import { ActivityType } from '../../types/activity';

type Props = {
  type: ActivityType;
  selected?: boolean;
  onPress?: () => void;
};

export function CategoryItem({ type, selected = false, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{ alignItems: 'center', marginRight: 14 }}
    >
      <Image
        source={{ uri: type.image }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: '#1D1D1D',
          marginBottom: 6,
          borderWidth: selected ? 3 : 0,
          borderColor: '#12C77A',
        }}
      />

      <Text
        style={{
          fontSize: 11,
          color: selected ? '#12C77A' : '#1D1D1D',
          fontWeight: selected ? '800' : '600',
        }}
      >
        {type.name}
      </Text>
    </TouchableOpacity>
  );
}