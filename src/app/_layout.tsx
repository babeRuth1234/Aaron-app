import { Stack } from 'expo-router';
import { AppProvider } from '../context/AppContext';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AnimatedSplashScreen({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 3, // Zoom in
        duration: 1500,
        useNativeDriver: false, // Disabling native driver to prevent Android Text transform crash
      }),
      Animated.timing(opacity, {
        toValue: 0, // Fade out
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onAnimationComplete();
    });
  }, []);

  return (
    <Animated.View style={[styles.splashContainer, { opacity }]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Text style={styles.splashText}>
          Aaron
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Pacifico': require('../../assets/fonts/Pacifico-Regular.ttf'),
  });
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <AppProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#f8f9fa' }
          }}
        />
      </AppProvider>
      {!animationComplete && (
        <AnimatedSplashScreen onAnimationComplete={() => setAnimationComplete(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  splashText: {
    fontFamily: 'Pacifico',
    color: '#FFFFFF',
    fontSize: 64,
  },
});
