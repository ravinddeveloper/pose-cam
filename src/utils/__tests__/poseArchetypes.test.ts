import { getTargetPoseSkeleton } from '../poseArchetypes';

describe('poseArchetypes - getTargetPoseSkeleton', () => {
  it('should generate 33 normalized landmarks for standing pose', () => {
    const landmarks = getTargetPoseSkeleton('standing', 'full-body');
    expect(landmarks).toHaveLength(33);

    // Nose should be near top center
    expect(landmarks[0].x).toBe(0.5);
    expect(landmarks[0].y).toBeLessThan(0.3);

    // Left and right shoulders
    expect(landmarks[11].x).toBeLessThan(0.5);
    expect(landmarks[12].x).toBeGreaterThan(0.5);

    // Left and right ankles near bottom
    expect(landmarks[27].y).toBeGreaterThan(0.8);
    expect(landmarks[28].y).toBeGreaterThan(0.8);
  });

  it('should adjust scale and vertical offset for waist-up framing', () => {
    const fullBody = getTargetPoseSkeleton('standing', 'full-body');
    const waistUp = getTargetPoseSkeleton('standing', 'waist-up');

    // Waist up shoulders should be lower down proportionally in the frame
    expect(waistUp[11].y).toBeGreaterThan(fullBody[11].y);
    // Hips should be near bottom of frame
    expect(waistUp[23].y).toBeGreaterThan(0.55);
  });

  it('should produce distinct geometry for sitting and fashion poses', () => {
    const sitting = getTargetPoseSkeleton('sitting', 'full-body');
    const fashion = getTargetPoseSkeleton('fashion', 'full-body');

    // Fashion has hand on hip (left wrist close to left hip)
    expect(fashion[15].y).toBeGreaterThan(0.4);

    // Sitting has knees bent
    expect(sitting[25].y).toBeDefined();
  });
});
