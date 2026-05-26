import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../api/client';
import { AppContext } from '../context/AppContext';
import QRCode from 'react-native-qrcode-svg';

export default function CreateRoomScreen() {
  const { user, setRoomId, setRole } = useContext(AppContext);
  const [roomName, setRoomName] = useState('');
  const [step, setStep] = useState(1); // 1 = form, 2 = QR code
  const [createdRoomId, setCreatedRoomId] = useState('');

  const handleCreateRoom = async () => {
    try {
      const res = await apiClient.post('/rooms/create', { name: roomName, adminId: user?.id });
      const newRoomId = res.data.room._id;
      setCreatedRoomId(newRoomId);
      setRoomId(newRoomId);
      setRole('admin');
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Failed to create room. Make sure backend is running.');
    }
  };

  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Room Created!</Text>
          <Text style={styles.subtitle}>Have your roommates scan this code to join.</Text>
          
          <View style={styles.qrContainer}>
            <QRCode 
              value={createdRoomId} 
              size={200} 
              color="#1a1a1a" 
              backgroundColor="transparent" 
            />
            <Text style={styles.qrText}>Room ID: {createdRoomId.slice(-6).toUpperCase()}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => router.replace('/dashboard')}>
            <Text style={styles.buttonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Create a Room</Text>
        <Text style={styles.subtitle}>Give your shared space a name.</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Room Name or Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Room 304 B block"
            value={roomName}
            onChangeText={setRoomName}
          />

          <TouchableOpacity 
            style={[styles.button, !roomName && styles.buttonDisabled]} 
            onPress={handleCreateRoom}
            disabled={!roomName}
          >
            <Text style={styles.buttonText}>Generate QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#00a261',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a7f3d0',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
    borderRadius: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qrText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 2,
  }
});
