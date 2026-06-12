import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  getDocs,
  setDoc,
  arrayUnion
} from "firebase/firestore";
import { getGeminiResponse } from "./geminiService";

export const collaborationService = {
  // Shared Workspaces / Rooms
  createRoom: async (userId, roomData) => {
    const roomsRef = collection(db, "rooms");
    return await addDoc(roomsRef, {
      ...roomData,
      ownerId: userId,
      members: [userId],
      sharedNote: {
        title: "Collaborative Note",
        content: "<h1>Welcome to your shared workspace!</h1><p>Start collaborating in real-time.</p>",
        lastUpdatedBy: userId
      },
      sharedQuiz: null,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });
  },

  subscribeToRooms: (userId, callback) => {
    const roomsRef = collection(db, "rooms");
    const q = query(roomsRef, where("members", "array-contains", userId), orderBy("lastActive", "desc"));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  },

  subscribeToRoom: (roomId, callback) => {
    const roomRef = doc(db, "rooms", roomId);
    return onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  },

  updateSharedNote: async (roomId, userId, updates) => {
    const roomRef = doc(db, "rooms", roomId);
    return await updateDoc(roomRef, {
      "sharedNote.content": updates.content,
      "sharedNote.title": updates.title,
      "sharedNote.lastUpdatedBy": userId,
      lastActive: serverTimestamp()
    });
  },

  generateSharedQuiz: async (roomId, noteContent) => {
    const prompt = `Generate a 5-question multiple choice quiz based on these notes: ${noteContent}.
    Return ONLY a JSON array of objects with fields: question, options (array of 4), correctAnswer (string), explanation.`;

    try {
      const response = await getGeminiResponse(prompt);
      // Clean up the response to ensure it's valid JSON
      const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const quizQuestions = JSON.parse(jsonStr);

      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        sharedQuiz: {
          title: "Team Challenge",
          questions: quizQuestions,
          generatedAt: new Date().toISOString()
        },
        lastActive: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Failed to generate shared quiz:", error);
      throw error;
    }
  },

  inviteUserByEmail: async (roomId, email) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) throw new Error("User not found in SmartNotes AI database.");

    const userToInvite = snapshot.docs[0].id;
    const roomRef = doc(db, "rooms", roomId);
    return await updateDoc(roomRef, {
      members: arrayUnion(userToInvite)
    });
  },

  // Real-time Presence
  updatePresence: async (roomId, userId, presenceData) => {
    const presenceRef = doc(db, "rooms", roomId, "presence", userId);
    return await setDoc(presenceRef, {
      ...presenceData,
      lastSeen: serverTimestamp()
    }, { merge: true });
  },

  subscribeToPresence: (roomId, callback) => {
    const presenceRef = collection(db, "rooms", roomId, "presence");
    return onSnapshot(presenceRef, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() })));
    });
  },

  // Collaborative Comments
  addComment: async (roomId, userId, text, userName) => {
    const commentsRef = collection(db, "rooms", roomId, "messages");
    return await addDoc(commentsRef, {
      userId,
      userName,
      text,
      timestamp: serverTimestamp()
    });
  },

  subscribeToComments: (roomId, callback) => {
    const commentsRef = collection(db, "rooms", roomId, "messages");
    const q = query(commentsRef, orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
};
