import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, CaretDown, CaretUp } from 'phosphor-react-native';

import { RootStackParamList } from '../../navigation/AppRoutes';
import { activityService } from '../../services/activityService';
import { userService } from '../../services/userService';
import { Activity, ActivityType } from '../../types/activity';
import { User } from '../../types/user';
import { ActivityCard } from '../../components/ActivityCard';
import { CategoryItem } from '../../components/CategoryItem';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'Activities'>;

function activityMatchesType(activity: Activity, type?: ActivityType) {
  if (!type) return false;

  return (
    activity.type === type.id ||
    activity.type === type.name ||
    activity.type?.toLowerCase() === type.name?.toLowerCase()
  );
}

export function Activities({ route, navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(
    route.params?.initialTypeId ?? null,
  );
  const [showMyActivities, setShowMyActivities] = useState(true);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const userData = await userService.getUser();
      const activitiesData = await activityService.getAllActivities();
      const typesData = await activityService.getTypes();

      setUser(userData);
      setActivities(activitiesData ?? []);
      setTypes(typesData ?? []);

      if (!route.params?.initialTypeId && typesData.length > 0) {
        const randomType =
          typesData[Math.floor(Math.random() * typesData.length)];

        setSelectedTypeId(randomType.id);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Atividades', 'Não foi possível carregar as atividades.');
      setActivities([]);
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedType = types.find(type => type.id === selectedTypeId);

  const filteredActivities: Activity[] = selectedTypeId
    ? activities.filter((activity: Activity) =>
        activityMatchesType(activity, selectedType),
      )
    : activities;

  const myActivities = filteredActivities.filter(
    activity => activity.creator?.id === user?.id,
  );

  const communityActivities = filteredActivities.filter(
    activity => activity.creator?.id !== user?.id,
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 45, marginBottom: 20 }}
        >
          <ArrowLeft size={24} color="#1D1D1D" weight="bold" />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 24,
            fontFamily: fonts.title,
            textAlign: 'center',
            marginBottom: 24,
            color: '#1D1D1D',
          }}
        >
          {selectedType?.name?.toUpperCase() ?? 'ATIVIDADES'}
        </Text>

        <Text
          style={{
            fontSize: 20,
            fontFamily: fonts.title,
            color: '#1D1D1D',
            marginBottom: 14,
          }}
        >
          CATEGORIAS
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        >
          {types.map(type => (
            <CategoryItem
              key={type.id}
              type={type}
              selected={type.id === selectedTypeId}
              onPress={() => setSelectedTypeId(type.id)}
            />
          ))}
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: fonts.title,
              color: '#1D1D1D',
            }}
          >
            SUAS ATIVIDADES
          </Text>

          <TouchableOpacity
            onPress={() => setShowMyActivities(!showMyActivities)}
          >
            {showMyActivities ? (
              <CaretDown size={24} color="#1D1D1D" weight="bold" />
            ) : (
              <CaretUp size={24} color="#1D1D1D" weight="bold" />
            )}
          </TouchableOpacity>
        </View>

        {showMyActivities &&
          (myActivities.length === 0 ? (
            <Text style={{ color: '#777', marginBottom: 20 }}>
              Nenhuma atividade sua nesta categoria.
            </Text>
          ) : (
            myActivities.map((activity: Activity) => (
              <ActivityCard
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

        <Text
          style={{
            fontSize: 20,
            fontFamily: fonts.title,
            color: '#1D1D1D',
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          ATIVIDADES DA COMUNIDADE
        </Text>

        {communityActivities.length === 0 ? (
          <Text style={{ color: '#777', textAlign: 'center', marginTop: 30 }}>
            Nenhuma atividade encontrada nesta categoria.
          </Text>
        ) : (
          communityActivities.map((activity: Activity) => (
            <ActivityCard
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
      </ScrollView>
    </View>
  );
}