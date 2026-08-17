import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Camera, CaretLeft, NotePencil } from 'phosphor-react-native';

import { RootStackParamList } from '../../navigation/AppRoutes';
import { userService } from '../../services/userService';
import { activityService } from '../../services/activityService';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authStorage } from '../../storage/authStorage';
import { ActivityType } from '../../types/activity';
import { requestGalleryPermission } from '../../utils/permissions';
import { fonts } from '../../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

type PreferenceWithImage = {
  typeId: string;
  typeName: string;
  typeDescription: string;
  image?: string;
};

export function EditProfile({ navigation }: Props) {
  const [avatar, setAvatar] = useState('');
  const [originalAvatar, setOriginalAvatar] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');

  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [preferences, setPreferences] = useState<PreferenceWithImage[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadUser() {
    try {
      const user = await userService.getUser();
      const allTypes: ActivityType[] = await activityService.getTypes();
      const preferencesData = await userService.getPreferences();

      const preferencesWithImages = preferencesData.map((preference: any) => {
        const type = allTypes.find(item => item.id === preference.typeId);

        return {
          ...preference,
          image: type?.image,
        };
      });

      setAvatar(user.avatar);
      setOriginalAvatar(user.avatar);
      setName(user.name);
      setOriginalName(user.name);
      setCpf(user.cpf);
      setEmail(user.email);
      setOriginalEmail(user.email);
      setPreferences(preferencesWithImages);
    } catch (error) {
      console.log(error);
    }
  }

  async function handlePickAvatar() {
    const allowed = await requestGalleryPermission();

    if (!allowed) {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso à galeria para alterar sua foto.',
      );
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    const image = result.assets?.[0];

    if (!image?.uri) return;

    setAvatar(image.uri);
  }

  async function handleSave() {
    const emailRegex = /\S+@\S+\.\S+/;

    if (!name || !email) {
      Alert.alert('Perfil', 'Preencha nome e e-mail.');
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert('Perfil', 'Informe um e-mail válido.');
      return;
    }

    if (password && password.length < 6) {
      Alert.alert('Perfil', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const dataToUpdate: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    if (name !== originalName) {
      dataToUpdate.name = name;
    }

    if (email !== originalEmail) {
      dataToUpdate.email = email;
    }

    if (password) {
      dataToUpdate.password = password;
    }

    const hasAvatarChanged = avatar && avatar !== originalAvatar;
    const hasDataChanged = Object.keys(dataToUpdate).length > 0;

    if (!hasAvatarChanged && !hasDataChanged) {
      Alert.alert('Perfil', 'Nenhuma alteração foi feita.');
      return;
    }

    try {
      setLoading(true);

      if (hasAvatarChanged) {
        await userService.updateAvatar(avatar);
      }

      if (hasDataChanged) {
        await userService.updateUser(dataToUpdate);
      }

      Alert.alert('Perfil', 'Dados atualizados com sucesso.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.log(error.response?.data ?? error);

      Alert.alert(
        'Perfil',
        error.response?.data?.error ?? 'Não foi possível atualizar o perfil.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivateAccount() {
    Alert.alert(
      'Desativar conta',
      'Tem certeza que deseja desativar sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              await userService.deactivateUser();
              await authStorage.clearAuth();

              Alert.alert('Conta', 'Conta desativada com sucesso.', [
                {
                  text: 'OK',
                  onPress: () =>
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    }),
                },
              ]);
            } catch (error: any) {
              console.log(error.response?.data ?? error);

              Alert.alert(
                'Conta',
                error.response?.data?.error ??
                  'Não foi possível desativar a conta.',
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  }

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, []),
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FFF' }}
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
        <CaretLeft size={28} weight="bold" color="#1D1D1D" />
      </TouchableOpacity>

      <Text
        style={{
          textAlign: 'center',
          fontSize: 24,
          fontFamily: fonts.title,
          color: '#1D1D1D',
          marginBottom: 24,
        }}
      >
        ATUALIZAR PERFIL
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePickAvatar}
        disabled={loading}
        style={{
          alignSelf: 'center',
          marginBottom: 24,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <View>
          <Image
            source={{ uri: avatar }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#DDD',
            }}
          />

          <View
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#12C77A',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#FFF',
            }}
          >
            <Camera size={17} color="#FFF" weight="bold" />
          </View>
        </View>
      </TouchableOpacity>

      <Input
        label="Nome Completo"
        value={name}
        onChangeText={setName}
        placeholder="Ex.: João Pessoa"
      />

      <Input
        label="CPF"
        value={cpf}
        editable={false}
        placeholder="Ex.: 111.111.111-12"
      />

      <Input
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Ex.: nome@email.com"
      />

      <Input
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Digite apenas se quiser alterar"
      />

      <View style={{ marginTop: 10, marginBottom: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontFamily: fonts.title,
              color: '#1D1D1D',
            }}
          >
            PREFERÊNCIAS
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Preferences', {
                fromProfile: true,
              })
            }
            style={{ marginLeft: 10 }}
          >
            <NotePencil size={22} color="#1D1D1D" weight="regular" />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}
        >
          {preferences.length > 0 ? (
            preferences.map(preference => (
              <View
                key={preference.typeId}
                style={{
                  width: 72,
                  alignItems: 'center',
                  marginRight: 14,
                  marginBottom: 16,
                }}
              >
                <Image
                  source={{ uri: preference.image }}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    backgroundColor: '#DDD',
                  }}
                />

                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    textAlign: 'center',
                    color: '#1D1D1D',
                  }}
                  numberOfLines={1}
                >
                  {preference.typeName}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#777' }}>
              Nenhuma preferência selecionada.
            </Text>
          )}
        </View>
      </View>

      <View style={{ marginTop: 10 }}>
        <Button
          title={loading ? 'Salvando...' : 'Salvar'}
          onPress={handleSave}
          disabled={loading}
        />
      </View>

      <TouchableOpacity
        onPress={handleDeactivateAccount}
        disabled={loading}
        style={{
          marginTop: 14,
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
          Desativar Conta
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}