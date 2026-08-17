import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  ArrowLeft,
  CalendarBlank,
  Heart,
  NotePencil,
  UsersThree,
  XCircle,
} from 'phosphor-react-native';

import { RootStackParamList } from '../../navigation/AppRoutes';
import { activityService } from '../../services/activityService';
import { userService } from '../../services/userService';
import { Activity, Participant } from '../../types/activity';
import { User } from '../../types/user';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'ActivityDetails'>;

function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-BR');
}

function translateStatus(status: string) {
  switch (status) {
    case 'WAITING':
      return 'Aguardando aprovação';
    case 'APPROVED':
      return 'Aprovado';
    case 'REJECTED':
    case 'DENIED':
      return 'Negado';
    default:
      return status;
  }
}

function translateVisibility(isPrivate: boolean) {
  return isPrivate ? 'Privado' : 'Público';
}

function isSameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function isBeforeActivityDay(activityDate: Date) {
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activityDay = new Date(
    activityDate.getFullYear(),
    activityDate.getMonth(),
    activityDate.getDate(),
  );

  return today < activityDay;
}

function canShowFinishButton(activityDate: Date) {
  const now = new Date();
  const thirtyMinutesAfterStart = new Date(
    activityDate.getTime() + 30 * 60 * 1000,
  );

  return now >= thirtyMinutesAfterStart;
}

