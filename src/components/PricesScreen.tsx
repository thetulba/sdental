import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export const PricesScreen = () => {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'services'));
    return unsub;
  }, []);

  return (
    <div className="py-20 px-6 max-w-4xl mx-auto">
      <h2 className="text-4xl font-headline mb-10 text-center">Our Prices</h2>
      <div className="grid gap-6">
        {services.map(s => (
          <div key={s.id} className="bg-surface p-6 rounded-2xl border border-surface-variant flex justify-between items-center">
            <span className="text-lg font-bold">{s.name}</span>
            <span className="text-xl font-bold text-primary">{s.price} EGP</span>
          </div>
        ))}
      </div>
    </div>
  );
};
