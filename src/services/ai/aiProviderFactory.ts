import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAIProvider } from './aiProviderInterface';
import { LocalRuleBasedAIProvider } from './localAiProvider';
import { FreeOnlineAIAdapter } from './freeOnlineAiProvider';

export class AIProviderFactory {
  private static localProvider = new LocalRuleBasedAIProvider();
  private static onlineAdapter = new FreeOnlineAIAdapter();

  static async getActiveProvider(): Promise<IAIProvider> {
    try {
      const onlineEnabled = await AsyncStorage.getItem('ai_online_enabled');
      if (onlineEnabled !== 'true') {
        return this.localProvider;
      }

      const endpoint = await AsyncStorage.getItem('ai_custom_endpoint');
      const apiKey = await AsyncStorage.getItem('ai_custom_key');
      const model = await AsyncStorage.getItem('ai_custom_model');

      if (!endpoint) {
        return this.localProvider;
      }

      this.onlineAdapter.updateConfig({
        endpointUrl: endpoint,
        apiKey: apiKey || undefined,
        modelName: model || undefined,
      });

      return this.onlineAdapter;
    } catch {
      return this.localProvider;
    }
  }

  static getOfflineProvider(): IAIProvider {
    return this.localProvider;
  }
}
