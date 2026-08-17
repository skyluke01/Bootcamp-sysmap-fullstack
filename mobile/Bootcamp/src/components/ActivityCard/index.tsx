import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Activity } from '../../types/activity';

type Props = {
  activity: Activity;
  onPress?: () => void;
};

function formatDate(date: string) {
  const value = new Date(date);

  return value.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function ActivityCard({ activity, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{ marginTop: 16 }}
    >
      <Image
        source={{ uri: activity.image }}
        style={{
          width: '100%',
          height: 150,
          borderRadius: 8,
          backgroundColor: '#E5E5E5',
        }}
      />

      <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '700' }}>
        {activity.title}
      </Text>

      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Text style={{ fontSize: 11, color: '#6B6B6B', marginRight: 12 }}>
          📅 {formatDate(activity.scheduledDate)}
        </Text>

        <Text style={{ fontSize: 11, color: '#6B6B6B' }}>
          👥 {activity.participantCount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}