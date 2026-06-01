import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect, useContext, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { apiClient } from '../api/client';
import { AppContext } from '../context/AppContext';

export default function Dashboard() {
  const { user, setUser, roomId, setRoomId, role, setRole, setToken, socket } = useContext(AppContext);
  const [streak, setStreak] = useState(12);
  const [chores, setChores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roomName, setRoomName] = useState('My Room');
  const [reviewInstance, setReviewInstance] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'mine' | 'roommates'>('mine');
  const [menuVisible, setMenuVisible] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChores().then(() => setRefreshing(false));
  }, [roomId]);

  const fetchChores = async () => {
    if (!roomId) return;
    try {
      // In a real app, you'd fetch room details to get the name, and chores scoped to room
      // For demo, we just fetch chores
      const res = await apiClient.get('/chores/today', { params: { roomId } });
      setChores(res.data);
      // Fetch room details just for the name
      const membersRes = await apiClient.get(`/rooms/${roomId}/members`);
      setRoomName(membersRes.data.name || 'My Room'); 
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

  useEffect(() => {
    if (socket) {
      socket.on('member_joined', (data) => {
        Alert.alert("New Roommate!", data.message);
      });
      socket.on('chore_reminder', (data) => {
        if (data.assignedUserId === user?.id) {
          Alert.alert("🔔 Chore Reminder!", `${data.fromUserName} is reminding you to complete: ${data.choreTitle}`);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('member_joined');
        socket.off('chore_reminder');
      }
    };
  }, [socket, user]);

  const handleRemind = async (instance: any) => {
    try {
      await apiClient.post(`/chores/instance/${instance._id}/remind`, { fromUserName: user?.name });
      Alert.alert("Reminder Sent!", `We've nudged ${instance.assignedUser?.name.split(' ')[0]} to do their chore.`);
    } catch (err) {
      console.error(err);
      alert('Failed to send reminder.');
    }
  };

  const handleComplete = async (instance: any) => {
    try {
      let photoProofUrl = null;
      if (instance.chore?.requiresPhotoProof) {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          alert("We need camera permission to take proof of your chore!");
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.2, // Compress heavily for local MongoDB base64
          base64: true,
        });

        if (result.canceled) return;
        if (result.assets && result.assets.length > 0) {
          photoProofUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
        }
      }

      await apiClient.post(`/chores/instance/${instance._id}/complete`, { photoProofUrl });
      fetchChores();
    } catch (err) {
      console.error(err);
      alert('Failed to complete chore.');
    }
  };

  const openReviewModal = (instance: any) => {
    setReviewInstance(instance);
  };

  const handleApprove = async () => {
    if (!reviewInstance) return;
    try {
      await apiClient.post(`/chores/instance/${reviewInstance._id}/approve`, { reviewerId: user?.id });
      setReviewInstance(null);
      fetchChores();
    } catch (err) {
      console.error(err);
      alert('Failed to approve chore.');
    }
  };

  const handleReject = () => {
    setReviewInstance(null);
  };

  const handleLogout = () => {
    setUser(null);
    setRoomId(null);
    setRole(null);
    if (setToken) setToken(null);
    router.replace('/');
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      "Leave Room",
      "Are you sure you want to leave this room? If you are the admin, the next person will become the new admin.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Leave", 
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.post('/rooms/leave', { roomId, userId: user?.id });
              setRoomId(null);
              setRole(null);
              router.replace('/setup');
            } catch (err) {
              console.error(err);
              alert("Failed to leave room.");
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

  // Calculate progress based on live data
  const completedCount = chores.filter(c => c.status === 'completed').length;

  const myChores = chores.filter(c => c.assignedUser?._id === user?.id);
  const roommateChores = chores.filter(c => c.assignedUser?._id !== user?.id);
  const displayChores = activeTab === 'mine' ? myChores : roommateChores;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#000000']} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <View style={{ backgroundColor: '#000000', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 }}>
              {/* <Text style={{ fontSize: 14, fontWeight: '900', color: '#CCFF00', letterSpacing: 1 }}>AAron</Text> */}
            </View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Roommate'}</Text>
            <Text style={styles.roomName}>{roomName}</Text>
          </View>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ padding: 8 }}>
            <Ionicons name="menu" size={32} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Chores Overview Card - Typography Style */}
        <View style={styles.statsCard}>
          <Text style={styles.statsSubtitle}>Chores Overview</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 }}>
            <Text style={{ fontSize: 48, fontWeight: '900', color: '#000000', lineHeight: 56 }}>{completedCount}</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#888888', marginBottom: 8, marginLeft: 8 }}>/ {chores.length}</Text>
          </View>
          <Text style={{ fontSize: 16, color: '#000000', fontWeight: '800', marginTop: 8 }}>
            {chores.length === 0 ? "No chores created yet!" : 
             (completedCount === chores.length ? "All caught up! 🎉" : `${chores.length - completedCount} more to go`)}
          </Text>
        </View>

        {/* Admin Controls */}
        {role === 'admin' && (
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: '#CCFF00', padding: 16, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={() => router.push('/create-chore')}>
              <Ionicons name="add" size={20} color="#000000" />
              <Text style={{ color: '#000000', fontWeight: '800', marginLeft: 8, fontSize: 16 }}>Add Chore</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA' }} onPress={() => router.push('/manage-chores')}>
              <Ionicons name="settings" size={20} color="#000000" />
              <Text style={{ color: '#000000', fontWeight: '800', marginLeft: 8, fontSize: 16 }}>Manage</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Chores List Tabs */}
        <View style={styles.tabContainer}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'mine' && styles.tabButtonActive]} 
              onPress={() => setActiveTab('mine')}
            >
              <Text style={[styles.tabText, activeTab === 'mine' && styles.tabTextActive]}>My Chores</Text>
              <View style={[styles.badge, activeTab === 'mine' && styles.badgeActive]}>
                <Text style={[styles.badgeText, activeTab === 'mine' && styles.badgeTextActive]}>
                  {myChores.length}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'roommates' && styles.tabButtonActive]} 
              onPress={() => setActiveTab('roommates')}
            >
              <Text style={[styles.tabText, activeTab === 'roommates' && styles.tabTextActive]}>Roommates</Text>
              <View style={[styles.badge, activeTab === 'roommates' && styles.badgeActive]}>
                <Text style={[styles.badgeText, activeTab === 'roommates' && styles.badgeTextActive]}>
                  {roommateChores.length}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {displayChores.length === 0 ? (
          <Text style={{ color: '#666', textAlign: 'center', marginVertical: 20 }}>No chores pending in this tab.</Text>
        ) : (
          displayChores.map(instance => {
            const isPending = instance.status === 'pending';
            const isAwaitingReview = instance.status === 'awaiting_review';
            const isCompleted = instance.status === 'completed';
            
            return (
              <View key={instance._id} style={[styles.choreCard, isCompleted && styles.choreCardCompleted]}>
                <View style={[styles.choreIconBg, isAwaitingReview && { backgroundColor: '#fff7ed' }, isCompleted && { backgroundColor: '#f1f5f9' }, instance.assignedUser?.avatar_url && { backgroundColor: 'transparent' }]}>
                  {instance.assignedUser?.avatar_url ? (
                    <View style={{ position: 'relative' }}>
                      <Image 
                        source={{ uri: instance.assignedUser.avatar_url }} 
                        style={{ width: 48, height: 48, borderRadius: 16, opacity: isCompleted ? 0.5 : 1 }} 
                      />
                      {isCompleted && (
                        <View style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: '#FFFFFF', borderRadius: 12 }}>
                          <Ionicons name="checkmark-circle" size={20} color="#CCFF00" />
                        </View>
                      )}
                      {isAwaitingReview && (
                        <View style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: '#fff', borderRadius: 12 }}>
                          <Ionicons name="time" size={20} color="#f97316" />
                        </View>
                      )}
                    </View>
                  ) : (
                    <Ionicons name={isCompleted ? "checkmark-circle" : (isAwaitingReview ? "eye-outline" : "trash-outline")} size={24} color={isCompleted ? "#94a3b8" : (isAwaitingReview ? "#f97316" : "#3b82f6")} />
                  )}
                </View>
                <View style={styles.choreInfo}>
                  <Text style={[styles.choreTitle, isCompleted && styles.choreTitleCompleted]}>
                    {instance.chore?.title || 'Unknown Chore'}
                  </Text>
                  <Text style={styles.choreTime}>
                    {isCompleted ? 'Completed' : (isAwaitingReview ? 'Pending Peer Review' : `Assigned to: ${instance.assignedUser?.name || 'Someone'}`)}
                  </Text>
                </View>
                
                {isPending && activeTab === 'mine' && (
                  <TouchableOpacity style={styles.markDoneButton} onPress={() => handleComplete(instance)}>
                    <Text style={styles.markDoneText}>Mark Done</Text>
                  </TouchableOpacity>
                )}

                {isPending && activeTab === 'roommates' && (
                  <TouchableOpacity style={styles.remindButton} onPress={() => handleRemind(instance)}>
                    <Text style={styles.remindButtonText}>Remind</Text>
                  </TouchableOpacity>
                )}
                
                {isAwaitingReview && activeTab === 'roommates' && (
                  <TouchableOpacity style={styles.approveButton} onPress={() => openReviewModal(instance)}>
                    <Text style={styles.approveButtonText}>Review</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={!!reviewInstance} animationType="slide" transparent={true} onRequestClose={handleReject}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review Chore</Text>
            <Text style={styles.modalSubtitle}>{reviewInstance?.chore?.title}</Text>
            
            {reviewInstance?.photoProofUrl ? (
              <Image source={{ uri: reviewInstance.photoProofUrl }} style={styles.proofImage} />
            ) : (
              <View style={styles.noProofBox}><Text>No photo provided</Text></View>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ef4444' }]} onPress={handleReject}>
                <Text style={styles.modalButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#CCFF00' }]} onPress={handleApprove}>
                <Text style={[styles.modalButtonText, { color: '#000000' }]}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Hamburger Menu Modal */}
      <Modal visible={menuVisible} animationType="fade" transparent={true} onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuDropdown}>
            {role === 'admin' && (
              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push('/share-room'); }}>
                <Ionicons name="qr-code" size={20} color="#000000" />
                <Text style={styles.menuItemText}>Scan QR Code</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); handleLeaveRoom(); }}>
              <Ionicons name="exit-outline" size={20} color="#000000" />
              <Text style={styles.menuItemText}>Leave Room</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => { setMenuVisible(false); handleLogout(); }}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  greeting: { fontSize: 24, fontWeight: '900', color: '#000000' },
  roomName: { fontSize: 16, color: '#888888', marginTop: 4 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff0cc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  streakText: { fontSize: 16, fontWeight: 'bold', color: '#cc9300', marginLeft: 4 },
  statsCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#EAEAEA' },
  statsHeader: { marginBottom: 16 },
  statsTitle: { fontSize: 18, fontWeight: '800', color: '#000000' },
  statsSubtitle: { fontSize: 14, color: '#888888', marginTop: 4 },
  progressBarContainer: { width: '100%' },
  progressBarBackground: { height: 12, backgroundColor: '#F4F4F4', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#CCFF00', borderRadius: 6 },
  
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tabButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, marginRight: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEA' },
  tabButtonActive: { backgroundColor: '#CCFF00', borderColor: '#CCFF00' },
  tabText: { fontSize: 14, fontWeight: '700', color: '#888888' },
  tabTextActive: { color: '#000000' },
  badge: { backgroundColor: '#F4F4F4', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  badgeActive: { backgroundColor: '#000000' },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#888888' },
  badgeTextActive: { color: '#CCFF00' },
  
  choreCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 15, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#EAEAEA' },
  choreCardCompleted: { backgroundColor: '#F4F4F4', borderColor: '#EAEAEA', borderWidth: 1, shadowOpacity: 0, elevation: 0 },
  choreIconBg: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  choreInfo: { flex: 1 },
  choreTitle: { fontSize: 16, fontWeight: '800', color: '#000000' },
  choreTitleCompleted: { color: '#888888', textDecorationLine: 'line-through' },
  choreTime: { fontSize: 14, color: '#888888', marginTop: 4 },
  markDoneButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#CCFF00', borderRadius: 20 },
  markDoneText: { color: '#000000', fontWeight: '800', fontSize: 14 },
  remindButton: { backgroundColor: '#F4F4F4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  remindButtonText: { color: '#000000', fontWeight: '800', fontSize: 14 },
  approveButton: { backgroundColor: '#000000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  approveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#000000', marginBottom: 4 },
  modalSubtitle: { fontSize: 16, color: '#888888', marginBottom: 20 },
  proofImage: { width: '100%', height: 300, borderRadius: 16, marginBottom: 24 },
  noProofBox: { width: '100%', height: 200, backgroundColor: '#F4F4F4', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 16, width: '100%' },
  modalButton: { flex: 1, paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  menuDropdown: { position: 'absolute', top: 60, right: 20, width: 220, backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, borderWidth: 1, borderColor: '#EAEAEA' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F4F4F4' },
  menuItemText: { fontSize: 16, fontWeight: '800', color: '#000000', marginLeft: 12 }
});
