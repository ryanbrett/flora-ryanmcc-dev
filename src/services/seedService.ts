/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { PlantStatus, Plant } from '../types';

const SEED_PLANTS: Partial<Plant>[] = [
  {
    commonName: "Rabbit Tobacco",
    scientificName: "Pseudognaphalium obtusifolium",
    status: PlantStatus.KEEP,
    managementNotes: "Great for native pollinators. Group intentionally in native beds.",
    imageUrl: "https://loremflickr.com/800/600/Pseudognaphalium,obtusifolium,plant/all"
  },
  {
    commonName: "Lyreleaf Sage",
    scientificName: "Salvia lyrata",
    status: PlantStatus.KEEP,
    managementNotes: "Provides excellent ground cover and early spring color. Move inside V-Trench border.",
    imageUrl: "https://loremflickr.com/800/600/Salvia,lyrata,plant/all"
  },
  {
    commonName: "Carolina Desert-chicory",
    scientificName: "Pyrrhopappus carolinianus",
    status: PlantStatus.KEEP,
    managementNotes: "Good native filler.",
    imageUrl: "https://loremflickr.com/800/600/Pyrrhopappus,carolinianus,plant/all"
  },
  {
    commonName: "Corn Speedwell",
    scientificName: "Veronica arvensis",
    status: PlantStatus.REMOVE,
    managementNotes: "Introduced weed that competes for resources. Pull from native beds.",
    imageUrl: "https://loremflickr.com/800/600/Veronica,arvensis,plant/all"
  },
  {
    commonName: "Oldfield Toadflax",
    scientificName: "Nuttallanthus canadensis",
    status: PlantStatus.KEEP,
    managementNotes: "Adds great vertical interest. Mass plant for best effect.",
    imageUrl: "https://loremflickr.com/800/600/Nuttallanthus,canadensis,plant/all"
  },
  {
    commonName: "Wild Radish",
    scientificName: "Raphanus raphanistrum",
    status: PlantStatus.REMOVE,
    managementNotes: "Introduced weed. Pull to prevent resource competition.",
    imageUrl: "https://loremflickr.com/800/600/Raphanus,raphanistrum,plant/all"
  },
  {
    commonName: "Slender Bluet",
    scientificName: "Oldenlandia uniflora",
    status: PlantStatus.KEEP,
    managementNotes: "Good native filler.",
    imageUrl: "https://loremflickr.com/800/600/Oldenlandia,uniflora,plant/all"
  },
  {
    commonName: "Annual Bluegrass",
    scientificName: "Poa annua",
    status: PlantStatus.REMOVE,
    managementNotes: "Pull immediately. Spreads rapidly and ruins clean look of borders.",
    imageUrl: "https://loremflickr.com/800/600/Poa,annua,plant/all"
  },
  {
    commonName: "Fiddle Dock",
    scientificName: "Rumex pulcher",
    status: PlantStatus.REMOVE,
    managementNotes: "Stubborn weed with a deep taproot. Dig it out entirely.",
    imageUrl: "https://loremflickr.com/800/600/Rumex,pulcher,plant/all"
  },
  {
    commonName: "Cudweed",
    scientificName: "Gamochaeta antillana",
    status: PlantStatus.KEEP,
    managementNotes: "Great for native pollinators.",
    imageUrl: "https://loremflickr.com/800/600/Gamochaeta,antillana,plant/all"
  },
  {
    commonName: "Wild Geranium",
    scientificName: "Geranium maculatum",
    status: PlantStatus.KEEP,
    medicinalBenefits: "Powerful astringent, styptic (stops bleeding), and antiseptic. Used for GI health and wound care.",
    culinaryUses: "Often used as a tea (infusion) or tincture.",
    managementNotes: "High tannin content (10-20%). Harvest roots in autumn or early spring.",
    imageUrl: "https://loremflickr.com/800/600/Geranium,maculatum,plant/all"
  },
  {
    commonName: "Asiatic Plantain",
    scientificName: "Plantago asiatica L.",
    status: PlantStatus.KEEP,
    medicinalBenefits: "Antioxidant effects, alleviates oxidative stress. Reduces DNA damage.",
    culinaryUses: "Can be used in cooking and folk medicine beverages.",
    managementNotes: "Self-fertile perennial. Grows well in disturbed areas.",
    imageUrl: "https://loremflickr.com/800/600/Plantago,asiatica,plant/all"
  },
  {
    commonName: "Canada Wild Lettuce",
    scientificName: "Lactuca canadensis",
    status: PlantStatus.MANAGE,
    medicinalBenefits: "Analgesic, antispasmodic, digestive, diuretic, hypnotic, narcotic, and sedative properties.",
    managementNotes: "Native but grows very tall and looks 'weedy'. Relegate to the far back of borders.",
    imageUrl: "https://loremflickr.com/800/600/Lactuca,canadensis,plant/all"
  },
  {
    commonName: "Lesser Trefoil (Shamrock)",
    scientificName: "Trifolium dubium",
    status: PlantStatus.MANAGE,
    permacultureFunction: "Fixing nitrogen in the soil, attracting pollinators.",
    managementNotes: "Aggressive spreader. Keep in lawn area, but pull from native beds.",
    imageUrl: "https://loremflickr.com/800/600/Trifolium,dubium,plant/all"
  },
  {
    commonName: "Small Venus' Looking-glass",
    scientificName: "Triodanis biflora",
    status: PlantStatus.KEEP,
    medicinalBenefits: "Cherokee use root infusion for dyspepsia (indigestion).",
    managementNotes: "Beautiful solitary bell-shaped blue or purple flower. Move inside V-Trench.",
    imageUrl: "https://loremflickr.com/800/600/Triodanis,biflora,plant/all"
  },
  {
    commonName: "Cutleaf Evening Primrose",
    scientificName: "Oenothera laciniata",
    status: PlantStatus.KEEP,
    medicinalBenefits: "Oil rich in GLA. Potential for skin health, joint pain, and menstrual management.",
    managementNotes: "Produces pale to deep yellow petals. Native to eastern US.",
    imageUrl: "https://loremflickr.com/800/600/Oenothera,laciniata,plant/all"
  },
  {
    commonName: "Earleaf Greenbrier",
    scientificName: "Smilax auriculata",
    status: PlantStatus.MANAGE,
    managementNotes: "Native but forms dense thickets with thorns. Keep pushed back to the woodline.",
    imageUrl: "https://loremflickr.com/800/600/Smilax,auriculata,plant/all"
  },
  {
    commonName: "Roundleaf Greenbrier",
    scientificName: "Smilax rotundifolia",
    status: PlantStatus.MANAGE,
    culinaryUses: "Berries edible raw or in jam. Roots can be ground into flour.",
    medicinalBenefits: "Tea from leaves/stems used for rheumatism and stomach problems.",
    managementNotes: "Common part of natural forest ecosystems. Keep away from patio/foundation.",
    imageUrl: "https://loremflickr.com/800/600/Smilax,rotundifolia,plant/all"
  }
];

export const seedDatabase = async () => {
  if (!auth.currentUser) throw new Error("User not authenticated");

  const plantsRef = collection(db, 'plants');
  
  // Check if already seeded to prevent duplicates
  const q = query(plantsRef, limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return "Database already contains data. Seed skipped to prevent duplicates.";
  }

  console.log("Starting seed...");
  for (const plant of SEED_PLANTS) {
    await addDoc(plantsRef, {
      ...plant,
      edibility: plant.edibility || "",
      culinaryUses: plant.culinaryUses || "",
      medicinalBenefits: plant.medicinalBenefits || "",
      petToxicity: plant.petToxicity || "",
      permacultureFunction: plant.permacultureFunction || "",
      createdAt: Date.now(),
      authorUid: auth.currentUser.uid,
      authorName: auth.currentUser.displayName || 'System'
    });
  }
  return "Success! 19 species imported.";
};
