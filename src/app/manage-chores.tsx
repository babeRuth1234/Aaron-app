import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { apiClient } from '../api/client';
import { AppContext } from '../context/AppContext';
import { useCallback } from 'react';

export default function ManageChoresScreen() {
  const { roomId } = useContext(AppContext);
  const [chores, setChores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChores = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/chores/room/${roomId}`);
      setChores(res.data);
    } catch (err) {
      console.error("Failed to fetch chores.", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChores();
    }, [roomId])
  );

  const handleDelete = (choreId: string) => {
    Alert.alert(
      "Delete Chore",
      "Are you sure you want to delete this chore? This will immediately remove any pending instances from the dashboard.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/chores/${choreId}`);
              alert("Chore deleted!");
              fetchChores();
            } catch (err) {
              console.error(err);
              alert("Failed to delete chore.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Chores</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {chores.length === 0 ? (
          <Text style={{ color: '#666', textAlign: 'center', marginVertical: 20 }}>No active chores found.</Text>
        ) : (
          chores.map((chore: any) => (
            <View key={chore._id} style={styles.choreCard}>
              <View style={styles.choreInfo}>
                <Text style={styles.choreTitle}>{chore.title}</Text>
                <Text style={styles.choreTime}>
                  {chore.cadenceType === 'daily' ? 'Daily' : 'Weekly'} • {chore.assignmentType === 'rotational' ? 'Rotational' : 'Fixed'}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={() => router.push({ pathname: '/edit-chore', params: { choreId: chore._id } })}
                >
                  <Ionicons name="pencil" size={20} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(chore._id)}>
                  <Ionicons name="trash" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#000000' },
  content: { padding: 20 },
  choreCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#EAEAEA' },
  choreInfo: { flex: 1 },
  choreTitle: { fontSize: 16, fontWeight: '800', color: '#000000' },
  choreTime: { fontSize: 14, color: '#888888', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12 },
  editButton: { backgroundColor: '#CCFF00', padding: 12, borderRadius: 16 },
  deleteButton: { backgroundColor: '#000000', padding: 12, borderRadius: 16 },
});
