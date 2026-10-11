import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { seedPoses } from '../../src/data/seedPoses';
import { StorageService } from '../../src/services/storageService';
import { Pose } from '../../src/types/pose';
import { PoseStickFigure } from '../../src/components/PoseStickFigure';

const categoryLabels: Record<string, string> = {
  'solo-portraits': 'Solo Portraits',
  'selfies': 'Selfies',
  'couples': 'Couples',
  'friends-groups': 'Friends & Groups',
  'women': 'Women',
  'men': 'Men',
  'travel': 'Travel',
  'fashion': 'Fashion',
  'wedding': 'Wedding',
  'beach': 'Beach',
  'nature': 'Nature',
  'street': 'Street',
  'sitting': 'Sitting',
  'standing': 'Standing',
  'walking': 'Walking',
  'fitness': 'Fitness',
  'maternity': 'Maternity',
  'family': 'Family',
  'graduation': 'Graduation',
  'professional': 'Professional',
  'creative': 'Creative',
};

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredPoses, setFeaturedPoses] = useState<Pose[]>([]);
  const [recentPoses, setRecentPoses] = useState<Pose[]>([]);

  const loadFeaturedPoses = () => {
    // Top beginner and intermediate poses
    const curated = seedPoses.filter(p => p.difficulty === 'beginner' || p.difficulty === 'intermediate').slice(0, 8);
    setFeaturedPoses(curated);
  };

  const loadRecentPoses = async () => {
    try {
      const recentIds = await StorageService.getRecentPoses();
      const recent = seedPoses.filter(p => recentIds.includes(p.id)).slice(0, 6);
      setRecentPoses(recent);
    } catch (error) {
      console.warn('Error loading recent poses:', error);
    }
  };

  useEffect(() => {
    loadFeaturedPoses();
    loadRecentPoses();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push('/explore');
    }
  };

  const categories = [
    { id: 'solo-portraits', name: 'Solo Portraits', emoji: '📸' },
    { id: 'couples', name: 'Couples', emoji: '💑' },
    { id: 'travel', name: 'Travel', emoji: '✈️' },
    { id: 'fashion', name: 'Fashion', emoji: '👗' },
    { id: 'sitting', name: 'Sitting', emoji: '🪑' },
    { id: 'walking', name: 'Walking', emoji: '🚶' },
    { id: 'fitness', name: 'Fitness', emoji: '💪' },
    { id: 'wedding', name: 'Wedding', emoji: '💒' },
  ];

  const renderFeaturedPose = ({ item }: { item: Pose }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => router.push(`/pose/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.featuredFigureContainer}>
        <PoseStickFigure
          category={item.category}
          framing={item.framing}
          size={110}
          color="#2563EB"
          accentColor="#00E5FF"
        />
      </View>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.featuredCategory}>{categoryLabels[item.category] || item.category}</Text>
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>{item.framing}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecentPose = ({ item }: { item: Pose }) => (
    <TouchableOpacity
      style={styles.recentCard}
      onPress={() => router.push(`/pose/${item.id}`)}
    >
      <Text style={styles.recentTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.recentCategory}>{categoryLabels[item.category] || item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Top Branding & Settings Icon */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>PoseGenius AI</Text>
            <Text style={styles.brandSubtitle}>Free AI-Powered Photo Pose Assistant</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsIconButton}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={22} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Offline & Privacy Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>100+ Poses Offline Ready • Zero Cloud Uploads</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search poses, tags, moods, outfits..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Hero Live Camera Assistant Banner */}
        <TouchableOpacity
          style={styles.heroCameraCard}
          onPress={() => router.push('/live-coach')}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>LIVE CAMERA COACH</Text>
            </View>
            <Text style={styles.heroTitle}>Frame Perfect Poses</Text>
            <Text style={styles.heroDescription}>
              Real-time skeleton guide, shutter timer & posture cues directly over your camera preview.
            </Text>
            <View style={styles.heroCta}>
              <Text style={styles.heroCtaText}>Start Camera</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.heroCameraIconBox}>
            <Ionicons name="camera" size={38} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Featured Poses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Curated Poses</Text>
              <Text style={styles.sectionSubtitle}>Handpicked archetypes for quick reference</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text style={styles.seeAll}>See All ({seedPoses.length})</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredPoses}
            renderItem={renderFeaturedPose}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Recently Viewed */}
        {recentPoses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Viewed</Text>
              <TouchableOpacity onPress={() => router.push('/favorites')}>
                <Text style={styles.seeAll}>Favorites</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentPoses}
              renderItem={renderRecentPose}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Categories Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
          <View style={styles.categoryGrid}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => router.push('/explore')}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Assistant Promo Card */}
        <TouchableOpacity
          style={styles.aiPromoCard}
          onPress={() => router.push('/ai-coach')}
          activeOpacity={0.85}
        >
          <View style={styles.aiPromoIconBox}>
            <Ionicons name="sparkles" size={26} color="#2563EB" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.aiPromoTitle}>AI Pose Coach (Offline & Free)</Text>
            <Text style={styles.aiPromoDescription}>
              {'Ask natural requests like "Solo travel in a blue dress near a waterfall" for instant personalized tips.'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  settingsIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  heroCameraCard: {
    backgroundColor: '#2563EB',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 12,
    color: '#DBEAFE',
    lineHeight: 17,
    marginBottom: 12,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroCameraIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 150,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  featuredFigureContainer: {
    height: 120,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredInfo: {
    padding: 10,
  },
  featuredTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  featuredCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  featuredBadge: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  featuredBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 120,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  recentCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 10,
  },
  categoryCard: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  categoryEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
    textAlign: 'center',
  },
  aiPromoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiPromoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiPromoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  aiPromoDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 36,
  },
});