export function ActivityDetails({ route, navigation }: Props) {
  const { activity } = route.params;

  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    activity.userSubscriptionStatus,
  );

  const activityDate = new Date(currentActivity.scheduledDate);
  const today = new Date();

  const isOwner = user?.id === currentActivity.creator.id;
  const isSubscribed = !!subscriptionStatus;
  const isWaiting = subscriptionStatus === 'WAITING';
  const isDenied =
    subscriptionStatus === 'DENIED' || subscriptionStatus === 'REJECTED';
  const isApproved = subscriptionStatus === 'APPROVED';
  const isActivityDay = isSameDay(today, activityDate);
  const isBeforeDay = isBeforeActivityDay(activityDate);
  const isFinished = !!currentActivity.completedAt;

  const canManageParticipants = isOwner && isBeforeDay && !isFinished;
  const canFinishActivity =
    isOwner && !isFinished && canShowFinishButton(activityDate);

  const currentParticipant = participants.find(
    participant => participant.userId === user?.id,
  );

  const hasCheckedIn = !!currentParticipant?.confirmedAt;

  const latitude = currentActivity.address.latitude;
  const longitude = currentActivity.address.longitude;

  const participantsWithoutOwner = participants.filter(
    participant => participant.userId !== currentActivity.creator.id,
  );

  async function loadUser() {
    try {
      const data = await userService.getUser();
      setUser(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function loadParticipants() {
    try {
      const data = await activityService.getParticipants(currentActivity.id);
      setParticipants(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingParticipants(false);
    }
  }

  async function handleCheckIn() {
    if (!confirmationCode) {
      Alert.alert('Check-in', 'Informe o código de confirmação.');
      return;
    }

    try {
      setActionLoading(true);

      await activityService.checkInActivity(
        currentActivity.id,
        confirmationCode,
      );

      Alert.alert('Check-in', 'Participação confirmada com sucesso.');
      setConfirmationCode('');
      await loadParticipants();
    } catch (error: any) {
      console.log(error.response?.data ?? error);

      Alert.alert(
        'Check-in',
        error.response?.data?.error ?? 'Não foi possível confirmar presença.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApproveParticipant(
    participantId: string,
    approved: boolean,
  ) {
    if (!canManageParticipants) {
      Alert.alert(
        'Participante',
        'Não é possível aprovar ou negar participantes no dia da atividade.',
      );
      return;
    }

    try {
      setActionLoading(true);

      await activityService.approveParticipant(
        currentActivity.id,
        participantId,
        approved,
      );

      await loadParticipants();

      Alert.alert(
        'Participante',
        approved
          ? 'Participante aprovado com sucesso.'
          : 'Participante negado com sucesso.',
      );
    } catch (error: any) {
      console.log(error.response?.data ?? error);

      Alert.alert(
        'Participante',
        error.response?.data?.error ??
          'Não foi possível atualizar a solicitação.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConcludeActivity() {
    if (!canFinishActivity) {
      Alert.alert(
        'Atividade',
        'A atividade só pode ser finalizada 30 minutos após o início.',
      );
      return;
    }

    try {
      setActionLoading(true);

      await activityService.concludeActivity(currentActivity.id);

      Alert.alert('Atividade', 'Atividade finalizada com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert('Atividade', 'Não foi possível finalizar a atividade.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubscribe() {
    if (!isBeforeDay || isFinished) {
      Alert.alert(
        'Atividade',
        'Não é possível participar desta atividade neste momento.',
      );
      return;
    }

    try {
      setActionLoading(true);

      const response = await activityService.subscribeActivity(
        currentActivity.id,
      );

      setSubscriptionStatus(response.subscriptionStatus);
      await loadParticipants();

      Alert.alert('Atividade', 'Solicitação realizada com sucesso.');
    } catch (error: any) {
      console.log(error.response?.data ?? error);

      Alert.alert(
        'Atividade',
        error.response?.data?.error ?? 'Não foi possível participar.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnsubscribe() {
    if (!isBeforeDay || isFinished) {
      Alert.alert(
        'Atividade',
        'Não é possível sair desta atividade neste momento.',
      );
      return;
    }

    try {
      setActionLoading(true);

      await activityService.unsubscribeActivity(currentActivity.id);

      setSubscriptionStatus(null);
      await loadParticipants();

      Alert.alert('Atividade', 'Participação cancelada com sucesso.');
    } catch (error: any) {
      console.log(error.response?.data ?? error);

      Alert.alert(
        'Atividade',
        error.response?.data?.error ?? 'Não foi possível sair da atividade.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    loadParticipants();
  }, []);

  useEffect(() => {
    setCurrentActivity(activity);
    setSubscriptionStatus(activity.userSubscriptionStatus);
  }, [activity]);

  function getParticipantButtonTitle() {
    if (actionLoading) return 'Aguarde...';
    if (isDenied) return 'Inscrição negada';
    if (isWaiting) return 'Aguardando aprovação';
    if (isApproved) return 'Sair';
    return 'Participar';
  }

  function getParticipantButtonColor() {
    if (isDenied) return '#FF0000';
    if (isWaiting) return '#D9D9D9';
    return '#12C77A';
  }

  function getParticipantButtonAction() {
    if (isSubscribed) return handleUnsubscribe;
    return handleSubscribe;
  }

  const shouldShowParticipantButton =
    !isOwner && !hasCheckedIn && !isActivityDay && isBeforeDay && !isFinished;

  const shouldShowCheckIn =
    !isOwner && isApproved && !hasCheckedIn && isActivityDay && !isFinished;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: '#FFF' }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: 'absolute',
          top: 45,
          left: 20,
          zIndex: 999,
        }}
      >
        <ArrowLeft size={24} color="#1D1D1D" weight="bold" />
      </TouchableOpacity>

      {isOwner && isBeforeDay && !isFinished && (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('EditActivity', {
              activity: currentActivity,
            })
          }
          style={{
            position: 'absolute',
            top: 45,
            right: 20,
            zIndex: 999,
          }}
        >
          <NotePencil size={24} color="#1D1D1D" weight="regular" />
        </TouchableOpacity>
      )}

      <Image
        source={{ uri: currentActivity.image }}
        style={{ width: '100%', height: 240 }}
      />

      <View
        style={{
          marginTop: -20,
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          paddingHorizontal: 20,
          paddingTop: 18,
        }}
      >
        <View
          style={{
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFF',
            minHeight: 36,
            borderRadius: 4,
            paddingHorizontal: 14,
            marginTop: -36,
            marginBottom: 24,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
            }}
          >
            <CalendarBlank size={13} color="#12C77A" />
            <Text style={{ fontSize: 10, color: '#777', marginLeft: 4 }}>
              {isFinished
                ? 'Atividade Finalizada'
                : formatDate(currentActivity.scheduledDate)}
            </Text>
          </View>

          <Text style={{ fontSize: 10, color: '#777', marginRight: 16 }}>
            {translateVisibility(currentActivity.private)}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <UsersThree size={14} color="#12C77A" weight="bold" />
            <Text style={{ fontSize: 10, color: '#777', marginLeft: 4 }}>
              {currentActivity.participantCount}
            </Text>
          </View>
        </View>

        {shouldShowCheckIn && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
              Código de Confirmação
            </Text>

            <TextInput
              value={confirmationCode}
              onChangeText={setConfirmationCode}
              placeholder=""
              placeholderTextColor="#999"
              autoCapitalize="characters"
              style={{
                height: 46,
                borderWidth: 1,
                borderColor: '#E5E5E5',
                borderRadius: 4,
                paddingHorizontal: 12,
                marginBottom: 12,
                color: '#1D1D1D',
              }}
            />

            <TouchableOpacity
              disabled={actionLoading}
              onPress={handleCheckIn}
              style={{
                backgroundColor: '#12C77A',
                height: 46,
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: actionLoading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>
                {actionLoading ? 'Confirmando...' : 'Confirmar Presença'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isOwner &&
          isActivityDay &&
          !isFinished &&
          currentActivity.confirmationCode && (
            <View
              style={{
                backgroundColor: '#F1F1F1',
                padding: 14,
                borderRadius: 8,
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 12, color: '#777' }}>
                Código de Confirmação
              </Text>

              <Text style={{ fontSize: 14, fontWeight: '700', marginTop: 6 }}>
                {currentActivity.confirmationCode}
              </Text>
            </View>
          )}

        <Text
          style={{
            fontSize: 18,
            fontFamily: fonts.title,
            color: '#1D1D1D',
            marginBottom: 12,
          }}
        >
          {currentActivity.title.toUpperCase()}
        </Text>

        <Text style={{ color: '#777', marginBottom: 26, fontSize: 12 }}>
          {currentActivity.description}
        </Text>

        <Text
          style={{
            fontSize: 18,
            fontFamily: fonts.title,
            color: '#1D1D1D',
            marginBottom: 12,
          }}
        >
          PONTO DE ENCONTRO
        </Text>

        <View
          style={{
            height: 190,
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 26,
          }}
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude,
                longitude,
              }}
              title={currentActivity.title}
              description="Ponto de encontro"
            />
          </MapView>
        </View>

        <Text
          style={{
            fontSize: 18,
            fontFamily: fonts.title,
            color: '#1D1D1D',
            marginBottom: 14,
          }}
        >
          PARTICIPANTES
        </Text>

        {loadingParticipants ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Image
                source={{ uri: currentActivity.creator.avatar }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: '#DDD',
                  marginRight: 10,
                }}
              />

              <View>
                <Text
                  style={{
                    fontWeight: '800',
                    fontSize: 12,
                    color: '#1D1D1D',
                  }}
                >
                  {currentActivity.creator.name}
                </Text>

                <Text style={{ fontSize: 11, color: '#777' }}>
                  Organizador
                </Text>
              </View>
            </View>

            {participantsWithoutOwner.length === 0 ? (
              <Text style={{ color: '#777', marginBottom: 12 }}>
                Nenhum participante ainda.
              </Text>
            ) : (
              participantsWithoutOwner.map(participant => (
                <View
                  key={participant.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <Image
                      source={{ uri: participant.avatar }}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: '#DDD',
                        marginRight: 10,
                      }}
                    />

                    <View>
                      <Text
                        style={{
                          fontWeight: '800',
                          fontSize: 12,
                          color: '#1D1D1D',
                        }}
                      >
                        {participant.name}
                      </Text>

                      <Text style={{ fontSize: 11, color: '#777' }}>
                        {translateStatus(participant.subscriptionStatus)}
                      </Text>
                    </View>
                  </View>

                  {canManageParticipants &&
                    participant.subscriptionStatus === 'WAITING' && (
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                          disabled={actionLoading}
                          onPress={() =>
                            handleApproveParticipant(participant.id, false)
                          }
                          style={{
                            marginRight: 16,
                            opacity: actionLoading ? 0.6 : 1,
                          }}
                        >
                          <XCircle size={24} color="#12C77A" weight="fill" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          disabled={actionLoading}
                          onPress={() =>
                            handleApproveParticipant(participant.id, true)
                          }
                          style={{
                            opacity: actionLoading ? 0.6 : 1,
                          }}
                        >
                          <Heart size={24} color="#12C77A" weight="fill" />
                        </TouchableOpacity>
                      </View>
                    )}
                </View>
              ))
            )}
          </>
        )}

        {!isOwner && hasCheckedIn && !isFinished && (
          <Text
            style={{
              marginTop: 20,
              color: '#12C77A',
              fontWeight: '700',
              textAlign: 'center',
            }}
          >
            Presença confirmada
          </Text>
        )}

        {canFinishActivity ? (
          <TouchableOpacity
            disabled={actionLoading}
            onPress={handleConcludeActivity}
            style={{
              marginTop: 20,
              backgroundColor: '#12C77A',
              height: 48,
              borderRadius: 4,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: actionLoading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>
              {actionLoading ? 'Aguarde...' : 'Finalizar Atividade'}
            </Text>
          </TouchableOpacity>
        ) : shouldShowParticipantButton ? (
          <TouchableOpacity
            disabled={actionLoading || isDenied || isWaiting}
            onPress={getParticipantButtonAction()}
            style={{
              marginTop: 20,
              backgroundColor: getParticipantButtonColor(),
              height: 48,
              borderRadius: 4,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: actionLoading || isDenied || isWaiting ? 0.6 : 1,
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>
              {getParticipantButtonTitle()}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}