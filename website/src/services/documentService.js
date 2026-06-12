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
  serverTimestamp
} from "firebase/firestore";

export const documentService = {
  subscribeToDocuments: (userId, callback) => {
    const docsRef = collection(db, "users", userId, "documents");

    // We remove the server-side orderBy to ensure documents from the mobile app
    // appear even if they use different timestamp field names.
    return onSnapshot(docsRef, (snapshot) => {
      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort locally by whatever date field is available
      const sortedDocs = documents.sort((a, b) => {
        const timeA = a.createdAt?.seconds || a.timestamp?.seconds || 0;
        const timeB = b.createdAt?.seconds || b.timestamp?.seconds || 0;
        return timeB - timeA;
      });

      callback(sortedDocs);
    });
  },

  saveDocument: async (userId, docData) => {
    const docsRef = collection(db, "users", userId, "documents");
    return await addDoc(docsRef, {
      ...docData,
      createdAt: serverTimestamp(),
    });
  },

  deleteDocument: async (userId, docId) => {
    const docRef = doc(db, "users", userId, "documents", docId);
    return await deleteDoc(docRef);
  }
};
