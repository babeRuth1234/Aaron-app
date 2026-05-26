import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SetupScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome aboard!</Text>
        <Text style={styles.subtitle}>Are you setting up a new room, or joining your roommates?</Text>

        <TouchableOpacity 
          style={[styles.card, styles.primaryCard]}
          onPress={() => router.push('/create-room')}
        >
          <View style={[styles.iconBg, { backgroundColor: '#CCFF00' }]}>
            <Ionicons name="add-circle" size={32} color="#000000" />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: '#FFFFFF' }]}>Create a Room</Text>
            <Text style={[styles.cardDesc, { color: '#AAAAAA' }]}>I'm the room admin setting up the chores.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/join-room')}
        >
          <View style={[styles.iconBg, { backgroundColor: '#F4F4F4' }]}>
            <Ionicons name="qr-code" size={32} color="#000000" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Join a Room</Text>
            <Text style={styles.cardDesc}>Scan the room's QR code to join your mates.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#000000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 40,
    lineHeight: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  primaryCard: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
  },
});
