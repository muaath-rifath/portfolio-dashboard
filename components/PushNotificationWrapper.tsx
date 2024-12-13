// components/PushNotificationWrapper.tsx
'use client';
import { useEffect, useState } from 'react';

export default function PushNotificationWrapper() {
  const [deviceToken, setDeviceToken] = useState<string>('');

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        // Initialize local notifications
        await LocalNotifications.requestPermissions();
        
        // Create default channel first
        await PushNotifications.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: 5,
          visibility: 1,
          vibration: true
        });

        const permissionStatus = await PushNotifications.checkPermissions();
        if (permissionStatus.receive !== 'granted') {
          const permission = await PushNotifications.requestPermissions();
          if (permission.receive !== 'granted') return;
        }
        
        await PushNotifications.register();
        await PushNotifications.removeAllDeliveredNotifications();

        const registrationListener = await PushNotifications.addListener(
          'registration', 
          (token) => {
            console.log('FCM Token:', token.value);
            setDeviceToken(token.value);
          }
        );

        const notificationListener = await PushNotifications.addListener(
          'pushNotificationReceived',
          async (notification) => {
            console.log('Notification received:', notification);
            await LocalNotifications.schedule({
              notifications: [{
                title: notification.title || 'New Notification',
                body: notification.body || '',
                id: Math.floor(Math.random() * 100000),
              }]
            });
          }
        );

        const actionListener = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification) => {
            console.log('Action performed:', notification.actionId);
            console.log('Notification data:', notification.notification);
          }
        );

        return () => {
          registrationListener.remove();
          notificationListener.remove();
          actionListener.remove();
        };
      } catch (error) {
        console.error('Error:', error);
      }
    };

    initializeNotifications();
  }, []);

  return (
    <div className="fixed hidden bottom-4 right-4 p-4 bg-gray-100 rounded-lg shadow">
      <p className="text-sm">FCM Token:</p>
      <p className="text-xs break-all">{deviceToken}</p>
    </div>
  );
}
