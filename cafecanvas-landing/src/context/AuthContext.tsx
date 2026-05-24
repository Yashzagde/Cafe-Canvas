"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  membershipPlan: string | null;
  onboarded: boolean;
  onboardingDetails: OnboardingDetails | null;
  createdAt: string;
}

export interface OnboardingDetails {
  businessName: string;
  businessType: string;
  ownerName: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: string;
  cityState: string;
  outletsCount: number;
  staffSize: number;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, plan: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (plan?: string) => Promise<void>;
  loginWithGoogleRedirect: (plan?: string) => Promise<void>;
  logout: () => Promise<void>;
  submitOnboarding: (details: OnboardingDetails) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create profile in Firestore
  const fetchProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Document doesn't exist, which can happen if someone registers in a different flow
        // Create a default profile
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || null,
          membershipPlan: "Starter",
          onboarded: false,
          onboardingDetails: null,
          createdAt: new Date().toISOString(),
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    // Check if we have a redirect result when mounting
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const firebaseUser = result.user;
          const savedPlan = typeof window !== "undefined" ? localStorage.getItem("pending_membership_plan") || "Starter" : "Starter";
          if (typeof window !== "undefined") {
            localStorage.removeItem("pending_membership_plan");
          }

          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || null,
              membershipPlan: savedPlan,
              onboarded: false,
              onboardingDetails: null,
              createdAt: new Date().toISOString(),
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          } else {
            const existingData = docSnap.data();
            if (savedPlan && existingData.membershipPlan !== savedPlan) {
              await updateDoc(docRef, { membershipPlan: savedPlan });
              setProfile({
                ...existingData,
                membershipPlan: savedPlan,
              } as UserProfile);
            } else {
              setProfile(existingData as UserProfile);
            }
          }
        }
      } catch (error) {
        console.error("Error handling Google Sign-In redirect:", error);
      }
    };

    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string, plan: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: null,
        membershipPlan: plan,
        onboarded: false,
        onboardingDetails: null,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newProfile);
      setProfile(newProfile);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async (plan?: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || null,
          membershipPlan: plan || "Starter",
          onboarded: false,
          onboardingDetails: null,
          createdAt: new Date().toISOString(),
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      } else {
        const existingData = docSnap.data();
        // If a new plan is requested during login, update the plan
        if (plan && existingData.membershipPlan !== plan) {
          await updateDoc(docRef, { membershipPlan: plan });
          setProfile({
            ...existingData,
            membershipPlan: plan,
          } as UserProfile);
        } else {
          setProfile(existingData as UserProfile);
        }
      }
    } catch (error: any) {
      if (error && error.code === "auth/popup-blocked") {
        console.warn("Google popup blocked. Falling back to redirect sign-in...");
        await loginWithGoogleRedirect(plan);
        return;
      }
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogleRedirect = async (plan?: string) => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        if (plan) {
          localStorage.setItem("pending_membership_plan", plan);
        } else {
          localStorage.removeItem("pending_membership_plan");
        }
      }
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const submitOnboarding = async (details: OnboardingDetails) => {
    if (!user) throw new Error("No authenticated user found.");
    
    try {
      const docRef = doc(db, "users", user.uid);
      const updates = {
        onboarded: true,
        onboardingDetails: details,
      };

      await updateDoc(docRef, updates);

      if (profile) {
        setProfile({
          ...profile,
          onboarded: true,
          onboardingDetails: details,
        });
      }
    } catch (error) {
      console.error("Error submitting onboarding details:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUpWithEmail,
        loginWithEmail,
        loginWithGoogle,
        loginWithGoogleRedirect,
        logout,
        submitOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
