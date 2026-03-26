/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import PlantGrid from './components/PlantGrid';
import AddPlantForm from './components/AddPlantForm';
import PlantDetails from './components/PlantDetails';
import AuthStatus from './components/AuthStatus';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, deleteDoc, getDocFromServer } from 'firebase/firestore';
import { Plus, Leaf, Database, AlertTriangle } from 'lucide-react';
import { seedDatabase } from './services/seedService';
import { Plant } from './types';

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [viewingPlant, setViewingPlant] = useState<Plant | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connection test successful.");
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client appears to be offline.");
          setSeedFeedback("Firebase connection error. Check console.");
        }
      }
    }
    testConnection();
  }, []);

  const handleSeed = async () => {
    console.log("Seed button clicked");
    setSeeding(true);
    try {
      console.log("Starting seed process...");
      const message = await seedDatabase();
      console.log("Seed response:", message);
      // We'll use a simple state to show feedback instead of alert
      setSeedFeedback(message);
      setTimeout(() => setSeedFeedback(null), 5000);
    } catch (error) {
      console.error("Seed error:", error);
      setSeedFeedback("Error seeding database. Check console.");
      setTimeout(() => setSeedFeedback(null), 5000);
    } finally {
      setSeeding(false);
    }
  };

  const [seedFeedback, setSeedFeedback] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'plants', id));
      setSeedFeedback("Entry deleted successfully.");
      setTimeout(() => setSeedFeedback(null), 3000);
    } catch (error) {
      console.error("Delete error:", error);
      setSeedFeedback("Error deleting entry.");
      setTimeout(() => setSeedFeedback(null), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-ink font-sans">
      {/* Feedback Toast */}
      {seedFeedback && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-ink text-background px-8 py-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4">
            <Database className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">{seedFeedback}</span>
          </div>
          <button onClick={() => setSeedFeedback(null)} className="text-[10px] font-bold uppercase tracking-widest hover:opacity-50">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-ink">
        <div className="max-w-[1440px] mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-ink flex items-center justify-center">
              <Leaf className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter">FloraTracker</h1>
              <p className="label-micro !mb-0">Local Ecosystem Database</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <AuthStatus />
            {user && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="swiss-button"
                  title="Import Doc Data"
                >
                  <Database className="w-4 h-4" />
                  <span>{seeding ? 'Importing' : 'Seed Data'}</span>
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="swiss-button bg-ink text-background"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Plant</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-8 border-b border-ink">
        <div className="max-w-[1440px] mx-auto">
          <div className="max-w-3xl">
            <h2 className="text-[10vw] md:text-[80px] font-black leading-[0.9] tracking-tighter mb-8">
              Catalog your <br />
              <span className="text-ink opacity-40">local flora.</span>
            </h2>
            <p className="text-lg font-medium max-w-xl leading-relaxed opacity-60">
              A community-driven database for tracking native and invasive species. 
              Objective mapping of local biodiversity.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-8 py-16">
        <PlantGrid 
          onEdit={user ? (plant) => {
            setEditingPlant(plant);
            setShowForm(true);
          } : undefined} 
          onDelete={user ? (id) => setDeletingId(id) : undefined}
          onViewDetails={(plant) => setViewingPlant(plant)}
        />
      </main>

      {/* Mobile FAB - Hidden in Swiss style if possible, or made very minimal */}
      {user && (
        <button
          onClick={() => setShowForm(true)}
          className="sm:hidden fixed bottom-8 right-8 w-16 h-16 bg-ink text-background shadow-none flex items-center justify-center active:scale-95 z-40"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      {/* Modal */}
      {showForm && (
        <AddPlantForm 
          plant={editingPlant || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingPlant(null);
          }} 
          onSuccess={() => {
            setSeedFeedback(editingPlant ? "Entry updated successfully." : "New entry added successfully.");
            setTimeout(() => setSeedFeedback(null), 3000);
          }}
        />
      )}

      {/* Details Modal */}
      {viewingPlant && (
        <PlantDetails 
          plant={viewingPlant}
          onClose={() => setViewingPlant(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-ink py-16 px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <h3 className="text-lg font-black mb-4">FloraTracker</h3>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">© 2026 Local Flora Tracker Project</p>
          </div>
          <div className="flex gap-16">
            <div>
              <p className="label-micro">System</p>
              <ul className="text-xs font-bold uppercase tracking-widest space-y-2">
                <li><a href="#" className="hover:opacity-50">Status</a></li>
                <li><a href="#" className="hover:opacity-50">Database</a></li>
              </ul>
            </div>
            <div>
              <p className="label-micro">Legal</p>
              <ul className="text-xs font-bold uppercase tracking-widest space-y-2">
                <li><a href="#" className="hover:opacity-50">Privacy</a></li>
                <li><a href="#" className="hover:opacity-50">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-8">
          <div className="bg-background border border-ink p-8 max-w-md w-full space-y-8">
            <div className="flex items-center gap-4 text-error">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-2xl font-black tracking-tighter uppercase">Confirm Deletion</h3>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest leading-relaxed opacity-60">
              Are you sure you want to remove this species from the database? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 swiss-button"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deletingId)}
                className="flex-1 swiss-button-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
