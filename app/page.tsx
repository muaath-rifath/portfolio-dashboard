'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { PushNotifications } from '@capacitor/push-notifications';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Timestamp;
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    initializePushNotifications();
    subscribeToContacts();
  }, []);

  const initializePushNotifications = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }
  
    try {
      // First request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }
  
      // Then proceed with Capacitor push notifications
      const permissionStatus = await PushNotifications.checkPermissions();
      
      if (permissionStatus.receive === 'prompt') {
        await PushNotifications.requestPermissions();
      }
  
      await PushNotifications.register();
  
      // Add listeners after successful registration
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success:', token.value);
      });
  
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Registration error:', error);
      });
  
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
      });
  
    } catch (error) {
      // Properly handle the error without throwing
      console.error('Push notification initialization error:', error);
    }
  };
  

  const subscribeToContacts = () => {
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const contactList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      setContacts(contactList);
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Dashboard</h1>
      <div className="grid gap-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="border p-4 rounded-lg">
            <h2 className="font-bold">{contact.name}</h2>
            <p>{contact.email}</p>
            <p>{contact.phone}</p>
            <p className="mt-2">{contact.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
