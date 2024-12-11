'use client';
import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Timestamp;
}

interface PushNotification {
  title?: string;
  body?: string;
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  const showNotification = useCallback((title: string, body: string) => {
    if (Capacitor.isNativePlatform()) {
      return;
    }

    if (notificationPermission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon.png'
      });
    }
  }, [notificationPermission]);

  const setupWebPushNotifications = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted' && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });
        
        console.log('ServiceWorker registered:', registration);
        console.log('Push subscription:', subscription);
      }
    } catch (error) {
      console.error('Notification setup error:', error);
    }
  }, []);

  const setupNativePushNotifications = useCallback(async () => {
    try {
      const permissionStatus = await PushNotifications.checkPermissions();
      
      if (permissionStatus.receive === 'prompt') {
        await PushNotifications.requestPermissions();
      }

      if (permissionStatus.receive !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success:', token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
        if (notification.title && notification.body) {
          showNotification(notification.title, notification.body);
        }
      });
    } catch (error) {
      console.error('Native push setup error:', error);
    }
  }, [showNotification]);

  const setupNotifications = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await setupNativePushNotifications();
      } else {
        await setupWebPushNotifications();
      }
    } catch (error) {
      console.error('Notification setup error:', error);
    }
  }, [setupNativePushNotifications, setupWebPushNotifications]);

  const subscribeToContacts = useCallback(() => {
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const contactList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      setContacts(contactList);

      const latestContact = contactList[0];
      if (latestContact?.name) {
        showNotification(
          'New Contact',
          `New message from ${latestContact.name}`
        );
      }
    });
  }, [showNotification]);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const init = async () => {
      await setupNotifications();
      unsubscribe = subscribeToContacts();
    };

    init();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setupNotifications, subscribeToContacts]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Dashboard</h1>
      <div className="grid gap-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="border p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <h2 className="font-bold text-lg">{contact.name}</h2>
            <p className="text-gray-600">{contact.email}</p>
            <p className="text-gray-600">{contact.phone}</p>
            <p className="mt-2 text-gray-800">{contact.message}</p>
            <p className="text-sm text-gray-500 mt-2">
              {contact.createdAt?.toDate().toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
