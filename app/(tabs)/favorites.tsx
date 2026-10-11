import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pose } from '../../src/types/pose';
import { seedPoses } from '../../src/data/seedPoses';
import { StorageService } from '../../src/services/storageService';
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
  'creative': 'Creative'
};

export default function FavoritesScreen() {
  const router = useRouter();
  const [favoritePoses, setFavoritePoses] = useState<Pose[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoriteIds = await StorageService.getFavorites();
      const poses = seedPoses.filter(pose => favoriteIds.includes(pose.id));
      setFavoritePoses(poses);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const removeFavorite = async (poseId: string) => {
    try {
      await StorageService.removeFavorite(poseId);
      await loadFavorites();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove favorite');
    }
  };

  const clearAllFavorites = async () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all favorite poses?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await loadFavorites();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear favorites');
            }
          }
        }
      ]
    );
  };

  const renderPoseItem = ({ item }: { item: Pose }) => (
    <TouchableOpacity
      style={styles.poseCard}
      onPress={() => router.push(`/pose/${item.id}`)}
    >
      <View style={styles.cardMainRow}>
        <View style={styles.figureThumbnail}>
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
            <View style={styles.poseInfo}>
              <Text style={styles.poseTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.poseCategory}>{categoryLabels[item.category] || item.category}</Text>
            </View>
            <TouchableOpacity
              onPress={() => removeFavorite(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="heart" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          <Text style={styles.poseDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>

      <View style={styles.cardBottomRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.framing}</Text>
        </View>
        <TouchableOpacity
          style={styles.directCameraButton}
          onPress={() => router.push({ pathname: '/live-coach', params: { poseId: item.id } })}
        >
          <Ionicons name="camera" size={15} color="#FFFFFF" />
          <Text style={styles.directCameraText}>Live Coach</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
          {favoritePoses.length > 0 && (
            <TouchableOpacity onPress={clearAllFavorites}>
              <Text style={styles.clearButton}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {favoritePoses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No favorites yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the heart icon on any pose to save it here
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/explore')}
            >
              <Text style={styles.exploreButtonText}>Explore Poses</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={favoritePoses}
            renderItem={renderPoseItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.poseList}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  clearButton: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  poseList: {
    paddingBottom: 24,
  },
  poseCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  poseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  poseInfo: {
    flex: 1,
    marginRight: 8,
  },
  poseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  poseCategory: {
    fontSize: 13,
    color: '#666',
  },
  poseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  figureThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  directCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  directCameraText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
