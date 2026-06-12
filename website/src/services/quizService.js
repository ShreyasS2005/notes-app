import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { userService } from "./userService";

export const quizService = {
  // Save quiz result and award XP
  saveQuizResult: async (userId, resultData) => {
    const resultsRef = collection(db, "users", userId, "quizzes");

    // Calculate XP based on score
    const xpEarned = Math.floor((resultData.score / resultData.totalQuestions) * 200);

    await userService.addXp(userId, xpEarned);

    return await addDoc(resultsRef, {
      ...resultData,
      xpEarned,
      timestamp: serverTimestamp(),
    });
  },

  // Get quiz history
  getQuizHistory: async (userId) => {
    const resultsRef = collection(db, "users", userId, "quizzes");
    const snapshot = await getDocs(resultsRef);
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return results.sort((a, b) => {
      const timeA = a.timestamp?.seconds || a.createdAt?.seconds || 0;
      const timeB = b.timestamp?.seconds || b.createdAt?.seconds || 0;
      return timeB - timeA;
    }).slice(0, 20);
  },

  // Save flashcards
  saveFlashcards: async (userId, noteId, flashcards) => {
    const flashcardsRef = collection(db, "users", userId, "flashcards");

    // Reward XP for generating flashcards
    await userService.addXp(userId, 30);

    return await addDoc(flashcardsRef, {
      noteId,
      flashcards,
      createdAt: serverTimestamp(),
    });
  },

  // Get leaderboards (Mocked for now, but could be real from Firestore)
  getLeaderboard: async () => {
    return [
      { name: "NeonRider", xp: 12500, rank: 1 },
      { name: "CyberSage", xp: 11200, rank: 2 },
      { name: "LogicGamer", xp: 9800, rank: 3 },
      { name: "AlphaDev", xp: 8500, rank: 4 },
    ];
  }
};
