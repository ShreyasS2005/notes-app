"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { documentService } from "@/services/documentService";
import { uploadFile, deleteFile } from "@/services/storageService";
import OCRScanner from "@/components/OCRScanner";
import DocumentWorkspace from "@/components/DocumentWorkspace";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Trash2,
  Search,
  Clock,
  FileUp,
  Loader2,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('list'); // list, scanner, workspace
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsubscribe = documentService.subscribeToDocuments(user.uid, (fetchedDocs) => {
      setDocuments(fetchedDocs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleExtract = async (text, title, file) => {
    try {
      let fileUrl = null;
      let storagePath = null;

      if (file) {
        storagePath = `users/${user.uid}/documents/${Date.now()}_${file.name}`;
        fileUrl = await uploadFile(storagePath, file);
      }

      const newDoc = {
        title,
        text,
        userId: user.uid,
        fileUrl,
        storagePath
      };

      const savedDoc = await documentService.saveDocument(user.uid, newDoc);
      setSelectedDoc({ id: savedDoc.id, ...newDoc });
      setActiveView('workspace');
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save document intelligence.");
    }
  };

  const handleDelete = async (e, doc) => {
    e.stopPropagation();
    if (confirm('Delete this document and its associated data?')) {
      try {
        if (doc.storagePath) {
          await deleteFile(doc.storagePath);
        }
        await documentService.deleteDocument(user.uid, doc.id);
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document fully.");
      }
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050505] pt-16">
        <AnimatePresence mode="wait">
          {activeView === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">
                    Document <span className="text-cyan-500">Vault</span>
                  </h1>
                  <p className="text-gray-500 font-medium">Extract intelligence from physical and digital assets.</p>
                </div>
                <button
                  onClick={() => setActiveView('scanner')}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
                >
                  <Plus className="w-6 h-6" />
                  New Document
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Search & Stats */}
                <div className="space-y-6">
                  <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles className="w-12 h-12 text-cyan-500" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-500 mb-2">Total Intelligence</h3>
                    <p className="text-3xl font-black text-white">{documents.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Processed documents</p>
                  </div>

                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search Vault..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-200 outline-none focus:border-cyan-500/50 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Document Grid */}
                <div className="lg:col-span-3">
                  {filteredDocs.length === 0 ? (
                    <div className="h-64 glass rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center p-8">
                      <FileUp className="w-12 h-12 text-gray-700 mb-4" />
                      <h3 className="text-lg font-bold text-gray-500">No documents found</h3>
                      <p className="text-sm text-gray-600 mt-2">Start by uploading a PDF or scanning a page.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredDocs.map(doc => (
                        <motion.div
                          key={doc.id}
                          layoutId={doc.id}
                          onClick={() => {
                            setSelectedDoc(doc);
                            setActiveView('workspace');
                          }}
                          className="group glass p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
                              <FileText className="w-6 h-6" />
                            </div>
                            <button
                              onClick={(e) => handleDelete(e, doc)}
                              className="p-2 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-cyan-400 transition-colors">
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {doc.createdAt ? formatDistanceToNow(doc.createdAt.toDate(), { addSuffix: true }) : 'Recently'}
                              </div>
                              <div className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-black uppercase tracking-tighter">
                                {doc.text?.split(' ').length || 0} Words
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'scanner' && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto px-4 py-24"
            >
              <div className="mb-12 text-center">
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                  Initialize <span className="text-cyan-500">Capture</span>
                </h2>
                <p className="text-gray-500">Select an input source to begin AI processing.</p>
              </div>
              <OCRScanner onExtract={handleExtract} />
              <div className="mt-12 text-center">
                <button
                  onClick={() => setActiveView('list')}
                  className="text-sm font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Back to Vault
                </button>
              </div>
            </motion.div>
          )}

          {activeView === 'workspace' && selectedDoc && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[calc(100vh-64px)]"
            >
              <DocumentWorkspace
                text={selectedDoc.text}
                title={selectedDoc.title}
                fileUrl={selectedDoc.fileUrl}
                onBack={() => setActiveView('list')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
