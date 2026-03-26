/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PlantStatus {
  KEEP = 'Keep in Garden',
  REMOVE = 'Remove/Invasive',
  MANAGE = 'Manage Closely'
}

export interface Plant {
  id?: string;
  commonName: string;
  scientificName: string;
  imageUrl: string;
  status: PlantStatus | string;
  edibility: string;
  culinaryUses: string;
  medicinalBenefits: string;
  petToxicity: string;
  permacultureFunction: string;
  managementNotes: string;
  createdAt: number;
  authorUid?: string;
  authorName?: string;
}
