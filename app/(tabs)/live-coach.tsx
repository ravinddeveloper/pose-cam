import React, { useState, useRef, useEffect } from 'react';
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
import { NormalizedLandmark } from '../../src/types/landmarks';
import { PoseLandmarkerService } from '../../src/services/poseDetection/poseLandmarkerService';
import { PoseContourSilhouette } from '../../src/components/PoseContourSilhouette';
import { PoseOutlineThumbnail } from '../../src/components/PoseOutlineThumbnail';
import { PosePackSelectorModal } from '../../src/components/PosePackSelectorModal';
import { POSE_PACKS, PosePackItem } from '../../src/data/posePacks';
import { SkeletonOverlay } from '../../src/components/SkeletonOverlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Flatten all available contour poses across packs for quick cycling
const ALL_PACK_ITEMS: PosePackItem[] = POSE_PACKS.flatMap(p => p.items);

export default function LiveCoachScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isFocused = useIsFocused();
  const cameraRef = useRef<any>(null);

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Camera settings
  const [facing, setFacing] = useState<CameraType>('back'); // Default back camera for shooting subjects
  const [flash, setFlash] = useState<FlashMode>('off');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Active pose selection (Default: viral Couple Heart Arch from Image 2!)
  const [activePoseIndex, setActivePoseIndex] = useState<number>(() => {
    if (params.poseId && typeof params.poseId === 'string') {
      const foundIdx = ALL_PACK_ITEMS.findIndex(p => p.id === params.poseId);
      if (foundIdx !== -1) return foundIdx;
    }
    const defaultIdx = ALL_PACK_ITEMS.findIndex(p => p.id === 'couple-heart-arch');
    return defaultIdx !== -1 ? defaultIdx : 0;
  });

  // Stencil alignment adjustments
  const [stencilScale, setStencilScale] = useState<number>(1.0); // 0.75x to 1.35x
  const [stencilOffsetY, setStencilOffsetY] = useState<number>(0); // -80 to +80
  const [stencilMirrored, setStencilMirrored] = useState<boolean>(false);
  const [stencilOpacity, setStencilOpacity] = useState<number>(0.9);

  // View modes: 'silhouette' (Image 2 default) vs 'skeleton' (Image 1 technical)
  const [overlayStyle, setOverlayStyle] = useState<'silhouette' | 'skeleton'>('silhouette');
  const [showAdjustPanel, setShowAdjustPanel] = useState<boolean>(false);
  const [showPackModal, setShowPackModal] = useState<boolean>(false);

  // Captured photo preview
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [showCaptureModal, setShowCaptureModal] = useState<boolean>(false);

  // MediaPipe landmarks
  const [detectedLandmarks] = useState<NormalizedLandmark[] | undefined>(undefined);

  const currentPoseItem: PosePackItem = ALL_PACK_ITEMS[activePoseIndex] || ALL_PACK_ITEMS[0];

  // Clean hardware lifecycle: release native camera when unfocused
  useEffect(() => {
    if (!isFocused) {
      PoseLandmarkerService.stopDetection();
    }
  }, [isFocused]);

  // Close camera button handler
  const handleCloseCamera = () => {
    PoseLandmarkerService.stopDetection();
    setCountdown(null);
    router.replace('/');
  };

  // Next & Previous pose cycling (floating chevron arrows on camera preview)
  const handleNextPose = () => {
    setActivePoseIndex(prev => (prev + 1) % ALL_PACK_ITEMS.length);
  };

  const handlePrevPose = () => {
    setActivePoseIndex(prev => (prev - 1 + ALL_PACK_ITEMS.length) % ALL_PACK_ITEMS.length);
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

  // Cycle timer
  const cycleTimer = () => {
    setTimerSeconds(prev => {
      if (prev === 0) return 3;
      if (prev === 3) return 5;
      if (prev === 5) return 10;
      return 0;
    });
  };

  // Cycle opacity
  const cycleOpacity = () => {
    setStencilOpacity(prev => {
      if (prev >= 0.9) return 0.5;
      if (prev >= 0.5) return 0.7;
      return 0.95;
    });
  };

  // Stencil zoom in / out
  const zoomStencil = (delta: number) => {
    setStencilScale(prev => {
      const next = prev + delta;
      return Math.min(Math.max(next, 0.7), 1.4);
    });
  };

  // Stencil move up / down
  const nudgeOffsetY = (delta: number) => {
    setStencilOffsetY(prev => {
      const next = prev + delta;
      return Math.min(Math.max(next, -120), 120);
    });
  };

  // Capture photo
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
          quality: 0.9,
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
            PoseGenius AI projects aesthetic Korean white contour pose stencils directly on your live camera.
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
        CRITICAL NATIVE HARDWARE LIFECYCLE:
        Only mount CameraView when screen is actively focused.
        Unmounts immediately on navigate away or close to stop background camera usage.
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

      {/* 
        ========================================================================
        IMAGE 2 AESTHETIC: WHITE LINE-ART CONTOUR SILHOUETTE OVERLAY
        Renders crisp, thick white body outline curves with drop shadow filter
        directly over the camera preview (Heart Arch, Overhead Heart, S-Curve, etc.)
        ========================================================================
      */}
      {isFocused && overlayStyle === 'silhouette' && (
        <PoseContourSilhouette
          poseId={currentPoseItem.id}
          category={currentPoseItem.category}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          strokeColor="#FFFFFF"
          strokeWidth={3.8}
          opacity={stencilOpacity}
          scale={stencilScale}
          offsetY={stencilOffsetY}
          mirrored={stencilMirrored}
          fillColor="rgba(255, 255, 255, 0.05)"
        />
      )}

      {/* Optional Technical Skeleton Mode (Image 1 debugging) */}
      {isFocused && overlayStyle === 'skeleton' && (
        <SkeletonOverlay
          landmarks={detectedLandmarks}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          isFrontCamera={facing === 'front'}
          isAligned={false}
          opacity={stencilOpacity}
          targetCategory={currentPoseItem.category}
          showTargetGuide={true}
          showRuleOfThirds={true}
        />
      )}

      {/* 
        ========================================================================
        IMAGE 2 FLOATING NAVIGATION ARROWS:
        Large, elegant floating chevron arrows directly on left & right edges
        of the viewfinder for one-tap pose switching!
        ========================================================================
      */}
      <TouchableOpacity
        style={[styles.floatingChevron, styles.floatingChevronLeft]}
        onPress={handlePrevPose}
        activeOpacity={0.7}
        accessibilityLabel="Previous Pose Silhouette"
      >
        <Ionicons name="chevron-back" size={38} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.floatingChevron, styles.floatingChevronRight]}
        onPress={handleNextPose}
        activeOpacity={0.7}
        accessibilityLabel="Next Pose Silhouette"
      >
        <Ionicons name="chevron-forward" size={38} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Top Controls Bar */}
      <SafeAreaView style={styles.topSafeArea}>
        <View style={styles.topBar}>
          {/* Close Camera Button (Instantly halts and releases hardware) */}
          <TouchableOpacity
            style={[styles.iconCircleButton, styles.closeButton]}
            onPress={handleCloseCamera}
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
            <Ionicons
              name="timer-outline"
              size={20}
              color={timerSeconds > 0 ? '#38BDF8' : '#FFFFFF'}
            />
            {timerSeconds > 0 && <Text style={styles.timerBadgeText}>{timerSeconds}s</Text>}
          </TouchableOpacity>

          {/* Opacity Cycle */}
          <TouchableOpacity style={styles.iconCircleButton} onPress={cycleOpacity}>
            <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
            <Text style={styles.timerBadgeText}>{Math.round(stencilOpacity * 100)}%</Text>
          </TouchableOpacity>

          {/* Stencil Alignment Quick Controls Toggle */}
          <TouchableOpacity
            style={[styles.iconCircleButton, showAdjustPanel && styles.activeButton]}
            onPress={() => setShowAdjustPanel(prev => !prev)}
          >
            <Ionicons name="options-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Flip Camera */}
          <TouchableOpacity style={styles.iconCircleButton} onPress={toggleFacing}>
            <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Top Active Pose Title Pill */}
        <TouchableOpacity
          style={styles.poseTitlePill}
          onPress={() => setShowPackModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.posePillLeft}>
            <Text style={styles.posePillKorean}>{currentPoseItem.koreanTitle}</Text>
            <Text style={styles.posePillTitle}>{currentPoseItem.title}</Text>
          </View>
          <View style={styles.posePillButton}>
            <Ionicons name="grid-outline" size={14} color="#FFFFFF" />
            <Text style={styles.posePillButtonText}>Packs</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Stencil Adjustments Drawer (Scale, Offset, Mirror) */}
        {showAdjustPanel && (
          <View style={styles.adjustPanel}>
            <View style={styles.adjustRow}>
              <Text style={styles.adjustLabel}>Size</Text>
              <View style={styles.adjustButtonGroup}>
                <TouchableOpacity
                  style={styles.adjustMiniButton}
                  onPress={() => zoomStencil(-0.1)}
                >
                  <Ionicons name="remove" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.adjustValueText}>{Math.round(stencilScale * 100)}%</Text>
                <TouchableOpacity
                  style={styles.adjustMiniButton}
                  onPress={() => zoomStencil(0.1)}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.adjustLabel, { marginLeft: 16 }]}>Height</Text>
              <View style={styles.adjustButtonGroup}>
                <TouchableOpacity
                  style={styles.adjustMiniButton}
                  onPress={() => nudgeOffsetY(-20)}
                >
                  <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustMiniButton}
                  onPress={() => nudgeOffsetY(20)}
                >
                  <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.mirrorButton,
                  stencilMirrored && { backgroundColor: '#F43F5E' },
                ]}
                onPress={() => setStencilMirrored(prev => !prev)}
              >
                <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
                <Text style={styles.mirrorButtonText}>Flip</Text>
              </TouchableOpacity>
            </View>

            {/* Mode switch: Silhouette vs Skeleton */}
            <View style={styles.modeSwitchRow}>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  overlayStyle === 'silhouette' && styles.activeModeTab,
                ]}
                onPress={() => setOverlayStyle('silhouette')}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    overlayStyle === 'silhouette' && styles.activeModeTabText,
                  ]}
                >
                  White Silhouette (Image 2)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeTab,
                  overlayStyle === 'skeleton' && styles.activeModeTab,
                ]}
                onPress={() => setOverlayStyle('skeleton')}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    overlayStyle === 'skeleton' && styles.activeModeTabText,
                  ]}
                >
                  AR Skeleton
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>

      {/* Countdown Animation */}
      {countdown !== null && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {/* 
        ========================================================================
        BOTTOM CONTROLS BAR:
        - Pose Pack / Shop Catalog button (opens Image 2 modal!)
        - Large Shutter Capture button
        - Flip Camera / Stencil Thumbnail
        ========================================================================
      */}
      <View style={styles.bottomBar}>
        {/* Open Pose Pack Catalog Button (Matching left screen in Image 2) */}
        <TouchableOpacity
          style={styles.packCatalogButton}
          onPress={() => setShowPackModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.packCatalogThumbnailBox}>
            <PoseOutlineThumbnail
              poseId={currentPoseItem.id}
              size={36}
              strokeColor="#FFFFFF"
              strokeWidth={3}
            />
          </View>
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.packCatalogButtonTitle}>SHOP</Text>
            <Text style={styles.packCatalogButtonSubtitle}>Pose Packs</Text>
          </View>
        </TouchableOpacity>

        {/* Shutter Capture Button */}
        <TouchableOpacity
          style={[styles.captureButtonOuter, countdown !== null && styles.captureButtonDisabled]}
          onPress={handleCapture}
          activeOpacity={0.7}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        {/* Stencil Reset / Reset Position */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setStencilScale(1.0);
            setStencilOffsetY(0);
            setStencilMirrored(false);
          }}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* 
        ========================================================================
        IMAGE 2 POSE PACK SELECTOR MODAL:
        Clean minimalist Korean pose shop modal with 3x3 pose sketch grid!
        ========================================================================
      */}
      <PosePackSelectorModal
        visible={showPackModal}
        selectedPoseId={currentPoseItem.id}
        onSelectPose={(item: PosePackItem) => {
          const idx = ALL_PACK_ITEMS.findIndex(p => p.id === item.id);
          if (idx !== -1) {
            setActivePoseIndex(idx);
          }
        }}
        onClose={() => setShowPackModal(false)}
      />

      {/* Captured Photo Modal Preview */}
      <Modal visible={showCaptureModal} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Photo Captured! 📸</Text>
                <Text style={styles.modalSubtitle}>{currentPoseItem.koreanTitle} • {currentPoseItem.title}</Text>
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
    marginBottom: 24,
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
  floatingChevron: {
    position: 'absolute',
    top: '46%',
    width: 52,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  floatingChevronLeft: {
    left: 12,
  },
  floatingChevronRight: {
    right: 12,
  },
  topSafeArea: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 24 : 10,
    left: 0,
    right: 0,
    zIndex: 30,
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
    backgroundColor: 'rgba(239, 68, 68, 0.75)',
  },
  activeButton: {
    borderWidth: 1.5,
    borderColor: '#F43F5E',
  },
  timerBadgeText: {
    position: 'absolute',
    bottom: 2,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  poseTitlePill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  posePillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  posePillKorean: {
    color: '#F43F5E',
    fontSize: 13,
    fontWeight: '800',
  },
  posePillTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  posePillButton: {
    marginLeft: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  posePillButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  adjustPanel: {
    marginTop: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adjustLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  adjustButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 2,
    marginLeft: 6,
  },
  adjustMiniButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustValueText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  mirrorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    marginLeft: 10,
  },
  mirrorButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeModeTab: {
    backgroundColor: '#F43F5E',
  },
  modeTabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  activeModeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 30,
  },
  packCatalogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  packCatalogThumbnailBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packCatalogButtonTitle: {
    color: '#F43F5E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  packCatalogButtonSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
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
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
  modalSecondaryButton: {
    backgroundColor: '#F1F5F9',
  },
  modalSecondaryButtonText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    backgroundColor: '#2563EB',
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
