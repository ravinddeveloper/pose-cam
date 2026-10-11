import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Defs, Filter, FeDropShadow } from 'react-native-svg';

export type PoseContourId =
  | 'couple-heart-arch'     // The exact pose in Image 2: wide lunging stance, outer arms arching overhead
  | 'couple-standing-heart' // Standing couple side-by-side, outer arms overhead forming heart
  | 'couple-inner-heart'    // Couple standing close, inner hands touching high to form center heart
  | 'couple-sitting-heart'  // Sitting on ground facing each other, arms raised meeting above
  | 'couple-back-to-back'   // Leaning back-to-back, arms overhead forming heart
  | 'couple-half-heart-arms'// Chest level, curved arms forming a cute heart
  | 'couple-finger-heart'   // Side-by-side cute Korean finger hearts toward camera
  | 'couple-hug-frame'      // Romantic embrace with heart outline
  | 'couple-shoulder-lean'  // Partner resting head on other's shoulder with sweet heart
  | 'solo-standing-model'   // Elegant standing pose, relaxed posture
  | 'solo-casual-lean'      // Casual leaning against wall/railing, hand in pocket
  | 'solo-walking-candid'   // Candid walking forward, coat/dress flowing
  | 'solo-sitting-cafe'     // Sitting at table/chair, chin on hand
  | 'solo-selfie-heart'     // Solo half-body with cute hand heart on cheek
  | 'solo-fashion-s-curve'  // High fashion model pose with hand on hip and crossed leg
  | 'solo-arms-spread'      // Joyful travel/beach pose with arms outstretched
  | 'friends-peace-trio'    // Best friends posing with peace signs
  | 'fitness-flex';         // Athletic fitness silhouette

export interface PoseContourSilhouetteProps {
  poseId?: PoseContourId | string;
  category?: string;
  width: number;
  height: number;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  scale?: number; // Zoom scale (0.7 to 1.4)
  offsetY?: number; // Vertical offset in pixels
  offsetX?: number; // Horizontal offset in pixels
  mirrored?: boolean; // Flip horizontally
  fillColor?: string; // Optional subtle fill tint
}

