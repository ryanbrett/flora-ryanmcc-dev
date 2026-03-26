/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Plant } from '../types';
import PlantCard from './PlantCard';
import { Loader2, Search, Sprout } from 'lucide-react';

interface PlantGridProps {
  onEdit?: (plant: Plant) => void;
  onDelete?: (plantId: string) => void;
  onViewDetails: (plant: Plant) => void;
}

export default function PlantGrid({ onEdit, onDelete, onViewDetails }: PlantGridProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'plants'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plantList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Plant[];
      setPlants(plantList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching plants:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPlants = plants.filter(plant => 
    plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading flora database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-ink pb-8">
        <div className="max-w-md w-full">
          <p className="label-micro">Search</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              placeholder="FILTER BY NAME OR SPECIES"
              className="swiss-input pl-12 uppercase font-black tracking-widest text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="label-micro !mb-0">Results</p>
          <span className="text-2xl font-black tracking-tighter">{filteredPlants.length}</span>
        </div>
      </div>

      {filteredPlants.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-ink">
          <p className="label-micro">No Matches Found</p>
          <p className="text-xs font-bold uppercase tracking-widest opacity-40">Adjust your search parameters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {filteredPlants.map((plant) => (
            <PlantCard 
              key={plant.id || Math.random().toString()} 
              plant={plant} 
              onEdit={onEdit} 
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
