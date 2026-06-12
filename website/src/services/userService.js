import { db } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

export const userService = {
  // Get or initialize user profile
  getUserProfile: async (userId, displayName) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      // Initialize new user profile
      const newProfile = {
        uid: userId,
        displayName: displayName || "Scholar",
        xp: 0,
        level: 1,
        streak: 0,
        lastActivity: serverTimestamp(),
        badges: ["Novice"],
        totalNotes: 0,
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  },

  // Subscribe to profile changes
  subscribeToProfile: (userId, callback) => {
    return onSnapshot(doc(db, "users", userId), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  },

  // Add XP and handle leveling
  addXp: async (userId, amount) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const newXp = (data.xp || 0) + amount;
    const nextLevelThreshold = data.level * 1000;

    let updates = {
      xp: increment(amount),
      lastActivity: serverTimestamp()
    };

    // Level up logic
    if (newXp >= nextLevelThreshold) {
      updates.level = increment(1);
      // Optional: Add level-up badge
      if (data.level + 1 === 5) updates.badges = [...data.badges, "Dedicated"];
      if (data.level + 1 === 10) updates.badges = [...data.badges, "Elite"];
    }

    await updateDoc(userRef, updates);
  },

  // Update Streak
  updateStreak: async (userId) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const now = new Date();
    const lastActivity = data.lastActivity?.toDate();

    if (!lastActivity) {
      await updateDoc(userRef, { streak: 1, lastActivity: serverTimestamp() });
      return;
    }

    const diffInDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

    if (diffInDays === 1) {
      // Streak continues
      await updateDoc(userRef, { streak: increment(1), lastActivity: serverTimestamp() });
    } else if (diffInDays > 1) {
      // Streak broken
      await updateDoc(userRef, { streak: 1, lastActivity: serverTimestamp() });
    }
  }
};
