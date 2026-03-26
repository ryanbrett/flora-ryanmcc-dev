/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plant, PlantStatus } from '../types';
import { User } from 'lucide-react';

interface PlantCardProps {
  plant: Plant;
  onEdit?: (plant: Plant) => void;
  onDelete?: (plantId: string) => void;
  onViewDetails: (plant: Plant) => void;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, onEdit, onDelete, onViewDetails }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case PlantStatus.KEEP: return 'bg-ink text-background';
      case PlantStatus.REMOVE: return 'bg-error text-background';
      case PlantStatus.MANAGE: return 'bg-muted text-ink';
      default: return 'bg-muted text-ink';
    }
  };

  return (
    <div className="border border-ink flex flex-col bg-background h-full group">
      <div className="aspect-[4/3] relative overflow-hidden border-b border-ink">
        <img 
          src={plant.imageUrl} 
          alt={plant.commonName}
          className="w-full h-full object-cover transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-0 left-0">
          <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest border-r border-b border-ink ${getStatusStyle(plant.status)}`}>
            {plant.status}
          </span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="mb-8">
          <p className="label-micro">Species</p>
          <h3 className="text-2xl font-black tracking-tighter mb-1 uppercase">{plant.commonName}</h3>
          <p className="text-xs font-medium italic opacity-40">{plant.scientificName}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {plant.edibility && (
            <div>
              <p className="label-micro">Edibility</p>
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{plant.edibility}</p>
            </div>
          )}
          {plant.permacultureFunction && (
            <div>
              <p className="label-micro">Function</p>
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{plant.permacultureFunction}</p>
            </div>
          )}
        </div>

        {plant.managementNotes && (
          <div className="mb-8 flex-1">
            <p className="label-micro">Management</p>
            <p className="text-xs font-medium leading-relaxed opacity-60 line-clamp-3">{plant.managementNotes}</p>
          </div>
        )}

        <div className="mt-auto pt-8 border-t border-ink space-y-4">
          <div className="flex items-center gap-2 opacity-40">
            <User className="w-3 h-3 text-ink" />
            <span className="text-[10px] font-black uppercase tracking-widest truncate">
              {plant.authorName || 'Contributor'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <button 
              onClick={() => onViewDetails(plant)}
              className="text-[10px] font-black uppercase tracking-widest hover:underline underline-offset-4"
            >
              Details
            </button>
            <div className="flex items-center gap-4">
              {onEdit && (
                <button 
                  onClick={() => onEdit(plant)}
                  className="text-[10px] font-black uppercase tracking-widest hover:underline underline-offset-4 opacity-40 hover:opacity-100"
                >
                  Edit
                </button>
              )}
              {onDelete && plant.id && (
                <button 
                  onClick={() => onDelete(plant.id!)}
                  className="text-[10px] font-black uppercase tracking-widest text-error hover:underline underline-offset-4 opacity-40 hover:opacity-100"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
