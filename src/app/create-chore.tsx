import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../api/client';
import { AppContext } from '../context/AppContext';

export default function CreateChoreScreen() {
  const { roomId } = useContext(AppContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('10');
  const [cadence, setCadence] = useState('daily'); 
  const [assignmentType, setAssignmentType] = useState('rotational'); 
  const [rotationTrigger, setRotationTrigger] = useState('occurrence');
  const [requiresPhotoProof, setRequiresPhotoProof] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Data State
  const [roommates, setRoommates] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoommates = async () => {
      if (!roomId) return;
      try {
        const membersRes = await apiClient.get(`/rooms/${roomId}/members`);
        setRoommates(membersRes.data.members);
      } catch (err) {
        console.error("Ensure you are connected to the internet ", err);
      }
    };
    fetchRoommates();
  }, []);

  const toggleUserSelection = (id: string) => {
    if (assignmentType === 'fixed') {
      setSelectedUsers([id]); // Only one user for fixed
    } else {
      // Toggle for rotational
      if (selectedUsers.includes(id)) {
        setSelectedUsers(selectedUsers.filter(u => u !== id));
      } else {
        setSelectedUsers([...selectedUsers, id]);
      }
    }
  };

  const handleCreateChore = async () => {
    if (!title || selectedUsers.length === 0) {
      alert("Please enter a title and select at least one roommate.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const payload = {
        roomId,
        title,
        points: parseInt(points, 10),
        cadenceType: cadence,
        assignmentType,
        rotationTrigger: assignmentType === 'rotational' ? rotationTrigger : 'none',
        assignedUsers: selectedUsers,
        requiresPhotoProof
      };
      
      await apiClient.post('/chores/create', payload);
      
      alert('Chore created successfully!');
      router.back();
    } catch (err) {
      console.error(err);
      alert('Failed to create chore. Check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Chore</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.label}>Chore Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Take out the trash"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Points (Gamification)</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          keyboardType="numeric"
          value={points}
          onChangeText={setPoints}
        />

        <Text style={styles.sectionHeader}>Frequency</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity style={[styles.segment, cadence === 'daily' && styles.segmentActive]} onPress={() => setCadence('daily')}>
            <Text style={[styles.segmentText, cadence === 'daily' && styles.segmentTextActive]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segment, cadence === 'weekly' && styles.segmentActive]} onPress={() => setCadence('weekly')}>
            <Text style={[styles.segmentText, cadence === 'weekly' && styles.segmentTextActive]}>Weekly</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>Assignment Logic</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity 
            style={[styles.segment, assignmentType === 'fixed' && styles.segmentActive]}
            onPress={() => {
              setAssignmentType('fixed');
              setSelectedUsers([]); // reset selection
            }}
          >
            <Text style={[styles.segmentText, assignmentType === 'fixed' && styles.segmentTextActive]}>Fixed User</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segment, assignmentType === 'rotational' && styles.segmentActive]}
            onPress={() => setAssignmentType('rotational')}
          >
            <Text style={[styles.segmentText, assignmentType === 'rotational' && styles.segmentTextActive]}>Rotational</Text>
          </TouchableOpacity>
        </View>

        {assignmentType === 'rotational' && (
          <View style={styles.subSection}>
            <Text style={styles.label}>Rotation Trigger</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity style={[styles.segment, rotationTrigger === 'occurrence' && styles.segmentActive]} onPress={() => setRotationTrigger('occurrence')}>
                <Text style={[styles.segmentText, rotationTrigger === 'occurrence' && styles.segmentTextActive]}>Every Occurrence</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.segment, rotationTrigger === 'cadence_cycle' && styles.segmentActive]} onPress={() => setRotationTrigger('cadence_cycle')}>
                <Text style={[styles.segmentText, rotationTrigger === 'cadence_cycle' && styles.segmentTextActive]}>Weekly Cycle</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Roommate Selection */}
        <Text style={styles.sectionHeader}>{assignmentType === 'fixed' ? 'Assign To' : 'Select Rotation Pool'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {roommates.map((user: any) => {
            const isSelected = selectedUsers.includes(user.id);
            return (
              <TouchableOpacity 
                key={user.id} 
                style={[styles.avatarContainer, isSelected && styles.avatarContainerSelected]}
                onPress={() => toggleUserSelection(user.id)}
              >
                <Image source={{ uri: user.avatar_url || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                <Text style={styles.avatarName} numberOfLines={1}>{user.name.split(' ')[0]}</Text>
                {isSelected && (
                  <View style={styles.checkmarkBadge}>
                    <Ionicons name="checkmark" size={12} color="#000000" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Require Peer Review / Photo Proof</Text>
            <Text style={styles.helperText}>Someone else must approve it to get points</Text>
          </View>
          <Switch 
            value={requiresPhotoProof} 
            onValueChange={setRequiresPhotoProof}
            trackColor={{ false: '#EAEAEA', true: '#000000' }}
            thumbColor={requiresPhotoProof ? '#CCFF00' : '#FFFFFF'}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, (!title || selectedUsers.length === 0 || isSubmitting) && styles.buttonDisabled]} 
          onPress={handleCreateChore}
          disabled={!title || selectedUsers.length === 0 || isSubmitting}
        >
          <Text style={styles.buttonText}>{isSubmitting ? 'Saving...' : 'Save Chore'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#000000' },
  content: { padding: 20 },
  sectionHeader: { fontSize: 18, fontWeight: '800', color: '#000000', marginTop: 12, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 20, padding: 16, fontSize: 16, marginBottom: 16, color: '#000000' },
  segmentedControl: { flexDirection: 'row', backgroundColor: '#EAEAEA', borderRadius: 20, padding: 4, marginBottom: 16 },
  segment: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
  segmentActive: { backgroundColor: '#000000', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  segmentText: { fontSize: 14, fontWeight: '700', color: '#888888' },
  segmentTextActive: { color: '#FFFFFF' },
  subSection: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, marginTop: -8, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA' },
  helperText: { fontSize: 12, color: '#888888' },
  avatarContainer: { alignItems: 'center', marginRight: 16, position: 'relative' },
  avatarContainerSelected: { opacity: 1 },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: 'transparent' },
  avatarName: { marginTop: 8, fontSize: 12, fontWeight: '700', color: '#000000' },
  checkmarkBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#CCFF00', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 24 },
  button: { backgroundColor: '#CCFF00', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#EAEAEA' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '800' },
});
