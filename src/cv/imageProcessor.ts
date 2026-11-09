import { ImageProcessingConfig, Point2D } from '../types';

/**
 * Applies image pre-processing filters (grayscale, blur, Sobel edge detection, thresholding)
 * Returns both the processed ImageData and binary edge mask (Uint8Array)
 */
export function processImageCanvas(
  sourceCanvas: HTMLCanvasElement,
  config: ImageProcessingConfig
): {
  processedImageData: ImageData;
  binaryEdgeData: Uint8Array;
  width: number;
  height: number;
} {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  ctx.drawImage(sourceCanvas, 0, 0);
  const srcData = ctx.getImageData(0, 0, width, height);
  const pixels = srcData.data;

  // Step 1: Grayscale
  const gray = new Float32Array(width * height);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Standard luminosity formula
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (a < 128) {
      // Treat transparent as white/background
      lum = 255;
    }
    if (config.invert) {
      lum = 255 - lum;
    }
    gray[i / 4] = lum;
  }

  // Step 2: Gaussian Blur / Noise reduction
  let blurred: any = gray;
  if (config.blurRadius > 0) {
    blurred = applyGaussianBlur(gray, width, height, config.blurRadius);
  }

  // Step 3: Sobel Edge Detection
  const { magnitude } = applySobel(blurred, width, height);

  // Step 4: Binary Thresholding
  const binaryEdges = new Uint8Array(width * height);
  const outputImgData = ctx.createImageData(width, height);
  const outPixels = outputImgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const mag = magnitude[idx];
      const isEdge = mag >= config.edgeThresholdLow && mag <= config.edgeThresholdHigh;

      binaryEdges[idx] = isEdge ? 255 : 0;

      const pIdx = idx * 4;
      if (isEdge) {
        outPixels[pIdx] = 12;     // R
        outPixels[pIdx + 1] = 135; // G (brand blue)
        outPixels[pIdx + 2] = 235; // B
        outPixels[pIdx + 3] = 255; // Alpha
      } else {
        // Dark background preview
        outPixels[pIdx] = 15;
        outPixels[pIdx + 1] = 15;
        outPixels[pIdx + 2] = 19;
        outPixels[pIdx + 3] = 255;
      }
    }
  }

  return {
    processedImageData: outputImgData,
    binaryEdgeData: binaryEdges,
    width,
    height,
  };
}

/**
 * Simple 1D separable Gaussian Blur
 */
function applyGaussianBlur(
  data: Float32Array,
  width: number,
  height: number,
  radius: number
): Float32Array {
  const output = new Float32Array(width * height);
  const temp = new Float32Array(width * height);

  const sigma = Math.max(radius / 2, 0.5);
  const kernelSize = Math.ceil(radius * 2) + 1;
  const kernel = new Float32Array(kernelSize);
  let kernelSum = 0;
  const half = Math.floor(kernelSize / 2);

  for (let i = 0; i < kernelSize; i++) {
    const x = i - half;
    const g = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel[i] = g;
    kernelSum += g;
  }
  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= kernelSum;
  }

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = 0; k < kernelSize; k++) {
        const px = Math.min(Math.max(x + k - half, 0), width - 1);
        sum += data[y * width + px] * kernel[k];
      }
      temp[y * width + x] = sum;
    }
  }

  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = 0; k < kernelSize; k++) {
        const py = Math.min(Math.max(y + k - half, 0), height - 1);
        sum += temp[py * width + x] * kernel[k];
      }
      output[y * width + x] = sum;
    }
  }

  return output;
}

/**
 * Sobel Gradient Operator
 */
function applySobel(
  gray: Float32Array,
  width: number,
  height: number
): { magnitude: Float32Array; direction: Float32Array } {
  const magnitude = new Float32Array(width * height);
  const direction = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // 3x3 window
      const p00 = gray[(y - 1) * width + (x - 1)];
      const p01 = gray[(y - 1) * width + x];
      const p02 = gray[(y - 1) * width + (x + 1)];
      const p10 = gray[y * width + (x - 1)];
      const p12 = gray[y * width + (x + 1)];
      const p20 = gray[(y + 1) * width + (x - 1)];
      const p21 = gray[(y + 1) * width + x];
      const p22 = gray[(y + 1) * width + (x + 1)];

      const gx = -p00 + p02 - 2 * p10 + 2 * p12 - p20 + p22;
      const gy = -p00 - 2 * p01 - p02 + p20 + 2 * p21 + p22;

      const idx = y * width + x;
      magnitude[idx] = Math.hypot(gx, gy);
      direction[idx] = Math.atan2(gy, gx);
    }
  }

  return { magnitude, direction };
}

/**
 * Converts screen/pixel points into mathematical coordinates (Cartesian system)
 */
export function pixelToMathCoordinates(
  points: Point2D[],
  imgWidth: number,
  imgHeight: number,
  targetSpan: number = 10,
  centerOrigin: boolean = true
): Point2D[] {
  const maxDim = Math.max(imgWidth, imgHeight);
  const scale = (targetSpan * 2) / maxDim;

  const cx = centerOrigin ? imgWidth / 2 : 0;
  const cy = centerOrigin ? imgHeight / 2 : 0;

  return points.map(p => ({
    x: (p.x - cx) * scale,
    y: -(p.y - cy) * scale, // Flip y so positive points up in math coordinates
  }));
}
