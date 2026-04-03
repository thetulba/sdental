import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Trash2, Plus } from 'lucide-react';

export const SettingsManagement = () => {
  const [services, setServices] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [newService, setNewService] = useState({ name: '', price: 0, description: '' });
  const [newPromo, setNewPromo] = useState({ code: '', discountType: 'percentage', discountValue: 0, isActive: true });

  useEffect(() => {
    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'services'));

    const unsubPromos = onSnapshot(collection(db, 'promocodes'), (snapshot) => {
      setPromoCodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'promocodes'));

    return () => { unsubServices(); unsubPromos(); };
  }, []);

  const addService = async () => {
    try {
      await addDoc(collection(db, 'services'), newService);
      setNewService({ name: '', price: 0, description: '' });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'services'); }
  };

  const addPromo = async () => {
    try {
      await addDoc(collection(db, 'promocodes'), newPromo);
      setNewPromo({ code: '', discountType: 'percentage', discountValue: 0, isActive: true });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'promocodes'); }
  };

  return (
    <div className="space-y-8 max-w-full overflow-hidden">
      <div>
        <h3 className="font-bold mb-4">Manage Services</h3>
        <div className="space-y-2 mb-4">
          <input placeholder="Name" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full p-2 border rounded" />
          <input type="number" placeholder="Price" value={newService.price} onChange={e => setNewService({...newService, price: Number(e.target.value)})} className="w-full p-2 border rounded" />
          <button onClick={addService} className="bg-primary text-white p-2 rounded flex items-center gap-2"><Plus className="w-4 h-4" /> Add Service</button>
        </div>
        {services.map(s => (
          <div key={s.id} className="flex justify-between items-center p-2 border rounded mb-2">
            <span>{s.name} - {s.price} EGP</span>
            <button onClick={() => deleteDoc(doc(db, 'services', s.id))} className="text-error"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-bold mb-4">Manage Promo Codes</h3>
        <div className="space-y-2 mb-4">
          <input placeholder="Code" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value})} className="w-full p-2 border rounded" />
          <select value={newPromo.discountType} onChange={e => setNewPromo({...newPromo, discountType: e.target.value})} className="w-full p-2 border rounded">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input type="number" placeholder="Discount Value" value={newPromo.discountValue} onChange={e => setNewPromo({...newPromo, discountValue: Number(e.target.value)})} className="w-full p-2 border rounded" />
          <button onClick={addPromo} className="bg-primary text-white p-2 rounded flex items-center gap-2"><Plus className="w-4 h-4" /> Add Promo</button>
        </div>
        {promoCodes.map(p => (
          <div key={p.id} className="flex justify-between items-center p-2 border rounded mb-2">
            <span>{p.code} - {p.discountValue}{p.discountType === 'percentage' ? '%' : ' EGP'}</span>
            <button onClick={() => deleteDoc(doc(db, 'promocodes', p.id))} className="text-error"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};
