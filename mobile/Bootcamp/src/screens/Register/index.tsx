import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import { CaretLeft } from 'phosphor-react-native';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { RootStackParamList } from '../../navigation/AppRoutes';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { authService } from '../../services/authService';
import { ApiErrorResponse } from '../../types/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function Register({ navigation }: Props) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !cpf || !email || !password) {
      Alert.alert('Cadastro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Cadastro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);

      await authService.register({
        name,
        cpf,
        email,
        password,
      });

      Alert.alert('Cadastro', 'Usuário criado com sucesso.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;

      Alert.alert(
        'Erro ao cadastrar',
        err.response?.data?.error ?? 'Não foi possível criar sua conta.',
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
        paddingTop: 78,
      }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <CaretLeft size={28} weight="bold" color={colors.text} />
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 24,
          lineHeight: 28,
          fontFamily: fonts.title,
          color: colors.text,
          marginTop: 42,
          marginBottom: 10,
        }}
      >
        CRIE SUA CONTA
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: '#8D8D8D',
          lineHeight: 20,
          marginBottom: 34,
        }}
      >
        Por favor preencha os dados para prosseguir!
      </Text>

      <Input
        label="Nome Completo"
        placeholder="Ex.: João Pessoa"
        value={name}
        onChangeText={setName}
      />

      <Input
        label="CPF"
        placeholder="Ex.: 111.111.111-12"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
      />

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

      <View style={{ marginTop: 46 }}>
        <Button
          title={loading ? 'Cadastrando...' : 'Cadastrar'}
          onPress={handleRegister}
          disabled={loading}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Login')}
        style={{ marginTop: 20, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 12, color: colors.muted }}>
          Já possui uma conta?{' '}
          <Text style={{ color: colors.text, fontWeight: '700' }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}