import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, G, Path, Rect } from 'react-native-svg';
import { NormalizedLandmark, POSE_CONNECTIONS } from '../types/landmarks';
import { Category, FramingType } from '../types/pose';
import { getTargetPoseSkeleton } from '../utils/poseArchetypes';

interface SkeletonOverlayProps {
  landmarks?: NormalizedLandmark[];
  width: number;
  height: number;
  isFrontCamera?: boolean;
  isAligned?: boolean;
  opacity?: number;
  targetCategory?: Category;
  targetFraming?: FramingType;
  showTargetGuide?: boolean;
  showRuleOfThirds?: boolean;
}

export const SkeletonOverlay: React.FC<SkeletonOverlayProps> = ({
  landmarks,
  width,
  height,
  isFrontCamera = true,
  isAligned = false,
  opacity = 0.8,
  targetCategory = 'standing',
  targetFraming = 'full-body',
  showTargetGuide = true,
  showRuleOfThirds = true,
}) => {
  if (width <= 0 || height <= 0 || opacity <= 0) {
    return null;
  }

  // Target skeleton coordinates (the ideal pose stencil on screen)
  const targetLandmarks = getTargetPoseSkeleton(targetCategory, targetFraming);

  // Map normalized coordinate (0-1) to screen pixel coordinate
  const mapPoint = (lm: NormalizedLandmark, isTarget = false) => {
    // For front camera, detected landmarks are mirrored, but target template is fixed
    const rawX = !isTarget && isFrontCamera ? 1 - lm.x : lm.x;
    return {
      x: rawX * width,
      y: lm.y * height,
    };
  };

  const hasDetectedLandmarks = landmarks && landmarks.length >= 33;

  // Active theme colors
  const targetBoneColor = 'rgba(56, 189, 248, 0.75)'; // Sky blue guide
  const targetGlowColor = 'rgba(56, 189, 248, 0.25)';
  const targetJointColor = '#38BDF8';

  const userBoneColor = isAligned ? 'rgba(52, 199, 89, 0.95)' : 'rgba(0, 229, 255, 0.85)';
  const userJointColor = isAligned ? '#34C759' : '#00E5FF';
  const userGlowColor = isAligned ? 'rgba(52, 199, 89, 0.45)' : 'rgba(0, 229, 255, 0.35)';

  return (
    <View pointerEvents="none" style={[styles.container, { width, height, opacity }]}>
      <Svg width={width} height={height}>
        {/* Photography Rule of Thirds Grid */}
        {showRuleOfThirds && (
          <G stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="4,4">
            <Line x1={width * 0.333} y1="0" x2={width * 0.333} y2={height} />
            <Line x1={width * 0.666} y1="0" x2={width * 0.666} y2={height} />
            <Line x1="0" y1={height * 0.333} x2={width} y2={height * 0.333} />
            <Line x1="0" y1={height * 0.666} x2={width} y2={height * 0.666} />
          </G>
        )}

        {/* Viewfinder Framing Corner Brackets */}
        <G stroke={isAligned ? '#34C759' : 'rgba(255, 255, 255, 0.6)'} strokeWidth="2.5" fill="none">
          {/* Top Left */}
          <Line x1="24" y1="24" x2="54" y2="24" />
          <Line x1="24" y1="24" x2="24" y2="54" />
          {/* Top Right */}
          <Line x1={width - 24} y1="24" x2={width - 54} y2="24" />
          <Line x1={width - 24} y1="24" x2={width - 24} y2="54" />
          {/* Bottom Left */}
          <Line x1="24" y1={height - 24} x2="54" y2={height - 24} />
          <Line x1="24" y1={height - 24} x2="24" y2={height - 54} />
          {/* Bottom Right */}
          <Line x1={width - 24} y1={height - 24} x2={width - 54} y2={height - 24} />
          <Line x1={width - 24} y1={height - 24} x2={width - 24} y2={height - 54} />
        </G>

        {/* 1. TARGET AR POSE GUIDE SKELETON (Always projected on viewfinder) */}
        {showTargetGuide && (
          <G>
            {/* Target Head Silhouette */}
            {(() => {
              const nose = mapPoint(targetLandmarks[0], true);
              const headRadius = targetFraming === 'close-up' ? 38 : targetFraming === 'waist-up' ? 28 : 22;
              return (
                <G>
                  <Circle
                    cx={nose.x}
                    cy={nose.y}
                    r={headRadius + 6}
                    fill={targetGlowColor}
                  />
                  <Circle
                    cx={nose.x}
                    cy={nose.y}
                    r={headRadius}
                    stroke={targetBoneColor}
                    strokeWidth="2.5"
                    strokeDasharray="4,3"
                    fill="rgba(56, 189, 248, 0.1)"
                  />
                  {/* Face direction cross */}
                  <Line
                    x1={nose.x - 6}
                    y1={nose.y}
                    x2={nose.x + 6}
                    y2={nose.y}
                    stroke={targetBoneColor}
                    strokeWidth="1.5"
                  />
                  <Line
                    x1={nose.x}
                    y1={nose.y - 6}
                    x2={nose.x}
                    y2={nose.y + 6}
                    stroke={targetBoneColor}
                    strokeWidth="1.5"
                  />
                </G>
              );
            })()}

            {/* Target Skeleton Bones (Dashed AR Guide) */}
            {POSE_CONNECTIONS.map(([startIdx, endIdx], idx) => {
              const startLm = targetLandmarks[startIdx];
              const endLm = targetLandmarks[endIdx];
              if (!startLm || !endLm) return null;

              const p1 = mapPoint(startLm, true);
              const p2 = mapPoint(endLm, true);

              return (
                <G key={`target-bone-${idx}`}>
                  {/* Outer soft glow */}
                  <Line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={targetGlowColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Dashed core bone */}
                  <Line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={targetBoneColor}
                    strokeWidth="3"
                    strokeDasharray="6,4"
                    strokeLinecap="round"
                  />
                </G>
              );
            })}

            {/* Target Joint Rings */}
            {[11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].map(jointIdx => {
              const lm = targetLandmarks[jointIdx];
              if (!lm) return null;
              const p = mapPoint(lm, true);

              return (
                <G key={`target-joint-${jointIdx}`}>
                  <Circle cx={p.x} cy={p.y} r="8" fill={targetGlowColor} />
                  <Circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    stroke={targetJointColor}
                    strokeWidth="2"
                    fill="rgba(15, 23, 42, 0.6)"
                  />
                  <Circle cx={p.x} cy={p.y} r="2" fill="#FFFFFF" />
                </G>
              );
            })}
          </G>
        )}

        {/* 2. REAL-TIME DETECTED USER SKELETON (Overlaid when person is in frame) */}
        {hasDetectedLandmarks && (
          <G>
            {/* Draw detected bones */}
            {POSE_CONNECTIONS.map(([startIdx, endIdx], idx) => {
              const startLm = landmarks[startIdx];
              const endLm = landmarks[endIdx];
              if (!startLm || !endLm) return null;
              if ((startLm.visibility ?? 1) < 0.4 || (endLm.visibility ?? 1) < 0.4) return null;

              const p1 = mapPoint(startLm, false);
              const p2 = mapPoint(endLm, false);

              return (
                <G key={`user-bone-${idx}`}>
                  <Line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={userGlowColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <Line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={userBoneColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </G>
              );
            })}

            {/* Draw detected joint points */}
            {landmarks.map((lm, idx) => {
              const isKeyJoint = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(idx);
              if (!isKeyJoint || (lm.visibility ?? 1) < 0.4) return null;

              const p = mapPoint(lm, false);
              const isNose = idx === 0;

              return (
                <G key={`user-joint-${idx}`}>
                  <Circle cx={p.x} cy={p.y} r={isNose ? 10 : 8} fill={userGlowColor} />
                  <Circle cx={p.x} cy={p.y} r={isNose ? 6 : 5} fill={userJointColor} />
                  <Circle cx={p.x} cy={p.y} r="2" fill="#FFFFFF" />
                </G>
              );
            })}
          </G>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
});
