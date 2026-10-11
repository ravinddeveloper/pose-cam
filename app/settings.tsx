import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StorageService } from '../src/services/storageService';

export default function SettingsScreen() {
  const router = useRouter();

  // Settings State
  const [onlineAiEnabled, setOnlineAiEnabled] = useState(false);
  const [offlineOnlyMode, setOfflineOnlyMode] = useState(true);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState('70');
  const [enableOpenverse, setEnableOpenverse] = useState(true);
  const [enableWikimedia, setEnableWikimedia] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const onlineAi = await AsyncStorage.getItem('ai_online_enabled');
      const offlineOnly = await AsyncStorage.getItem('offline_only_mode');
      const endpoint = await AsyncStorage.getItem('ai_custom_endpoint');
      const apiKey = await AsyncStorage.getItem('ai_custom_key');
      const model = await AsyncStorage.getItem('ai_custom_model');
      const opacity = await AsyncStorage.getItem('camera_overlay_opacity');

      if (onlineAi !== null) setOnlineAiEnabled(onlineAi === 'true');
      if (offlineOnly !== null) setOfflineOnlyMode(offlineOnly === 'true');
      if (endpoint !== null) setCustomEndpoint(endpoint);
      if (apiKey !== null) setCustomApiKey(apiKey);
      if (model !== null) setCustomModel(model);
      if (opacity !== null) setOverlayOpacity(opacity);
    } catch (e) {
      console.warn('Error loading settings:', e);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('ai_online_enabled', String(onlineAiEnabled));
      await AsyncStorage.setItem('offline_only_mode', String(offlineOnlyMode));
      await AsyncStorage.setItem('ai_custom_endpoint', customEndpoint.trim());
      await AsyncStorage.setItem('ai_custom_key', customApiKey.trim());
      await AsyncStorage.setItem('ai_custom_model', customModel.trim());
      await AsyncStorage.setItem('camera_overlay_opacity', overlayOpacity);
      Alert.alert('Settings Saved', 'Your preferences have been updated successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear cached thumbnails and temporary network search data. Your saved favorites will not be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('recent_poses');
              Alert.alert('Success', 'Cache cleared successfully.');
            } catch {
              Alert.alert('Error', 'Failed to clear cache.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAllData = async () => {
    Alert.alert(
      'Delete All Local Data',
      'Are you sure? This will remove all your saved favorites, personal pose notes, and reset all app preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await AsyncStorage.clear();
              setOnlineAiEnabled(false);
              setOfflineOnlyMode(true);
              setCustomEndpoint('');
              setCustomApiKey('');
              Alert.alert('Deleted', 'All local data has been reset.');
            } catch {
              Alert.alert('Error', 'Failed to delete local data.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings & Preferences</Text>

      {/* AI Configuration Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>AI Pose Coach Configuration</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.settingLabel}>Offline-Only Mode</Text>
            <Text style={styles.settingDescription}>
              Keep all AI recommendations strictly on-device using local rule matching. Zero network requests.
            </Text>
          </View>
          <Switch
            value={offlineOnlyMode}
            onValueChange={val => {
              setOfflineOnlyMode(val);
              if (val) setOnlineAiEnabled(false);
            }}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={offlineOnlyMode ? '#2563EB' : '#F8FAFC'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.settingLabel}>Enable Online AI Adapter</Text>
            <Text style={styles.settingDescription}>
              Connect to a free or self-hosted AI endpoint (e.g. Local Ollama, Groq, OpenRouter).
            </Text>
          </View>
          <Switch
            value={onlineAiEnabled}
            disabled={offlineOnlyMode}
            onValueChange={val => setOnlineAiEnabled(val)}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={onlineAiEnabled ? '#2563EB' : '#F8FAFC'}
          />
        </View>

        {onlineAiEnabled && !offlineOnlyMode && (
          <View style={styles.customConfigBox}>
            <Text style={styles.inputLabel}>Custom AI Endpoint URL</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. http://10.0.2.2:11434/v1/chat/completions"
              placeholderTextColor="#94A3B8"
              value={customEndpoint}
              onChangeText={setCustomEndpoint}
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>
              For Android Emulator with local Ollama, use: http://10.0.2.2:11434/v1/chat/completions
            </Text>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>API Key (Optional / Never Uploaded)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Leave blank if using local Ollama"
              placeholderTextColor="#94A3B8"
              value={customApiKey}
              onChangeText={setCustomApiKey}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Model Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. llama3, mistral, or mistralai/mistral-7b-instruct:free"
              placeholderTextColor="#94A3B8"
              value={customModel}
              onChangeText={setCustomModel}
              autoCapitalize="none"
            />
          </View>
        )}
      </View>

      {/* Camera & Visualizer Preferences */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="camera-outline" size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>Camera & Overlay Preferences</Text>
        </View>

        <Text style={styles.settingLabel}>Default Overlay Opacity</Text>
        <Text style={styles.settingDescription}>
          Controls the transparency of the pose skeleton and reference silhouette in the camera.
        </Text>

        <View style={styles.opacityButtonRow}>
          {['30', '50', '70', '90'].map(val => (
            <TouchableOpacity
              key={val}
              style={[
                styles.opacityButton,
                overlayOpacity === val && styles.opacityButtonActive,
              ]}
              onPress={() => setOverlayOpacity(val)}
            >
              <Text
                style={[
                  styles.opacityButtonText,
                  overlayOpacity === val && styles.opacityButtonTextActive,
                ]}
              >
                {val}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Image Discovery Sources */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="globe-outline" size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>Online Discovery Sources</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Openverse Public API</Text>
            <Text style={styles.settingDescription}>Search Creative Commons & public-domain library</Text>
          </View>
          <Switch
            value={enableOpenverse}
            onValueChange={setEnableOpenverse}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={enableOpenverse ? '#2563EB' : '#F8FAFC'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Wikimedia Commons</Text>
            <Text style={styles.settingDescription}>Search Wikimedia open knowledge photography</Text>
          </View>
          <Switch
            value={enableWikimedia}
            onValueChange={setEnableWikimedia}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={enableWikimedia ? '#2563EB' : '#F8FAFC'}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveSettings} disabled={isSaving}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </TouchableOpacity>

      {/* Privacy & Legal */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#16A34A" />
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
        </View>

        <Text style={styles.privacyText}>
          • Zero Account Requirement: PoseGenius AI does not require sign-up or registration.
        </Text>
        <Text style={styles.privacyText}>
          • On-Device Processing: Camera frames are evaluated locally on your device. Photos are never uploaded to any remote server without your explicit command.
        </Text>
        <Text style={styles.privacyText}>
          • Open Source & Free: All core capabilities are designed to remain 100% free with no surprise paywalls.
        </Text>
      </View>

      {/* Data Management */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={styles.sectionTitle}>Data Management</Text>
        </View>

        <TouchableOpacity style={styles.dangerButton} onPress={handleClearCache}>
          <Ionicons name="refresh-outline" size={18} color="#2563EB" />
          <Text style={styles.dangerButtonTextBlue}>Clear Temporary Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.dangerButton, { marginTop: 10 }]} onPress={handleDeleteAllData}>
          <Ionicons name="trash" size={18} color="#EF4444" />
          <Text style={styles.dangerButtonTextRed}>Delete All Saved Data & Favorites</Text>
        </TouchableOpacity>
      </View>

      {/* Version Information */}
      <View style={styles.versionCard}>
        <Text style={styles.versionTitle}>PoseGenius AI</Text>
        <Text style={styles.versionText}>Version 1.0.0 (Release Build) • Expo SDK 57</Text>
        <Text style={styles.versionText}>On-Device Landmark Architecture • MediaPipe Compatible</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  customConfigBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  helperText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  opacityButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  opacityButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  opacityButtonActive: {
    backgroundColor: '#2563EB',
  },
  opacityButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  opacityButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  privacyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  dangerButtonTextBlue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  dangerButtonTextRed: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionCard: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});
