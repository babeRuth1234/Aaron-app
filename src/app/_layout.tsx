import { Stack } from 'expo-router';
import { AppProvider } from '../context/AppContext';
// import * as Notifications from 'expo-notifications';

/*
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
*/

export default function Layout() {
  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8f9fa' }
        }}
      />
    </AppProvider>
  );
}
