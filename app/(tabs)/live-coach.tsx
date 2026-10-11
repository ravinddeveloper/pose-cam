import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useIsFocused } from 'expo-router';
import { seedPoses } from '../../src/data/seedPoses';
import { Pose } from '../../src/types/pose';
import { NormalizedLandmark } from '../../src/types/landmarks';
import { PoseMatchingService } from '../../src/services/poseMatchingService';
import { PoseLandmarkerService } from '../../src/services/poseDetection/poseLandmarkerService';
import { PoseStickFigure } from '../../src/components/PoseStickFigure';
import { SkeletonOverlay } from '../../src/components/SkeletonOverlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LiveCoachScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isFocused = useIsFocused();
  const cameraRef = useRef<any>(null);

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Camera controls
  const [facing, setFacing] = useState<CameraType>('front');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Pose selection & overlay display controls
  const [currentPoseIndex, setCurrentPoseIndex] = useState<number>(0);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.75);
  const [showPoseOverlay, setShowPoseOverlay] = useState<boolean>(true); // Real-time AR silhouette over camera
  const [showPoseCard, setShowPoseCard] = useState<boolean>(true); // Floating mini-card
  const [activeHintIndex, setActiveHintIndex] = useState<number>(0);

  // Captured photo preview
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [showCaptureModal, setShowCaptureModal] = useState<boolean>(false);

  // Landmarks state
  const [detectedLandmarks, setDetectedLandmarks] = useState<NormalizedLandmark[] | undefined>(undefined);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  // Load requested pose if specified in route params
  useEffect(() => {
    if (params.poseId && typeof params.poseId === 'string') {
      const foundIdx = seedPoses.findIndex(p => p.id === params.poseId);
      if (foundIdx !== -1) {
        setCurrentPoseIndex(foundIdx);
      }
    }
  }, [params.poseId]);

  // Handle focus changes: when user navigates away or closes camera, RELEASE hardware resources
  useEffect(() => {
    if (!isFocused) {
      PoseLandmarkerService.stopDetection();
      setCountdown(null);
      setIsDetecting(false);
    } else {
      // Re-enable detection if native module is available
      if (PoseLandmarkerService.isNativeModuleAvailable()) {
        PoseLandmarkerService.initializeModel().then(ready => {
          if (ready) {
            setIsDetecting(true);
            PoseLandmarkerService.startDetection();
          }
        });
      }
    }
  }, [isFocused]);

  // Subscribe to native landmarker if available
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (isFocused && PoseLandmarkerService.isNativeModuleAvailable()) {
      PoseLandmarkerService.initializeModel().then(ready => {
        if (ready) {
          setIsDetecting(true);
          PoseLandmarkerService.startDetection();
          unsubscribe = PoseLandmarkerService.addLandmarkListener(landmarks => {
            setDetectedLandmarks(landmarks);
          });
        }
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
      PoseLandmarkerService.stopDetection();
    };
  }, [isFocused]);

  const currentPose: Pose = seedPoses[currentPoseIndex] || seedPoses[0];

  // Evaluate alignment
  const alignmentResult = PoseMatchingService.evaluatePose(
    detectedLandmarks || [],
    currentPose
  );

  // Collect step-by-step instructions into hints
  const instructionsList: string[] = [];
  if (currentPose.bodyInstructions.head) instructionsList.push(`Head: ${currentPose.bodyInstructions.head}`);
  if (currentPose.bodyInstructions.shoulders) instructionsList.push(`Shoulders: ${currentPose.bodyInstructions.shoulders}`);
  if (currentPose.bodyInstructions.arms) instructionsList.push(`Arms: ${currentPose.bodyInstructions.arms}`);
  if (currentPose.bodyInstructions.hands) instructionsList.push(`Hands: ${currentPose.bodyInstructions.hands}`);
  if (currentPose.bodyInstructions.torso) instructionsList.push(`Torso: ${currentPose.bodyInstructions.torso}`);
  if (currentPose.bodyInstructions.legs) instructionsList.push(`Legs: ${currentPose.bodyInstructions.legs}`);
  if (currentPose.bodyInstructions.feet) instructionsList.push(`Feet: ${currentPose.bodyInstructions.feet}`);
  if (currentPose.bodyInstructions.posture) instructionsList.push(`Posture: ${currentPose.bodyInstructions.posture}`);
  if (instructionsList.length === 0) instructionsList.push('Align your body with the AR skeleton guide on the camera.');

  // Cycle hints every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHintIndex(prev => (prev + 1) % instructionsList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [instructionsList.length]);

  // Close camera button handler
  const handleCloseCamera = () => {
    PoseLandmarkerService.stopDetection();
    setCountdown(null);
    router.replace('/');
  };

  // Next / Previous pose handlers
  const handleNextPose = () => {
    setCurrentPoseIndex(prev => (prev + 1) % seedPoses.length);
    setActiveHintIndex(0);
  };

  const handlePrevPose = () => {
    setCurrentPoseIndex(prev => (prev - 1 + seedPoses.length) % seedPoses.length);
    setActiveHintIndex(0);
  };

  // Flip camera
  const toggleFacing = () => {
    setFacing(prev => (prev === 'back' ? 'front' : 'back'));
  };

  // Toggle flash
  const toggleFlash = () => {
    setFlash(prev => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'auto';
      return 'off';
    });
  };

  // Cycle timer (0s -> 3s -> 5s -> 10s)
  const cycleTimer = () => {
    setTimerSeconds(prev => {
      if (prev === 0) return 3;
      if (prev === 3) return 5;
      if (prev === 5) return 10;
      return 0;
    });
  };

  // Toggle AR overlay mode
  const cycleOverlayMode = () => {
    if (showPoseOverlay && showPoseCard) {
      setShowPoseCard(false); // only full AR overlay
    } else if (showPoseOverlay && !showPoseCard) {
      setShowPoseOverlay(false);
      setShowPoseCard(true); // only mini card
    } else if (!showPoseOverlay && showPoseCard) {
      setShowPoseOverlay(false);
      setShowPoseCard(false); // hide all overlays
    } else {
      setShowPoseOverlay(true);
      setShowPoseCard(true); // show both
    }
  };

  // Cycle opacity (0.3 -> 0.5 -> 0.75 -> 0.9)
  const cycleOpacity = () => {
    setOverlayOpacity(prev => {
      if (prev <= 0.35) return 0.55;
      if (prev <= 0.6) return 0.75;
      if (prev <= 0.8) return 0.95;
      return 0.35;
    });
  };

  // Capture photo with timer
  const handleCapture = async () => {
    if (countdown !== null) return;

    if (timerSeconds > 0) {
      setCountdown(timerSeconds);
      let count = timerSeconds;
      const interval = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(interval);
          setCountdown(null);
          executeCapture();
        } else {
          setCountdown(count);
        }
      }, 1000);
    } else {
      executeCapture();
    }
  };

  const executeCapture = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: false,
        });
        if (photo?.uri) {
          setCapturedPhotoUri(photo.uri);
          setShowCaptureModal(true);
        }
      }
    } catch (error) {
      console.warn('Capture error:', error);
    }
  };

  // Permission checks
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Loading camera status...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={64} color="#2563EB" />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionSubtitle}>
            PoseGenius AI needs access to your camera to give you real-time visual pose coaching and capture photos.
          </Text>
          <Text style={styles.permissionNote}>
            🔒 All camera processing stays on your device. Camera frames and photos are never uploaded without your consent.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* 
        CRITICAL CAMERA LIFECYCLE:
        Only mount CameraView when screen is actively focused.
        When user closes the camera or switches tabs, CameraView is completely
        unmounted to immediately release native camera hardware and stop battery drain.
      */}
      {isFocused ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
        />
      ) : (
        <View style={styles.standbyContainer}>
          <Ionicons name="camera-outline" size={48} color="#64748B" />
          <Text style={styles.standbyText}>Camera Paused</Text>
        </View>
      )}

      {/* Real-time AR Target Pose Skeleton & Landmarks Overlay */}
      {isFocused && (
        <SkeletonOverlay
          landmarks={detectedLandmarks}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          isFrontCamera={facing === 'front'}
          isAligned={alignmentResult.isAligned}
          opacity={overlayOpacity}
          targetCategory={currentPose.category}
          targetFraming={currentPose.framing}
          showTargetGuide={showPoseOverlay}
          showRuleOfThirds={true}
        />
      )}

      {/* Top Controls Bar */}
      <SafeAreaView style={styles.topSafeArea}>
        <View style={styles.topBar}>
          {/* Close Camera Button (Instantly exits & releases camera) */}
          <TouchableOpacity
            style={[styles.iconCircleButton, styles.closeButton]}
            onPress={handleCloseCamera}
            accessibilityLabel="Close Camera"
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Flash Toggle */}
          <TouchableOpacity style={styles.iconCircleButton} onPress={toggleFlash}>
            <Ionicons
              name={
                flash === 'on' ? 'flash' : flash === 'auto' ? 'flash-outline' : 'flash-off-outline'
              }
              size={20}
              color={flash !== 'off' ? '#FACC15' : '#FFFFFF'}
            />
          </TouchableOpacity>

          {/* Timer Toggle */}
          <TouchableOpacity style={styles.iconCircleButton} onPress={cycleTimer}>
            <Ionicons name="timer-outline" size={20} color={timerSeconds > 0 ? '#38BDF8' : '#FFFFFF'} />
            {timerSeconds > 0 && <Text style={styles.timerBadgeText}>{timerSeconds}s</Text>}
          </TouchableOpacity>

          {/* AR Overlay Mode Toggle */}
          <TouchableOpacity
            style={[styles.iconCircleButton, showPoseOverlay && styles.activeButton]}
            onPress={cycleOverlayMode}
          >
            <Ionicons
              name={showPoseOverlay ? 'body' : 'body-outline'}
              size={20}
              color={showPoseOverlay ? '#38BDF8' : '#FFFFFF'}
            />
          </TouchableOpacity>

          {/* Overlay Opacity Toggle */}
          <TouchableOpacity style={styles.iconCircleButton} onPress={cycleOpacity}>
            <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
            <Text style={styles.timerBadgeText}>{Math.round(overlayOpacity * 100)}%</Text>
          </TouchableOpacity>

          {/* Flip Camera */}
          <TouchableOpacity style={styles.iconCircleButton} onPress={toggleFacing}>
            <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Live Coaching Hint & Real-time Alignment Banner */}
        <View style={styles.coachingBanner}>
          <View style={styles.coachingHeader}>
            <View style={styles.liveIndicator}>
              <View
                style={[
                  styles.pulseDot,
                  alignmentResult.isAligned ? styles.pulseDotGreen : styles.pulseDotCyan,
                ]}
              />
              <Text style={styles.liveStatusText}>
                {alignmentResult.isAligned ? 'PERFECT ALIGNMENT' : 'REAL-TIME POSE COACH'}
              </Text>
            </View>

            <View style={styles.headerBadges}>
              <Text style={styles.framingBadge}>{currentPose.framing.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.coachingHintText} numberOfLines={2}>
            {instructionsList[activeHintIndex]}
          </Text>
        </View>
      </SafeAreaView>

      {/* Floating Pose Reference Card (Toggled via Overlay Mode button) */}
      {showPoseCard && (
        <View style={[styles.floatingCard, { opacity: overlayOpacity }]}>
          <View style={styles.floatingCardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.floatingCardTitle} numberOfLines={1}>
                {currentPose.title}
              </Text>
              <Text style={styles.floatingCardMeta}>
                {currentPose.category} • {currentPose.cameraAngle}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowPoseCard(false)}>
              <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>

          <View style={styles.stickFigureContainer}>
            <PoseStickFigure
              category={currentPose.category}
              framing={currentPose.framing}
              size={110}
              color="#38BDF8"
              accentColor="#F43F5E"
            />
          </View>
        </View>
      )}

      {/* Countdown Overlay Animation */}
      {countdown !== null && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {/* Bottom Controls Bar */}
      <View style={styles.bottomBar}>
        {/* Previous Pose */}
        <TouchableOpacity style={styles.cyclePoseButton} onPress={handlePrevPose}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          <Text style={styles.cyclePoseText}>Prev</Text>
        </TouchableOpacity>

        {/* Shutter Capture Button */}
        <TouchableOpacity
          style={[styles.captureButtonOuter, countdown !== null && styles.captureButtonDisabled]}
          onPress={handleCapture}
          activeOpacity={0.7}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        {/* Next Pose */}
        <TouchableOpacity style={styles.cyclePoseButton} onPress={handleNextPose}>
          <Text style={styles.cyclePoseText}>Next</Text>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Captured Photo Modal Preview */}
      <Modal visible={showCaptureModal} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Photo Captured! 📸</Text>
                <Text style={styles.modalSubtitle}>Pose: {currentPose.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCaptureModal(false)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {capturedPhotoUri && (
              <Image source={{ uri: capturedPhotoUri }} style={styles.capturedImagePreview} />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondaryButton]}
                onPress={() => setShowCaptureModal(false)}
              >
                <Ionicons name="camera" size={20} color="#2563EB" />
                <Text style={styles.modalSecondaryButtonText}>Keep Shooting</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={() => {
                  setShowCaptureModal(false);
                  handleNextPose();
                }}
              >
                <Text style={styles.modalPrimaryButtonText}>Next Pose</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  standbyContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  standbyText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 380,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  permissionNote: {
    fontSize: 13,
    color: '#CBD5E1',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    lineHeight: 18,
  },
  permissionText: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  topSafeArea: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 24 : 10,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconCircleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.7)',
  },
  activeButton: {
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  timerBadgeText: {
    position: 'absolute',
    bottom: 2,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  coachingBanner: {
    marginTop: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  coachingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pulseDotCyan: {
    backgroundColor: '#00E5FF',
  },
  pulseDotGreen: {
    backgroundColor: '#34C759',
  },
  liveStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  framingBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F8FAFC',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coachingHintText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  floatingCard: {
    position: 'absolute',
    right: 16,
    bottom: 130,
    width: 130,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 15,
  },
  floatingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  floatingCardTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  floatingCardMeta: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  stickFigureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 40,
  },
  countdownText: {
    fontSize: 96,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 24 : 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 20,
  },
  cyclePoseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  cyclePoseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 380,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  capturedImagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  modalPrimaryButton: {
    backgroundColor: '#2563EB',
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  modalSecondaryButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  modalSecondaryButtonText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
});
