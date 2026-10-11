export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type FramingType = 'full-body' | 'waist-up' | 'close-up' | 'three-quarter' | 'varies';

export type CameraAngle = 'front' | 'side' | 'three-quarter' | 'high-angle' | 'low-angle' | 'eye-level' | 'back' | 'varies';

export type SourceType = 'local' | 'openverse' | 'wikimedia' | 'custom';

export type Category =
  | 'solo-portraits'
  | 'selfies'
  | 'couples'
  | 'friends-groups'
  | 'women'
  | 'men'
  | 'travel'
  | 'fashion'
  | 'wedding'
  | 'beach'
  | 'nature'
  | 'street'
  | 'sitting'
  | 'standing'
  | 'walking'
  | 'fitness'
  | 'maternity'
  | 'family'
  | 'graduation'
  | 'professional'
  | 'creative';

export interface BodyInstructions {
  head?: string;
  shoulders?: string;
  arms?: string;
  hands?: string;
  torso?: string;
  legs?: string;
  feet?: string;
  posture?: string;
}

export interface Pose {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  difficulty: DifficultyLevel;
  framing: FramingType;
  cameraAngle: CameraAngle;
  bodyInstructions: BodyInstructions;
  facialExpression: string;
  lighting: string;
  environment: string;
  sourceType: SourceType;
  imageUrl?: string;
  thumbnailUrl?: string;
  sourcePageUrl?: string;
  creator?: string;
  licenseName?: string;
  licenseUrl?: string;
  attribution?: string;
  targetLandmarks?: number[][];
  createdAt: string;
}

export interface PoseFilter {
  category?: Category;
  difficulty?: DifficultyLevel;
  framing?: FramingType;
  cameraAngle?: CameraAngle;
  tags?: string[];
  searchQuery?: string;
}

export interface PoseRecommendationRequest {
  gender?: 'male' | 'female' | 'neutral';
  peopleCount?: number;
  clothing?: string;
  location?: 'indoor' | 'outdoor';
  occasion?: string;
  mood?: string;
  aesthetic?: string;
  cameraType?: string;
  framing?: FramingType;
  experience?: 'beginner' | 'advanced';
  bodyPreferences?: string[];
}

export interface PoseRecommendation {
  pose: Pose;
  reason: string;
  confidence: number;
  alternatives?: Pose[];
}
