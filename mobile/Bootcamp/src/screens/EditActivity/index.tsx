import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Camera, CaretLeft } from 'phosphor-react-native';

import { RootStackParamList } from '../../navigation/AppRoutes';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { activityService } from '../../services/activityService';
import { ActivityType } from '../../types/activity';
import { requestGalleryPermission } from '../../utils/permissions';
import { fonts } from '../../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'EditActivity'>;

type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

export function EditActivity({ route, navigation }: Props) {
  const { activity } = route.params;

  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description);
  const [date, setDate] = useState(new Date(activity.scheduledDate));
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);

  const [isPrivate, setIsPrivate] = useState(activity.private);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [location, setLocation] = useState(activity.address);
  const [loading, setLoading] = useState(false);

  async function loadTypes() {
    try {
      const data = await activityService.getTypes();

      setTypes(data);

      const currentType = data.find(
        item => item.id === activity.type || item.name === activity.type,
      );

      if (currentType) {
        setSelectedType(currentType.id);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSelectImage() {
    const allowed = await requestGalleryPermission();

    if (!allowed) {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso à galeria para selecionar uma imagem.',
      );
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.didCancel) return;

    const asset = result.assets?.[0];

    if (!asset?.uri) {
      Alert.alert('Imagem', 'Não foi possível selecionar a imagem.');
      return;
    }

    setSelectedImage({
      uri: asset.uri,
      name: asset.fileName ?? 'activity.jpg',
      type: asset.type ?? 'image/jpeg',
    });
  }

  function handleDateChange(event: any, selectedDate?: Date) {
    if (event.type === 'dismissed') {
      setPickerMode(null);
      return;
    }

    if (!selectedDate) {
      setPickerMode(null);
      return;
    }

    setDate(selectedDate);

    if (pickerMode === 'date') {
      setPickerMode('time');
    } else {
      setPickerMode(null);
    }
  }

  async function handleSave() {
    if (!title || !description || !selectedType) {
      Alert.alert('Editar atividade', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);

      await activityService.updateActivity({
        id: activity.id,
        title,
        description,
        typeId: selectedType,
        address: JSON.stringify(location),
        scheduledDate: date.toISOString(),
        isPrivate,
        image: selectedImage ?? undefined,
      });

      const updatedActivity = await activityService.getActivityById(activity.id);

      Alert.alert('Editar atividade', 'Atividade atualizada com sucesso.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.replace('ActivityDetails', {
              activity: updatedActivity,
            }),
        },
      ]);
    } catch (error: any) {
      console.log(error.response?.data ?? error);

      Alert.alert(
        'Editar atividade',
        error.response?.data?.error ??
          'Não foi possível atualizar a atividade.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteActivity() {
    Alert.alert(
      'Cancelar atividade',
      'Tem certeza que deseja cancelar esta atividade?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              await activityService.deleteActivity(activity.id);

              Alert.alert('Atividade', 'Atividade cancelada com sucesso.', [
                {
                  text: 'OK',
                  onPress: () =>
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Home' }],
                    }),
                },
              ]);
            } catch (error: any) {
              console.log(error.response?.data ?? error);

              Alert.alert(
                'Atividade',
                error.response?.data?.error ??
                  'Não foi possível cancelar a atividade.',
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  }

  useEffect(() => {
    loadTypes();
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: '#FFF' }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 40,
      }}
    >
      <TouchableOpacity
        disabled={loading}
        onPress={() => navigation.goBack()}
        style={{ marginTop: 45, marginBottom: 22 }}
      >
        <CaretLeft size={26} color="#1D1D1D" weight="bold" />
      </TouchableOpacity>

      <Text
        style={{
          textAlign: 'center',
          fontSize: 24,
          fontFamily: fonts.title,
          color: '#1D1D1D',
          marginBottom: 22,
        }}
      >
        EDITAR ATIVIDADE
      </Text>

      <TouchableOpacity
        disabled={loading}
        activeOpacity={0.8}
        onPress={handleSelectImage}
        style={{
          height: 150,
          backgroundColor: '#F1F1F1',
          borderRadius: 8,
          marginBottom: 20,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Image
          source={{ uri: selectedImage?.uri ?? activity.image }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        <View
          style={{
            position: 'absolute',
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: 'rgba(255,255,255,0.85)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Camera size={20} color="#1D1D1D" weight="regular" />
        </View>
      </TouchableOpacity>

      <Input label="Título" value={title} onChangeText={setTitle} />

      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
        Data do Evento <Text style={{ color: '#FF0000' }}>*</Text>
      </Text>

      <TouchableOpacity
        disabled={loading}
        onPress={() => setPickerMode('date')}
        style={{
          height: 52,
          borderWidth: 1,
          borderColor: '#DDD',
          borderRadius: 8,
          justifyContent: 'center',
          paddingHorizontal: 14,
          marginBottom: 20,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ color: '#1D1D1D' }}>{date.toLocaleString('pt-BR')}</Text>
      </TouchableOpacity>

      {pickerMode && (
        <DateTimePicker
          value={date}
          mode={pickerMode}
          is24Hour
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
        Ponto de Encontro
      </Text>

      <View
        style={{
          height: 150,
          borderRadius: 8,
          backgroundColor: '#DDEFE7',
          marginBottom: 18,
          overflow: 'hidden',
        }}
      >
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ width: '100%', height: '100%' }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={event => {
            setLocation(event.nativeEvent.coordinate);
          }}
        >
          <Marker coordinate={location} title="Ponto de encontro" />
        </MapView>
      </View>

      <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 10 }}>
        Visibilidade
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        <TouchableOpacity
          disabled={loading}
          onPress={() => setIsPrivate(true)}
          style={{
            backgroundColor: isPrivate ? '#000' : '#EFEFEF',
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 4,
            marginRight: 10,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: isPrivate ? '#FFF' : '#000', fontSize: 12 }}>
            Privado
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={loading}
          onPress={() => setIsPrivate(false)}
          style={{
            backgroundColor: !isPrivate ? '#000' : '#EFEFEF',
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 4,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: !isPrivate ? '#FFF' : '#000', fontSize: 12 }}>
            Público
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontSize: 22,
          fontFamily: fonts.title,
          color: '#1D1D1D',
          marginBottom: 14,
        }}
      >
        CATEGORIAS
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {types.map(type => (
          <TouchableOpacity
            disabled={loading}
            key={type.id}
            onPress={() => setSelectedType(type.id)}
            style={{ alignItems: 'center', marginRight: 14 }}
          >
            <Image
              source={{ uri: type.image }}
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                borderWidth: selectedType === type.id ? 3 : 0,
                borderColor: '#12C77A',
                backgroundColor: '#D9D9D9',
                opacity: loading ? 0.6 : 1,
              }}
            />

            <Text style={{ marginTop: 6, fontSize: 11, color: '#1D1D1D' }}>
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ marginTop: 28 }}>
        <Button
          title={loading ? 'Salvando...' : 'Salvar alterações'}
          onPress={handleSave}
          disabled={loading}
        />
      </View>

      <TouchableOpacity
        disabled={loading}
        onPress={handleDeleteActivity}
        style={{
          marginTop: 18,
          alignItems: 'center',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: '#1D1D1D',
          }}
        >
          Cancelar Atividade
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}