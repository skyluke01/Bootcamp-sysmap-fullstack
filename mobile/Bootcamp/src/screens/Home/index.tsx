import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Plus, Star } from 'phosphor-react-native';

import { RootStackParamList } from '../../navigation/AppRoutes';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { userService } from '../../services/userService';
import { activityService } from '../../services/activityService';

import { User } from '../../types/user';
import { Activity, ActivityType } from '../../types/activity';

import { ActivityCard } from '../../components/ActivityCard';
import { CategoryItem } from '../../components/CategoryItem';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function activityMatchesType(activity: Activity, type?: ActivityType) {
  if (!type) return false;

  return (
    activity.type === type.id ||
    activity.type === type.name ||
    activity.type?.toLowerCase() === type.name?.toLowerCase()
  );
}

export function Home({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  async function loadHomeData() {
    try {
      setLoading(true);

      const userData = await userService.getUser();
      const activitiesData = await activityService.getAllActivities();
      const typesData = await activityService.getTypes();

      setUser(userData);
      setActivities(activitiesData ?? []);
      setTypes(typesData ?? []);
    } catch (error) {
      console.log(error);
      Alert.alert('Home', 'Não foi possível carregar os dados da Home.');
      setActivities([]);
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, []),
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

  const selectedType = types.find(type => type.id === selectedTypeId);

  const filteredActivities: Activity[] = selectedTypeId
    ? activities.filter((activity: Activity) =>
        activityMatchesType(activity, selectedType),
      )
    : activities;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View
          style={{
            backgroundColor: '#12C77A',
            height: 105,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 42,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text style={{ color: '#F1F1F1', fontSize: 12 }}>
              Olá, Seja Bem Vindo
            </Text>

            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 24,
                fontFamily: fonts.title,
              }}
            >
              {user?.name}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#FFFFFF',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginRight: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Star size={15} color="#FFD43B" weight="fill" />

              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '700',
                  marginLeft: 4,
                }}
              >
                {user?.level}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Profile')}
            >
              <Image
                source={{ uri: user?.avatar }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#D9D9D9',
                }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: fonts.title,
                color: '#1D1D1D',
              }}
            >
              SUAS RECOMENDAÇÕES
            </Text>

            <TouchableOpacity
              onPress={async () => {
                try {
                  let initialTypeId: string | undefined =
                    selectedTypeId ?? undefined;

                  if (!initialTypeId) {
                    const preferences = await userService.getPreferences();

                    if (preferences.length > 0) {
                      const randomPreference =
                        preferences[
                          Math.floor(Math.random() * preferences.length)
                        ];

                      initialTypeId = randomPreference.typeId;
                    } else if (types.length > 0) {
                      const randomType =
                        types[Math.floor(Math.random() * types.length)];

                      initialTypeId = randomType.id;
                    }
                  }

                  navigation.navigate('Activities', {
                    initialTypeId,
                  });
                } catch (error) {
                  console.log(error);

                  navigation.navigate('Activities', {
                    initialTypeId: selectedTypeId ?? types[0]?.id,
                  });
                }
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#1D1D1D',
                }}
              >
                VER MAIS
              </Text>
            </TouchableOpacity>
          </View>

          {filteredActivities.length === 0 ? (
            <Text style={{ color: '#777', marginTop: 20 }}>
              Nenhuma atividade encontrada.
            </Text>
          ) : (
            filteredActivities.slice(0, 2).map((activity: Activity) => (
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

          <Text
            style={{
              fontSize: 20,
              fontFamily: fonts.title,
              color: '#1D1D1D',
              marginTop: 24,
              marginBottom: 14,
            }}
          >
            CATEGORIAS
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {types.map(type => (
              <CategoryItem
                key={type.id}
                type={type}
                selected={type.id === selectedTypeId}
                onPress={() =>
                  setSelectedTypeId(
                    selectedTypeId === type.id ? null : type.id,
                  )
                }
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CreateActivity')}
        style={{
          position: 'absolute',
          right: 24,
          bottom: 28,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#12C77A',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Plus size={30} color="#FFFFFF" weight="regular" />
      </TouchableOpacity>
    </View>
  );
}