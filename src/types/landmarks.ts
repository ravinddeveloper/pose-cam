export interface NormalizedLandmark {
  x: number; // 0.0 to 1.0 (normalized image width)
  y: number; // 0.0 to 1.0 (normalized image height)
  z?: number; // relative depth
  visibility?: number; // 0.0 to 1.0
  presence?: number; // 0.0 to 1.0
}

export type LandmarkIndex =
  | 0  // NOSE
  | 1  // LEFT_EYE_INNER
  | 2  // LEFT_EYE
  | 3  // LEFT_EYE_OUTER
  | 4  // RIGHT_EYE_INNER
  | 5  // RIGHT_EYE
  | 6  // RIGHT_EYE_OUTER
  | 7  // LEFT_EAR
  | 8  // RIGHT_EAR
  | 9  // MOUTH_LEFT
  | 10 // MOUTH_RIGHT
  | 11 // LEFT_SHOULDER
  | 12 // RIGHT_SHOULDER
  | 13 // LEFT_ELBOW
  | 14 // RIGHT_ELBOW
  | 15 // LEFT_WRIST
  | 16 // RIGHT_WRIST
  | 17 // LEFT_PINKY
  | 18 // RIGHT_PINKY
  | 19 // LEFT_INDEX
  | 20 // RIGHT_INDEX
  | 21 // LEFT_THUMB
  | 22 // RIGHT_THUMB
  | 23 // LEFT_HIP
  | 24 // RIGHT_HIP
  | 25 // LEFT_KNEE
  | 26 // RIGHT_KNEE
  | 27 // LEFT_ANKLE
  | 28 // RIGHT_ANKLE
  | 29 // LEFT_HEEL
  | 30 // RIGHT_HEEL
  | 31 // LEFT_FOOT_INDEX
  | 32; // RIGHT_FOOT_INDEX

export const POSE_CONNECTIONS: [number, number][] = [
  // Head
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  // Shoulders & Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left arm
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
  // Right arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
  // Left leg
  [23, 25], [25, 27], [27, 29], [27, 31],
  // Right leg
  [24, 26], [26, 28], [28, 30], [28, 32]
];

export interface PoseAlignmentResult {
  overallScore: number; // 0 to 100
  upperBodyScore: number;
  lowerBodyScore: number;
  isAligned: boolean;
  statusText: string;
  coachingHints: string[];
}

export type PoseDetectionState =
  | 'idle'
  | 'permission_denied'
  | 'camera_unavailable'
  | 'model_loading'
  | 'no_body_detected'
  | 'body_partially_detected'
  | 'body_detected'
  | 'error';
