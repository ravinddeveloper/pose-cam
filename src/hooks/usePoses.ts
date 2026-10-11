import { useState, useEffect, useCallback } from 'react';
import { Pose, PoseFilter } from '../types/pose';
import { seedPoses } from '../data/seedPoses';
import { PoseFilterService } from '../services/poseFilterService';
import { StorageService } from '../services/storageService';

export function usePoses() {
  const [poses, setPoses] = useState<Pose[]>([]);
  const [filteredPoses, setFilteredPoses] = useState<Pose[]>([]);
  const [filter, setFilter] = useState<PoseFilter>({});
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load poses and favorites on mount
  useEffect(() => {
    loadPoses();
    loadFavorites();
  }, []);

  // Load poses from seed data
  const loadPoses = useCallback(() => {
    setLoading(true);
    // In a real app, this might fetch from an API or database
    setPoses(seedPoses);
    setFilteredPoses(seedPoses);
    setLoading(false);
  }, []);

  // Load favorites from storage
  const loadFavorites = useCallback(async () => {
    try {
      const favIds = await StorageService.getFavorites();
      setFavorites(new Set(favIds));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Apply filter whenever filter or poses changes
  useEffect(() => {
    if (poses.length > 0) {
      const filtered = PoseFilterService.filterPoses(poses, filter);
      setFilteredPoses(filtered);
    }
  }, [filter, poses]);

  // Update filter
  const updateFilter = useCallback((newFilter: Partial<PoseFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  // Clear filter
  const clearFilter = useCallback(() => {
    setFilter({});
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (poseId: string) => {
    try {
      const newFavorites = new Set(favorites);
      if (newFavorites.has(poseId)) {
        await StorageService.removeFavorite(poseId);
        newFavorites.delete(poseId);
      } else {
        await StorageService.addFavorite(poseId);
        newFavorites.add(poseId);
      }
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [favorites]);

  // Check if pose is favorited
  const isFavorite = useCallback((poseId: string) => {
    return favorites.has(poseId);
  }, [favorites]);

  // Get categories
  const categories = PoseFilterService.getCategories(poses);

  // Get tags
  const tags = PoseFilterService.getTags(poses);

  return {
    poses,
    filteredPoses,
    filter,
    updateFilter,
    clearFilter,
    loading,
    toggleFavorite,
    isFavorite,
    categories,
    tags
  };
}
