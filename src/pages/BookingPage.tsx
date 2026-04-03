import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { format, addHours, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Phone, MapPin, Clock, Sparkles, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { doc, setDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { useAuth } from '../App'; // This might be an issue, need to export useAuth from App.tsx
import { ServiceSelection } from '../components/ServiceSelection';

const BookingPage = () => {
  const { profile, login } = useAuth();
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<{
    patientName: string;
    service: string;
    time: Date;
  } | null>(null);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const subtotal = selectedServices.reduce((acc, s) => acc + s.price, 0);

  useEffect(() => {
    setFinalTotal(subtotal - discount);
  }, [subtotal, discount]);

  const validatePromo = async () => {
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, subtotal })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDiscount(data.discount);
      setFinalTotal(data.finalTotal);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      login();
      return;
    }
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const phone = formData.get('phone') as string;
    const startTime = addHours(startOfDay(new Date()), 10); // Mock time
    
    try {
      if (profile && !profile.phone) {
        await setDoc(doc(db, 'users', profile.uid), { phone }, { merge: true });
      }

      await addDoc(collection(db, 'appointments'), {
        patientId: profile.uid,
        patientName: profile.name,
        dentistId: 'default_dentist',
        dentistName: 'Dr. Sarah Johnson',
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(addHours(startTime, 1)),
        services: selectedServices.map(s => s.name),
        totalCost: finalTotal,
        status: 'booked'
      });
      setBookedDetails({
        patientName: profile.name,
        service: selectedServices.map(s => s.name).join(', '),
        time: startTime
      });
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
    } finally {
      setLoading(false);
    }
  };

  if (submitted && bookedDetails) {
    return (
      <div className="pt-32 pb-20 flex items-center justify-center min-h-[80vh] px-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full overflow-hidden border border-surface-variant"
        >
          <div className="bg-primary p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Sparkles className="w-full h-full scale-150 rotate-12" />
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-headline mb-2">{t('booking.confirmation.title')}</h2>
            <p className="text-white/80">{t('booking.success.desc')}</p>
          </div>

          <div className="p-10 space-y-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-headline text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {t('booking.confirmation.details')}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-surface-variant">
                    <span className="text-sm text-on-surface-variant font-medium">{t('booking.confirmation.patient')}</span>
                    <span className="font-bold">{bookedDetails.patientName}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-surface-variant">
                    <span className="text-sm text-on-surface-variant font-medium">{t('booking.confirmation.service')}</span>
                    <span className="font-bold capitalize">{bookedDetails.service}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-surface-variant">
                    <span className="text-sm text-on-surface-variant font-medium">{t('booking.confirmation.date')}</span>
                    <span className="font-bold">{format(bookedDetails.time, 'PPP p')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-headline text-xl flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-primary" />
                  {t('booking.confirmation.nextSteps')}
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-surface-container text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i}
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {t(`booking.confirmation.step${i}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:bg-primary-container transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('booking.confirmation.done')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-start">
        <div>
          <h1 className="font-headline text-5xl mb-6">{t('booking.title')}</h1>
          <p className="text-on-surface-variant text-lg mb-12">
            {t('booking.subtitle')}
          </p>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Call Us Directly</h4>
                <p className="text-on-surface-variant">+20 100 123 4567</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Our Location</h4>
                <p className="text-on-surface-variant">45 El-Batal Ahmed Abdel Aziz St, Mohandessin, Giza, Egypt</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Working Hours</h4>
                <p className="text-on-surface-variant">Sat - Thu: 11:00 AM - 9:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-surface-variant">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">{t('booking.form.firstName')}</label>
                <input required name="firstName" type="text" defaultValue={profile?.name.split(' ')[0]} className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">{t('booking.form.lastName')}</label>
                <input required name="lastName" type="text" defaultValue={profile?.name.split(' ')[1]} className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">{t('booking.form.email')}</label>
              <input required name="email" type="email" defaultValue={profile?.email} className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Phone Number (for reminders)</label>
              <input required name="phone" type="tel" defaultValue={profile?.phone} className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="+20 100 123 4567" />
            </div>
            <ServiceSelection selectedServices={selectedServices} setSelectedServices={setSelectedServices} />
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Promo Code (Optional)</label>
              <div className="flex gap-2">
                <input name="promoCode" type="text" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="Enter promo code" />
                <button type="button" onClick={validatePromo} className="bg-surface-variant px-4 rounded-2xl">Apply</button>
              </div>
            </div>
            <div className="text-xl font-bold">Subtotal: {subtotal} EGP</div>
            {discount > 0 && <div className="text-xl font-bold text-error">Discount: -{discount} EGP</div>}
            <div className="text-2xl font-bold text-primary">Total: {finalTotal} EGP</div>
            <button 
              type="submit" 
              disabled={loading || selectedServices.length === 0}
              className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:bg-primary-container transition-all disabled:opacity-50"
            >
              {loading ? t('booking.form.submitting') : profile ? t('booking.form.submit') : t('booking.form.signInToBook')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
