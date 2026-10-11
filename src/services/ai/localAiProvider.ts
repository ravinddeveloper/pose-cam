import { IAIProvider, AIGeneratedPoseResult } from './aiProviderInterface';
import { PoseRecommendationRequest, Pose } from '../../types/pose';
import { seedPoses } from '../../data/seedPoses';
import { RecommendationService } from '../recommendationService';

export class LocalRuleBasedAIProvider implements IAIProvider {
  readonly id = 'local-rule-engine';
  readonly name = 'Local AI Engine (100% Offline & Free)';
  readonly isOnline = false;

  async generateRecommendations(
    userPrompt: string,
    structuredCriteria?: PoseRecommendationRequest
  ): Promise<AIGeneratedPoseResult[]> {
    const promptLower = userPrompt.toLowerCase();
    const criteria: PoseRecommendationRequest = structuredCriteria || {};

    // People count analysis
    if (promptLower.includes('solo') || promptLower.includes('single') || promptLower.includes('alone') || promptLower.includes('myself')) {
      criteria.peopleCount = 1;
    } else if (promptLower.includes('couple') || promptLower.includes('two of us') || promptLower.includes('boyfriend') || promptLower.includes('girlfriend') || promptLower.includes('husband') || promptLower.includes('wife')) {
      criteria.peopleCount = 2;
    } else if (promptLower.includes('group') || promptLower.includes('friends') || promptLower.includes('family') || promptLower.includes('squad')) {
      criteria.peopleCount = 3;
    }

    // Setting analysis
    if (promptLower.includes('waterfall') || promptLower.includes('beach') || promptLower.includes('nature') || promptLower.includes('park') || promptLower.includes('mountain') || promptLower.includes('outdoor')) {
      criteria.location = 'outdoor';
    } else if (promptLower.includes('indoor') || promptLower.includes('cafe') || promptLower.includes('studio') || promptLower.includes('room') || promptLower.includes('museum')) {
      criteria.location = 'indoor';
    }

    // Occasion analysis
    if (promptLower.includes('travel') || promptLower.includes('trip') || promptLower.includes('vacation')) {
      criteria.occasion = 'travel';
    } else if (promptLower.includes('wedding') || promptLower.includes('engagement')) {
      criteria.occasion = 'wedding';
    } else if (promptLower.includes('graduation')) {
      criteria.occasion = 'graduation';
    }

    // Outfit detection for contextual enrichment
    let outfitHint = '';
    if (promptLower.includes('dress') || promptLower.includes('gown')) {
      outfitHint = 'Allow your dress to drape or catch subtle motion with the natural breeze.';
    } else if (promptLower.includes('suit') || promptLower.includes('blazer') || promptLower.includes('formal')) {
      outfitHint = 'Fasten the top blazer button when standing, adjust cuffs naturally with one hand.';
    } else if (promptLower.includes('hat') || promptLower.includes('sunglasses')) {
      outfitHint = 'Rest one hand gently on the brim of your hat or glasses for an effortless candid touch.';
    }

    // Run core recommendation engine
    const matched = RecommendationService.recommendPoses(seedPoses, criteria, 8);
    const posesToUse: Pose[] = matched.length > 0 ? matched.map(m => m.pose) : seedPoses.slice(0, 6);

    return posesToUse.map((pose, idx) => {
      const stepInstructions: string[] = [];
      if (pose.bodyInstructions.posture) stepInstructions.push(`Posture: ${pose.bodyInstructions.posture}`);
      if (pose.bodyInstructions.head) stepInstructions.push(`Head Angle: ${pose.bodyInstructions.head}`);
      if (pose.bodyInstructions.shoulders) stepInstructions.push(`Shoulders: ${pose.bodyInstructions.shoulders}`);
      if (outfitHint && idx === 0) stepInstructions.push(`Outfit note: ${outfitHint}`);

      const handAndLeg = [
        pose.bodyInstructions.hands || 'Keep fingers relaxed',
        pose.bodyInstructions.legs || 'Weight shifted comfortably onto back leg',
      ].join(' • ');

      const headAndExpr = [
        pose.bodyInstructions.head || 'Face slightly off-center',
        pose.facialExpression || 'Natural candid smile',
      ].join(' • ');

      const nextPose = seedPoses[(idx + 1) % seedPoses.length];

      return {
        id: `ai-rec-${pose.id}-${idx}`,
        title: pose.title,
        reason: `Matched for ${criteria.occasion || 'photo'} in ${criteria.location || 'ambient'} setting with ${pose.framing} framing.`,
        stepByStepInstructions: stepInstructions.length > 0 ? stepInstructions : [pose.description],
        handAndLegPlacement: handAndLeg,
        headAndExpression: headAndExpr,
        cameraAngleAndFraming: `${pose.cameraAngle} camera angle • ${pose.framing} framing`,
        environmentSuitability: pose.environment,
        difficultyScore: (pose.difficulty.charAt(0).toUpperCase() + pose.difficulty.slice(1)) as any,
        alternativePoseTitle: nextPose.title,
        matchingLocalPoseId: pose.id,
        onlineSearchQuery: `${userPrompt} ${pose.title}`,
        provider: 'local-offline',
      };
    });
  }
}
