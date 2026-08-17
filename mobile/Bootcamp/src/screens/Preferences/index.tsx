import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaretLeft } from 'phosphor-react-native';

import { RootStackParamList } from '../../navigation/AppRoutes';
import { activityService } from '../../services/activityService';
import { userService } from '../../services/userService';
import { Button } from '../../components/Button';
import { ActivityType } from '../../types/activity';
import { fonts } from '../../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'Preferences'>;

export function Preferences({ navigation, route }: Props) {
  const fromProfile = route.params?.fromProfile === true;

  const [types, setTypes] = useState<ActivityType[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      const typesData = await activityService.getTypes();
      setTypes(typesData);

      if (fromProfile) {
        const preferences = await userService.getPreferences();
        const selectedIds = preferences.map((item: any) => item.typeId);
        setSelected(selectedIds);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function toggleType(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  }

  async function handleSave() {
    if (selected.length === 0) {
      Alert.alert('Preferências', 'Selecione pelo menos uma categoria.');
      return;
    }

    try {
      setSaving(true);

      await userService.definePreferences(selected);

      if (fromProfile) {
        navigation.goBack();
        return;
      }

      navigation.replace('Home');
    } catch (error: any) {
      console.log(error.response?.data ?? error);

      Alert.alert(
        'Preferências',
        error.response?.data?.error ??
          'Não foi possível salvar as preferências.',
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFF',
        }}
      >
        <ActivityIndicator color="#12C77A" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FFF' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 28,
        paddingBottom: 40,
      }}
    >
      {fromProfile && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 45, marginBottom: 24 }}
        >
          <CaretLeft size={26} color="#1D1D1D" weight="bold" />
        </TouchableOpacity>
      )}

      <Text
        style={{
          marginTop: fromProfile ? 8 : 70,
          fontSize: 26,
          lineHeight: 30,
          fontFamily: fonts.title,
          color: '#1D1D1D',
          textAlign: 'center',
        }}
      >
        SELECIONE SEU TIPO{'\n'}FAVORITO
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginTop: 38,
          marginBottom: 20,
        }}
      >
        {types.map(type => {
          const isSelected = selected.includes(type.id);

          return (
            <TouchableOpacity
              key={type.id}
              disabled={saving}
              onPress={() => toggleType(type.id)}
              style={{
                width: '45%',
                alignItems: 'center',
                marginBottom: 34,
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Image
                source={{ uri: type.image }}
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 43,
                  borderWidth: isSelected ? 3 : 0,
                  borderColor: '#12C77A',
                  backgroundColor: '#DDD',
                }}
              />

              <Text
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  fontWeight: isSelected ? '800' : '500',
                  color: '#1D1D1D',
                  textAlign: 'center',
                }}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        title={saving ? 'Salvando...' : 'Salvar'}
        onPress={handleSave}
        disabled={saving}
      />

      {!fromProfile && (
        <TouchableOpacity
          disabled={saving}
          style={{
            marginTop: 18,
            alignItems: 'center',
            opacity: saving ? 0.6 : 1,
          }}
          onPress={() => navigation.replace('Home')}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: '#1D1D1D',
            }}
          >
            Pular
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}