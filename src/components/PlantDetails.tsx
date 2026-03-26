/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plant, PlantStatus } from '../types';
import { X, User, Calendar, Info, ShieldAlert, Utensils, HeartPulse, Sprout } from 'lucide-react';

interface PlantDetailsProps {
  plant: Plant;
  onClose: () => void;
}

export default function PlantDetails({ plant, onClose }: PlantDetailsProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case PlantStatus.KEEP: return 'bg-ink text-background';
      case PlantStatus.REMOVE: return 'bg-error text-background';
      case PlantStatus.MANAGE: return 'bg-muted text-ink';
      default: return 'bg-muted text-ink';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/20 backdrop-blur-sm p-0 sm:p-8">
      <div className="relative w-full max-w-5xl bg-background border border-ink flex flex-col my-auto min-h-screen sm:min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-ink shrink-0 bg-background">
          <div>
            <p className="label-micro">Technical Documentation</p>
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">
              {plant.commonName}
            </h2>
            <p className="text-sm font-medium italic opacity-40 mt-2">{plant.scientificName}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 hover:bg-ink hover:text-background transition-colors border border-ink"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="border-b lg:border-b-0 lg:border-r border-ink">
              <img 
                src={plant.imageUrl} 
                alt={plant.commonName} 
                className="w-full h-full object-cover aspect-square lg:aspect-auto"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Info Section */}
            <div className="p-8 space-y-12">
              {/* Status & Meta */}
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="label-micro">Classification</p>
                  <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest border border-ink inline-block ${getStatusStyle(plant.status)}`}>
                    {plant.status}
                  </span>
                </div>
                <div>
                  <p className="label-micro">Contributor</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 opacity-40" />
                    <span className="text-xs font-black uppercase tracking-widest">{plant.authorName || 'Anonymous'}</span>
                  </div>
                </div>
                <div>
                  <p className="label-micro">Recorded On</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-40" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      {new Date(plant.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid of Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {plant.edibility && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 opacity-40" />
                      <p className="label-micro !mb-0">Edibility</p>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">{plant.edibility}</p>
                  </div>
                )}
                {plant.petToxicity && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 opacity-40" />
                      <p className="label-micro !mb-0">Pet Toxicity</p>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">{plant.petToxicity}</p>
                  </div>
                )}
                {plant.permacultureFunction && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 opacity-40" />
                      <p className="label-micro !mb-0">Permaculture Function</p>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">{plant.permacultureFunction}</p>
                  </div>
                )}
              </div>

              {/* Text Blocks */}
              <div className="space-y-12">
                {plant.culinaryUses && (
                  <div>
                    <p className="label-micro">Culinary Applications</p>
                    <p className="text-sm font-medium leading-relaxed opacity-60">{plant.culinaryUses}</p>
                  </div>
                )}
                {plant.medicinalBenefits && (
                  <div>
                    <p className="label-micro">Medicinal Properties</p>
                    <p className="text-sm font-medium leading-relaxed opacity-60">{plant.medicinalBenefits}</p>
                  </div>
                )}
                {plant.managementNotes && (
                  <div className="bg-muted p-8 border border-ink">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-4 h-4 opacity-40" />
                      <p className="label-micro !mb-0">Management Protocols</p>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-60">{plant.managementNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-ink bg-background shrink-0">
          <button
            onClick={onClose}
            className="w-full swiss-button bg-ink text-background"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
