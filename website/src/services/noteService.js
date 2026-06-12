import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { userService } from "./userService";

export const noteService = {
  // Create a new note
  createNote: async (userId, noteData = {}) => {
    const notesRef = collection(db, "users", userId, "notes");
    const newNote = {
      title: noteData.title || "Untitled Note",
      content: noteData.content || "",
      tags: noteData.tags || [],
      favorite: noteData.favorite || false,
      folder: noteData.folder || "All",
      reminderAt: noteData.reminderAt || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(notesRef, newNote);

    // Reward XP for creating a note
    await userService.addXp(userId, 50);

    return docRef;
  },

  // Update a note
  updateNote: async (userId, noteId, updates) => {
    const paths = [
      doc(db, "users", userId, "notes", noteId),
      doc(db, "user", userId, "notes", noteId)
    ];

    const updatePromises = paths.map(ref =>
      updateDoc(ref, {
        ...updates,
        updatedAt: serverTimestamp(),
      }).catch(() => {/* ignore if path doesn't exist */})
    );

    return Promise.all(updatePromises);
  },

  // Delete a note
  deleteNote: async (userId, noteId) => {
    const paths = [
      doc(db, "users", userId, "notes", noteId),
      doc(db, "user", userId, "notes", noteId)
    ];
    return Promise.all(paths.map(ref => deleteDoc(ref).catch(() => {})));
  },

  // Subscribe to notes
  subscribeToNotes: (userId, callback) => {
    const resultsMap = new Map();

    const processSnapshot = (snapshot, pathName) => {
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        resultsMap.set(doc.id, {
          id: doc.id,
          ...data,
          title: data.title || data.name || data.subject || data.header || "Untitled Note",
          content: data.content || data.text || data.body || data.note || data.description || "",
          updatedAt: data.updatedAt || data.timestamp || data.lastModified || data.createdAt || data.time || null,
          sourcePath: pathName
        });
      });

      const sortedNotes = Array.from(resultsMap.values()).sort((a, b) => {
        const getTime = (val) => {
          if (!val) return 0;
          if (val.seconds) return val.seconds;
          if (typeof val === 'number') return val > 10000000000 ? val / 1000 : val;
          return 0;
        };
        return getTime(b.updatedAt) - getTime(a.updatedAt);
      });

      callback(sortedNotes);
    };

    const unsub1 = onSnapshot(collection(db, "users", userId, "notes"), (s) => processSnapshot(s, 'users'));
    const unsub2 = onSnapshot(collection(db, "user", userId, "notes"), (s) => processSnapshot(s, 'user'));

    return () => {
      unsub1();
      unsub2();
    };
  },

  // Toggle favorite
  toggleFavorite: async (userId, noteId, currentStatus) => {
    return noteService.updateNote(userId, noteId, { favorite: !currentStatus });
  },

  // Set Reminder
  setReminder: async (userId, noteId, reminderAt) => {
    return noteService.updateNote(userId, noteId, { reminderAt });
  }
};
