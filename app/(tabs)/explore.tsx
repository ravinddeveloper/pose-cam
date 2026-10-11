import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePoses } from '../../src/hooks/usePoses';
import { Category } from '../../src/types/pose';
import {
  OnlineDiscoveryService,
  OnlineDiscoveryItem,
} from '../../src/services/imageDiscovery/openverseService';
import { PoseStickFigure } from '../../src/components/PoseStickFigure';

const categoryLabels: Record<Category, string> = {
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

export default function ExploreScreen() {
  const router = useRouter();
  const {
    filteredPoses,
    filter,
    updateFilter,
    clearFilter,
    loading: localLoading,
    categories,
    toggleFavorite,
    isFavorite,
  } = usePoses();

  // Mode: 'local' (offline seed library) vs 'online' (Openverse & Wikimedia)
  const [activeTab, setActiveTab] = useState<'local' | 'online'>('local');

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Online state
  const [onlineQuery, setOnlineQuery] = useState('natural portrait');
  const [onlineItems, setOnlineItems] = useState<OnlineDiscoveryItem[]>([]);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlinePage, setOnlinePage] = useState(1);
  const [onlineSource, setOnlineSource] = useState<'openverse' | 'wikimedia' | 'fallback'>('openverse');
  const [hasSearchedOnline, setHasSearchedOnline] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    updateFilter({ searchQuery: text });
  };

  const handleCategorySelect = (category: Category | undefined) => {
    setSelectedCategory(category);
    updateFilter({ category });
  };

  const handlePosePress = (poseId: string) => {
    router.push(`/pose/${poseId}`);
  };

  const handleOnlineSearch = async (queryToSearch?: string) => {
    const q = queryToSearch !== undefined ? queryToSearch : onlineQuery;
    if (!q.trim()) return;

    setOnlineLoading(true);
    setHasSearchedOnline(true);
    try {
      const res = await OnlineDiscoveryService.searchOpenverse(q, 1, 20);
      setOnlineItems(res.items);
      setOnlineSource(res.source);
      setOnlinePage(1);
    } catch (e) {
      console.warn('Online search error:', e);
      Alert.alert('Notice', 'Unable to reach online search. You can search the web directly.');
    } finally {
      setOnlineLoading(false);
    }
  };

  const handleUseOnlinePoseInCamera = (item: OnlineDiscoveryItem) => {
    const converted = OnlineDiscoveryService.convertToPose(item);
    router.push({ pathname: '/live-coach', params: { poseId: converted.id } });
  };

  const renderLocalPoseItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.poseCard} onPress={() => handlePosePress(item.id)}>
      <View style={styles.poseCardTop}>
        <View style={styles.thumbnailStickFigure}>
          <PoseStickFigure
            category={item.category}
            framing={item.framing}
            size={70}
            color="#2563EB"
            accentColor="#00E5FF"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.poseHeader}>
            <Text style={styles.poseTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <TouchableOpacity
              onPress={() => toggleFavorite(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite(item.id) ? '#FF3B30' : '#94A3B8'}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.poseDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>

      <View style={styles.poseMeta}>
        <View style={styles.metaTag}>
          <Text style={styles.metaText}>
            {categoryLabels[item.category as keyof typeof categoryLabels] || item.category}
          </Text>
        </View>
        <View style={[styles.metaTag, styles.difficultyTag]}>
          <Text style={styles.metaText}>{item.difficulty}</Text>
        </View>
        <View style={styles.metaTag}>
          <Text style={styles.metaText}>{item.framing}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOnlineItem = ({ item }: { item: OnlineDiscoveryItem }) => (
    <View style={styles.onlineCard}>
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.onlineImage} resizeMode="cover" />
      ) : (
        <View style={[styles.onlineImage, styles.placeholderImage]}>
          <Ionicons name="image-outline" size={32} color="#94A3B8" />
        </View>
      )}

      <View style={styles.onlineCardContent}>
        <View style={styles.onlineHeaderRow}>
          <Text style={styles.onlineTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.licenseBadge}>
            <Text style={styles.licenseBadgeText}>{item.licenseName}</Text>
          </View>
        </View>

        <Text style={styles.onlineAttribution} numberOfLines={2}>
          {item.attribution}
        </Text>

        <View style={styles.onlineActionsRow}>
          <TouchableOpacity
            style={styles.onlineLinkButton}
            onPress={() => OnlineDiscoveryService.openSourcePage(item.landingPageUrl)}
          >
            <Ionicons name="open-outline" size={16} color="#2563EB" />
            <Text style={styles.onlineLinkText}>Source Page</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.onlineCameraButton}
            onPress={() => handleUseOnlinePoseInCamera(item)}
          >
            <Ionicons name="camera" size={16} color="#FFFFFF" />
            <Text style={styles.onlineCameraText}>Use in Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header & Mode Switcher */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Poses</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'local' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('local')}
          >
            <Ionicons
              name="library-outline"
              size={16}
              color={activeTab === 'local' ? '#2563EB' : '#64748B'}
            />
            <Text style={[styles.segmentText, activeTab === 'local' && styles.segmentTextActive]}>
              Local Library ({filteredPoses.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'online' && styles.segmentButtonActive]}
            onPress={() => {
              setActiveTab('online');
              if (!hasSearchedOnline) {
                handleOnlineSearch('natural portrait pose');
              }
            }}
          >
            <Ionicons
              name="globe-outline"
              size={16}
              color={activeTab === 'online' ? '#2563EB' : '#64748B'}
            />
            <Text style={[styles.segmentText, activeTab === 'online' && styles.segmentTextActive]}>
              Discover Online
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Local Library View */}
      {activeTab === 'local' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search 100+ offline poses..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={handleSearch}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                onPress={() => handleCategorySelect(undefined)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    !selectedCategory && styles.categoryChipTextActive,
                  ]}
                >
                  All ({filteredPoses.length})
                </Text>
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, selectedCategory === (cat as Category) && styles.categoryChipActive]}
                  onPress={() => handleCategorySelect(selectedCategory === (cat as Category) ? undefined : (cat as Category))}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === (cat as Category) && styles.categoryChipTextActive,
                    ]}
                  >
                    {categoryLabels[cat as Category] || cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {localLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : (
            <FlatList
              data={filteredPoses}
              renderItem={renderLocalPoseItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No matching poses found</Text>
                  <TouchableOpacity style={styles.resetButton} onPress={clearFilter}>
                    <Text style={styles.resetButtonText}>Reset Filters</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </View>
      ) : (
        /* Discover Online View */
        <View style={{ flex: 1 }}>
          <View style={styles.searchContainer}>
            <Ionicons name="globe" size={20} color="#2563EB" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Openverse (e.g. sunset couple, beach)..."
              placeholderTextColor="#94A3B8"
              value={onlineQuery}
              onChangeText={setOnlineQuery}
              onSubmitEditing={() => handleOnlineSearch()}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={() => handleOnlineSearch()} style={styles.searchActionButton}>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quick preset chips */}
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['Sunset couple', 'Solo travel', 'Beach fashion', 'Coffee shop sitting', 'Urban street'].map(
                term => (
                  <TouchableOpacity
                    key={term}
                    style={styles.categoryChip}
                    onPress={() => {
                      setOnlineQuery(term);
                      handleOnlineSearch(term);
                    }}
                  >
                    <Text style={styles.categoryChipText}>🔍 {term}</Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>

          {onlineLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Searching openly-licensed sources...</Text>
            </View>
          ) : (
            <FlatList
              data={onlineItems}
              renderItem={renderOnlineItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.onlineInfoBanner}>
                  <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
                  <Text style={styles.onlineInfoText}>
                    Free discovery from {onlineSource.toUpperCase()} (CC & Public Domain licenses).
                  </Text>
                </View>
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="images-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No online results for "{onlineQuery}"</Text>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => OnlineDiscoveryService.openExternalWebSearch(onlineQuery)}
                  >
                    <Ionicons name="open-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.resetButtonText}>Search Web in Browser</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
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
    fontSize: 15,
    color: '#0F172A',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchActionButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    padding: 6,
  },
  categoriesContainer: {
    paddingVertical: 10,
    paddingLeft: 16,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  poseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  poseCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  thumbnailStickFigure: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  poseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  poseDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  poseMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  metaTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyTag: {
    backgroundColor: '#ECFDF5',
  },
  metaText: {
    fontSize: 11,
    color: '#475569',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  onlineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  onlineImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E2E8F0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineCardContent: {
    padding: 14,
  },
  onlineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  onlineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  licenseBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  licenseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  onlineAttribution: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  onlineActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  onlineLinkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  onlineLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  onlineCameraButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    gap: 6,
  },
  onlineCameraText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  onlineInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  onlineInfoText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 12,
    marginBottom: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
