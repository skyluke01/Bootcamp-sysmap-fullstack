import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  CaretLeftIcon,
  CaretDown,
  CaretUp,
  NotePencilIcon,
  SignOut,
} from 'phosphor-react-native';

import { RootStackParamList } from '../../navigation/AppRoutes';
import { colors } from '../../theme/colors';
import { userService } from '../../services/userService';
import { activityService } from '../../services/activityService';
import { authStorage } from '../../storage/authStorage';

import { User } from '../../types/user';
import { Activity } from '../../types/activity';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function ActivityProfileCard({
  activity,
  onPress,
}: {
  activity: Activity;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
      }}
    >
      <Image
        source={{ uri: activity.image }}
        style={{
          width: '100%',
          height: 140,
          backgroundColor: '#DDD',
        }}
      />

      <View style={{ padding: 12 }}>
        <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 6 }}>
          {activity.title}
        </Text>

        <Text style={{ fontSize: 12, color: '#777' }}>
          📅 {formatDate(activity.scheduledDate)}
        </Text>

        <Text style={{ fontSize: 12, color: '#777', marginTop: 4 }}>
          👥 {activity.participantCount} participantes
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function Profile({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [createdActivities, setCreatedActivities] = useState<Activity[]>([]);
  const [historyActivities, setHistoryActivities] = useState<Activity[]>([]);
  const [showCreatedActivities, setShowCreatedActivities] = useState(true);
  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    await authStorage.clearAuth();

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  async function loadData() {
    try {
      const userData = await userService.getUser();
      const createdData = await activityService.getUserCreatedActivities();
      const historyData = await activityService.getUserParticipantActivities();

      setUser(userData);
      setCreatedActivities(createdData);
      setHistoryActivities(historyData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FFF' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View
        style={{
          backgroundColor: '#12C77A',
          paddingTop: 50,
          paddingBottom: 30,
          alignItems: 'center',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            left: 24,
            top: 54,
            zIndex: 10,
          }}
        >
          <CaretLeftIcon size={26} color="#1D1D1D" weight="bold" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          style={{
            position: 'absolute',
            right: 60,
            top: 54,
            zIndex: 10,
          }}
        >
          <NotePencilIcon size={26} color="#1D1D1D" weight="regular" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            position: 'absolute',
            right: 24,
            top: 54,
            zIndex: 10,
          }}
        >
          <SignOut size={26} color="#1D1D1D" weight="regular" />
        </TouchableOpacity>

        <Text
          style={{
            color: '#FFF',
            fontSize: 20,
            fontWeight: '800',
            marginBottom: 16,
          }}
        >
          PERFIL
        </Text>

        <Image
          source={{ uri: user?.avatar }}
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: '#DDD',
            borderWidth: 4,
            borderColor: '#FFF',
          }}
        />

        <Text
          style={{
            color: '#FFF',
            fontSize: 22,
            fontWeight: '800',
            marginTop: 12,
          }}
        >
          {user?.name}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 4,
        }}
        style={{ marginTop: 20 }}
      >
        <View
          style={{
            width: 335,
            height: 200,
            backgroundColor: '#FFF',
            borderRadius: 12,
            padding: 20,
            elevation: 2,
            marginRight: 16,
            overflow: 'hidden',
          }}
        >
          <Text style={{ fontSize: 12, color: '#777', marginBottom: 8 }}>
            Seu nível é
          </Text>

          <Text style={{ fontSize: 28, fontWeight: '800', color: '#1D1D1D' }}>
            {user?.level}
          </Text>

          <View
            style={{
              marginTop: 16,
              height: 6,
              backgroundColor: '#E5E5E5',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${Math.min((user?.xp ?? 0) % 100, 100)}%`,
                height: '100%',
                backgroundColor: '#12C77A',
              }}
            />
          </View>

          <Text
            style={{
              marginTop: 8,
              fontSize: 12,
              color: '#777',
              textAlign: 'right',
            }}
          >
            {user?.xp} pts
          </Text>
        </View>

        <View
          style={{
            width: 335,
            height: 200,
            backgroundColor: '#FFF',
            borderRadius: 12,
            padding: 20,
            elevation: 2,
            marginRight: 16,
            overflow: 'hidden',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 16 }}>
            CONQUISTAS
          </Text>

          {user?.achievements?.length ? (
            user.achievements.map(achievement => (
              <View key={achievement.id} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 28 }}>🏅</Text>

                <Text style={{ fontWeight: '700' }}>{achievement.name}</Text>

                <Text style={{ fontSize: 12, color: '#777' }}>
                  {achievement.criterion}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#777' }}>Nenhuma conquista ainda.</Text>
          )}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
            }}
          >
            SUAS ATIVIDADES
          </Text>

          <TouchableOpacity
            onPress={() => setShowCreatedActivities(!showCreatedActivities)}
          >
            {showCreatedActivities ? (
              <CaretDown size={30} color="#1D1D1D" weight="bold" />
            ) : (
              <CaretUp size={30} color="#1D1D1D" weight="bold" />
            )}
          </TouchableOpacity>
        </View>

        {showCreatedActivities &&
          (createdActivities.length === 0 ? (
            <Text style={{ color: '#777' }}>Nenhuma atividade criada.</Text>
          ) : (
            createdActivities.map(activity => (
              <ActivityProfileCard
                key={activity.id}
                activity={activity}
                onPress={() =>
                  navigation.navigate('ActivityDetails', {
                    activity,
                  })
                }
              />
            ))
          ))}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
            }}
          >
            HISTÓRICO DE ATIVIDADES
          </Text>
        </View>

        {historyActivities.length === 0 ? (
          <Text style={{ color: '#777' }}>Nenhuma atividade no histórico.</Text>
        ) : (
          historyActivities.map(activity => (
            <ActivityProfileCard
              key={activity.id}
              activity={activity}
              onPress={() =>
                navigation.navigate('ActivityDetails', {
                  activity,
                })
              }
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}