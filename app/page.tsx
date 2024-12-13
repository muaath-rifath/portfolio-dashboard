// app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import dynamic from 'next/dynamic';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Timestamp;
}

const PushNotificationWrapper = dynamic(
  () => import('../components/PushNotificationWrapper'),
  { ssr: false }
);

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lastContactCount, setLastContactCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const contactList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      
      // Check for new contacts
      if (lastContactCount > 0 && contactList.length > lastContactCount) {
        const newestContact = contactList[0];
        try {
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          await LocalNotifications.schedule({
            notifications: [{
              title: 'New Contact Message',
              body: `New message from ${newestContact.name}`,
              id: Math.floor(Math.random() * 100000),
            }]
          });
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      }
      
      setLastContactCount(contactList.length);
      setContacts(contactList);
    });

    return () => unsubscribe();
  }, [lastContactCount]);

  return (
    <main className="min-h-screen p-4">
      <PushNotificationWrapper />
      <h1 className="text-2xl font-bold mb-4">Contact Messages</h1>
      <div className="grid gap-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="border p-4 rounded-lg shadow">
            <h2 className="font-bold text-lg">{contact.name}</h2>
            <p className="text-gray-600">{contact.email}</p>
            <p className="text-gray-600">{contact.phone}</p>
            <p className="mt-2">{contact.message}</p>
            <p className="text-sm text-gray-500 mt-2">
              {contact.createdAt?.toDate().toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
