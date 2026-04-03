import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export const ServiceSelection = ({ selectedServices, setSelectedServices }: { selectedServices: any[], setSelectedServices: (s: any[]) => void }) => {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'services'));
    return unsub;
  }, []);

  const toggleService = (service: any) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold">Select Services</h3>
      {services.map(s => (
        <div key={s.id} onClick={() => toggleService(s)} className={`p-4 border rounded-2xl cursor-pointer ${selectedServices.find(sel => sel.id === s.id) ? 'border-primary bg-primary/5' : 'border-surface-variant'}`}>
          <div className="flex justify-between">
            <span className="font-bold">{s.name}</span>
            <span className="text-primary font-bold">{s.price} EGP</span>
          </div>
          <p className="text-sm text-on-surface-variant">{s.description}</p>
        </div>
      ))}
    </div>
  );
};
