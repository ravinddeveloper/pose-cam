import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path, G } from 'react-native-svg';
import { Category, FramingType } from '../types/pose';

interface PoseStickFigureProps {
  category?: Category;
  framing?: FramingType;
  color?: string;
  accentColor?: string;
  size?: number;
}

export const PoseStickFigure: React.FC<PoseStickFigureProps> = ({
  category = 'standing',
  framing = 'full-body',
  color = '#2563EB',
  accentColor = '#38BDF8',
  size = 200,
}) => {
  const width = size;
  const height = size;

  // Render pose archetypes based on pose category and framing
  const renderPoseGraphics = () => {
    switch (category) {
      case 'sitting':
        return (
          <G stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Head */}
            <Circle cx="100" cy="50" r="14" fill={color} />
            {/* Torso */}
            <Line x1="100" y1="64" x2="98" y2="120" />
            {/* Thighs (horizontal) */}
            <Line x1="98" y1="120" x2="140" y2="120" />
            {/* Shins (vertical down) */}
            <Line x1="140" y1="120" x2="142" y2="165" />
            {/* Feet */}
            <Line x1="142" y1="165" x2="155" y2="165" />
            {/* Arms resting on lap */}
            <Line x1="100" y1="78" x2="120" y2="105" />
            <Line x1="120" y1="105" x2="135" y2="118" />
            {/* Bench / Stool line */}
            <Line x1="75" y1="122" x2="148" y2="122" stroke="#94A3B8" strokeWidth="3" />
            <Line x1="88" y1="122" x2="88" y2="168" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3,3" />
            {/* Joints highlight */}
            <Circle cx="98" cy="120" r="4" fill={accentColor} />
            <Circle cx="140" cy="120" r="4" fill={accentColor} />
          </G>
        );

      case 'walking':
        return (
          <G stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Head */}
            <Circle cx="105" cy="40" r="14" fill={color} />
            {/* Torso tilted forward slightly */}
            <Line x1="105" y1="54" x2="98" y2="108" />
            {/* Front Leg */}
            <Line x1="98" y1="108" x2="124" y2="140" />
            <Line x1="124" y1="140" x2="142" y2="175" />
            {/* Back Leg */}
            <Line x1="98" y1="108" x2="76" y2="138" />
            <Line x1="76" y1="138" x2="62" y2="172" />
            {/* Left Arm swinging back */}
            <Line x1="103" y1="68" x2="80" y2="92" />
            <Line x1="80" y1="92" x2="70" y2="115" />
            {/* Right Arm swinging forward */}
            <Line x1="103" y1="68" x2="122" y2="90" />
            <Line x1="122" y1="90" x2="135" y2="112" />
            {/* Accent joints */}
            <Circle cx="124" cy="140" r="4" fill={accentColor} />
            <Circle cx="76" cy="138" r="4" fill={accentColor} />
          </G>
        );

      case 'selfies':
        return (
          <G stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Head with tilt */}
            <Circle cx="105" cy="65" r="18" fill={color} />
            {/* Torso - waist up */}
            <Line x1="105" y1="83" x2="100" y2="155" />
            {/* Arm holding phone up forward */}
            <Line x1="104" y1="95" x2="142" y2="85" />
            <Line x1="142" y1="85" x2="165" y2="55" />
            {/* Phone */}
            <Line x1="160" y1="46" x2="174" y2="60" stroke={accentColor} strokeWidth="5" />
            {/* Other arm tucked */}
            <Line x1="104" y1="95" x2="75" y2="125" />
            <Line x1="75" y1="125" x2="88" y2="145" />
            <Circle cx="105" cy="65" r="5" fill="#FFFFFF" />
          </G>
        );

      case 'couples':
      case 'wedding':
        return (
          <G stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Person 1 (Left) */}
            <Circle cx="80" cy="45" r="13" fill={color} />
            <Line x1="80" y1="58" x2="82" y2="115" />
            <Line x1="82" y1="115" x2="74" y2="170" />
            <Line x1="82" y1="115" x2="90" y2="170" />
            {/* Person 2 (Right, leaning slightly) */}
            <Circle cx="118" cy="48" r="12" fill={accentColor} />
            <Line x1="118" y1="60" x2="114" y2="115" stroke={accentColor} />
            <Line x1="114" y1="115" x2="110" y2="170" stroke={accentColor} />
            <Line x1="114" y1="115" x2="124" y2="170" stroke={accentColor} />
            {/* Intertwined Arms */}
            <Line x1="81" y1="72" x2="100" y2="88" />
            <Line x1="116" y1="74" x2="100" y2="88" stroke={accentColor} />
            {/* Heart accent above */}
            <Path
              d="M 97,25 C 97,20 92,15 88,18 C 84,21 86,27 97,35 C 108,27 110,21 106,18 C 102,15 97,20 97,25 Z"
              fill="#F43F5E"
              stroke="#F43F5E"
              strokeWidth="1"
            />
          </G>
        );

      case 'fashion':
      case 'creative':
        return (
          <G stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* High-fashion S-curve pose */}
            <Circle cx="95" cy="38" r="14" fill={color} />
            {/* Torso curve */}
            <Path d="M 95,52 Q 108,82 92,112" />
            {/* Weight on one hip */}
            <Line x1="92" y1="112" x2="88" y2="172" />
            {/* Crossed kick leg */}
            <Line x1="92" y1="112" x2="118" y2="145" />
            <Line x1="118" y1="145" x2="112" y2="172" />
            {/* Hand on hip */}
            <Line x1="98" y1="66" x2="122" y2="86" />
            <Line x1="122" y1="86" x2="106" y2="106" />
            {/* Hand through hair */}
            <Line x1="94" y1="66" x2="72" y2="52" />
            <Line x1="72" y1="52" x2="88" y2="35" />
            <Circle cx="106" cy="106" r="4" fill={accentColor} />
          </G>
        );

      case 'fitness':
        return (
          <G stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Athletic posture */}
            <Circle cx="100" cy="40" r="14" fill={color} />
            <Line x1="100" y1="54" x2="100" y2="110" />
            {/* Flexed arms */}
            <Line x1="100" y1="68" x2="70" y2="68" />
            <Line x1="70" y1="68" x2="68" y2="44" />
            <Line x1="100" y1="68" x2="130" y2="68" />
            <Line x1="130" y1="68" x2="132" y2="44" />
            {/* Wide athletic stance */}
            <Line x1="100" y1="110" x2="75" y2="170" />
            <Line x1="100" y1="110" x2="125" y2="170" />
            <Circle cx="68" cy="44" r="5" fill={accentColor} />
            <Circle cx="132" cy="44" r="5" fill={accentColor} />
          </G>
        );

      default:
        // Classic Standing Portrait
        return (
          <G stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Head */}
            <Circle cx="100" cy="42" r="14" fill={color} />
            {/* Torso */}
            <Line x1="100" y1="56" x2="100" y2="116" />
            {/* Arms relaxed at sides */}
            <Line x1="100" y1="70" x2="80" y2="102" />
            <Line x1="80" y1="102" x2="82" y2="132" />
            <Line x1="100" y1="70" x2="120" y2="102" />
            <Line x1="120" y1="102" x2="118" y2="132" />
            {/* Legs */}
            <Line x1="100" y1="116" x2="88" y2="172" />
            <Line x1="100" y1="116" x2="112" y2="172" />
            {/* Joints highlight */}
            <Circle cx="100" cy="70" r="4" fill={accentColor} />
            <Circle cx="100" cy="116" r="4" fill={accentColor} />
          </G>
        );
    }
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 200 200">
        {/* Soft background reference guide box */}
        <Path
          d="M 20,20 L 40,20 M 20,20 L 20,40 M 180,20 L 160,20 M 180,20 L 180,40 M 20,180 L 40,180 M 20,180 L 20,160 M 180,180 L 160,180 M 180,180 L 180,160"
          stroke="rgba(148, 163, 184, 0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {renderPoseGraphics()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
