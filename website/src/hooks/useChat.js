import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { aiService } from '../services/aiService';

export const useChat = (userId, mode = 'STUDY') => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const chatsRef = collection(db, 'users', userId, 'chats');
    const q = query(chatsRef, orderBy('timestamp', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [userId]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim() || !userId) return;

    const chatsRef = collection(db, 'users', userId, 'chats');

    try {
      // 1. Add User Message to Firestore
      await addDoc(chatsRef, {
        text,
        isUser: true,
        timestamp: serverTimestamp(),
      });

      setIsTyping(true);

      // 2. Get AI Response
      // We pass the current messages + the new one to the AI service
      const history = [...messages, { text, isUser: true }];
      const aiResponse = await aiService.getChatResponse(history, mode);

      // 3. Add AI Message to Firestore
      await addDoc(chatsRef, {
        text: aiResponse,
        isUser: false,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Chat Error:', error);
      // Optional: Add error message to chat
      await addDoc(chatsRef, {
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: serverTimestamp(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, sendMessage, isTyping, chatEndRef };
};
