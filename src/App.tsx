import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  Menu, 
  X, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Instagram, 
  Facebook, 
  Linkedin,
  ChevronRight,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Award,
  Users,
  Settings,
  Upload,
  Trash2,
  LogOut,
  LayoutDashboard,
  FileText,
  CreditCard,
  Plus,
  Search,
  Activity,
  Box,
  AlertCircle,
  Shield,
  DollarSign,
  Lock,
  Key,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  updatePassword as firebaseUpdatePassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  deleteDoc,
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { format, addHours, startOfDay, isSameDay, parseISO, isAfter } from 'date-fns';
import { useTranslation } from 'react-i18next';

// --- Types ---
type Role = 'patient' | 'staff' | 'dentist' | 'admin' | 'owner';
type Screen = 'home' | 'experts' | 'portfolio' | 'booking' | 'dashboard';

interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  name: string;
  phone?: string;
  requiresPasswordChange?: boolean;
}

interface HRProfile {
  uid: string;
  baseSalary: number;
  joiningDate: Timestamp;
  contractType: 'full-time' | 'part-time' | 'contract';
  documents: { name: string, url: string, uploadedAt: Timestamp }[];
  updatedAt?: Timestamp;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  startTime: Timestamp;
  endTime: Timestamp;
  type: 'checkup' | 'surgery' | 'emergency';
  status: 'booked' | 'checked-in' | 'completed' | 'cancelled';
}

interface ClinicalRecord {
  id: string;
  patientId: string;
  dentistId: string;
  date: Timestamp;
  notes: string;
  scans: string[];
}

interface Billing {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  status: 'pending' | 'paid';
}

interface Expert {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoURL?: string;
  order: number;
}

