import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useContext, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../api/client';
import { AppContext } from '../context/AppContext';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export default function LoginScreen() {
  const { user, setUser, roomId, setRoomId, setRole, isReady } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      if (!user.avatar_url) {
        router.replace('/avatar-picker');
      } else if (roomId) {
        router.replace('/dashboard');
      } else {
        router.replace('/setup');
      }
    }
  }, [isReady, user, roomId]);

  const handleAuth = async () => {
    if (!email || !password) return alert('Please enter email and password');
    if (!isLogin && !name) return alert('Please enter your name');

    setLoading(true);
    try {
      // 1. Get Push Token
      let pushToken = '';
      if (Device.isDevice) {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
        
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus === 'granted') {
          try {
            pushToken = (await Notifications.getExpoPushTokenAsync({
              projectId: 'ba542f3b-d39c-410f-83a5-10a1d36b925a',
            })).data;
          } catch (e) {
            console.log('Failed to get push token:', e);
          }
        }
      }

      // 2. Auth Request
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await apiClient.post(endpoint, { name, email, password, pushToken });
      setUser(res.data.user);
      
      // Auto-route based on room persistence
      if (res.data.roomId) {
        setRoomId(res.data.roomId);
        setRole(res.data.role);
      }
      
      // Route to avatar picker if they don't have one
      if (!res.data.user.avatar_url) {
        router.replace('/avatar-picker');
      } else {
        if (res.data.roomId) {
          router.replace('/dashboard');
        } else {
          router.replace('/setup');
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Authentication failed. Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {/* <Image source={require('./hostel-chores-frontend/assets/images/app_icon_a_clean.png')} style={{ width: 120, height: 120, borderRadius: 24, marginBottom: 16 }} /> */}
          {/* <Text style={styles.title}>AAron</Text> */}
          <Text style={styles.subtitle}>Automated Allocation of Roommates' Obligations Network.</Text>
        </View>

        <View style={styles.formContainer}>
          {!isLogin && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Tunde O."
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </>
          )}

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            {loading ? <ActivityIndicator color="#000000" /> : <Text style={styles.buttonText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: '#000000', fontWeight: '800' }}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 32, fontWeight: '900', color: '#000000', marginTop: 16 },
  subtitle: { fontSize: 16, color: '#888888', marginTop: 8, textAlign: 'center' },
  formContainer: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#000000', marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 20, padding: 16, fontSize: 16, marginBottom: 20, color: '#000000' },
  button: { backgroundColor: '#CCFF00', paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '800' },
});
