import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from './types/auth';
import { isSuperAdminEmail, getTodayDateString } from './utils/authStorage';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isPro: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  isPro: false,
  isAdmin: false,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSyncProfile = async (fbUser: User) => {
    const emailNorm = (fbUser.email || '').trim().toLowerCase();
    if (!emailNorm) return;

    const isAdmin = isSuperAdminEmail(emailNorm);
    const today = getTodayDateString();

    try {
      const userRef = doc(db, 'users', emailNorm);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const proStatus = isAdmin || Boolean(data.isPro) || data.role === 'admin' || data.role === 'pro';
        setUserProfile((prev) => ({
          id: data.id || fbUser.uid,
          name: data.name || fbUser.displayName || emailNorm.split('@')[0] || 'User',
          email: emailNorm,
          avatarUrl: data.avatarUrl || fbUser.photoURL || undefined,
          companyName: data.companyName,
          role: isAdmin ? 'admin' : (proStatus ? 'pro' : 'user'),
          isPro: proStatus,
          dailyInvoicesCount: data.invoicesToday ?? 0,
          lastInvoiceDate: data.lastInvoiceDate || today,
          createdAt: data.joinedDate || today,
          customWatermark: data.customWatermark,
          proProfile: data.proProfile,
        }));
      }
    } catch (err) {
      console.warn('fetchAndSyncProfile warning:', err);
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      setFirebaseUser(fbUser);

      if (!fbUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const emailNorm = (fbUser.email || '').trim().toLowerCase();
      const isAdmin = isSuperAdminEmail(emailNorm);
      const today = getTodayDateString();

      // Default base profile for immediate UI response
      const baseProfile: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || emailNorm.split('@')[0] || 'User',
        email: emailNorm,
        avatarUrl: fbUser.photoURL || undefined,
        role: isAdmin ? 'admin' : 'user',
        isPro: isAdmin,
        dailyInvoicesCount: 0,
        lastInvoiceDate: today,
        createdAt: today,
      };

      setUserProfile(baseProfile);
      setLoading(false);

      if (!emailNorm) return;

      const userDocRef = doc(db, 'users', emailNorm);

      // Listen in real-time to user's record in Firestore!
      unsubscribeSnapshot = onSnapshot(
        userDocRef,
        async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const proStatus = isAdmin || Boolean(data.isPro) || data.role === 'admin' || data.role === 'pro';

            setUserProfile((prev) => ({
              ...(prev || baseProfile),
              id: data.id || fbUser.uid,
              name: data.name || prev?.name || baseProfile.name,
              companyName: data.companyName || prev?.companyName,
              avatarUrl: data.avatarUrl || prev?.avatarUrl || baseProfile.avatarUrl,
              role: isAdmin ? 'admin' : (proStatus ? 'pro' : 'user'),
              isPro: proStatus,
              dailyInvoicesCount: data.invoicesToday ?? prev?.dailyInvoicesCount ?? 0,
              lastInvoiceDate: data.lastInvoiceDate || today,
              customWatermark: data.customWatermark || prev?.customWatermark,
              proProfile: data.proProfile || prev?.proProfile,
            }));
          } else {
            // Document does not exist yet: create user doc in Firestore
            try {
              await setDoc(
                userDocRef,
                {
                  id: fbUser.uid,
                  email: emailNorm,
                  name: baseProfile.name,
                  role: isAdmin ? 'admin' : 'user',
                  isPro: isAdmin,
                  joinedDate: today,
                  lastLoginTime: new Date().toISOString(),
                  totalInvoicesCount: 0,
                  invoicesToday: 0,
                  lastInvoiceDate: today,
                  avatarUrl: fbUser.photoURL || '',
                },
                { merge: true }
              );
            } catch (err) {
              console.warn('Create user profile notice:', err);
            }
          }
        },
        (error) => {
          console.warn('Real-time Firestore user subscription notice:', error);
        }
      );
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  const isAdmin = isSuperAdminEmail(userProfile?.email);
  const isPro = Boolean(userProfile?.isPro || isAdmin);

  return (
    <AuthContext.Provider
      value={{
        user: userProfile,
        firebaseUser,
        loading,
        isPro,
        isAdmin,
        refreshProfile: async () => {
          if (firebaseUser) await fetchAndSyncProfile(firebaseUser);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
