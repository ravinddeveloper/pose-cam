import { NormalizedLandmark, PoseAlignmentResult } from '../types/landmarks';
import { Pose } from '../types/pose';

export class PoseMatchingService {
  /**
   * Calculate angle in degrees between three 2D points (A -> B -> C, angle at B)
   */
  static calculateAngle(
    a: NormalizedLandmark,
    b: NormalizedLandmark,
    c: NormalizedLandmark
  ): number {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return Math.round(angle);
  }

  /**
   * Distance between two normalized points
   */
  static calculateDistance(a: NormalizedLandmark, b: NormalizedLandmark): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if a landmark is sufficiently visible
   */
  static isVisible(lm?: NormalizedLandmark, threshold: number = 0.5): boolean {
    if (!lm) return false;
    return (lm.visibility ?? 1.0) >= threshold;
  }

  /**
   * Evaluate detected landmarks against target pose guidance and return alignment scores & actionable hints
   */
  static evaluatePose(
    detectedLandmarks: NormalizedLandmark[],
    targetPose?: Pose
  ): PoseAlignmentResult {
    const hints: string[] = [];

    if (!detectedLandmarks || detectedLandmarks.length < 33) {
      return {
        overallScore: 0,
        upperBodyScore: 0,
        lowerBodyScore: 0,
        isAligned: false,
        statusText: 'No person detected in frame',
        coachingHints: ['Step into the camera frame to begin pose guidance']
      };
    }

    const nose = detectedLandmarks[0];
    const leftShoulder = detectedLandmarks[11];
    const rightShoulder = detectedLandmarks[12];
    const leftElbow = detectedLandmarks[13];
    const rightElbow = detectedLandmarks[14];
    const leftWrist = detectedLandmarks[15];
    const rightWrist = detectedLandmarks[16];
    const leftHip = detectedLandmarks[23];
    const rightHip = detectedLandmarks[24];
    const leftKnee = detectedLandmarks[25];
    const rightKnee = detectedLandmarks[26];
    const leftAnkle = detectedLandmarks[27];
    const rightAnkle = detectedLandmarks[28];

    const upperVisible =
      this.isVisible(leftShoulder) &&
      this.isVisible(rightShoulder) &&
      this.isVisible(nose);

    const lowerVisible =
      this.isVisible(leftHip) &&
      this.isVisible(rightHip) &&
      (this.isVisible(leftKnee) || this.isVisible(rightKnee));

    // Framing verification
    if (targetPose) {
      if (targetPose.framing === 'full-body' && (!this.isVisible(leftAnkle) && !this.isVisible(rightAnkle))) {
        hints.push('Move further back to fit your full body in the frame');
      } else if (targetPose.framing === 'close-up' && (this.isVisible(leftHip) || this.isVisible(rightHip))) {
        hints.push('Step closer to the camera for an intimate portrait framing');
      }
    }

    // Head position check
    if (upperVisible) {
      const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

      // Check head tilt
      const headOffset = nose.x - shoulderMidX;
      if (Math.abs(headOffset) > 0.08) {
        if (targetPose?.bodyInstructions.head) {
          hints.push(`Head hint: ${targetPose.bodyInstructions.head}`);
        } else {
          hints.push(headOffset > 0 ? 'Straighten head slightly to the left' : 'Straighten head slightly to the right');
        }
      }

      // Check shoulder slant
      const shoulderSlant = Math.abs(leftShoulder.y - rightShoulder.y);
      if (shoulderSlant > 0.06) {
        if (targetPose?.bodyInstructions.shoulders) {
          hints.push(`Shoulders: ${targetPose.bodyInstructions.shoulders}`);
        } else {
          hints.push('Relax and level your shoulders naturally');
        }
      } else {
        if (targetPose?.bodyInstructions.shoulders) {
          hints.push(targetPose.bodyInstructions.shoulders);
        }
      }
    }

    // Arm positioning
    let upperScore = 60;
    if (this.isVisible(leftElbow) && this.isVisible(leftWrist)) {
      const leftElbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
      if (leftElbowAngle < 70) {
        // Bent arm
        if (targetPose?.bodyInstructions.arms) {
          hints.push(targetPose.bodyInstructions.arms);
        }
      }
      upperScore += 15;
    }

    if (this.isVisible(rightElbow) && this.isVisible(rightWrist)) {
      const rightElbowAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
      if (rightElbowAngle < 70) {
        if (targetPose?.bodyInstructions.hands) {
          hints.push(targetPose.bodyInstructions.hands);
        }
      }
      upperScore += 15;
    }

    // Lower body / posture check
    let lowerScore = 50;
    if (lowerVisible) {
      lowerScore += 20;
      if (this.isVisible(leftAnkle) && this.isVisible(rightAnkle)) {
        lowerScore += 20;
        const feetDistance = this.calculateDistance(leftAnkle, rightAnkle);
        if (feetDistance < 0.05) {
          hints.push('Shift weight slightly to one leg for a relaxed, natural contour');
        }
      }
      if (targetPose?.bodyInstructions.legs) {
        hints.push(targetPose.bodyInstructions.legs);
      }
    } else {
      if (targetPose?.framing === 'full-body') {
        hints.push('Adjust camera angle so your legs and feet are visible');
      }
    }

    // Fallback hints from targetPose if hints list is small
    if (hints.length === 0 && targetPose) {
      if (targetPose.bodyInstructions.posture) hints.push(targetPose.bodyInstructions.posture);
      if (targetPose.facialExpression) hints.push(`Expression: ${targetPose.facialExpression}`);
      if (targetPose.cameraAngle) hints.push(`Suggested angle: ${targetPose.cameraAngle}`);
    }

    // Ensure at least one positive coaching hint
    if (hints.length === 0) {
      hints.push('Great alignment! Hold this posture and relax your expression');
    }

    upperScore = Math.min(100, Math.max(20, upperScore));
    lowerScore = Math.min(100, Math.max(20, lowerScore));
    const overallScore = Math.round((upperScore * 0.6) + (lowerScore * 0.4));
    const isAligned = overallScore >= 70;

    let statusText = 'Aligning body to pose';
    if (overallScore >= 85) {
      statusText = 'Excellent pose! Ready to snap';
    } else if (overallScore >= 70) {
      statusText = 'Good alignment! Minor adjustment suggested';
    } else if (upperVisible) {
      statusText = 'Upper body detected. Follow hints';
    } else {
      statusText = 'Step clearly into frame';
    }

    return {
      overallScore,
      upperBodyScore: upperScore,
      lowerBodyScore: lowerScore,
      isAligned,
      statusText,
      coachingHints: Array.from(new Set(hints)).slice(0, 4)
    };
  }
}
