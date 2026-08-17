import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Login } from '../screens/Login';
import { Register } from '../screens/Register';
import { Home } from '../screens/Home';
import { CreateActivity } from '../screens/CreateActivity';
import { Activity } from '../types/activity';
import { ActivityDetails } from '../screens/ActivityDetails';
import { Profile } from '../screens/Profile';
import { EditProfile } from '../screens/EditProfile';
import { Preferences } from '../screens/Preferences';
import { EditActivity } from '../screens/EditActivity';
import { Activities } from '../screens/Activities';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateActivity: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Preferences: {
    fromProfile?: boolean;
  } | undefined;

  ActivityDetails: {
    activity: Activity;
  };

  EditActivity: {
    activity: Activity;
  };

  Activities: {
    initialTypeId?: string;
  } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppRoutes() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="CreateActivity" component={CreateActivity} />
      <Stack.Screen name="ActivityDetails" component={ActivityDetails} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Preferences" component={Preferences} />
      <Stack.Screen name="EditActivity" component={EditActivity} />
      <Stack.Screen name="Activities" component={Activities} />
    </Stack.Navigator>
  );
}