export const renderPoseSvgPaths = (
  id: PoseContourId,
  fillColor = 'rgba(255, 255, 255, 0.04)',
  accentColor = '#F43F5E'
) => {
  switch (id) {
    /* ========================================================================
       1. COUPLE HEART ARCH POSE (The EXACT pose in the user's second photo!)
       Wide lunging stance, outer arms arching together overhead forming giant heart!
       ======================================================================== */
    case 'couple-heart-arch':
      return (
        <G>
          {/* Person 1 (Left Partner - Male/Taller in Beige Trousers) */}
          <Path
            d="M 125,120 C 122,100 135,80 152,82 C 168,84 175,102 172,122 C 168,136 150,140 138,138 Z"
            fill={fillColor}
          />
          {/* Outer arm arching high upward */}
          <Path
            d="M 132,135 C 110,130 80,105 75,70 C 72,40 100,10 135,8 C 165,6 185,25 200,45"
            strokeLinecap="round"
          />
          <Path
            d="M 148,145 C 125,142 98,118 92,85 C 88,58 112,30 140,28 C 165,26 180,40 196,55"
            strokeLinecap="round"
          />
          {/* Torso */}
          <Path
            d="M 135,138 L 120,185 C 116,200 130,225 142,230 L 175,230 C 182,215 180,195 174,155 L 168,138 Z"
            fill={fillColor}
          />
          {/* Inner arm reaching down */}
          <Path d="M 172,155 C 178,175 190,205 200,235" strokeLinecap="round" />
          {/* Outer bent leg lunging */}
          <Path
            d="M 130,230 C 105,245 78,270 70,300 C 62,330 75,370 82,410 L 102,410 C 95,370 86,335 95,310 C 105,285 125,265 145,245 Z"
            fill={fillColor}
          />
          {/* Inner straight leg */}
          <Path
            d="M 160,230 C 168,260 178,310 190,370 L 195,410 L 178,410 C 168,360 156,310 148,265 Z"
            fill={fillColor}
          />

          {/* Person 2 (Right Partner - Female in Blouse & Skirt) */}
          <Path
            d="M 230,122 C 228,102 238,82 254,84 C 270,86 278,105 274,124 C 270,138 252,142 240,140 Z"
            fill={fillColor}
          />
          {/* Outer arm arching high to meet partner */}
          <Path
            d="M 270,135 C 290,130 320,105 325,70 C 328,40 300,10 265,8 C 235,6 215,25 200,45"
            strokeLinecap="round"
          />
          <Path
            d="M 252,145 C 275,142 302,118 308,85 C 312,58 288,30 260,28 C 235,26 220,40 204,55"
            strokeLinecap="round"
          />
          {/* Top Heart Apex Indicator */}
          <Circle cx="200" cy="45" r="5" fill={accentColor} />

          {/* Torso & Blouse */}
          <Path
            d="M 238,138 L 225,185 C 220,200 235,225 245,230 L 278,230 C 285,215 284,195 275,155 L 268,138 Z"
            fill={fillColor}
          />
          {/* Inner arm reaching down */}
          <Path d="M 230,155 C 222,175 210,205 200,235" strokeLinecap="round" />
          {/* Bottom Tip Indicator */}
          <Circle cx="200" cy="235" r="4" fill={accentColor} />

          {/* Skirt */}
          <Path d="M 242,230 L 235,265 L 285,265 L 280,230 Z" fill={fillColor} />
          {/* Inner leg */}
          <Path
            d="M 245,265 C 238,295 228,340 215,410 L 230,410 C 242,350 252,305 258,265 Z"
            fill={fillColor}
          />
          {/* Outer straight leg */}
          <Path
            d="M 275,265 C 295,290 318,320 335,355 C 345,378 350,405 352,410 L 332,410 C 322,375 308,345 292,315 C 280,290 268,275 265,265 Z"
            fill={fillColor}
          />
        </G>
      );

    /* ========================================================================
       2. COUPLE STANDING OVERHEAD HEART
       ======================================================================== */
    case 'couple-standing-heart':
      return (
        <G>
          {/* Left Person */}
          <Path d="M 140,110 C 135,90 148,75 165,76 C 180,77 188,94 185,112 C 180,126 165,132 150,130 Z" fill={fillColor} />
          <Path d="M 148,125 C 122,118 90,92 84,55 C 80,22 115,-8 160,-10 C 182,-12 195,5 200,18" strokeLinecap="round" />
          <Path d="M 152,130 L 140,195 L 185,195 L 186,130 Z" fill={fillColor} />
          <Path d="M 144,195 L 138,405 L 160,405 L 165,260 L 170,405 L 188,405 L 184,195 Z" fill={fillColor} />

          {/* Right Person */}
          <Path d="M 220,110 C 215,90 228,75 245,76 C 260,77 268,94 265,112 C 260,126 245,132 230,130 Z" fill={fillColor} />
          <Path d="M 252,125 C 278,118 310,92 316,55 C 320,22 285,-8 240,-10 C 218,-12 205,5 200,18" strokeLinecap="round" />
          <Path d="M 215,130 L 216,195 L 260,195 L 250,130 Z" fill={fillColor} />
          <Path d="M 216,195 L 220,405 L 240,405 L 244,260 L 248,405 L 266,405 L 260,195 Z" fill={fillColor} />

          <Circle cx="200" cy="18" r="5" fill={accentColor} />
        </G>
      );

    /* ========================================================================
       3. COUPLE INNER HAND HEART
       ======================================================================== */
    case 'couple-inner-heart':
      return (
        <G>
          {/* Left Person */}
          <Path d="M 145,115 C 140,95 152,80 168,82 C 182,84 190,100 186,118 C 182,130 168,136 154,134 Z" fill={fillColor} />
          <Path d="M 180,128 C 186,105 192,85 200,75" strokeLinecap="round" />
          <Path d="M 154,134 L 142,200 L 185,200 L 186,134 Z" fill={fillColor} />
          <Path d="M 144,134 L 126,180 L 138,205" strokeLinecap="round" />
          <Path d="M 145,200 L 140,405 L 160,405 L 165,260 L 170,405 L 188,405 L 184,200 Z" fill={fillColor} />

          {/* Right Person */}
          <Path d="M 215,115 C 210,95 222,80 238,82 C 252,84 260,100 256,118 C 252,130 238,136 224,134 Z" fill={fillColor} />
          <Path d="M 220,128 C 214,105 208,85 200,75" strokeLinecap="round" />
          <Path d="M 216,134 L 217,200 L 260,200 L 250,134 Z" fill={fillColor} />
          <Path d="M 255,134 L 273,180 L 261,205" strokeLinecap="round" />
          <Path d="M 218,200 L 222,405 L 242,405 L 246,260 L 250,405 L 268,405 L 262,200 Z" fill={fillColor} />

          <Circle cx="200" cy="75" r="5" fill={accentColor} />
        </G>
      );

    /* ========================================================================
       4. COUPLE SITTING GROUND HEART
       ======================================================================== */
    case 'couple-sitting-heart':
      return (
        <G>
          {/* Left seated person */}
          <Path d="M 130,170 C 125,150 140,135 156,136 C 170,138 178,154 174,172 C 170,185 155,190 142,188 Z" fill={fillColor} />
          <Path d="M 145,185 C 130,160 145,115 180,95 C 190,90 196,95 200,105" strokeLinecap="round" />
          <Path d="M 142,188 L 125,260 L 175,260 L 178,190 Z" fill={fillColor} />
          <Path d="M 125,260 C 110,290 120,335 170,335 L 185,315 C 150,315 140,285 145,260 Z" fill={fillColor} />

          {/* Right seated person */}
          <Path d="M 230,170 C 225,150 240,135 256,136 C 270,138 278,154 274,172 C 270,185 255,190 242,188 Z" fill={fillColor} />
          <Path d="M 255,185 C 270,160 255,115 220,95 C 210,90 204,95 200,105" strokeLinecap="round" />
          <Path d="M 232,188 L 222,260 L 275,260 L 268,190 Z" fill={fillColor} />
          <Path d="M 275,260 C 290,290 280,335 230,335 L 215,315 C 250,315 260,285 255,260 Z" fill={fillColor} />

          <Circle cx="200" cy="105" r="5" fill={accentColor} />
        </G>
      );

    /* ========================================================================
       5. COUPLE BACK-TO-BACK HEART
       ======================================================================== */
    case 'couple-back-to-back':
      return (
        <G>
          {/* Left leaning back */}
          <Path d="M 160,110 C 155,90 168,75 184,76 C 198,78 205,95 200,114 C 196,126 182,132 168,130 Z" fill={fillColor} />
          <Path d="M 162,126 C 145,100 155,50 190,30 C 196,26 200,32 200,40" strokeLinecap="round" />
          <Path d="M 168,130 L 160,205 L 196,205 L 198,130 Z" fill={fillColor} />
          <Path d="M 162,205 L 150,405 L 172,405 L 180,265 L 188,405 L 198,405 L 198,205 Z" fill={fillColor} />

          {/* Right leaning back */}
          <Path d="M 205,110 C 200,90 212,75 228,76 C 242,78 250,95 245,114 C 240,126 226,132 212,130 Z" fill={fillColor} />
          <Path d="M 238,126 C 255,100 245,50 210,30 C 204,26 200,32 200,40" strokeLinecap="round" />
          <Path d="M 202,130 L 204,205 L 240,205 L 232,130 Z" fill={fillColor} />
          <Path d="M 202,205 L 202,405 L 212,405 L 220,265 L 228,405 L 250,405 L 238,205 Z" fill={fillColor} />

          <Circle cx="200" cy="40" r="5" fill={accentColor} />
        </G>
      );

    /* ========================================================================
       6. COUPLE CHEST HALF-HEART ARMS
       ======================================================================== */
    case 'couple-half-heart-arms':
      return (
        <G>
          {/* Left Person */}
          <Path d="M 140,110 C 135,90 148,75 164,76 C 178,78 186,95 182,114 C 178,126 164,132 150,130 Z" fill={fillColor} />
          {/* Curved inner arm forming left half of heart at chest level */}
          <Path d="M 175,140 C 190,140 200,155 200,175 C 200,195 185,210 178,215" strokeLinecap="round" />
          <Path d="M 152,130 L 140,205 L 185,205 L 186,130 Z" fill={fillColor} />
          <Path d="M 144,205 L 138,405 L 160,405 L 165,260 L 170,405 L 188,405 L 184,205 Z" fill={fillColor} />

          {/* Right Person */}
          <Path d="M 220,110 C 215,90 228,75 244,76 C 258,78 266,95 262,114 C 258,126 244,132 230,130 Z" fill={fillColor} />
          {/* Curved inner arm forming right half of heart at chest level */}
          <Path d="M 225,140 C 210,140 200,155 200,175 C 200,195 215,210 222,215" strokeLinecap="round" />
          <Path d="M 215,130 L 216,205 L 260,205 L 250,130 Z" fill={fillColor} />
          <Path d="M 216,205 L 220,405 L 240,405 L 244,260 L 248,405 L 266,405 L 260,205 Z" fill={fillColor} />

          <Circle cx="200" cy="175" r="4" fill={accentColor} />
        </G>
      );

    /* ========================================================================
       7. COUPLE K-POP FINGER HEARTS
       ======================================================================== */
    case 'couple-finger-heart':
      return (
        <G>
          {/* Left Person */}
          <Path d="M 140,110 C 135,90 148,75 164,76 C 178,78 186,95 182,114 C 178,126 164,132 150,130 Z" fill={fillColor} />
          <Path d="M 152,130 L 140,205 L 185,205 L 186,130 Z" fill={fillColor} />
          {/* Arm holding finger heart forward */}
          <Path d="M 175,140 L 185,175 L 195,170" strokeLinecap="round" />
          <Circle cx="195" cy="165" r="4" fill={accentColor} />
          <Path d="M 144,205 L 138,405 L 160,405 L 165,260 L 170,405 L 188,405 L 184,205 Z" fill={fillColor} />

          {/* Right Person */}
          <Path d="M 220,110 C 215,90 228,75 244,76 C 258,78 266,95 262,114 C 258,126 244,132 230,130 Z" fill={fillColor} />
          <Path d="M 215,130 L 216,205 L 260,205 L 250,130 Z" fill={fillColor} />
          {/* Arm holding finger heart forward */}
          <Path d="M 225,140 L 215,175 L 205,170" strokeLinecap="round" />
          <Circle cx="205" cy="165" r="4" fill={accentColor} />
          <Path d="M 216,205 L 220,405 L 240,405 L 244,260 L 248,405 L 266,405 L 260,205 Z" fill={fillColor} />
        </G>
      );

    /* ========================================================================
       8. COUPLE EMBRACE HEART FRAME
       ======================================================================== */
    case 'couple-hug-frame':
      return (
        <G>
          {/* Left embracing partner */}
          <Path d="M 160,115 C 155,95 168,80 184,82 C 198,84 204,100 200,118 C 196,130 182,136 168,134 Z" fill={fillColor} />
          <Path d="M 168,134 L 155,210 L 205,210 L 202,134 Z" fill={fillColor} />
          <Path d="M 160,145 C 145,175 160,205 210,195" strokeLinecap="round" />
          <Path d="M 158,210 L 155,405 L 178,405 L 185,270 L 192,405 L 205,405 L 202,210 Z" fill={fillColor} />

          {/* Right embracing partner */}
          <Path d="M 205,115 C 200,95 212,80 228,82 C 242,84 250,100 245,118 C 240,130 226,136 212,134 Z" fill={fillColor} />
          <Path d="M 202,134 L 200,210 L 245,210 L 236,134 Z" fill={fillColor} />
          <Path d="M 240,145 C 255,175 240,205 190,195" strokeLinecap="round" />
          <Path d="M 202,210 L 205,405 L 222,405 L 228,270 L 235,405 L 250,405 L 245,210 Z" fill={fillColor} />

          <Circle cx="200" cy="180" r="5" fill={accentColor} />
        </G>
      );

    /* ========================================================================
       9. COUPLE SWEET SHOULDER LEAN
       ======================================================================== */
    case 'couple-shoulder-lean':
      return (
        <G>
          {/* Taller Partner */}
          <Path d="M 155,100 C 150,80 164,65 180,66 C 195,68 202,85 198,104 C 194,118 180,124 166,122 Z" fill={fillColor} />
          <Path d="M 168,122 L 152,198 L 202,198 L 200,122 Z" fill={fillColor} />
          <Path d="M 155,198 L 150,405 L 172,405 L 178,260 L 184,405 L 204,405 L 200,198 Z" fill={fillColor} />

          {/* Leaning Partner (Head resting on shoulder) */}
          <Path d="M 198,118 C 195,100 208,86 222,88 C 236,90 242,106 238,124 C 234,136 220,142 208,138 Z" fill={fillColor} />
          <Path d="M 208,138 L 202,205 L 245,205 L 238,138 Z" fill={fillColor} />
          <Path d="M 204,205 L 208,405 L 228,405 L 232,260 L 236,405 L 254,405 L 245,205 Z" fill={fillColor} />

          <Circle cx="200" cy="165" r="4" fill={accentColor} />
        </G>
      );

    /* ========================================================================
       10. SOLO FASHION MODEL S-CURVE
       ======================================================================== */
    case 'solo-fashion-s-curve':
      return (
        <G>
          <Path d="M 180,65 C 178,42 195,25 215,26 C 232,27 242,46 238,68 C 234,82 216,88 200,86 Z" fill={fillColor} />
          <Path d="M 194,86 L 168,110 L 235,105 L 206,86 Z" />
          <Path d="M 168,110 C 160,140 185,175 178,215 C 172,250 160,265 175,270 L 220,260 C 235,245 228,215 220,175 C 215,140 235,115 235,105 Z" fill={fillColor} />
          <Path d="M 168,110 L 132,155 L 175,195" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M 235,105 L 255,150 L 245,195" strokeLinecap="round" />
          <Path d="M 175,270 C 185,305 205,345 225,410 L 240,408 C 220,345 200,305 190,270 Z" fill={fillColor} />
          <Path d="M 210,265 C 205,300 185,345 175,410 L 192,410 C 202,345 220,300 220,260 Z" fill={fillColor} />
        </G>
      );

    /* ========================================================================
       11. SOLO CASUAL LEAN
       ======================================================================== */
    case 'solo-casual-lean':
      return (
        <G>
          <Path d="M 185,75 C 182,55 198,38 218,40 C 235,42 245,60 240,80 C 235,95 218,100 202,98 Z" fill={fillColor} />
          <Path d="M 195,98 L 165,120 L 155,240 L 225,230 L 235,115 Z" fill={fillColor} />
          <Path d="M 165,120 L 140,165 L 165,210" strokeLinecap="round" />
          <Path d="M 235,115 L 265,145 L 275,190" strokeLinecap="round" />
          <Path d="M 285,60 L 285,420" stroke="rgba(255, 255, 255, 0.3)" strokeDasharray="5,5" strokeWidth="2" />
          <Path d="M 165,240 L 175,410 L 195,410 L 185,240 Z" fill={fillColor} />
          <Path d="M 215,230 L 195,310 L 210,410 L 228,410 L 225,230 Z" fill={fillColor} />
        </G>
      );

    /* ========================================================================
       12. SOLO WALKING CANDID
       ======================================================================== */
    case 'solo-walking-candid':
      return (
        <G>
          <Path d="M 195,65 C 192,45 208,28 228,30 C 245,32 255,50 250,70 C 245,85 228,90 212,88 Z" fill={fillColor} />
          <Path d="M 205,88 L 175,115 L 170,225 L 240,220 L 245,110 Z" fill={fillColor} />
          <Path d="M 245,110 L 265,155 L 285,190" strokeLinecap="round" />
          <Path d="M 175,115 L 155,155 L 145,195" strokeLinecap="round" />
          <Path d="M 220,220 C 235,260 255,310 270,390 L 250,395 C 235,325 218,275 205,225 Z" fill={fillColor} />
          <Path d="M 185,225 C 170,265 155,315 140,385 L 158,390 C 172,325 188,275 200,225 Z" fill={fillColor} />
        </G>
      );

    /* ========================================================================
       13. SOLO SITTING CAFE
       ======================================================================== */
    case 'solo-sitting-cafe':
      return (
        <G>
          <Path d="M 185,95 C 182,75 198,58 218,60 C 235,62 245,80 240,100 C 235,115 218,120 202,118 Z" fill={fillColor} />
          <Path d="M 195,118 L 165,140 L 160,240 L 230,240 L 235,135 Z" fill={fillColor} />
          <Path d="M 235,135 L 245,185 L 215,110" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M 165,140 L 145,185 L 185,210" strokeLinecap="round" />
          <Path d="M 110,210 L 290,210" stroke="rgba(255, 255, 255, 0.3)" strokeDasharray="4,4" strokeWidth="2" />
          <Path d="M 160,240 L 220,240 C 235,260 240,300 245,390 L 225,390 C 220,310 215,270 205,255 Z" fill={fillColor} />
          <Path d="M 175,240 C 185,270 195,310 195,390 L 175,390 C 175,320 165,280 160,240 Z" fill={fillColor} />
        </G>
      );

    /* ========================================================================
       14. SOLO SELFIE CHEEK HEART
       ======================================================================== */
    case 'solo-selfie-heart':
      return (
        <G>
          <Path d="M 170,110 C 165,80 185,55 215,58 C 242,60 258,85 252,115 C 245,135 220,145 195,140 Z" fill={fillColor} />
          <Path d="M 235,130 C 245,125 255,130 250,140 C 245,148 238,142 235,130 Z" fill={accentColor} />
          <Circle cx="252" cy="132" r="3" fill={accentColor} />
          <Path d="M 180,145 L 140,195 L 135,340 L 265,340 L 260,190 Z" fill={fillColor} />
          <Path d="M 140,195 L 105,145 L 85,95" strokeLinecap="round" />
          <Path d="M 75,85 L 95,105" stroke="#38BDF8" strokeWidth="3" />
        </G>
      );

    /* ========================================================================
       15. SOLO ARMS SPREAD (VACATION / BEACH JOY)
       ======================================================================== */
    case 'solo-arms-spread':
      return (
        <G>
          <Path d="M 185,60 C 182,38 198,22 218,24 C 235,26 245,44 240,64 C 235,78 218,84 202,82 Z" fill={fillColor} />
          <Path d="M 195,82 L 165,105 L 160,225 L 235,225 L 235,105 Z" fill={fillColor} />
          {/* Outstretched arms */}
          <Path d="M 165,105 C 130,95 85,90 60,85" strokeLinecap="round" />
          <Path d="M 235,105 C 270,95 315,90 340,85" strokeLinecap="round" />
          <Path d="M 175,225 L 170,410 L 190,410 L 195,225 Z" fill={fillColor} />
          <Path d="M 205,225 L 210,410 L 230,410 L 225,225 Z" fill={fillColor} />
        </G>
      );

    /* ========================================================================
       16. FITNESS FLEX
       ======================================================================== */
    case 'fitness-flex':
      return (
        <G>
          <Path d="M 185,55 C 182,35 198,20 218,22 C 235,24 245,42 240,60 C 235,74 218,80 202,78 Z" fill={fillColor} />
          <Path d="M 195,78 L 155,100 L 150,215 L 245,215 L 240,100 Z" fill={fillColor} />
          {/* Bicep flex arms */}
          <Path d="M 155,100 L 120,110 L 130,70" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M 240,100 L 275,110 L 265,70" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M 165,215 L 150,405 L 175,405 L 195,250 L 205,250 L 225,405 L 250,405 L 235,215 Z" fill={fillColor} />
        </G>
      );

    /* ========================================================================
       17. FRIENDS PEACE TRIO
       ======================================================================== */
    case 'friends-peace-trio':
      return (
        <G>
          {/* Center friend */}
          <Path d="M 185,85 C 180,68 192,55 208,56 C 220,57 228,70 224,84 C 220,95 208,100 196,98 Z" fill={fillColor} />
          <Path d="M 195,98 L 175,120 L 170,260 L 230,260 L 225,120 Z" fill={fillColor} />
          {/* Peace sign hand */}
          <Path d="M 225,120 L 245,95 L 242,75" strokeLinecap="round" />
          <Path d="M 245,95 L 252,78" strokeLinecap="round" />

          {/* Left friend leaning */}
          <Path d="M 125,105 C 120,88 132,75 148,76 C 160,77 168,90 164,104 C 160,115 148,120 136,118 Z" fill={fillColor} />
          <Path d="M 135,118 L 115,140 L 120,260 L 165,260 L 160,140 Z" fill={fillColor} />

          {/* Right friend leaning */}
          <Path d="M 245,105 C 240,88 252,75 268,76 C 280,77 288,90 284,104 C 280,115 268,120 256,118 Z" fill={fillColor} />
          <Path d="M 255,118 L 240,140 L 240,260 L 285,260 L 280,140 Z" fill={fillColor} />
        </G>
      );

    /* ========================================================================
       DEFAULT: SOLO STANDING ELEGANT MODEL
       ======================================================================== */
    default:
    case 'solo-standing-model':
      return (
        <G>
          <Path d="M 185,60 C 182,38 198,22 218,24 C 235,26 245,44 240,64 C 235,78 218,84 202,82 Z" fill={fillColor} />
          <Path d="M 195,82 L 165,105 L 160,225 L 235,225 L 235,105 Z" fill={fillColor} />
          <Path d="M 165,105 C 150,145 148,185 152,225" strokeLinecap="round" />
          <Path d="M 235,105 C 250,145 252,185 248,225" strokeLinecap="round" />
          <Path d="M 175,225 L 175,410 L 195,410 L 198,225 Z" fill={fillColor} />
          <Path d="M 205,225 L 208,410 L 228,410 L 225,225 Z" fill={fillColor} />
        </G>
      );
  }
};

