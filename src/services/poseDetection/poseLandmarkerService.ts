import { NativeModules, Platform } from 'react-native';
import { NormalizedLandmark, PoseDetectionState } from '../../types/landmarks';
import { isNativeLandmarkerAvailable } from '../../../modules/pose-landmarker';

export interface PoseLandmarkerOptions {
  modelAssetPath?: string;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  runningMode?: 'LIVE_STREAM' | 'IMAGE';
}

export type LandmarkCallback = (landmarks: NormalizedLandmark[]) => void;

class PoseLandmarkerServiceImpl {
  private isInitialized = false;
  private isDetecting = false;
  private listeners: LandmarkCallback[] = [];
  private currentState: PoseDetectionState = 'idle';

  /**
   * Check if native MediaPipe Android module is present in the runtime
   */
  public isNativeModuleAvailable(): boolean {
    if (Platform.OS !== 'android') {
      return false;
    }
    return (
      isNativeLandmarkerAvailable() ||
      !!(NativeModules.PoseLandmarkerModule || NativeModules.PoseLandmarker)
    );
  }

  /**
   * Initialize the pose landmarker model
   */
  public async initializeModel(options?: PoseLandmarkerOptions): Promise<boolean> {
    if (!this.isNativeModuleAvailable()) {
      // Native module is not loaded (e.g. running in Expo Go or Web)
      this.currentState = 'idle';
      this.isInitialized = false;
      return false;
    }

    try {
      this.currentState = 'model_loading';
      const nativeModule =
        NativeModules.PoseLandmarkerModule || NativeModules.PoseLandmarker;

      await nativeModule.initializeModel({
        modelAssetPath: options?.modelAssetPath ?? 'pose_landmarker_lite.task',
        minDetectionConfidence: options?.minDetectionConfidence ?? 0.5,
        minTrackingConfidence: options?.minTrackingConfidence ?? 0.5,
        runningMode: options?.runningMode ?? 'LIVE_STREAM',
      });

      this.isInitialized = true;
      this.currentState = 'body_detected';
      return true;
    } catch (error) {
      console.warn('PoseLandmarker initialization error:', error);
      this.currentState = 'error';
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Start live-stream detection
   */
  public startDetection(): boolean {
    if (!this.isNativeModuleAvailable() || !this.isInitialized) {
      return false;
    }

    try {
      const nativeModule =
        NativeModules.PoseLandmarkerModule || NativeModules.PoseLandmarker;
      nativeModule.startDetection();
      this.isDetecting = true;
      return true;
    } catch (error) {
      console.warn('Error starting pose detection:', error);
      return false;
    }
  }

  /**
   * Stop detection
   */
  public stopDetection(): void {
    if (this.isDetecting && this.isNativeModuleAvailable()) {
      try {
        const nativeModule =
          NativeModules.PoseLandmarkerModule || NativeModules.PoseLandmarker;
        nativeModule.stopDetection();
      } catch (e) {
        // ignore
      }
    }
    this.isDetecting = false;
  }

  /**
   * Subscribe to landmark detections
   */
  public addLandmarkListener(callback: LandmarkCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Internal emitter for received native frames
   */
  public emitLandmarks(landmarks: NormalizedLandmark[]): void {
    this.listeners.forEach(cb => {
      try {
        cb(landmarks);
      } catch (err) {
        console.error('Error in landmark callback:', err);
      }
    });
  }

  /**
   * Dispose model resources
   */
  public async disposeModel(): Promise<void> {
    this.stopDetection();
    if (this.isNativeModuleAvailable() && this.isInitialized) {
      try {
        const nativeModule =
          NativeModules.PoseLandmarkerModule || NativeModules.PoseLandmarker;
        await nativeModule.disposeModel();
      } catch (e) {
        // ignore
      }
    }
    this.isInitialized = false;
    this.listeners = [];
  }

  public getState(): PoseDetectionState {
    return this.currentState;
  }
}

export const PoseLandmarkerService = new PoseLandmarkerServiceImpl();
