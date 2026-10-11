import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G } from 'react-native-svg';
import { PoseContourId, renderPoseSvgPaths } from './PoseContourSilhouette';

interface PoseOutlineThumbnailProps {
  poseId: PoseContourId | string;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
}

export const PoseOutlineThumbnail: React.FC<PoseOutlineThumbnailProps> = ({
  poseId,
  size = 72,
  strokeColor = '#0F172A',
  strokeWidth = 3,
  fillColor = 'rgba(0, 0, 0, 0.02)',
}) => {
  const resolvedId: PoseContourId = (poseId as PoseContourId) || 'couple-heart-arch';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 400 440">
        <G
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {renderPoseSvgPaths(resolvedId, fillColor, '#F43F5E')}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
