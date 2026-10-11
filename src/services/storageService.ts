import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pose } from '../types/pose';

const FAVORITES_KEY = '@posegenius_favorites';
const RECENT_POSES_KEY = '@posegenius_recent';
const USER_NOTES_KEY = '@posegenius_notes';

export class StorageService {
  /**
   * Get all favorite pose IDs
   */
  static async getFavorites(): Promise<string[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Add a pose to favorites
   */
  static async addFavorite(poseId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(poseId)) {
        favorites.push(poseId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  }

  /**
   * Remove a pose from favorites
   */
  static async removeFavorite(poseId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updated = favorites.filter(id => id !== poseId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  /**
   * Check if a pose is favorited
   */
  static async isFavorite(poseId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.includes(poseId);
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }

  /**
   * Get recently viewed pose IDs (last 20)
   */
  static async getRecentPoses(): Promise<string[]> {
    try {
      const recentJson = await AsyncStorage.getItem(RECENT_POSES_KEY);
      return recentJson ? JSON.parse(recentJson) : [];
    } catch (error) {
      console.error('Error getting recent poses:', error);
      return [];
    }
  }

  /**
   * Add a pose to recently viewed
   */
  static async addRecentPose(poseId: string): Promise<void> {
    try {
      const recent = await this.getRecentPoses();
      // Remove if already exists (to move to front)
      const filtered = recent.filter(id => id !== poseId);
      // Add to front
      filtered.unshift(poseId);
      // Keep only last 20
      const trimmed = filtered.slice(0, 20);
      await AsyncStorage.setItem(RECENT_POSES_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error adding recent pose:', error);
    }
  }

  /**
   * Clear recently viewed poses
   */
  static async clearRecentPoses(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENT_POSES_KEY);
    } catch (error) {
      console.error('Error clearing recent poses:', error);
    }
  }

  /**
   * Get user notes for a pose
   */
  static async getPoseNote(poseId: string): Promise<string | null> {
    try {
      const notesJson = await AsyncStorage.getItem(USER_NOTES_KEY);
      const notes = notesJson ? JSON.parse(notesJson) : {};
      return notes[poseId] || null;
    } catch (error) {
      console.error('Error getting pose note:', error);
      return null;
    }
  }

  /**
   * Save user note for a pose
   */
  static async savePoseNote(poseId: string, note: string): Promise<void> {
    try {
      const notesJson = await AsyncStorage.getItem(USER_NOTES_KEY);
      const notes = notesJson ? JSON.parse(notesJson) : {};
      notes[poseId] = note;
      await AsyncStorage.setItem(USER_NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving pose note:', error);
    }
  }

  /**
   * Delete user note for a pose
   */
  static async deletePoseNote(poseId: string): Promise<void> {
    try {
      const notesJson = await AsyncStorage.getItem(USER_NOTES_KEY);
      const notes = notesJson ? JSON.parse(notesJson) : {};
      delete notes[poseId];
      await AsyncStorage.setItem(USER_NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error deleting pose note:', error);
    }
  }

  /**
   * Clear all app data
   */
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        FAVORITES_KEY,
        RECENT_POSES_KEY,
        USER_NOTES_KEY
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}