export const PoseContourSilhouette: React.FC<PoseContourSilhouetteProps> = ({
  poseId,
  category = 'couples',
  width,
  height,
  strokeColor = '#FFFFFF',
  strokeWidth = 3.5,
  opacity = 0.9,
  scale = 1.0,
  offsetY = 0,
  offsetX = 0,
  mirrored = false,
  fillColor = 'rgba(255, 255, 255, 0.04)',
}) => {
  if (width <= 0 || height <= 0 || opacity <= 0) {
    return null;
  }

  // Resolve to explicit PoseContourId
  const resolvedId: PoseContourId = (() => {
    if (poseId) {
      const p = poseId.toLowerCase();
      if (p === 'couple-heart-arch' || p.includes('arch')) return 'couple-heart-arch';
      if (p === 'couple-standing-heart' || p.includes('overhead')) return 'couple-standing-heart';
      if (p === 'couple-inner-heart') return 'couple-inner-heart';
      if (p === 'couple-sitting-heart') return 'couple-sitting-heart';
      if (p === 'couple-back-to-back') return 'couple-back-to-back';
      if (p === 'couple-half-heart-arms') return 'couple-half-heart-arms';
      if (p === 'couple-finger-heart') return 'couple-finger-heart';
      if (p === 'couple-hug-frame') return 'couple-hug-frame';
      if (p === 'couple-shoulder-lean') return 'couple-shoulder-lean';
      if (p.includes('fashion') || p.includes('curve')) return 'solo-fashion-s-curve';
      if (p.includes('lean') || p.includes('wall')) return 'solo-casual-lean';
      if (p.includes('walk')) return 'solo-walking-candid';
      if (p.includes('cafe') || p.includes('chin') || p.includes('sit')) return 'solo-sitting-cafe';
      if (p.includes('selfie')) return 'solo-selfie-heart';
      if (p.includes('fitness') || p.includes('gym')) return 'fitness-flex';
      if (p.includes('friends') || p.includes('trio')) return 'friends-peace-trio';
      if (p.includes('travel') || p.includes('spread') || p.includes('beach')) return 'solo-arms-spread';
      if (p.includes('couple') || p.includes('heart') || p.includes('wedding')) return 'couple-heart-arch';
    }

    switch (category) {
      case 'couples':
      case 'wedding':
        return 'couple-heart-arch';
      case 'sitting':
        return 'solo-sitting-cafe';
      case 'walking':
        return 'solo-walking-candid';
      case 'selfies':
        return 'solo-selfie-heart';
      case 'fashion':
      case 'creative':
        return 'solo-fashion-s-curve';
      case 'fitness':
        return 'fitness-flex';
      case 'friends-groups':
      case 'family':
        return 'friends-peace-trio';
      case 'travel':
      case 'beach':
      case 'nature':
        return 'solo-arms-spread';
      default:
        return 'solo-standing-model';
    }
  })();

  // Center coordinate system in 400x440
  const transform = `
    translate(${width / 2 + offsetX}, ${height / 2 + offsetY})
    scale(${mirrored ? -scale : scale}, ${scale})
    translate(-200, -220)
  `;

  return (
    <View pointerEvents="none" style={[styles.container, { width, height, opacity }]}>
      <Svg width={width} height={height}>
        <Defs>
          <Filter id="contourShadow" x="-20%" y="-20%" width="140%" height="140%">
            <FeDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.65" />
          </Filter>
        </Defs>

        <G
          transform={transform}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#contourShadow)"
        >
          {renderPoseSvgPaths(resolvedId, fillColor, '#F43F5E')}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
  },
});
