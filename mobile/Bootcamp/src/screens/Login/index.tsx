import React, { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { RootStackParamList } from '../../navigation/AppRoutes';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { authService } from '../../services/authService';
import { authStorage } from '../../storage/authStorage';
import { ApiErrorResponse } from '../../types/auth';
import { userService } from '../../services/userService';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function Login({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Login', 'Preencha e-mail e senha.');
      return;
    }

    try {
      setLoading(true);

      const authData = await authService.signIn({
        email,
        password,
      });

      await authStorage.saveAuth(authData);

      const preferences = await userService.getPreferences();

      if (preferences.length === 0) {
        navigation.replace('Preferences');
        return;
      }

      navigation.replace('Home');
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;

      Alert.alert(
        'Erro ao entrar',
        err.response?.data?.error ?? 'Não foi possível realizar login.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 32,
        justifyContent: 'center',
      }}
    >
      <View style={{ alignItems: 'center', marginBottom: 50 }}>
        <Image
          source={require('../../assets/logo.png')}
          style={{
            width: 120,
            height: 40,
            resizeMode: 'contain',
          }}
        />
      </View>

      <Text
        style={{
          fontSize: 22,
          color: colors.text,
          marginBottom: 10,
          fontFamily: fonts.title,
        }}
      >
        FAÇA LOGIN E COMECE A TREINAR
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: '#8D8D8D',
          marginBottom: 34,
          lineHeight: 20,
        }}
      >
        Encontre parceiros para treinar ao ar livre. Conecte-se e comece agora!
        💪
      </Text>

      <Input
        label="E-mail"
        placeholder="Ex.: nome@email.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        label="Senha"
        placeholder="Ex.: nome123"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={{ marginTop: 18 }}>
        <Button
          title={loading ? 'Entrando...' : 'Entrar'}
          onPress={handleLogin}
          disabled={loading}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Register')}
        style={{ marginTop: 24, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 12, color: colors.muted }}>
          Ainda não tem uma conta?{' '}
          <Text style={{ color: colors.text, fontWeight: '700' }}>
            Cadastre-se
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}