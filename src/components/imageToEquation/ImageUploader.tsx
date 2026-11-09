import React, { useRef, useState } from 'react';
import { SAMPLE_IMAGES, SampleImage } from '../../cv/sampleImages';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Sun,
  SlidersHorizontal
} from 'lucide-react';

interface ImageUploaderProps {
  onImageLoaded: (image: HTMLImageElement, name: string) => void;
  currentImageName?: string;
  imageDimensions?: { width: number; height: number };
  currentImage?: HTMLImageElement | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageLoaded,
  currentImageName,
  imageDimensions,
  currentImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        onImageLoaded(img, file.name);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const loadSample = (sample: SampleImage) => {
    const img = new Image();
    img.onload = () => {
      onImageLoaded(img, sample.name);
    };
    img.src = sample.dataUrl;
  };

  // Rotate image by 90 degrees
  const handleRotate = (angleDegrees: number) => {
    if (!currentImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (Math.abs(angleDegrees) === 90) {
      canvas.width = currentImage.height;
      canvas.height = currentImage.width;
    } else {
      canvas.width = currentImage.width;
      canvas.height = currentImage.height;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angleDegrees * Math.PI) / 180);
    ctx.drawImage(currentImage, -currentImage.width / 2, -currentImage.height / 2);

    const rotatedImg = new Image();
    rotatedImg.onload = () => {
      onImageLoaded(rotatedImg, currentImageName || 'Rotated Image');
    };
    rotatedImg.src = canvas.toDataURL();
  };

  // Flip image horizontally
  const handleFlipHorizontal = () => {
    if (!currentImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(currentImage, 0, 0);

    const flippedImg = new Image();
    flippedImg.onload = () => {
      onImageLoaded(flippedImg, currentImageName || 'Flipped Image');
    };
    flippedImg.src = canvas.toDataURL();
  };

  // Apply Brightness & Contrast
  const handleApplyFilter = (newBrightness: number, newContrast: number) => {
    if (!currentImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    ctx.filter = `brightness(${newBrightness}%) contrast(${newContrast}%)`;
    ctx.drawImage(currentImage, 0, 0);

    const filteredImg = new Image();
    filteredImg.onload = () => {
      onImageLoaded(filteredImg, currentImageName || 'Adjusted Image');
    };
    filteredImg.src = canvas.toDataURL();
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer bg-surface-900/60 hover:bg-surface-800/60 transition-all group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 group-hover:scale-110 flex items-center justify-center mx-auto mb-3 transition-transform">
          <Upload className="w-6 h-6" />
        </div>

        <h3 className="font-semibold text-sm text-slate-100 mb-1">
          Drop an image here, or <span className="text-brand-400 underline">browse</span>
        </h3>
        <p className="text-xs text-slate-400">
          Supports PNG, JPG, SVG, WEBP (drawings, logos, silhouettes, contours)
        </p>

        {currentImageName && imageDimensions && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-medium">{currentImageName}</span>
            <span className="text-emerald-500/80 font-mono">
              ({imageDimensions.width} × {imageDimensions.height}px)
            </span>
          </div>
        )}
      </div>

      {/* Image Manipulation Toolbar (Rotate, Flip, Contrast, Brightness) */}
      {currentImage && (
        <div className="bg-surface-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
              Image Transform:
            </span>
            <button
              onClick={() => handleRotate(90)}
              className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-200 border border-slate-700/60 flex items-center gap-1 transition-colors"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>90° CW</span>
            </button>
            <button
              onClick={() => handleRotate(-90)}
              className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-200 border border-slate-700/60 flex items-center gap-1 transition-colors"
              title="Rotate 90° Counter-Clockwise"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>90° CCW</span>
            </button>
            <button
              onClick={handleFlipHorizontal}
              className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-200 border border-slate-700/60 flex items-center gap-1 transition-colors"
              title="Flip Horizontally"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip H</span>
            </button>
          </div>

          <button
            onClick={() => setShowAdjustments(!showAdjustments)}
            className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
              showAdjustments
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : 'bg-surface-800 hover:bg-surface-700 text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Tone & Contrast</span>
          </button>

          {showAdjustments && (
            <div className="w-full pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Brightness:</span>
                  <span className="font-mono text-slate-400">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={200}
                  step={5}
                  value={brightness}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setBrightness(val);
                    handleApplyFilter(val, contrast);
                  }}
                  className="w-full accent-brand-500 h-1.5 bg-surface-800 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Contrast:</span>
                  <span className="font-mono text-slate-400">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={250}
                  step={5}
                  value={contrast}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setContrast(val);
                    handleApplyFilter(brightness, val);
                  }}
                  className="w-full accent-brand-500 h-1.5 bg-surface-800 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instant Sample Image Presets */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Or Choose A Sample Shape
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => loadSample(sample)}
              className="p-2.5 rounded-xl bg-surface-900 border border-slate-800 hover:border-brand-500/60 hover:bg-surface-800 text-left transition-all group flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-lg bg-white p-1 mb-2 flex items-center justify-center shadow-inner overflow-hidden">
                <img
                  src={sample.dataUrl}
                  alt={sample.name}
                  className="w-full h-full object-contain filter group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-xs font-medium text-slate-200 group-hover:text-brand-300 text-center truncate w-full">
                {sample.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
