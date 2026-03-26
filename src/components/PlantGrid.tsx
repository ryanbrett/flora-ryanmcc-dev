/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Plant, PlantStatus } from '../types';
import PlantCard from './PlantCard';
import { Loader2, Search, Sprout, Filter, X } from 'lucide-react';

interface PlantGridProps {
  onEdit?: (plant: Plant) => void;
  onDelete?: (plantId: string) => void;
  onViewDetails: (plant: Plant) => void;
}

export default function PlantGrid({ onEdit, onDelete, onViewDetails }: PlantGridProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [edibilityFilter, setEdibilityFilter] = useState('');
  const [toxicityFilter, setToxicityFilter] = useState('');
  const [permacultureFilter, setPermacultureFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || plant.status === statusFilter;
    
    const matchesEdibility = !edibilityFilter || 
                            (plant.edibility && plant.edibility.toLowerCase().includes(edibilityFilter.toLowerCase())) ||
                            (plant.culinaryUses && plant.culinaryUses.toLowerCase().includes(edibilityFilter.toLowerCase()));
    
    const matchesToxicity = !toxicityFilter || 
                           (plant.petToxicity && plant.petToxicity.toLowerCase().includes(toxicityFilter.toLowerCase()));
    
    const matchesPermaculture = !permacultureFilter || 
                               (plant.permacultureFunction && plant.permacultureFunction.toLowerCase().includes(permacultureFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesEdibility && matchesToxicity && matchesPermaculture;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setEdibilityFilter('');
    setToxicityFilter('');
    setPermacultureFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter || edibilityFilter || toxicityFilter || permacultureFilter;

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
      <div className="border-b border-ink pb-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
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
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`swiss-button ${showFilters ? 'bg-ink text-background' : ''}`}
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Hide Filters' : 'More Filters'}</span>
            </button>
            
            <div className="flex items-center gap-4 ml-4">
              <p className="label-micro !mb-0">Results</p>
              <span className="text-2xl font-black tracking-tighter">{filteredPlants.length}</span>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-ink/10 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <p className="label-micro">Status</p>
              <select 
                className="swiss-input uppercase font-black tracking-widest text-[10px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value={PlantStatus.KEEP}>{PlantStatus.KEEP}</option>
                <option value={PlantStatus.REMOVE}>{PlantStatus.REMOVE}</option>
                <option value={PlantStatus.MANAGE}>{PlantStatus.MANAGE}</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="label-micro">Edibility</p>
              <input
                type="text"
                placeholder="E.G. EDIBLE, TEA, FRUIT"
                className="swiss-input uppercase font-black tracking-widest text-[10px]"
                value={edibilityFilter}
                onChange={(e) => setEdibilityFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="label-micro">Pet Toxicity</p>
              <input
                type="text"
                placeholder="E.G. TOXIC, SAFE, DOGS"
                className="swiss-input uppercase font-black tracking-widest text-[10px]"
                value={toxicityFilter}
                onChange={(e) => setToxicityFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="label-micro">Permaculture</p>
              <input
                type="text"
                placeholder="E.G. NITROGEN, POLLINATOR"
                className="swiss-input uppercase font-black tracking-widest text-[10px]"
                value={permacultureFilter}
                onChange={(e) => setPermacultureFilter(e.target.value)}
              />
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex justify-end">
            <button 
              onClick={clearFilters}
              className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-50 transition-opacity"
            >
              <X className="w-3 h-3" />
              Clear All Filters
            </button>
          </div>
        )}
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
