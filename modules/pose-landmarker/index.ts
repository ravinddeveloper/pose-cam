import { requireNativeModule } from 'expo-modules-core';
import { NormalizedLandmark } from '../../src/types/landmarks';

let NativePoseLandmarker: any = null;
try {
  NativePoseLandmarker = requireNativeModule('PoseLandmarker');
} catch {
  NativePoseLandmarker = null;
}

export const isNativeLandmarkerAvailable = (): boolean => {
  return NativePoseLandmarker !== null;
};

export const initializeNativeModel = async (options?: {
  modelAssetPath?: string;
  minDetectionConfidence?: number;
}): Promise<boolean> => {
  if (!NativePoseLandmarker) return false;
  return await NativePoseLandmarker.initializeModel(options || {});
};

export const startNativeDetection = (): void => {
  if (NativePoseLandmarker) {
    NativePoseLandmarker.startDetection();
  }
};

export const stopNativeDetection = (): void => {
  if (NativePoseLandmarker) {
    NativePoseLandmarker.stopDetection();
  }
};

export const disposeNativeModel = async (): Promise<void> => {
  if (NativePoseLandmarker) {
    await NativePoseLandmarker.disposeModel();
  }
};
