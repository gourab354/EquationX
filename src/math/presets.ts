import { Equation, SliderVar } from '../types';

export interface PresetItem {
  id: string;
  name: string;
  category: 'Famous Curves' | 'Simulations' | 'Polar' | 'Implicit' | '3D Surfaces' | 'Physics';
  description: string;
  equations: Partial<Equation>[];
  sliders?: Partial<SliderVar>[];
  mode?: '2d' | '3d';
}

export const PRESETS: PresetItem[] = [
  {
    id: 'heart-curve',
    name: 'Mathematical Heart Curve',
    category: 'Famous Curves',
    description: 'Classic parametric heart curve derived from cardioid kinematics',
    equations: [
      {
        id: 'eq-heart-1',
        type: 'parametric',
        expression: '16 * (sin(t))^3',
        parametricY: '13 * cos(t) - 5 * cos(2*t) - 2 * cos(3*t) - cos(4*t)',
        domain: { min: 0, max: 2 * Math.PI, step: 0.02 },
        color: '#f43f5e',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'Heart Curve'
      }
    ]
  },
  {
    id: 'butterfly-curve',
    name: 'Temple Fay Butterfly Curve',
    category: 'Polar',
    description: 'Transcendental polar butterfly curve discovered by Temple H. Fay (1989)',
    equations: [
      {
        id: 'eq-butterfly',
        type: 'polar',
        expression: 'exp(cos(theta)) - 2*cos(4*theta) + (sin(theta/12))^5',
        domain: { min: 0, max: 12 * Math.PI, step: 0.02 },
        color: '#ec4899',
        strokeWidth: 2.5,
        visible: true,
        opacity: 1,
        label: 'Butterfly'
      }
    ]
  },
  {
    id: 'lissajous',
    name: 'Lissajous Harmonograph',
    category: 'Simulations',
    description: 'System of parametric equations simulating orthogonal harmonic oscillations',
    equations: [
      {
        id: 'eq-lissajous',
        type: 'parametric',
        expression: 'A * sin(a * t + delta)',
        parametricY: 'B * sin(b * t)',
        domain: { min: 0, max: 2 * Math.PI, step: 0.01 },
        color: '#06b6d4',
        strokeWidth: 2.5,
        visible: true,
        opacity: 1,
        label: 'Lissajous Figure'
      }
    ],
    sliders: [
      { variable: 'A', min: 1, max: 10, step: 0.1, value: 5, isPlaying: false, speed: 1 },
      { variable: 'B', min: 1, max: 10, step: 0.1, value: 5, isPlaying: false, speed: 1 },
      { variable: 'a', min: 1, max: 10, step: 1, value: 3, isPlaying: false, speed: 1 },
      { variable: 'b', min: 1, max: 10, step: 1, value: 4, isPlaying: false, speed: 1 },
      { variable: 'delta', min: 0, max: 6.28, step: 0.05, value: 1.57, isPlaying: true, speed: 1 }
    ]
  },
  {
    id: 'fourier-square-wave',
    name: 'Fourier Series Synthesis',
    category: 'Physics',
    description: 'Approximating a square wave by summing odd harmonic sine waves',
    equations: [
      {
        id: 'eq-fourier-1',
        type: 'cartesian',
        expression: 'y = (4/pi) * (sin(x) + (1/3)*sin(3*x) + (1/5)*sin(5*x) + (1/7)*sin(7*x) + (1/9)*sin(9*x))',
        color: '#0c87eb',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'Fourier Approximation (N=5)'
      },
      {
        id: 'eq-fourier-fund',
        type: 'cartesian',
        expression: 'y = (4/pi) * sin(x)',
        color: '#64748b',
        strokeWidth: 1.5,
        visible: true,
        opacity: 0.6,
        label: 'Fundamental Harmonic'
      }
    ]
  },
  {
    id: 'damped-wave',
    name: 'Damped Traveling Wave',
    category: 'Simulations',
    description: 'Propagating physical wave with exponential spatial decay and phase shift',
    equations: [
      {
        id: 'eq-damped',
        type: 'cartesian',
        expression: 'y = A * exp(-gamma * abs(x)) * sin(k * x - w * t)',
        color: '#10b981',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'Damped Wave'
      }
    ],
    sliders: [
      { variable: 'A', min: 1, max: 8, step: 0.1, value: 4, isPlaying: false, speed: 1 },
      { variable: 'gamma', min: 0.05, max: 0.8, step: 0.01, value: 0.2, isPlaying: false, speed: 1 },
      { variable: 'k', min: 0.5, max: 4, step: 0.1, value: 1.5, isPlaying: false, speed: 1 },
      { variable: 'w', min: 0.5, max: 5, step: 0.1, value: 2.0, isPlaying: false, speed: 1 },
      { variable: 't', min: 0, max: 20, step: 0.05, value: 0, isPlaying: true, speed: 1 }
    ]
  },
  {
    id: 'folium-descartes',
    name: 'Folium of Descartes',
    category: 'Implicit',
    description: 'Classic algebraic curve proposed by René Descartes in 1638: x^3 + y^3 - 3axy = 0',
    equations: [
      {
        id: 'eq-folium',
        type: 'implicit',
        expression: 'x^3 + y^3 - 3*a*x*y = 0',
        color: '#f59e0b',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'Folium of Descartes'
      }
    ],
    sliders: [
      { variable: 'a', min: 1, max: 6, step: 0.2, value: 3, isPlaying: false, speed: 1 }
    ]
  },
  {
    id: 'astroid',
    name: 'Astroid / Hypocycloid',
    category: 'Famous Curves',
    description: 'Hypocycloid with four cusps traced by a point on a circle rolling inside another',
    equations: [
      {
        id: 'eq-astroid',
        type: 'implicit',
        expression: 'x^(2/3) + y^(2/3) = a^(2/3)',
        color: '#8b5cf6',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'Astroid'
      }
    ],
    sliders: [
      { variable: 'a', min: 2, max: 8, step: 0.5, value: 5, isPlaying: false, speed: 1 }
    ]
  },
  {
    id: 'rose-curve',
    name: 'Rhodonea Rose Curve',
    category: 'Polar',
    description: 'Petal rose curve r = a * cos(k * theta)',
    equations: [
      {
        id: 'eq-rose',
        type: 'polar',
        expression: 'a * cos(k * theta)',
        domain: { min: 0, max: 2 * Math.PI, step: 0.01 },
        color: '#ec4899',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'Rose Petals'
      }
    ],
    sliders: [
      { variable: 'a', min: 2, max: 8, step: 0.5, value: 6, isPlaying: false, speed: 1 },
      { variable: 'k', min: 1, max: 12, step: 1, value: 7, isPlaying: true, speed: 0.5 }
    ]
  },
  {
    id: 'saddle-surface-3d',
    name: 'Hyperbolic Paraboloid (Saddle)',
    category: '3D Surfaces',
    mode: '3d',
    description: 'Double curved surface resembling a mountain pass or saddle: z = (x^2 - y^2)/a',
    equations: [
      {
        id: 'eq-3d-saddle',
        type: 'surface3d',
        expression: '(x^2 - y^2) / a',
        color: '#0c87eb',
        strokeWidth: 2,
        visible: true,
        opacity: 0.9,
        label: 'Saddle Surface'
      }
    ],
    sliders: [
      { variable: 'a', min: 1, max: 10, step: 0.5, value: 4, isPlaying: false, speed: 1 }
    ]
  },
  {
    id: 'ripple-surface-3d',
    name: 'Circular Water Ripple Wave',
    category: '3D Surfaces',
    mode: '3d',
    description: 'Bessel-like circular wave propagation: z = sin(sqrt(x^2 + y^2) - t)',
    equations: [
      {
        id: 'eq-3d-ripple',
        type: 'surface3d',
        expression: 'A * sin(k * sqrt(x^2 + y^2) - t) / (1 + 0.1 * (x^2 + y^2))',
        color: '#06b6d4',
        strokeWidth: 2,
        visible: true,
        opacity: 0.9,
        label: 'Ripple Surface'
      }
    ],
    sliders: [
      { variable: 'A', min: 1, max: 5, step: 0.2, value: 2.5, isPlaying: false, speed: 1 },
      { variable: 'k', min: 0.5, max: 3, step: 0.1, value: 1.5, isPlaying: false, speed: 1 },
      { variable: 't', min: 0, max: 20, step: 0.1, value: 0, isPlaying: true, speed: 1 }
    ]
  }
];

