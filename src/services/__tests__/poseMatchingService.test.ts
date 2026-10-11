import { PoseMatchingService } from '../poseMatchingService';
import { NormalizedLandmark } from '../../types/landmarks';
import { Pose } from '../../types/pose';

describe('PoseMatchingService', () => {
  it('should calculate angles accurately between three landmarks', () => {
    // 90-degree right angle (e.g. shoulder at (0, 0), elbow at (0, 1), wrist at (1, 1))
    const a: NormalizedLandmark = { x: 0, y: 0 };
    const b: NormalizedLandmark = { x: 0, y: 1 };
    const c: NormalizedLandmark = { x: 1, y: 1 };

    const angle = PoseMatchingService.calculateAngle(a, b, c);
    expect(angle).toBe(90);

    // 180-degree straight line (shoulder at (0, 0), elbow at (0, 1), wrist at (0, 2))
    const d: NormalizedLandmark = { x: 0, y: 2 };
    const straightAngle = PoseMatchingService.calculateAngle(a, b, d);
    expect(straightAngle).toBe(180);
  });

  it('should calculate Euclidean distance between two landmarks', () => {
    const a: NormalizedLandmark = { x: 0, y: 0 };
    const b: NormalizedLandmark = { x: 3, y: 4 };
    const dist = PoseMatchingService.calculateDistance(a, b);
    expect(dist).toBe(5);
  });

  it('should return empty/unaligned result when no landmarks are provided', () => {
    const result = PoseMatchingService.evaluatePose([]);
    expect(result.overallScore).toBe(0);
    expect(result.isAligned).toBe(false);
    expect(result.coachingHints[0]).toContain('camera frame');
  });

  it('should generate hints when person is in frame', () => {
    // Generate mock 33 landmarks
    const mockLandmarks: NormalizedLandmark[] = Array.from({ length: 33 }, (_, i) => ({
      x: 0.5,
      y: 0.1 + i * 0.02,
      visibility: 0.9,
    }));

    const mockPose: Pose = {
      id: 'test-pose',
      title: 'Full Body Standing',
      description: 'Test pose',
      category: 'standing',
      tags: ['standing'],
      difficulty: 'beginner',
      framing: 'full-body',
      cameraAngle: 'eye-level',
      bodyInstructions: {
        head: 'Straight ahead',
        shoulders: 'Level',
        arms: 'Relaxed',
      },
      facialExpression: 'Smile',
      lighting: 'Bright',
      environment: 'Studio',
      sourceType: 'local',
      createdAt: '2024-01-01',
    };

    const evaluation = PoseMatchingService.evaluatePose(mockLandmarks, mockPose);
    expect(evaluation.overallScore).toBeGreaterThan(0);
    expect(evaluation.coachingHints.length).toBeGreaterThan(0);
    expect(evaluation.statusText).toBeDefined();
  });
});
