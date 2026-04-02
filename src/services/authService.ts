import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

const provider = new GoogleAuthProvider();

export const authService = {
  async signIn() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create default profile for first-time login
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || 'User',
          role: user.email === 'the.tulba@gmail.com' ? 'admin' : 'receptionist',
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', user.uid), profile);
        return profile;
      }
      return userDoc.data() as UserProfile;
    } catch (error) {
      console.error('Auth Error:', error);
      throw error;
    }
  },

  async signOut() {
    await signOut(auth);
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async getUserProfile(uid: string) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
  }
};