// --- Context ---
interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoggingIn: boolean;
  updatePass: (newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- Auth Provider ---
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create profile
        const userDoc = doc(db, 'users', firebaseUser.uid);
        try {
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // Special case for owner email
            if (data.email === "the.tulba@gmail.com" && data.role !== 'owner') {
              await setDoc(userDoc, { role: 'owner' }, { merge: true });
              data.role = 'owner';
            }
            setProfile(data);
          } else {
            // Default to patient for new users
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: firebaseUser.email === "the.tulba@gmail.com" ? 'owner' : 'patient',
              name: firebaseUser.displayName || 'New Patient',
            };
            await setDoc(userDoc, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        alert('The login popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Login popup request was cancelled.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('Login popup was closed by the user.');
      } else {
        console.error("Login Error:", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const updatePass = async (newPass: string) => {
    if (!user) return;
    try {
      await firebaseUpdatePassword(user, newPass);
      await setDoc(doc(db, 'users', user.uid), { requiresPasswordChange: false }, { merge: true });
      setProfile(prev => prev ? { ...prev, requiresPasswordChange: false } : null);
    } catch (error) {
      console.error("Password Update Error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, loginWithEmail, signOut, isLoggingIn, updatePass }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Components ---

const Navbar = ({ activeScreen, setScreen, logo, onOpenSettings }: { activeScreen: Screen, setScreen: (s: Screen) => void, logo: string | null, onOpenSettings: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, login, signOut, isLoggingIn } = useAuth();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { label: string, id: Screen }[] = [
    { label: t('nav.home'), id: 'home' },
    { label: t('nav.experts'), id: 'experts' },
    { label: t('nav.portfolio'), id: 'portfolio' },
  ];

  const languages = [
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'ar', label: 'AR', flag: '🇸🇦' },
    { code: 'ms', label: 'MS', flag: '🇲🇾' },
    { code: 'id', label: 'ID', flag: '🇮🇩' },
    { code: 'th', label: 'TH', flag: '🇹🇭' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
      isScrolled ? "glass-nav shadow-sm py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="relative group/logo cursor-pointer"
            onClick={onOpenSettings}
          >
            {logo ? (
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain transition-transform group-hover/logo:scale-110" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover/logo:scale-110 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                <Sparkles className="w-6 h-6" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity border border-surface-variant">
              <Settings className="w-2.5 h-2.5 text-primary" />
            </div>
          </div>
          
          <div 
            className="cursor-pointer"
            onClick={() => setScreen('home')}
          >
            <span className="font-headline text-xl tracking-tight text-on-surface">
              Dental Center
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setScreen(link.id)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                activeScreen === link.id ? "text-primary" : "text-on-surface-variant"
              )}
            >
              {link.label}
            </button>
          ))}
          
          {/* Language Switcher */}
          <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-full border border-surface-variant">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={cn(
                  "w-8 h-8 rounded-full text-[10px] font-bold transition-all flex items-center justify-center",
                  i18n.language === lang.code ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-variant"
                )}
                title={lang.label}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setScreen('dashboard')}
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-container transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('nav.dashboard')}
              </button>
              <div className="h-6 w-[1px] bg-surface-variant" />
              <button 
                onClick={signOut}
                className="p-2 text-on-surface-variant hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              disabled={isLoggingIn}
              className={cn(
                "bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md hover:bg-primary-container transition-all hover:scale-105 active:scale-95 flex items-center gap-2",
                isLoggingIn && "opacity-50 cursor-not-allowed scale-100"
              )}
            >
              {isLoggingIn ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              {isLoggingIn ? t('nav.signingIn') || 'Signing in...' : t('nav.signIn')}
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-on-surface"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-t border-surface-variant p-6 md:hidden shadow-xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setScreen(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "text-left text-lg font-medium py-2",
                    activeScreen === link.id ? "text-primary" : "text-on-surface-variant"
                  )}
                >
                  {link.label}
                </button>
              ))}
              {user ? (
                <button 
                  onClick={() => {
                    setScreen('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-primary text-white w-full py-4 rounded-2xl text-center font-bold mt-2"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button 
                  onClick={login}
                  className="bg-primary text-white w-full py-4 rounded-2xl text-center font-bold mt-2"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Dashboards ---

const PatientDashboard = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', profile.uid),
      orderBy('startTime', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'appointments'));
    return unsubscribe;
  }, [profile]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline">{t('dashboard.patient.welcome', { name: profile?.name })}</h2>
          <p className="text-on-surface-variant">{t('dashboard.patient.subtitle')}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-variant">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">{t('dashboard.patient.nextAppointment')}</h3>
          <p className="text-sm text-on-surface-variant">
            {appointments.find(a => a.status === 'booked') 
              ? format(appointments.find(a => a.status === 'booked')!.startTime.toDate(), 'PPP p')
              : t('dashboard.patient.noUpcoming')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-variant">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">{t('dashboard.patient.healthStatus')}</h3>
          <p className="text-sm text-on-surface-variant">{t('dashboard.patient.healthDesc')}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-variant">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">{t('dashboard.patient.balance')}</h3>
          <p className="text-sm text-on-surface-variant">{t('dashboard.patient.balanceZero')}</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-surface-variant overflow-hidden">
        <div className="p-6 border-b border-surface-variant flex items-center justify-between">
          <h3 className="font-headline text-xl">{t('dashboard.patient.history')}</h3>
          <button className="text-primary text-sm font-bold">{t('dashboard.patient.viewAll')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-xs uppercase tracking-wider font-bold text-on-surface-variant">
              <tr>
                <th className="px-6 py-4">{t('dashboard.patient.table.date')}</th>
                <th className="px-6 py-4">{t('dashboard.patient.table.dentist')}</th>
                <th className="px-6 py-4">{t('dashboard.patient.table.type')}</th>
                <th className="px-6 py-4">{t('dashboard.patient.table.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {appointments.map(a => (
                <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 text-sm">{format(a.startTime.toDate(), 'PPP')}</td>
                  <td className="px-6 py-4 text-sm">{a.dentistName}</td>
                  <td className="px-6 py-4 text-sm capitalize">{a.type}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      a.status === 'booked' ? "bg-blue-100 text-blue-700" :
                      a.status === 'completed' ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant italic">
                    {t('dashboard.patient.table.noAppointments')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const INITIAL_EXPERTS = [
  { name: 'Dr. Mohamed Ahmed Tulba', role: 'Consultant Orthodontist', bio: 'Specializing in digital smile design with over 12 years of international experience.', order: 0 },
  { name: 'Dr. Michael Chen', role: 'Implant Specialist', bio: 'Expert in minimally invasive implantology and full-mouth reconstruction.', order: 1 },
  { name: 'Dr. Elena Rossi', role: 'Orthodontist', bio: 'Certified Invisalign Diamond provider focusing on functional aesthetics.', order: 2 },
  { name: 'Dr. Sarah Johnson', role: 'Aesthetic Dentist', bio: 'Passionate about creating natural-looking smile transformations.', order: 3 },
  { name: 'Dr. David Lee', role: 'Endodontist', bio: 'Specialist in root canal therapy and microscopic dentistry.', order: 4 },
  { name: 'Dr. Anna Smith', role: 'Pediatric Dentist', bio: 'Dedicated to providing gentle and fun dental care for children.', order: 5 },
];

const StaffDashboard = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'appointments' | 'experts' | 'team'>('appointments');

  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('startTime', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'appointments'));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'experts'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expert));
      
      // Auto-seed if empty (Staff/Admin only)
      if (snapshot.empty) {
        try {
          for (const exp of INITIAL_EXPERTS) {
            await addDoc(collection(db, 'experts'), exp);
          }
        } catch (error) {
          console.error("Auto-seeding failed:", error);
        }
      }

      setExperts(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'experts'));
    return unsubscribe;
  }, []);

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    try {
      await setDoc(doc(db, 'appointments', id), { status }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const seedExperts = async () => {
    try {
      for (const exp of INITIAL_EXPERTS) {
        await addDoc(collection(db, 'experts'), exp);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'experts');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline">Clinic Operations</h2>
          <p className="text-on-surface-variant">Manage the master calendar and patient check-ins.</p>
        </div>
        <div className="flex gap-4">
          {experts.length === 0 && (
            <button 
              onClick={seedExperts}
              className="bg-surface-container text-primary px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
            >
              Seed 6 Experts
            </button>
          )}
          <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Appointment
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-surface-variant overflow-x-auto">
        <button 
          onClick={() => setTab('appointments')}
          className={cn("pb-4 px-4 font-bold transition-all whitespace-nowrap", tab === 'appointments' ? "text-primary border-b-2 border-primary" : "text-on-surface-variant")}
        >
          Appointments
        </button>
        <button 
          onClick={() => setTab('experts')}
          className={cn("pb-4 px-4 font-bold transition-all whitespace-nowrap", tab === 'experts' ? "text-primary border-b-2 border-primary" : "text-on-surface-variant")}
        >
          Manage Experts
        </button>
        {profile?.role === 'owner' && (
          <button 
            onClick={() => setTab('team')}
            className={cn("pb-4 px-4 font-bold transition-all whitespace-nowrap", tab === 'team' ? "text-primary border-b-2 border-primary" : "text-on-surface-variant")}
          >
            Team Management
          </button>
        )}
      </div>

      {tab === 'appointments' && (
        <div className="bg-white rounded-[32px] border border-surface-variant overflow-hidden">
          <div className="p-6 border-b border-surface-variant flex items-center justify-between">
            <h3 className="font-headline text-xl">Today's Schedule</h3>
            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl">
              <Search className="w-4 h-4 text-on-surface-variant" />
              <input type="text" placeholder="Search patients..." className="bg-transparent border-none outline-none text-sm" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Dentist</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {appointments.map(a => (
                  <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 text-sm font-bold">{format(a.startTime.toDate(), 'p')}</td>
                    <td className="px-6 py-4 text-sm">{a.patientName}</td>
                    <td className="px-6 py-4 text-sm">{a.dentistName}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        a.type === 'emergency' ? "bg-red-100 text-red-700" : "bg-surface-container text-on-surface-variant"
                      )}>
                        {a.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={a.status}
                        onChange={(e) => handleStatusUpdate(a.id, e.target.value as Appointment['status'])}
                        className="text-xs font-bold bg-surface-container-low border border-surface-variant rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="booked">Booked</option>
                        <option value="checked-in">Checked In</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'experts' && <ExpertManagement experts={experts} />}
      {tab === 'team' && <TeamManagement />}
    </div>
  );
};

const ExpertManagement = ({ experts }: { experts: Expert[] }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Expert>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        const { id, ...updateData } = form as Expert;
        await setDoc(doc(db, 'experts', editingId), updateData, { merge: true });
      } else {
        await addDoc(collection(db, 'experts'), { ...form, order: experts.length });
      }
      setEditingId(null);
      setForm({});
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'experts');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this expert?')) return;
    try {
      await deleteDoc(doc(db, 'experts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `experts/${id}`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, photoURL: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-surface-variant shadow-sm h-fit sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-xl">{editingId ? 'Edit Profile' : 'Add Expert'}</h3>
            {editingId && (
              <button 
                onClick={() => { setEditingId(null); setForm({}); }}
                className="text-xs font-bold text-primary hover:underline"
              >
                Switch to Add New
              </button>
            )}
          </div>
          
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name</label>
              <input 
                required
                placeholder="e.g. Dr. Jane Doe"
                value={form.name || ''} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-surface-container-low border border-surface-variant rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Professional Title</label>
              <input 
                required
                placeholder="e.g. Orthodontist Specialist"
                value={form.role || ''} 
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full bg-surface-container-low border border-surface-variant rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Biography</label>
              <textarea 
                required
                placeholder="Brief professional background..."
                value={form.bio || ''} 
                onChange={e => setForm({ ...form, bio: e.target.value })}
                className="w-full bg-surface-container-low border border-surface-variant rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary h-24 resize-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Profile Photo</label>
              <div className="flex items-center gap-6 p-4 bg-surface-container-low rounded-2xl border border-dashed border-surface-variant">
                <div className="w-20 h-20 bg-surface-container rounded-2xl overflow-hidden border border-surface-variant flex-shrink-0 shadow-inner">
                  {form.photoURL ? (
                    <img src={form.photoURL} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                      <Users className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-primary-container transition-all shadow-sm">
                    {form.photoURL ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                  <p className="text-[10px] text-on-surface-variant">JPG, PNG or WebP. Max 2MB.</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-grow bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <Sparkles className="w-4 h-4 animate-spin" />}
                {editingId ? 'Save Changes' : 'Add to Team'}
              </button>
              {(editingId || form.name || form.role || form.bio || form.photoURL) && (
                <button 
                  type="button" 
                  onClick={() => { setEditingId(null); setForm({}); }}
                  className="px-6 bg-surface-container text-on-surface py-4 rounded-2xl font-bold hover:bg-surface-container-high transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-headline text-2xl">Our Experts</h3>
            <span className="text-xs font-bold bg-surface-container px-3 py-1 rounded-full text-on-surface-variant">
              {experts.length} Total
            </span>
          </div>
          
          <div className="grid gap-4">
            {experts.map(exp => (
              <div 
                key={exp.id} 
                className={cn(
                  "bg-white p-5 rounded-[24px] border transition-all flex items-center gap-5 group cursor-pointer",
                  editingId === exp.id ? "border-primary ring-1 ring-primary shadow-md" : "border-surface-variant hover:border-primary/50 hover:shadow-sm"
                )}
                onClick={() => { setEditingId(exp.id); setForm(exp); }}
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-surface-variant">
                  <img 
                    src={exp.photoURL || "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2070&auto=format&fit=crop"} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-headline text-lg truncate">{exp.name}</div>
                    {editingId === exp.id && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                  </div>
                  <div className="text-sm text-primary font-bold tracking-tight uppercase">{exp.role}</div>
                  <p className="text-xs text-on-surface-variant line-clamp-1 mt-1">{exp.bio}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingId(exp.id); setForm(exp); }}
                    className="p-3 bg-surface-container-low hover:bg-primary/10 text-primary rounded-xl transition-colors"
                    title="Edit Profile"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
                    className="p-3 bg-surface-container-low hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                    title="Remove Expert"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            
            {experts.length === 0 && (
              <div className="text-center py-20 bg-surface-container-low rounded-[32px] border border-dashed border-surface-variant">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-on-surface-variant font-medium">No experts found. Add your first team member!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamManagement = () => {
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<UserProfile | null>(null);
  const [showHRModal, setShowHRModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', 'in', ['staff', 'dentist', 'admin', 'owner']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStaff(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-2xl">Team Directory</h3>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:bg-primary-container transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Team Member
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-surface-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-xs uppercase tracking-wider font-bold text-on-surface-variant">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold">
                        {s.name?.[0] || 'U'}
                      </div>
                      <div className="font-bold text-sm">{s.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold uppercase tracking-tight text-primary">
                      {s.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{s.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                      s.requiresPasswordChange ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    )}>
                      {s.requiresPasswordChange ? 'Pending Reset' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedStaff(s); setShowHRModal(true); }}
                      className="text-primary font-bold text-xs hover:underline"
                    >
                      View HR Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && <CreateStaffModal onClose={() => setShowCreateModal(false)} />}
      {showHRModal && selectedStaff && (
        <HRProfileModal 
          staff={selectedStaff} 
          onClose={() => { setShowHRModal(false); setSelectedStaff(null); }} 
        />
      )}
    </div>
  );
};

const CreateStaffModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'staff' as Role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl border border-surface-variant"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-headline">New Team Member</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name</label>
            <input 
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-surface-container-low border border-surface-variant rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. John Smith"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
            <input 
              required
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-surface-container-low border border-surface-variant rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary"
              placeholder="john@clinic.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Temporary Password</label>
            <div className="relative">
              <input 
                required
                type="text"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-surface-container-low border border-surface-variant rounded-xl p-3 pr-12 outline-none focus:ring-2 focus:ring-primary"
                placeholder="Min 6 characters"
              />
              <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Role</label>
            <select 
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value as Role })}
              className="w-full bg-surface-container-low border border-surface-variant rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="staff">Staff</option>
              <option value="dentist">Dentist</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className="text-red-600 text-sm font-bold text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const HRProfileModal = ({ staff, onClose }: { staff: UserProfile, onClose: () => void }) => {
  const [profile, setProfile] = useState<HRProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<HRProfile>>({});

  useEffect(() => {
    const docRef = doc(db, 'hr_profiles', staff.uid);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as HRProfile;
        setProfile(data);
        setForm(data);
      } else {
        setProfile(null);
        setForm({
          uid: staff.uid,
          baseSalary: 0,
          joiningDate: Timestamp.now(),
          contractType: 'full-time',
          documents: []
        });
      }
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, `hr_profiles/${staff.uid}`));
    return unsubscribe;
  }, [staff.uid]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'hr_profiles', staff.uid), {
        ...form,
        uid: staff.uid,
        updatedAt: Timestamp.now()
      }, { merge: true });
      setEditMode(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `hr_profiles/${staff.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to Firebase Storage. 
      // For this demo, we'll use a data URL for small PDFs or a mock URL.
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc = {
          name: file.name,
          url: reader.result as string,
          uploadedAt: Timestamp.now()
        };
        setForm({ ...form, documents: [...(form.documents || []), newDoc] });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl border border-surface-variant flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-surface-variant flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl">
              {staff.name?.[0]}
            </div>
            <div>
              <h3 className="text-2xl font-headline">{staff.name}</h3>
              <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">{staff.role} Profile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Sparkles className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline text-lg flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Employment Details
                    </h4>
                    {!editMode && (
                      <button onClick={() => setEditMode(true)} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                        <Settings className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Base Salary (Monthly)</label>
                      {editMode ? (
                        <div className="relative">
                          <input 
                            type="number"
                            value={form.baseSalary}
                            onChange={e => setForm({ ...form, baseSalary: Number(e.target.value) })}
                            className="w-full bg-surface-container-low border border-surface-variant rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-primary"
                          />
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-on-surface flex items-center gap-1">
                          <DollarSign className="w-5 h-5 text-primary" />
                          {profile?.baseSalary?.toLocaleString() || '0'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Contract Type</label>
                      {editMode ? (
                        <select 
                          value={form.contractType}
                          onChange={e => setForm({ ...form, contractType: e.target.value as any })}
                          className="w-full bg-surface-container-low border border-surface-variant rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="full-time">Full-Time</option>
                          <option value="part-time">Part-Time</option>
                          <option value="contract">Contract</option>
                        </select>
                      ) : (
                        <div className="text-sm font-bold text-on-surface capitalize">{profile?.contractType || 'Not Set'}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Joining Date</label>
                      {editMode ? (
                        <input 
                          type="date"
                          value={form.joiningDate ? format(form.joiningDate.toDate(), 'yyyy-MM-dd') : ''}
                          onChange={e => setForm({ ...form, joiningDate: Timestamp.fromDate(new Date(e.target.value)) })}
                          className="w-full bg-surface-container-low border border-surface-variant rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <div className="text-sm font-bold text-on-surface">
                          {profile?.joiningDate ? format(profile.joiningDate.toDate(), 'PPP') : 'Not Set'}
                        </div>
                      )}
                    </div>

                    {editMode && (
                      <div className="flex gap-2 pt-2">
                        <button 
                          type="submit"
                          disabled={saving}
                          className="flex-grow bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary-container transition-all"
                        >
                          {saving ? 'Saving...' : 'Save Details'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setEditMode(false); setForm(profile || {}); }}
                          className="px-4 bg-surface-container text-on-surface py-3 rounded-xl font-bold text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Confidential Documents
                    </h4>
                    <label className="bg-surface-container text-primary p-2 rounded-xl cursor-pointer hover:bg-primary/10 transition-all">
                      <Upload className="w-4 h-4" />
                      <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                    </label>
                  </div>

                  <div className="space-y-3">
                    {(form.documents || []).length > 0 ? (
                      (form.documents || []).map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low border border-surface-variant rounded-2xl group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate max-w-[150px]">{doc.name}</div>
                              <div className="text-[10px] text-on-surface-variant">{format(doc.uploadedAt.toDate(), 'MMM d, yyyy')}</div>
                            </div>
                          </div>
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            View PDF
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 border-2 border-dashed border-surface-variant rounded-2xl flex flex-col items-center justify-center text-on-surface-variant text-center px-6">
                        <Lock className="w-8 h-8 mb-2 opacity-10" />
                        <p className="text-xs">No confidential documents uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const DentistDashboard = () => {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'clinical_records'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClinicalRecord)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'clinical_records'));
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline">Clinical Portal</h2>
          <p className="text-on-surface-variant">Patient records, 3D scans, and treatment planning.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-bold text-lg px-2">Recent Records</h3>
          <div className="space-y-2">
            {records.map(r => (
              <button 
                key={r.id}
                onClick={() => setSelectedRecord(r)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all",
                  selectedRecord?.id === r.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-surface-variant hover:border-primary"
                )}
              >
                <div className="font-bold">{format(r.date.toDate(), 'PPP')}</div>
                <div className={cn("text-xs", selectedRecord?.id === r.id ? "text-white/80" : "text-on-surface-variant")}>
                  Patient ID: {r.patientId.slice(0, 8)}...
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedRecord ? (
            <div className="bg-white rounded-[32px] border border-surface-variant p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-2xl">Treatment Notes</h3>
                <div className="flex gap-2">
                  <button className="p-2 bg-surface-container rounded-xl text-primary"><FileText className="w-5 h-5" /></button>
                  <button className="p-2 bg-surface-container rounded-xl text-primary"><Box className="w-5 h-5" /></button>
                </div>
              </div>
              
              <div className="bg-surface-container-low p-6 rounded-2xl text-on-surface leading-relaxed">
                {selectedRecord.notes || 'No clinical notes recorded for this session.'}
              </div>

              <div>
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Box className="w-5 h-5 text-primary" />
                  High-Resolution 3D Scans
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedRecord.scans.map((scan, i) => (
                    <div key={i} className="aspect-video bg-on-surface rounded-2xl flex items-center justify-center relative overflow-hidden group">
                      <img src={scan} alt="3D Scan" className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/30 hover:bg-white/40 transition-all">
                          Open 3D Viewer
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedRecord.scans.length === 0 && (
                    <div className="col-span-2 py-12 border-2 border-dashed border-surface-variant rounded-2xl flex flex-col items-center justify-center text-on-surface-variant">
                      <Upload className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">No scans attached to this record.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-surface-container-low rounded-[32px] border-2 border-dashed border-surface-variant flex flex-col items-center justify-center text-on-surface-variant p-12 text-center">
              <Activity className="w-16 h-16 mb-4 opacity-10" />
              <h3 className="text-xl font-headline mb-2">Select a Record</h3>
              <p className="max-w-xs">Choose a patient record from the list to view clinical notes and imaging history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const Hero = ({ onBook }: { onBook: () => void }) => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070&auto=format&fit=crop" 
          alt="Modern Dental Clinic"
          className="w-full h-full object-cover opacity-10"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full text-primary text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            {t('hero.badge')}
          </div>
          <h1 className="font-headline text-5xl md:text-7xl leading-[1.1] text-on-surface mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-lg text-on-surface-variant mb-10 max-w-lg leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onBook}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-container transition-all flex items-center gap-2 group"
            >
              {t('hero.cta')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-4 px-4">
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-surface-variant">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex text-yellow-500">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <p className="font-semibold text-on-surface">{t('hero.stats')}</p>
              </div>
            </div>
          </div>
        </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative"
      >
        <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl editorial-shadow">
          <img 
            src="https://images.unsplash.com/photo-1606811841660-1b5168c34714?q=80&w=2070&auto=format&fit=crop" 
            alt="Dental Technology"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl max-w-[240px] border border-surface-variant">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-bold text-on-surface">Certified Safety</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            ISO 9001:2015 certified clinical standards and sterilization protocols.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
  );
};

const Stats = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: t('stats.experience'), value: '15+', icon: Award },
            { label: t('stats.doctors'), value: '12', icon: Users },
            { label: t('stats.success'), value: '99.8%', icon: CheckCircle2 },
            { label: t('stats.clinics'), value: '04', icon: MapPin },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-headline text-on-surface mb-1">{stat.value}</div>
              <div className="text-sm text-on-surface-variant font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const { t } = useTranslation();
  const services = [
    {
      title: t('services.smileDesign.title'),
      desc: t('services.smileDesign.desc'),
      icon: Sparkles,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: t('services.implants.title'),
      desc: t('services.implants.desc'),
      icon: Stethoscope,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: t('services.ortho.title'),
      desc: t('services.ortho.desc'),
      icon: HeartPulse,
      color: "bg-rose-50 text-rose-600"
    }
  ];

  return (
    <section className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="font-headline text-4xl md:text-5xl mb-6">{t('services.title')}</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
            {t('services.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[32px] bg-white border border-surface-variant shadow-sm hover:shadow-xl transition-all"
            >
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8", s.color)}>
                <s.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-headline mb-4">{s.title}</h3>
              <p className="text-on-surface-variant leading-relaxed mb-8">{s.desc}</p>
              <button className="text-primary font-bold flex items-center gap-2 group">
                {t('services.learnMore')}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ExpertsScreen = () => {
  const { t } = useTranslation();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'experts'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expert));
      setExperts(data);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'experts'));
    return unsubscribe;
  }, []);

  if (loading) return <div className="pt-32 pb-20 flex items-center justify-center min-h-[50vh]"><Sparkles className="w-8 h-8 animate-spin text-primary" /></div>;

  const displayExperts = experts.length > 0 ? experts : INITIAL_EXPERTS.map((e, i) => ({ ...e, id: `initial-${i}` } as Expert));

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h1 className="font-headline text-5xl mb-4">{t('experts.title')}</h1>
          <p className="text-on-surface-variant text-lg">{t('experts.subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {displayExperts.map((exp, i) => (
            <motion.div 
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="aspect-[3/4] rounded-[32px] overflow-hidden mb-6 shadow-lg">
                <img 
                  src={exp.photoURL || "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2070&auto=format&fit=crop"} 
                  alt={exp.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-2xl font-headline mb-1">{exp.name}</h3>
              <p className="text-primary font-semibold mb-4">{exp.role}</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">{exp.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PortfolioScreen = () => {
  const { t } = useTranslation();
  const cases = [
    {
      title: t('portfolio.cases.makeover.title'),
      desc: t('portfolio.cases.makeover.desc'),
      image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: t('portfolio.cases.alignment.title'),
      desc: t('portfolio.cases.alignment.desc'),
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: t('portfolio.cases.restoration.title'),
      desc: t('portfolio.cases.restoration.desc'),
      image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <h1 className="font-headline text-5xl mb-4">{t('portfolio.title')}</h1>
          <p className="text-on-surface-variant text-lg">{t('portfolio.subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((c, i) => (
            <motion.div 
              key={i}
              className="relative rounded-[40px] overflow-hidden group aspect-square shadow-xl"
            >
              <img 
                src={c.image} 
                alt={c.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-10">
                <h3 className="text-white font-headline text-2xl mb-2">{c.title}</h3>
                <p className="text-white/80">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BookingScreen = () => {
  const { profile, login } = useAuth();
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      login();
      return;
    }
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const type = formData.get('type') as Appointment['type'];
    
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: profile.uid,
        patientName: profile.name,
        dentistId: 'default_dentist',
        dentistName: 'Dr. Sarah Johnson',
        startTime: Timestamp.fromDate(addHours(startOfDay(new Date()), 10)), // Mock time
        endTime: Timestamp.fromDate(addHours(startOfDay(new Date()), 11)),
        type,
        status: 'booked'
      });
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-20 flex items-center justify-center min-h-[80vh]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-12 bg-white rounded-[40px] shadow-2xl max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-headline mb-4">{t('booking.success.title')}</h2>
          <p className="text-on-surface-variant mb-8">
            {t('booking.success.desc')}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold"
          >
            {t('booking.success.back')}
          </button>
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
                <p className="text-on-surface-variant">+1 (555) 000-1234</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Our Location</h4>
                <p className="text-on-surface-variant">123 Clinical Way, Medical District, NY</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Working Hours</h4>
                <p className="text-on-surface-variant">Mon - Sat: 9:00 AM - 8:00 PM</p>
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
              <label className="text-sm font-semibold ml-1">{t('booking.form.service')}</label>
              <select name="type" className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none appearance-none">
                <option value="checkup">General Checkup</option>
                <option value="surgery">Smile Design / Veneers</option>
                <option value="emergency">Emergency Care</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">{t('booking.form.message')}</label>
              <textarea name="message" className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none h-32" placeholder="Tell us about your dental goals..."></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
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

const Footer = ({ logo }: { logo: string | null }) => {
  const { t } = useTranslation();
  return (
    <footer className="bg-inverse-surface text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              {logo ? (
                <img src={logo} alt="Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                  <Sparkles className="w-6 h-6" />
                </div>
              )}
              <span className="font-headline text-xl tracking-tight">Dental Center</span>
            </div>
            <p className="text-white/60 max-w-sm leading-relaxed mb-8">
              {t('footer.desc')}
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">{t('footer.links')}</h4>
            <ul className="space-y-4 text-white/60">
              <li><button onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">{t('nav.home')}</button></li>
              <li><button onClick={() => {/* navigate to experts */}} className="hover:text-white transition-colors">{t('nav.experts')}</button></li>
              <li><button onClick={() => {/* navigate to portfolio */}} className="hover:text-white transition-colors">{t('nav.portfolio')}</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">{t('footer.legal')}</h4>
            <ul className="space-y-4 text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem('app-logo'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface-container-low"><Sparkles className="w-12 h-12 animate-spin text-primary" /></div>;

  if (user && profile?.requiresPasswordChange) {
    return <PasswordChangeModal />;
  }

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar activeScreen={screen} setScreen={setScreen} logo={logo} onOpenSettings={() => setIsSettingsOpen(true)} />
        
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            {screen === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Hero onBook={() => setScreen('booking')} />
                <Stats />
                <Services />
                
                {/* Tech Spotlight Section */}
                <section className="py-32 bg-on-surface text-white overflow-hidden">
                  <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                    <div className="relative">
                      <div className="aspect-square rounded-[40px] overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1606811841660-1b5168c34714?q=80&w=2070&auto=format&fit=crop" 
                          alt="Advanced Tech" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                    </div>
                    <div>
                      <div className="text-primary font-bold mb-4 flex items-center gap-2">
                        <div className="w-8 h-[2px] bg-primary" />
                        {t('tech.badge')}
                      </div>
                      <h2 className="font-headline text-4xl md:text-5xl mb-8 leading-tight">
                        {t('tech.title')}
                      </h2>
                      <p className="text-white/60 text-lg mb-10 leading-relaxed">
                        {t('tech.desc')}
                      </p>
                      <ul className="space-y-4">
                        {(t('tech.items', { returnObjects: true }) as string[]).map((item, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <span className="font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Testimonials */}
                <section className="py-32">
                  <div className="max-w-7xl mx-auto px-6">
                     <div className="text-center mb-20">
                      <h2 className="font-headline text-4xl md:text-5xl mb-6">{t('testimonials.title')}</h2>
                      <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
                        {t('testimonials.subtitle')}
                      </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      {(t('testimonials.items', { returnObjects: true }) as any[]).map((t_item, i) => (
                        <div key={i} className="p-10 bg-surface-container-low rounded-[32px] border border-surface-variant">
                          <div className="flex text-yellow-500 mb-6">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                          </div>
                          <p className="text-lg italic text-on-surface mb-8">"{t_item.text}"</p>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-surface-variant overflow-hidden">
                              <img src={`https://i.pravatar.cc/100?u=${t_item.name}`} alt={t_item.name} referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <div className="font-bold">{t_item.name}</div>
                              <div className="text-xs text-on-surface-variant uppercase tracking-wider">{t_item.role}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 px-6">
                  <div className="max-w-7xl mx-auto bg-primary-gradient rounded-[48px] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
                      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
                    </div>
                    <h2 className="font-headline text-4xl md:text-6xl mb-8 relative z-10">{t('cta.title')}</h2>
                    <p className="text-white/80 text-lg mb-12 max-w-xl mx-auto relative z-10">
                      {t('cta.subtitle')}
                    </p>
                    <button 
                      onClick={() => setScreen('booking')}
                      className="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-all relative z-10"
                    >
                      {t('cta.button')}
                    </button>
                  </div>
                </section>
              </motion.div>
            )}

            {screen === 'experts' && <ExpertsScreen />}
            {screen === 'portfolio' && <PortfolioScreen />}
            {screen === 'booking' && <BookingScreen />}
            
            {screen === 'dashboard' && (
              <div className="pt-32 pb-20 bg-surface-container-low min-h-screen">
                <div className="max-w-7xl mx-auto px-6">
                  {!user ? <Login /> : <DashboardRouter />}
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>

        <Footer logo={logo} />

        {/* Settings Modal */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          logo={logo} 
          setLogo={(l) => {
            setLogo(l);
            if (l) localStorage.setItem('app-logo', l);
            else localStorage.removeItem('app-logo');
          }} 
        />
      </div>
    </AuthProvider>
  );
}

const DashboardRouter = () => {
  const { profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-64"><Sparkles className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!profile) return <div className="text-center p-20">Please sign in to access your dashboard.</div>;

  switch (profile.role) {
    case 'patient': return <PatientDashboard />;
    case 'staff': 
    case 'owner': return <StaffDashboard />;
    case 'dentist':
    case 'admin': return <DentistDashboard />;
    default: return <PatientDashboard />;
  }
};

// --- Auth Components ---

const Login = () => {
  const { login, loginWithEmail, isLoggingIn } = useAuth();
  const { t } = useTranslation();
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('login.title')}</h2>
          <p className="mt-2 text-gray-600">{t('login.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {isEmailLogin ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {isLoggingIn ? <Sparkles className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setIsEmailLogin(false)}
              className="w-full text-sm text-blue-600 hover:underline"
            >
              Back to Google Login
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {isLoggingIn ? (
                <Sparkles className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              )}
              {t('login.google_button')}
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div>
            </div>
            <button
              onClick={() => setIsEmailLogin(true)}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              Sign in with Email
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const PasswordChangeModal = () => {
  const { updatePass } = useAuth();
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setError('Passwords do not match');
      return;
    }
    if (newPass.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await updatePass(newPass);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
        <p className="text-gray-600 mb-6">For security, you must change your temporary password on your first login.</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, logo, setLogo }: { isOpen: boolean, onClose: () => void, logo: string | null, setLogo: (l: string | null) => void }) => {
  const { profile } = useAuth();
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRoleChange = async (role: Role) => {
    if (!profile) return;
    try {
      await setDoc(doc(db, 'users', profile.uid), { role }, { merge: true });
      window.location.reload(); // Refresh to apply role changes
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-headline">App Settings</h2>
              <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold mb-4">Clinic Logo</label>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-surface-container rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-surface-variant">
                    {logo ? (
                      <img src={logo} alt="Current Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-primary"><Sparkles className="w-10 h-10" /></div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-primary-container transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload New
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    {logo && (
                      <button onClick={() => setLogo(null)} className="text-red-500 text-sm font-bold flex items-center gap-2 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {profile && (
                <div>
                  <label className="block text-sm font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Debug: Switch Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['patient', 'staff', 'dentist'] as Role[]).map(r => (
                      <button 
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold border transition-all",
                          profile.role === r ? "bg-primary text-white border-primary" : "bg-white border-surface-variant hover:border-primary"
                        )}
                      >
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-2 italic">
                    * Role switching is for demonstration purposes. In production, roles are managed by admins.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-12 pt-6 border-t border-surface-variant">
              <button onClick={onClose} className="w-full bg-surface-container text-on-surface py-4 rounded-2xl font-bold hover:bg-surface-container-high transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
