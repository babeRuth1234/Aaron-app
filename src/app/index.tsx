import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
  const [streak, setStreak] = useState(12);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, Aaron!</Text>
            <Text style={styles.roomName}>Room 304 B Block</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color="#ffb800" />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>

        {/* Progress Ring / Stats Section - Brilliant Style */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Today's Goal</Text>
            <Text style={styles.statsSubtitle}>2 of 3 chores done</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '66%' }]} />
            </View>
          </View>
        </View>

        {/* Chores List */}
        <Text style={styles.sectionTitle}>My Chores</Text>
        
        <View style={styles.choreCard}>
          <View style={styles.choreIconBg}>
            <Ionicons name="trash-outline" size={24} color="#3b82f6" />
          </View>
          <View style={styles.choreInfo}>
            <Text style={styles.choreTitle}>Empty Trash</Text>
            <Text style={styles.choreTime}>Due by 8 PM</Text>
          </View>
          <TouchableOpacity style={styles.completeButton}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#00a261" />
          </TouchableOpacity>
        </View>

        <View style={[styles.choreCard, styles.choreCardCompleted]}>
          <View style={[styles.choreIconBg, { backgroundColor: '#e2f5ec' }]}>
            <Ionicons name="water-outline" size={24} color="#00a261" />
          </View>
          <View style={styles.choreInfo}>
            <Text style={[styles.choreTitle, styles.choreTitleCompleted]}>Clean Sink</Text>
            <Text style={styles.choreTimeCompleted}>Completed</Text>
          </View>
          <Ionicons name="checkmark-circle" size={28} color="#00a261" />
        </View>

        {/* Bounty Board */}
        <Text style={[styles.sectionTitle, { marginTop: 24, color: '#ff6b6b' }]}>🔥 Bounty Board</Text>
        <Text style={styles.bountyDesc}>Grab these overdue chores for 1.5x points!</Text>
        
        <View style={styles.bountyCard}>
          <View style={[styles.choreIconBg, { backgroundColor: '#ffe3e3' }]}>
            <Ionicons name="alert-circle-outline" size={24} color="#ff6b6b" />
          </View>
          <View style={styles.choreInfo}>
            <Text style={styles.choreTitle}>Sweep Floor</Text>
            <Text style={styles.bountyPoints}>+15 pts (was Tunde's)</Text>
          </View>
          <TouchableOpacity style={styles.claimButton}>
            <Text style={styles.claimButtonText}>Claim</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  roomName: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0cc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#cc9300',
    marginLeft: 4,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statsHeader: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00a261',
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  choreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  choreCardCompleted: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  choreIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  choreInfo: {
    flex: 1,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  choreTitleCompleted: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  choreTime: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  choreTimeCompleted: {
    fontSize: 14,
    color: '#00a261',
    marginTop: 4,
    fontWeight: '500',
  },
  completeButton: {
    padding: 8,
  },
  bountyDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    marginTop: -8,
  },
  bountyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffe3e3',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  bountyPoints: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
    marginTop: 4,
  },
  claimButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  claimButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
