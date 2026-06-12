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
  getDocs,
  where
} from "firebase/firestore";

export const studyPlannerService = {
  // Tasks / Goals - Enhanced with Deep Sync
  subscribeToTasks: (userId, callback) => {
    const resultsMap = new Map();
    // Support multiple collection names and paths
    const paths = [
      collection(db, "users", userId, "studyGoals"),
      collection(db, "user", userId, "studyGoals"),
      collection(db, "users", userId, "planner"),
      collection(db, "user", userId, "planner")
    ];

    const unsubs = paths.map(colRef => {
      return onSnapshot(colRef, (snapshot) => {
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          resultsMap.set(doc.id, {
            id: doc.id,
            ...data,
            title: data.title || data.name || data.task || "Untitled Goal",
            deadline: data.deadline || data.date || data.due || data.timestamp || new Date().toISOString(),
            type: data.type || "Study",
            completed: data.completed || false
          });
        });

        const sortedTasks = Array.from(resultsMap.values()).sort((a, b) => {
          return new Date(a.deadline) - new Date(b.deadline);
        });

        callback(sortedTasks);
      }, (err) => console.warn(`Planner sync warning for ${colRef.path}:`, err));
    });

    return () => unsubs.forEach(u => u());
  },

  addTask: async (userId, taskData) => {
    const tasksRef = collection(db, "users", userId, "studyGoals");
    return await addDoc(tasksRef, {
      ...taskData,
      completed: false,
      createdAt: serverTimestamp(),
    });
  },

  updateTask: async (userId, taskId, updates) => {
    const paths = [
      doc(db, "users", userId, "studyGoals", taskId),
      doc(db, "user", userId, "studyGoals", taskId),
      doc(db, "users", userId, "planner", taskId),
      doc(db, "user", userId, "planner", taskId)
    ];

    const promises = paths.map(ref => updateDoc(ref, updates).catch(() => {}));
    return Promise.all(promises);
  },

  deleteTask: async (userId, taskId) => {
    const paths = [
      doc(db, "users", userId, "studyGoals", taskId),
      doc(db, "user", userId, "studyGoals", taskId),
      doc(db, "users", userId, "planner", taskId),
      doc(db, "user", userId, "planner", taskId)
    ];
    const promises = paths.map(ref => deleteDoc(ref).catch(() => {}));
    return Promise.all(promises);
  },

  // Focus Sessions
  saveFocusSession: async (userId, sessionData) => {
    const sessionsRef = collection(db, "users", userId, "focusSessions");
    return await addDoc(sessionsRef, {
      ...sessionData,
      timestamp: serverTimestamp(),
    });
  },

  getFocusStats: async (userId) => {
    const paths = [
      collection(db, "users", userId, "focusSessions"),
      collection(db, "user", userId, "focusSessions")
    ];

    let results = [];
    for (const p of paths) {
      const snap = await getDocs(p).catch(() => ({docs: []}));
      snap.docs.forEach(d => results.push(d.data()));
    }
    return results;
  }
};
