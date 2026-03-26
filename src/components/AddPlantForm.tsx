/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db, storage, auth } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plant, PlantStatus } from '../types';
import { Camera, Loader2, X, AlertTriangle } from 'lucide-react';

interface AddPlantFormProps {
  onClose: () => void;
  onSuccess: () => void;
  plant?: Plant;
}

export default function AddPlantForm({ onClose, onSuccess, plant }: AddPlantFormProps) {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(plant?.imageUrl || null);
  const [formData, setFormData] = useState({
    commonName: plant?.commonName || '',
    scientificName: plant?.scientificName || '',
    status: plant?.status || PlantStatus.KEEP,
    edibility: plant?.edibility || '',
    culinaryUses: plant?.culinaryUses || '',
    medicinalBenefits: plant?.medicinalBenefits || '',
    petToxicity: plant?.petToxicity || '',
    permacultureFunction: plant?.permacultureFunction || '',
    managementNotes: plant?.managementNotes || '',
  });

  const [error, setError] = useState<string | null>(null);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Could not get canvas context');
          
          ctx.drawImage(img, 0, 0, width, height);
          // 0.7 quality provides a good balance between size and clarity
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (err) => reject('Image load error');
      };
      reader.onerror = (err) => reject('File read error');
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (10MB limit for raw upload, will be resized anyway)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size exceeds 10MB limit.');
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!auth.currentUser) {
      setError('You must be logged in to perform this action.');
      return;
    }
    if (!image && !plant) {
      setError('Please upload an image.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = plant?.imageUrl || '';

      // 1. Process and "Upload" Image (only if a new one is selected)
      if (image) {
        console.log('Processing image for database storage...');
        imageUrl = await resizeImage(image);
        console.log('Image processed successfully');
      }

      // 2. Save to Firestore
      console.log('Saving to Firestore...', plant?.id ? 'Updating' : 'Adding');
      
      const firestoreTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out after 20 seconds')), 20000)
      );

      if (plant?.id) {
        const plantRef = doc(db, 'plants', plant.id);
        const updatePromise = updateDoc(plantRef, {
          ...formData,
          imageUrl,
          updatedAt: Date.now(),
        });
        await Promise.race([updatePromise, firestoreTimeout]);
        console.log('Firestore update complete');
      } else {
        const addPromise = addDoc(collection(db, 'plants'), {
          ...formData,
          imageUrl,
          createdAt: Date.now(),
          authorUid: auth.currentUser.uid,
          authorName: auth.currentUser.displayName || 'Anonymous',
        });
        await Promise.race([addPromise, firestoreTimeout]);
        console.log('Firestore addition complete');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving plant:', err);
      setError(`Failed to save plant: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/20 backdrop-blur-sm p-0 sm:p-8">
      <div className="relative w-full max-w-4xl bg-background border border-ink flex flex-col my-auto min-h-screen sm:min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-ink shrink-0 bg-background">
          <div>
            <p className="label-micro">Action</p>
            <h2 className="text-3xl font-black tracking-tighter uppercase">
              {plant ? 'Edit Entry' : 'Add New Entry'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 hover:bg-ink hover:text-background transition-colors border border-ink"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {error && (
            <div className="bg-error text-background px-6 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-4">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
          <form id="add-plant-form" onSubmit={handleSubmit} className="space-y-12">
            {/* Image Upload */}
            <div>
              <p className="label-micro">Visual Documentation</p>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center w-full h-96 border border-ink cursor-pointer transition-all
                    ${preview ? 'border-transparent' : 'bg-muted hover:bg-ink hover:text-background'}`}
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover transition-all duration-500" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Camera className="w-12 h-12 mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">Upload Species Image</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="label-micro">Common Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.G. RABBIT TOBACCO"
                  className="swiss-input uppercase font-black tracking-widest"
                  value={formData.commonName}
                  onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
                />
              </div>
              <div>
                <label className="label-micro">Scientific Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.G. PSEUDOGNAPHALIUM OBTUSIFOLIUM"
                  className="swiss-input italic font-medium"
                  value={formData.scientificName}
                  onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label-micro">Classification Status</label>
              <select
                className="swiss-input uppercase font-black tracking-widest appearance-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {Object.values(PlantStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="label-micro">Edibility Profile</label>
                <input
                  type="text"
                  placeholder="E.G. EDIBLE / TOXIC"
                  className="swiss-input uppercase font-black tracking-widest"
                  value={formData.edibility}
                  onChange={(e) => setFormData({ ...formData, edibility: e.target.value })}
                />
              </div>
              <div>
                <label className="label-micro">Pet Toxicity</label>
                <input
                  type="text"
                  placeholder="E.G. SAFE FOR CANINES"
                  className="swiss-input uppercase font-black tracking-widest"
                  value={formData.petToxicity}
                  onChange={(e) => setFormData({ ...formData, petToxicity: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label-micro">Permaculture Function</label>
              <input
                type="text"
                placeholder="E.G. NITROGEN FIXER"
                className="swiss-input uppercase font-black tracking-widest"
                value={formData.permacultureFunction}
                onChange={(e) => setFormData({ ...formData, permacultureFunction: e.target.value })}
              />
            </div>

            <div>
              <label className="label-micro">Culinary Applications</label>
              <textarea
                className="swiss-input h-32 resize-none"
                value={formData.culinaryUses}
                onChange={(e) => setFormData({ ...formData, culinaryUses: e.target.value })}
              />
            </div>

            <div>
              <label className="label-micro">Medicinal Properties</label>
              <textarea
                className="swiss-input h-32 resize-none"
                value={formData.medicinalBenefits}
                onChange={(e) => setFormData({ ...formData, medicinalBenefits: e.target.value })}
              />
            </div>

            <div>
              <label className="label-micro">Management Protocols</label>
              <textarea
                className="swiss-input h-48 resize-none"
                placeholder="TECHNICAL NOTES ON MAINTENANCE AND GROWTH"
                value={formData.managementNotes}
                onChange={(e) => setFormData({ ...formData, managementNotes: e.target.value })}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-ink bg-background shrink-0 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 swiss-button"
          >
            Cancel
          </button>
          <button
            form="add-plant-form"
            type="submit"
            disabled={loading}
            className="flex-1 swiss-button bg-ink text-background"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing</span>
              </>
            ) : (
              plant ? 'Update Entry' : 'Commit Entry'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
