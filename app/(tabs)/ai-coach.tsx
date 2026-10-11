import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AIProviderFactory } from '../../src/services/ai/aiProviderFactory';
import { AIGeneratedPoseResult } from '../../src/services/ai/aiProviderInterface';
import { PoseStickFigure } from '../../src/components/PoseStickFigure';
import { StorageService } from '../../src/services/storageService';

export default function AiCoachScreen() {
  const router = useRouter();
  const [promptText, setPromptText] = useState('');
  const [recommendations, setRecommendations] = useState<AIGeneratedPoseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeProviderName, setActiveProviderName] = useState<string>('Local AI Engine (Offline)');

  const quickPrompts = [
    'Solo travel in blue dress near waterfall',
    'Romantic couple on beach at sunset',
    'Professional headshot in office',
    'Casual coffee shop sitting pose',
    'Street fashion candid walking',
    'Fitness workout athletic flex',
  ];

  const handleGenerate = async (queryText?: string) => {
    const q = queryText !== undefined ? queryText : promptText;
    if (!q.trim()) {
      Alert.alert('Prompt needed', 'Please describe your photo scenario or pick one of the quick suggestions.');
      return;
    }

    setLoading(true);
    try {
      const provider = await AIProviderFactory.getActiveProvider();
      setActiveProviderName(provider.name);
      const results = await provider.generateRecommendations(q);
      setRecommendations(results);
    } catch (error) {
      console.warn('AI coach generation error:', error);
      // Fallback
      const fallback = AIProviderFactory.getOfflineProvider();
      const results = await fallback.generateRecommendations(q);
      setRecommendations(results);
    } finally {
      setLoading(false);
    }
  };

  const handleUseInCamera = (item: AIGeneratedPoseResult) => {
    if (item.matchingLocalPoseId) {
      router.push({ pathname: '/live-coach', params: { poseId: item.matchingLocalPoseId } });
    } else {
      router.push('/live-coach');
    }
  };

  const handleSaveFavorite = async (item: AIGeneratedPoseResult) => {
    try {
      if (item.matchingLocalPoseId) {
        await StorageService.addFavorite(item.matchingLocalPoseId);
        Alert.alert('Saved!', `Added "${item.title}" to your favorites.`);
      } else {
        Alert.alert('Saved!', `Saved "${item.title}" to your session.`);
      }
    } catch {
      Alert.alert('Note', 'Could not save to favorites.');
    }
  };

  const renderRecommendationCard = ({ item }: { item: AIGeneratedPoseResult }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyBadgeText}>{item.difficultyScore}</Text>
            </View>
            <View
              style={[
                styles.providerBadge,
                item.provider === 'free-online' ? styles.providerBadgeOnline : styles.providerBadgeOffline,
              ]}
            >
              <Text style={styles.providerBadgeText}>
                {item.provider === 'free-online' ? 'Online AI' : 'Offline Engine'}
              </Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardReason}>{item.reason}</Text>
        </View>

        <View style={styles.stickFigureThumbnail}>
          <PoseStickFigure
            category="standing"
            size={70}
            color="#2563EB"
            accentColor="#38BDF8"
          />
        </View>
      </View>

      {/* Step by Step instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.sectionHeader}>Step-by-Step Guidance</Text>
        {item.stepByStepInstructions.map((step, idx) => (
          <View key={idx} style={styles.stepItem}>
            <Text style={styles.stepNumber}>{idx + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Body positioning breakdown */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Hands & Legs</Text>
          <Text style={styles.detailValue}>{item.handAndLegPlacement}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Head & Expression</Text>
          <Text style={styles.detailValue}>{item.headAndExpression}</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Camera & Framing</Text>
          <Text style={styles.detailValue}>{item.cameraAngleAndFraming}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Alternative Pose</Text>
          <Text style={styles.detailValue}>{item.alternativePoseTitle}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleSaveFavorite(item)}
        >
          <Ionicons name="heart-outline" size={18} color="#2563EB" />
          <Text style={styles.favoriteButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cameraActionButton}
          onPress={() => handleUseInCamera(item)}
        >
          <Ionicons name="camera" size={18} color="#FFFFFF" />
          <Text style={styles.cameraActionButtonText}>Open in Live Coach</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Pose Coach</Text>
        <Text style={styles.subtitle}>
          Natural-language director for customized photo poses
        </Text>
      </View>

      {/* Prompt Input Field */}
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="e.g. Solo travel in blue dress near waterfall..."
          placeholderTextColor="#94A3B8"
          value={promptText}
          onChangeText={setPromptText}
          multiline
          numberOfLines={2}
        />
        <View style={styles.inputActionRow}>
          <Text style={styles.providerInfoText}>
            🔒 {activeProviderName}
          </Text>
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.generateButtonDisabled]}
            onPress={() => handleGenerate()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.generateButtonText}>Generate</Text>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Prompts Carousel */}
      <View style={styles.quickPromptsContainer}>
        <Text style={styles.quickPromptsLabel}>Quick Scenarios:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickPrompts.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickChip}
              onPress={() => {
                setPromptText(q);
                handleGenerate(q);
              }}
            >
              <Text style={styles.quickChipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recommendations List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingMessage}>
            Directing custom poses and posture angles...
          </Text>
        </View>
      ) : (
        <FlatList
          data={recommendations}
          renderItem={renderRecommendationCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="sparkles-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Personalized AI Pose Direction</Text>
              <Text style={styles.emptySubtitle}>
                Type any outfit, setting, mood, or occasion above, or pick one of the quick scenarios to get tailored poses.
              </Text>
            </View>
          }
        />
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
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    fontSize: 15,
    color: '#0F172A',
    minHeight: 48,
    textAlignVertical: 'top',
  },
  inputActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  providerInfoText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  quickPromptsContainer: {
    paddingVertical: 10,
    paddingLeft: 16,
  },
  quickPromptsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  quickChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  difficultyBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyBadgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  providerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  providerBadgeOnline: {
    backgroundColor: '#F0FDF4',
  },
  providerBadgeOffline: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  providerBadgeText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardReason: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  stickFigureThumbnail: {
    width: 70,
    height: 70,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  instructionsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  stepNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
    marginRight: 8,
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  detailBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 10,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  favoriteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  cameraActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  cameraActionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingMessage: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
