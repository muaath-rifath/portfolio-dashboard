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
    setupPushNotifications();
    subscribeToContacts();
  }, []);

  const setupPushNotifications = async () => {
    const result = await PushNotifications.requestPermissions();
    if (result.receive === 'granted') {
      await PushNotifications.register();
      
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Notification received:', notification);
      });
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
