import { RecommendationService } from '../recommendationService';
import { Pose, PoseRecommendationRequest } from '../../types/pose';

describe('RecommendationService', () => {
  const mockPoses: Pose[] = [
    {
      id: 'pose-001',
      title: 'Solo Coffee Candid',
      description: 'Relaxed sitting portrait in a cafe',
      category: 'solo-portraits',
      tags: ['sitting', 'cafe', 'casual', 'solo'],
      difficulty: 'beginner',
      framing: 'waist-up',
      cameraAngle: 'eye-level',
      bodyInstructions: {
        head: 'Look towards window',
        hands: 'Holding cup with both hands',
        posture: 'Leaning slightly forward on table',
      },
      facialExpression: 'Gentle relaxed smile',
      lighting: 'Warm ambient cafe light',
      environment: 'Indoor cafe',
      sourceType: 'local',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'pose-002',
      title: 'Sunset Beach Couple',
      description: 'Romantic couple walking along shoreline',
      category: 'couples',
      tags: ['couple', 'beach', 'sunset', 'romantic'],
      difficulty: 'beginner',
      framing: 'full-body',
      cameraAngle: 'low-angle',
      bodyInstructions: {
        head: 'Looking at each other',
        hands: 'Holding hands while walking',
        legs: 'Mid-stride strolling',
      },
      facialExpression: 'Warm affectionate laughter',
      lighting: 'Golden hour sunset',
      environment: 'Outdoor beach',
      sourceType: 'local',
      createdAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'pose-003',
      title: 'Family Park Gathering',
      description: 'Joyful family sitting together on grass',
      category: 'family',
      tags: ['family', 'group', 'park', 'outdoor'],
      difficulty: 'beginner',
      framing: 'full-body',
      cameraAngle: 'eye-level',
      bodyInstructions: {
        posture: 'Close together in triangular formation',
      },
      facialExpression: 'Happy bright smiles',
      lighting: 'Diffused daylight',
      environment: 'Outdoor park',
      sourceType: 'local',
      createdAt: '2024-01-03T00:00:00Z',
    },
  ];

  it('should recommend solo poses when peopleCount is 1', () => {
    const request: PoseRecommendationRequest = { peopleCount: 1 };
    const results = RecommendationService.recommendPoses(mockPoses, request);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].pose.id).toBe('pose-001');
  });

  it('should recommend couple poses when peopleCount is 2', () => {
    const request: PoseRecommendationRequest = { peopleCount: 2 };
    const results = RecommendationService.recommendPoses(mockPoses, request);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].pose.id).toBe('pose-002');
  });

  it('should recommend group/family poses when peopleCount is 3+', () => {
    const request: PoseRecommendationRequest = { peopleCount: 4 };
    const results = RecommendationService.recommendPoses(mockPoses, request);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].pose.id).toBe('pose-003');
  });

  it('should filter by indoor/outdoor location', () => {
    const indoorReq: PoseRecommendationRequest = { location: 'indoor' };
    const indoorResults = RecommendationService.recommendPoses(mockPoses, indoorReq);
    expect(indoorResults.every(r => r.pose.environment.toLowerCase().includes('indoor'))).toBe(true);

    const outdoorReq: PoseRecommendationRequest = { location: 'outdoor' };
    const outdoorResults = RecommendationService.recommendPoses(mockPoses, outdoorReq);
    expect(outdoorResults.every(r => r.pose.environment.toLowerCase().includes('outdoor'))).toBe(true);
  });

  it('should filter by mood', () => {
    const request: PoseRecommendationRequest = { mood: 'romantic' };
    const results = RecommendationService.recommendPoses(mockPoses, request);
    expect(results.length).toBe(1);
    expect(results[0].pose.id).toBe('pose-002');
  });

  it('should calculate confidence scores and alternative poses', () => {
    const request: PoseRecommendationRequest = { peopleCount: 1, location: 'indoor' };
    const results = RecommendationService.recommendPoses(mockPoses, request);
    expect(results[0].confidence).toBeGreaterThan(0);
    expect(results[0].reason).toBeDefined();
  });
});
