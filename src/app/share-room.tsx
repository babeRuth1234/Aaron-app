import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import QRCode from 'react-native-qrcode-svg';

export default function ShareRoomScreen() {
  const { roomId } = useContext(AppContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={32} color="#000000" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Invite Roommates</Text>
        <Text style={styles.subtitle}>Have your roommates scan this code from their 'Join Room' screen.</Text>
        
        <View style={styles.qrContainer}>
          {roomId ? (
            <QRCode 
              value={roomId} 
              size={250} 
              color="#000000" 
              backgroundColor="transparent" 
            />
          ) : (
            <Text>Loading QR...</Text>
          )}
          <Text style={styles.qrText}>Room ID: {roomId ? roomId.slice(-6).toUpperCase() : ''}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  header: { paddingHorizontal: 20, paddingTop: 10, alignItems: 'flex-end' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '900', color: '#000000', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#888888', marginBottom: 40, textAlign: 'center' },
  qrContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', padding: 40, borderRadius: 24, marginBottom: 40, borderWidth: 1, borderColor: '#EAEAEA' },
  qrText: { marginTop: 24, fontSize: 18, fontWeight: '800', color: '#000000', letterSpacing: 2 },
  button: { backgroundColor: '#CCFF00', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '800' }
});
