import { PoseRecommendationRequest } from '../../types/pose';

export interface AIGeneratedPoseResult {
  id: string;
  title: string;
  reason: string;
  stepByStepInstructions: string[];
  handAndLegPlacement: string;
  headAndExpression: string;
  cameraAngleAndFraming: string;
  environmentSuitability: string;
  difficultyScore: 'Beginner' | 'Intermediate' | 'Advanced';
  alternativePoseTitle: string;
  matchingLocalPoseId?: string;
  onlineSearchQuery?: string;
  provider: 'local-offline' | 'free-online' | 'local-fallback';
}

export interface IAIProvider {
  readonly id: string;
  readonly name: string;
  readonly isOnline: boolean;
  generateRecommendations(
    userPrompt: string,
    structuredCriteria?: PoseRecommendationRequest
  ): Promise<AIGeneratedPoseResult[]>;
}
