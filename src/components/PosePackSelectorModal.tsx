import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { POSE_PACKS, PosePack, PosePackItem } from '../data/posePacks';
import { PoseOutlineThumbnail } from './PoseOutlineThumbnail';
import Svg, { Path } from 'react-native-svg';

interface PosePackSelectorModalProps {
  visible: boolean;
  selectedPoseId: string;
  onSelectPose: (item: PosePackItem) => void;
  onClose: () => void;
}

// Cute Korean Finger Heart SVG illustration for the featured banner
const FingerHeartIcon = () => (
  <View style={styles.bannerIconBox}>
    <Svg width={46} height={46} viewBox="0 0 100 100">
      {/* Hand wrist and fingers */}
      <Path
        d="M 30,95 L 30,70 C 30,60 38,55 45,55 L 45,45 C 45,40 50,38 54,42 C 58,45 58,52 58,55 L 62,48 C 65,44 70,45 72,50 C 74,54 70,62 70,66 L 70,72 C 70,85 55,95 45,95 Z"
        stroke="#1E293B"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FFFFFF"
      />
      {/* Crossed thumb forming heart */}
      <Path
        d="M 40,55 C 38,45 44,38 50,38 C 55,38 60,42 62,48"
        stroke="#1E293B"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Pink mini heart floating above fingers */}
      <Path
        d="M 60,25 C 60,18 52,14 48,20 C 44,14 36,18 36,25 C 36,34 48,42 48,42 C 48,42 60,34 60,25 Z"
        fill="#F43F5E"
        stroke="#E11D48"
        strokeWidth="1.5"
      />
    </Svg>
  </View>
);

export const PosePackSelectorModal: React.FC<PosePackSelectorModalProps> = ({
  visible,
  selectedPoseId,
  onSelectPose,
  onClose,
}) => {
  const [activePackId, setActivePackId] = useState<string>('heart-pack');
  const currentPack: PosePack =
    POSE_PACKS.find(p => p.id === activePackId) || POSE_PACKS[0];

  const [activeItemId, setActiveItemId] = useState<string>(selectedPoseId || currentPack.items[2].id);

  const activeItem =
    currentPack.items.find(i => i.id === activeItemId) ||
    currentPack.items[0];

  const handleApply = () => {
    if (activeItem) {
      onSelectPose(activeItem);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar matching Image 2 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SHOP</Text>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Pack Tab Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {POSE_PACKS.map(pack => {
              const isSelected = pack.id === activePackId;
              return (
                <TouchableOpacity
                  key={pack.id}
                  style={[styles.tabChip, isSelected && styles.activeTabChip]}
                  onPress={() => {
                    setActivePackId(pack.id);
                    setActiveItemId(pack.items[0].id);
                  }}
                >
                  <Text style={[styles.tabChipText, isSelected && styles.activeTabChipText]}>
                    {pack.koreanTitle} ({pack.title})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Featured Pack Banner Card matching Image 2 top card */}
          <View style={styles.featuredCard}>
            <FingerHeartIcon />
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredTitle}>{currentPack.koreanTitle}</Text>
              <Text style={styles.featuredHashtags}>{currentPack.hashtags.join(' ')}</Text>
              <View style={styles.featuredPriceRow}>
                <Text style={styles.featuredPrice}>FREE • $0.00</Text>
                <View style={styles.badgeFree}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.badgeFreeText}>All 9 Poses Included</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 3x3 Grid of 9 Pose Stencil Cards matching Image 2 */}
          <View style={styles.gridSection}>
            <Text style={styles.sectionHeading}>
              {currentPack.title} Stencils ({currentPack.items.length})
            </Text>
            <View style={styles.grid}>
              {currentPack.items.map((item, index) => {
                const isSelected = item.id === activeItemId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.gridCard, isSelected && styles.activeGridCard]}
                    onPress={() => setActiveItemId(item.id)}
                    activeOpacity={0.75}
                  >
                    {/* Minimalist Line Drawing Thumbnail */}
                    <View style={styles.thumbnailBox}>
                      <PoseOutlineThumbnail
                        poseId={item.id}
                        size={68}
                        strokeColor={isSelected ? '#F43F5E' : '#1E293B'}
                        strokeWidth={isSelected ? 3.5 : 2.5}
                      />
                    </View>

                    {/* Pose Title */}
                    <Text
                      style={[styles.cardTitle, isSelected && styles.activeCardTitle]}
                      numberOfLines={1}
                    >
                      {item.koreanTitle}
                    </Text>

                    {/* Selected Indicator Badge */}
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected Pose Detail Preview */}
          {activeItem && (
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Ionicons name="sparkles" size={18} color="#F43F5E" />
                <Text style={styles.detailTitle}>
                  {activeItem.koreanTitle} • {activeItem.title}
                </Text>
              </View>
              <Text style={styles.detailDescription}>{activeItem.description}</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Sticky Action Button matching Image 2 red "구매하기" button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.85}>
            <Text style={styles.applyButtonText}>포즈 적용하기 (Use Pose in Camera)</Text>
            <Ionicons name="camera" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTabChip: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabChipText: {
    color: '#FFFFFF',
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  featuredHashtags: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F43F5E',
  },
  badgeFree: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  badgeFreeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  gridSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '31%',
    aspectRatio: 0.88,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative',
  },
  activeGridCard: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  thumbnailBox: {
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
    textAlign: 'center',
  },
  activeCardTitle: {
    color: '#F43F5E',
    fontWeight: '700',
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F43F5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCard: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? 14 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  applyButton: {
    backgroundColor: '#F43F5E', // Coral Red matching Image 2 "구매하기" button
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
