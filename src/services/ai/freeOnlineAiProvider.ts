import { IAIProvider, AIGeneratedPoseResult } from './aiProviderInterface';
import { PoseRecommendationRequest } from '../../types/pose';
import { LocalRuleBasedAIProvider } from './localAiProvider';

export interface OnlineAIConfig {
  endpointUrl?: string; // e.g. OpenRouter, Groq, or Local Ollama http://10.0.2.2:11434/v1/chat/completions
  apiKey?: string;
  modelName?: string;
}

export class FreeOnlineAIAdapter implements IAIProvider {
  readonly id = 'free-online-adapter';
  readonly name = 'Configurable AI Provider (Online / Local Model)';
  readonly isOnline = true;

  private localFallback = new LocalRuleBasedAIProvider();
  private config: OnlineAIConfig;

  constructor(config?: OnlineAIConfig) {
    this.config = config || {};
  }

  updateConfig(config: OnlineAIConfig) {
    this.config = { ...this.config, ...config };
  }

  async generateRecommendations(
    userPrompt: string,
    structuredCriteria?: PoseRecommendationRequest
  ): Promise<AIGeneratedPoseResult[]> {
    // If no endpoint is configured, immediately use offline engine
    if (!this.config.endpointUrl) {
      return this.localFallback.generateRecommendations(userPrompt, structuredCriteria);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const systemPrompt = `You are PoseGenius AI, a professional photography pose director.
The user wants photo pose suggestions. Respond with a JSON array of up to 4 pose recommendations.
Each item must have these exact keys:
- title: string
- reason: string
- stepByStepInstructions: array of 3 string tips
- handAndLegPlacement: string
- headAndExpression: string
- cameraAngleAndFraming: string
- environmentSuitability: string
- difficultyScore: "Beginner" | "Intermediate" | "Advanced"
- alternativePoseTitle: string
Return ONLY valid raw JSON array.`;

      const response = await fetch(this.config.endpointUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.config.modelName || 'mistralai/mistral-7b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Online AI request returned status ${response.status}. Using local fallback.`);
        return this.fallbackWithNotice(userPrompt, structuredCriteria);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Parse JSON from model output
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in model response');
      }

      const parsed: any[] = JSON.parse(jsonMatch[0]);
      return parsed.map((item, idx) => ({
        id: `online-ai-${Date.now()}-${idx}`,
        title: item.title || 'Dynamic Pose',
        reason: item.reason || 'AI recommendation',
        stepByStepInstructions: Array.isArray(item.stepByStepInstructions)
          ? item.stepByStepInstructions
          : ['Follow natural body line'],
        handAndLegPlacement: item.handAndLegPlacement || 'Relaxed posture',
        headAndExpression: item.headAndExpression || 'Natural expression',
        cameraAngleAndFraming: item.cameraAngleAndFraming || 'Eye level • Medium shot',
        environmentSuitability: item.environmentSuitability || 'Versatile',
        difficultyScore: item.difficultyScore || 'Beginner',
        alternativePoseTitle: item.alternativePoseTitle || 'Classic Lean',
        onlineSearchQuery: `${userPrompt} ${item.title}`,
        provider: 'free-online',
      }));
    } catch (error) {
      console.warn('Online AI failed or timed out. Falling back to local offline engine:', error);
      return this.fallbackWithNotice(userPrompt, structuredCriteria);
    }
  }

  private async fallbackWithNotice(
    userPrompt: string,
    criteria?: PoseRecommendationRequest
  ): Promise<AIGeneratedPoseResult[]> {
    const fallbackResults = await this.localFallback.generateRecommendations(userPrompt, criteria);
    return fallbackResults.map(r => ({
      ...r,
      provider: 'local-fallback',
      reason: `(Offline Mode) ${r.reason}`,
    }));
  }
}
