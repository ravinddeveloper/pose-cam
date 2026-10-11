import { NormalizedLandmark } from '../types/landmarks';
import { Category, FramingType } from '../types/pose';

/**
 * Generate normalized 33-point target skeleton coordinates [0.0 - 1.0]
 * for a given pose category and framing.
 */
export function getTargetPoseSkeleton(
  category: Category = 'standing',
  framing: FramingType = 'full-body'
): NormalizedLandmark[] {
  const landmarks: NormalizedLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    visibility: 1,
    presence: 1,
  }));

  // Framing scale & vertical offset
  let topY = 0.12;
  let bottomY = 0.88;
  let headSize = 0.07;

  if (framing === 'waist-up') {
    topY = 0.15;
    bottomY = 1.05; // lower body below frame
    headSize = 0.10;
  } else if (framing === 'close-up') {
    topY = 0.18;
    bottomY = 1.30;
    headSize = 0.14;
  } else if (framing === 'three-quarter') {
    topY = 0.14;
    bottomY = 0.95;
    headSize = 0.08;
  }

  const height = bottomY - topY;
  const cx = 0.5;

  // Head (0: Nose, 2: Left Eye, 5: Right Eye)
  landmarks[0] = { x: cx, y: topY + headSize * 0.6, visibility: 1 };
  landmarks[2] = { x: cx - 0.025, y: topY + headSize * 0.45, visibility: 1 };
  landmarks[5] = { x: cx + 0.025, y: topY + headSize * 0.45, visibility: 1 };
  landmarks[7] = { x: cx - 0.05, y: topY + headSize * 0.55, visibility: 1 };
  landmarks[8] = { x: cx + 0.05, y: topY + headSize * 0.55, visibility: 1 };

  // Shoulders (11: Left Shoulder, 12: Right Shoulder)
  const shoulderY = topY + height * 0.18;
  const shoulderHalfWidth = framing === 'close-up' ? 0.18 : 0.12;

  // Torso / Hips (23: Left Hip, 24: Right Hip)
  const hipY = topY + height * 0.48;
  const hipHalfWidth = 0.08;

  // Apply archetype-specific limb positions
  switch (category) {
    case 'sitting': {
      // Leveled shoulders
      landmarks[11] = { x: cx - shoulderHalfWidth, y: shoulderY, visibility: 1 };
      landmarks[12] = { x: cx + shoulderHalfWidth, y: shoulderY, visibility: 1 };

      // Hips
      landmarks[23] = { x: cx - hipHalfWidth, y: hipY, visibility: 1 };
      landmarks[24] = { x: cx + hipHalfWidth, y: hipY, visibility: 1 };

      // Arms resting on lap
      landmarks[13] = { x: cx - 0.13, y: hipY - 0.06, visibility: 1 }; // left elbow
      landmarks[14] = { x: cx + 0.13, y: hipY - 0.06, visibility: 1 }; // right elbow
      landmarks[15] = { x: cx - 0.05, y: hipY + 0.02, visibility: 1 }; // left wrist
      landmarks[16] = { x: cx + 0.05, y: hipY + 0.02, visibility: 1 }; // right wrist

      // Sitting knees bent forward
      const kneeY = hipY + height * 0.22;
      landmarks[25] = { x: cx - 0.11, y: kneeY, visibility: 1 }; // left knee
      landmarks[26] = { x: cx + 0.11, y: kneeY, visibility: 1 }; // right knee

      // Shins down to ankles
      const ankleY = bottomY;
      landmarks[27] = { x: cx - 0.10, y: ankleY, visibility: 1 }; // left ankle
      landmarks[28] = { x: cx + 0.10, y: ankleY, visibility: 1 }; // right ankle
      break;
    }

    case 'walking': {
      // Forward stride
      landmarks[11] = { x: cx - shoulderHalfWidth - 0.02, y: shoulderY, visibility: 1 };
      landmarks[12] = { x: cx + shoulderHalfWidth - 0.01, y: shoulderY + 0.01, visibility: 1 };

      landmarks[23] = { x: cx - hipHalfWidth, y: hipY, visibility: 1 };
      landmarks[24] = { x: cx + hipHalfWidth, y: hipY, visibility: 1 };

      // Arm swing
      landmarks[13] = { x: cx - 0.16, y: shoulderY + 0.12, visibility: 1 }; // left elbow back
      landmarks[15] = { x: cx - 0.18, y: shoulderY + 0.22, visibility: 1 }; // left wrist back
      landmarks[14] = { x: cx + 0.14, y: shoulderY + 0.10, visibility: 1 }; // right elbow forward
      landmarks[16] = { x: cx + 0.16, y: shoulderY + 0.18, visibility: 1 }; // right wrist forward

      // Front leg (right) & back leg (left)
      const kneeY = topY + height * 0.70;
      landmarks[25] = { x: cx - 0.09, y: kneeY - 0.03, visibility: 1 }; // left knee back
      landmarks[27] = { x: cx - 0.14, y: bottomY - 0.02, visibility: 1 }; // left ankle back

      landmarks[26] = { x: cx + 0.10, y: kneeY + 0.02, visibility: 1 }; // right knee forward
      landmarks[28] = { x: cx + 0.15, y: bottomY, visibility: 1 }; // right ankle forward
      break;
    }

    case 'fashion':
    case 'creative': {
      // S-curve model posture: tilted shoulders, popped hip
      landmarks[11] = { x: cx - shoulderHalfWidth, y: shoulderY - 0.015, visibility: 1 };
      landmarks[12] = { x: cx + shoulderHalfWidth, y: shoulderY + 0.02, visibility: 1 };

      // Hip pop to right
      landmarks[23] = { x: cx - hipHalfWidth + 0.03, y: hipY, visibility: 1 };
      landmarks[24] = { x: cx + hipHalfWidth + 0.04, y: hipY - 0.015, visibility: 1 };

      // Hand on hip (left arm)
      landmarks[13] = { x: cx - 0.18, y: shoulderY + 0.10, visibility: 1 }; // left elbow flared
      landmarks[15] = { x: cx - hipHalfWidth + 0.01, y: hipY - 0.01, visibility: 1 }; // left wrist on hip

      // Hand touching hair or relaxed at side (right arm)
      landmarks[14] = { x: cx + 0.16, y: shoulderY + 0.06, visibility: 1 };
      landmarks[16] = { x: cx + 0.08, y: topY + headSize * 0.4, visibility: 1 }; // hand in hair

      // Crossed kick leg
      const kneeY = topY + height * 0.72;
      landmarks[25] = { x: cx + 0.02, y: kneeY - 0.02, visibility: 1 }; // crossed left knee
      landmarks[27] = { x: cx - 0.02, y: bottomY, visibility: 1 };

      landmarks[26] = { x: cx + 0.09, y: kneeY, visibility: 1 }; // straight right leg
      landmarks[28] = { x: cx + 0.07, y: bottomY, visibility: 1 };
      break;
    }

    case 'selfies': {
      // Head tilt
      landmarks[0] = { x: cx - 0.02, y: topY + headSize * 0.65, visibility: 1 };

      landmarks[11] = { x: cx - shoulderHalfWidth, y: shoulderY + 0.01, visibility: 1 };
      landmarks[12] = { x: cx + shoulderHalfWidth, y: shoulderY - 0.01, visibility: 1 };

      landmarks[23] = { x: cx - hipHalfWidth, y: hipY, visibility: 1 };
      landmarks[24] = { x: cx + hipHalfWidth, y: hipY, visibility: 1 };

      // Extended arm holding phone up forward
      landmarks[14] = { x: cx + 0.22, y: shoulderY - 0.04, visibility: 1 }; // right elbow up
      landmarks[16] = { x: cx + 0.30, y: topY + 0.02, visibility: 1 }; // right wrist extended

      // Other arm resting relaxed
      landmarks[13] = { x: cx - 0.14, y: shoulderY + 0.12, visibility: 1 };
      landmarks[15] = { x: cx - 0.10, y: hipY - 0.05, visibility: 1 };

      // Lower body
      landmarks[25] = { x: cx - 0.06, y: topY + height * 0.72, visibility: 1 };
      landmarks[26] = { x: cx + 0.06, y: topY + height * 0.72, visibility: 1 };
      landmarks[27] = { x: cx - 0.06, y: bottomY, visibility: 1 };
      landmarks[28] = { x: cx + 0.06, y: bottomY, visibility: 1 };
      break;
    }

    default: {
      // Classic Standing / Solo Portrait
      landmarks[11] = { x: cx - shoulderHalfWidth, y: shoulderY, visibility: 1 };
      landmarks[12] = { x: cx + shoulderHalfWidth, y: shoulderY, visibility: 1 };

      landmarks[23] = { x: cx - hipHalfWidth, y: hipY, visibility: 1 };
      landmarks[24] = { x: cx + hipHalfWidth, y: hipY, visibility: 1 };

      // Arms gently curved down at sides
      landmarks[13] = { x: cx - shoulderHalfWidth - 0.03, y: shoulderY + height * 0.16, visibility: 1 };
      landmarks[14] = { x: cx + shoulderHalfWidth + 0.03, y: shoulderY + height * 0.16, visibility: 1 };
      landmarks[15] = { x: cx - shoulderHalfWidth - 0.02, y: hipY + 0.04, visibility: 1 };
      landmarks[16] = { x: cx + shoulderHalfWidth + 0.02, y: hipY + 0.04, visibility: 1 };

      // Legs shoulder width
      const kneeY = topY + height * 0.72;
      landmarks[25] = { x: cx - 0.06, y: kneeY, visibility: 1 };
      landmarks[26] = { x: cx + 0.06, y: kneeY, visibility: 1 };
      landmarks[27] = { x: cx - 0.07, y: bottomY, visibility: 1 };
      landmarks[28] = { x: cx + 0.07, y: bottomY, visibility: 1 };
      break;
    }
  }

  return landmarks;
}
