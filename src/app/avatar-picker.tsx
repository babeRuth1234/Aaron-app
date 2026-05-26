import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useContext } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from '../context/AppContext';
import { apiClient } from '../api/client';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/png?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Jude&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Milo&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Nala&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Oscar&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Simba&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Lola&backgroundColor=ffdfbf',
];

export default function AvatarPickerScreen() {
  const { user, setUser, roomId } = useContext(AppContext);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setSelectedAvatar(base64Img);
    }
  };

  const handleSave = async () => {
    if (!selectedAvatar || !user) return;
    
    setLoading(true);
    try {
      const res = await apiClient.put(`/auth/${user.id}/avatar`, { avatarUrl: selectedAvatar });
      // Update local context
      setUser({ ...user, avatar_url: res.data.avatar_url });
      
      // Proceed to next screen
      if (roomId) {
        router.replace('/dashboard');
      } else {
        router.replace('/setup');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save avatar');
    } finally {
      setLoading(false);
    }
  };

  const skip = () => {
    if (roomId) {
      router.replace('/dashboard');
    } else {
      router.replace('/setup');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Pick Your Avatar</Text>
          <Text style={styles.subtitle}>Choose how you want to appear to your roommates.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.uploadOption} onPress={handlePickImage}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="camera" size={32} color="#000000" />
            </View>
            <Text style={styles.uploadText}>Camera Roll</Text>
          </TouchableOpacity>

          {/* Presets */}
          {PRESET_AVATARS.map((url, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[
                styles.avatarWrapper, 
                selectedAvatar === url && styles.avatarWrapperSelected
              ]}
              onPress={() => setSelectedAvatar(url)}
            >
              <Image source={{ uri: url }} style={styles.avatarImage} />
              {selectedAvatar === url && (
                <View style={styles.checkmarkBadge}>
                  <Ionicons name="checkmark" size={16} color="#000000" />
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* For the base64 custom uploaded preview (if it's not one of the presets) */}
          {selectedAvatar && !PRESET_AVATARS.includes(selectedAvatar) && (
            <TouchableOpacity 
              style={[styles.avatarWrapper, styles.avatarWrapperSelected]}
            >
              <Image source={{ uri: selectedAvatar }} style={styles.avatarImage} />
              <View style={styles.checkmarkBadge}>
                <Ionicons name="checkmark" size={16} color="#000000" />
              </View>
            </TouchableOpacity>
          )}

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, !selectedAvatar && styles.buttonDisabled]} 
            onPress={handleSave}
            disabled={!selectedAvatar || loading}
          >
            {loading ? <ActivityIndicator color="#000000" /> : <Text style={styles.buttonText}>Continue</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={skip} style={styles.skipButton}>
            <Text style={styles.skipText}>I'll do this later</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginTop: 24, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', color: '#000000', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#888888', textAlign: 'center', paddingHorizontal: 20 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, paddingBottom: 24 },
  
  uploadOption: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#EAEAEA', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  uploadIconContainer: { marginBottom: 4 },
  uploadText: { fontSize: 12, fontWeight: '700', color: '#888888' },

  avatarWrapper: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'transparent', position: 'relative', marginBottom: 8 },
  avatarWrapperSelected: { borderColor: '#CCFF00', transform: [{ scale: 1.05 }] },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50 },
  
  checkmarkBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#CCFF00', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#F4F4F4' },

  footer: { marginTop: 'auto', paddingTop: 24 },
  button: { backgroundColor: '#CCFF00', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#EAEAEA' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '800' },
  skipButton: { alignItems: 'center', marginTop: 16, padding: 12 },
  skipText: { color: '#888888', fontSize: 16, fontWeight: '700' }
});
