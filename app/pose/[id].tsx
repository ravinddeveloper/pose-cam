import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pose } from '../../src/types/pose';
import { seedPoses } from '../../src/data/seedPoses';
import { StorageService } from '../../src/services/storageService';
import { PoseFilterService } from '../../src/services/poseFilterService';
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

export default function PoseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [pose, setPose] = useState<Pose | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarPoses, setSimilarPoses] = useState<Pose[]>([]);

  const loadPose = async () => {
    const foundPose = seedPoses.find(p => p.id === id);
    if (foundPose) {
      setPose(foundPose);
      const fav = await StorageService.isFavorite(foundPose.id);
      setIsFavorite(fav);
      await StorageService.addRecentPose(foundPose.id);
      const similar = PoseFilterService.getSimilarPoses(seedPoses, foundPose, 4);
      setSimilarPoses(similar);
    }
  };

  useEffect(() => {
    loadPose();
  }, [id]);

  const toggleFavorite = async () => {
    if (!pose) return;
    try {
      if (isFavorite) {
        await StorageService.removeFavorite(pose.id);
        setIsFavorite(false);
      } else {
        await StorageService.addFavorite(pose.id);
        setIsFavorite(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const startCamera = () => {
    if (pose) {
      router.push({ pathname: '/live-coach', params: { poseId: pose.id } });
    } else {
      router.push('/live-coach');
    }
  };

  if (!pose) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Pose not found</Text>
        </View>
      </View>
    );
  }

  const renderInstruction = (label: string, value?: string) => {
    if (!value) return null;
    return (
      <View style={styles.instructionItem}>
        <Text style={styles.instructionLabel}>{label}:</Text>
        <Text style={styles.instructionText}>{value}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{pose.title}</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? '#FF3B30' : '#999'}
            />
          </TouchableOpacity>
        </View>

        {/* Hero Geometric Pose Visualizer */}
        <View style={styles.visualizerCard}>
          <PoseStickFigure
            category={pose.category}
            framing={pose.framing}
            size={180}
            color="#2563EB"
            accentColor="#00E5FF"
          />
          <Text style={styles.visualizerCaption}>
            Target Posture & Skeleton Archetype
          </Text>
        </View>

        <Text style={styles.description}>{pose.description}</Text>

        {/* Metadata badges */}
        <View style={styles.metaContainer}>
          <View style={styles.metaTag}>
            <Text style={styles.metaText}>{categoryLabels[pose.category] || pose.category}</Text>
          </View>
          <View style={[styles.metaTag, styles.difficultyTag]}>
            <Text style={styles.metaText}>{pose.difficulty}</Text>
          </View>
          <View style={styles.metaTag}>
            <Text style={styles.metaText}>{pose.framing}</Text>
          </View>
          <View style={styles.metaTag}>
            <Text style={styles.metaText}>{pose.cameraAngle} angle</Text>
          </View>
        </View>

        {/* Step-by-step Body Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Instructions</Text>
          {renderInstruction('Head', pose.bodyInstructions.head)}
          {renderInstruction('Shoulders', pose.bodyInstructions.shoulders)}
          {renderInstruction('Arms', pose.bodyInstructions.arms)}
          {renderInstruction('Hands', pose.bodyInstructions.hands)}
          {renderInstruction('Torso', pose.bodyInstructions.torso)}
          {renderInstruction('Legs', pose.bodyInstructions.legs)}
          {renderInstruction('Feet', pose.bodyInstructions.feet)}
          {renderInstruction('Posture', pose.bodyInstructions.posture)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facial Expression</Text>
          <Text style={styles.sectionContent}>{pose.facialExpression}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lighting & Environment</Text>
          {renderInstruction('Lighting', pose.lighting)}
          {renderInstruction('Environment', pose.environment)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {pose.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Licensing & Attribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attribution & Source</Text>
          <Text style={styles.sectionContent}>
            Source: {pose.sourceType === 'local' ? 'PoseGenius Curated Dataset' : pose.sourceType}
          </Text>
          <Text style={styles.subtleText}>
            Licensing: Free for personal use • Zero cloud upload required
          </Text>
        </View>

        {/* Similar Poses */}
        {similarPoses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar Poses</Text>
            {similarPoses.map((similar) => (
              <TouchableOpacity
                key={similar.id}
                style={styles.similarPoseCard}
                onPress={() => router.push(`/pose/${similar.id}`)}
              >
                <View>
                  <Text style={styles.similarPoseTitle}>{similar.title}</Text>
                  <Text style={styles.similarPoseCategory}>{categoryLabels[similar.category]}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Camera Guidance Action */}
        <TouchableOpacity style={styles.cameraButton} onPress={startCamera}>
          <Ionicons name="camera" size={24} color="#fff" style={styles.cameraButtonIcon} />
          <Text style={styles.cameraButtonText}>Use in Camera Coach</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
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
  errorText: {
    fontSize: 18,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
  },
  visualizerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  visualizerCaption: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  metaTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyTag: {
    backgroundColor: '#E8F5E9',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  subtleText: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  instructionItem: {
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  instructionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 13,
    color: '#475569',
  },
  similarPoseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  similarPoseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  similarPoseCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cameraButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraButtonIcon: {
    marginRight: 8,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
});
