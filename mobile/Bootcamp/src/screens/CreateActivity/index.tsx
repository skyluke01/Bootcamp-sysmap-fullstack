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
import { launchImageLibrary } from 'react-native-image-picker';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Camera, CaretLeft, MapPin } from 'phosphor-react-native';

import { RootStackParamList } from '../../navigation/AppRoutes';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { activityService } from '../../services/activityService';
import { ActivityType } from '../../types/activity';
import {
  requestGalleryPermission,
  requestLocationPermission,
} from '../../utils/permissions';
import { fonts } from '../../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateActivity'>;

type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

type Location = {
  latitude: number;
  longitude: number;
};

export function CreateActivity({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);

  const [isPrivate, setIsPrivate] = useState(true);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );

  const [location, setLocation] = useState<Location | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadTypes() {
    try {
      const data = await activityService.getTypes();
      setTypes(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function loadCurrentLocation() {
    try {
      setLoadingLocation(true);

      const allowed = await requestLocationPermission();

      if (!allowed) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à localização para definir o ponto de encontro.',
        );
        setLoadingLocation(false);
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          setLoadingLocation(false);
        },
        error => {
          console.log(error);
          Alert.alert(
            'Localização',
            'Não foi possível obter sua localização atual.',
          );
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (error) {
      console.log(error);
      Alert.alert('Localização', 'Erro ao solicitar localização.');
      setLoadingLocation(false);
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
    if (loading) return;

    if (!title || !description || !selectedType) {
      Alert.alert('Nova atividade', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Nova atividade', 'Selecione uma imagem para a atividade.');
      return;
    }

    if (!location) {
      Alert.alert(
        'Nova atividade',
        'Não foi possível definir o ponto de encontro.',
      );
      return;
    }

    try {
      setLoading(true);

      await activityService.createActivity({
        title,
        description,
        typeId: selectedType,
        address: JSON.stringify(location),
        scheduledDate: date.toISOString(),
        isPrivate,
        image: selectedImage,
      });

      Alert.alert('Nova atividade', 'Atividade criada com sucesso.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.log(error.response?.data ?? error);

      Alert.alert(
        'Erro ao criar atividade',
        error.response?.data?.error ?? 'Não foi possível criar a atividade.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTypes();
    loadCurrentLocation();
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
        CADASTRAR ATIVIDADE
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
        {selectedImage ? (
          <Image
            source={{ uri: selectedImage.uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <>
            <Camera size={28} color="#1D1D1D" weight="regular" />
            <Text style={{ marginTop: 8, fontSize: 12, color: '#6B6B6B' }}>
              Selecionar imagem
            </Text>
          </>
        )}
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
        <Text style={{ color: '#1D1D1D' }}>
          {date.toLocaleString('pt-BR')}
        </Text>
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
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loadingLocation ? (
          <ActivityIndicator color="#12C77A" />
        ) : location ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ width: '100%', height: '100%' }}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            onPress={event => {
              setLocation(event.nativeEvent.coordinate);
            }}
          >
            <Marker coordinate={location} title="Ponto de encontro" />
          </MapView>
        ) : (
          <>
            <MapPin size={28} color="#12C77A" weight="fill" />
            <Text style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>
              Localização não disponível
            </Text>
          </>
        )}
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
          title={loading ? 'Salvando...' : 'Salvar'}
          onPress={handleSave}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}