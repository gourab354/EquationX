export interface SampleImage {
  id: string;
  name: string;
  category: string;
  dataUrl: string;
  description: string;
}

// Inline SVGs encoded as Data URLs for instant loading
export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'heart',
    name: 'Heart Silhouette',
    category: 'Symbols',
    description: 'Classic cardiovascular curve with smooth top lobes and sharp bottom apex',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="white"/><path d="M100,165 C60,130 20,95 20,60 C20,35 40,20 65,20 C80,20 93,28 100,42 C107,28 120,20 135,20 C160,20 180,35 180,60 C180,95 140,130 100,165 Z" fill="black"/></svg>`,
  },
  {
    id: 'butterfly',
    name: 'Butterfly Outline',
    category: 'Nature',
    description: 'Symmetric biological contour with dual wing arcs and antennae',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="white"/><path d="M100,90 C85,30 30,30 30,75 C30,110 80,120 95,140 C85,160 50,170 60,185 C75,190 95,165 100,150 C105,165 125,190 140,185 C150,170 115,160 105,140 C120,120 170,110 170,75 C170,30 115,30 100,90 Z" fill="black"/><circle cx="100" cy="115" r="5" fill="white"/></svg>`,
  },
  {
    id: 'star',
    name: 'Five-Pointed Star',
    category: 'Geometry',
    description: 'Symmetric geometric polygon with five acute vertices and golden ratio proportions',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="white"/><polygon points="100,20 124,78 186,82 138,122 153,182 100,148 47,182 62,122 14,82 76,78" fill="black"/></svg>`,
  },
  {
    id: 'infinity',
    name: 'Lemniscate / Infinity',
    category: 'Mathematics',
    description: 'Bernoulli lemniscate figure-eight loop',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="white"/><path d="M100,100 C70,70 30,70 30,100 C30,130 70,130 100,100 C130,70 170,70 170,100 C170,130 130,130 100,100 Z" fill="none" stroke="black" stroke-width="16" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'apple',
    name: 'Minimal Apple',
    category: 'Iconography',
    description: 'Curved silhouette with top leaf stem and bottom indentation',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="white"/><path d="M100,55 C80,35 45,50 45,95 C45,145 75,180 100,180 C125,180 155,145 155,95 C155,50 120,35 100,55 Z" fill="black"/><ellipse cx="115" cy="30" rx="10" ry="16" transform="rotate(35 115 30)" fill="black"/></svg>`,
  },
];

