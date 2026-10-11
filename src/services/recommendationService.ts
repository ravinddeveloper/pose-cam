import { Pose, PoseRecommendationRequest, PoseRecommendation } from '../types/pose';
import { PoseFilterService } from './poseFilterService';

export class RecommendationService {
  /**
   * Recommend poses based on user request (offline, rule-based)
   */
  static recommendPoses(poses: Pose[], request: PoseRecommendationRequest, limit: number = 10): PoseRecommendation[] {
    let filtered = [...poses];
    const reasons: string[] = [];

    // Filter by people count
    if (request.peopleCount) {
      if (request.peopleCount === 1) {
        filtered = filtered.filter(pose =>
          pose.category === 'solo-portraits' ||
          pose.category === 'selfies' ||
          pose.category === 'women' ||
          pose.category === 'men' ||
          pose.category === 'professional'
        );
        reasons.push('Solo poses selected for single person');
      } else if (request.peopleCount === 2) {
        filtered = filtered.filter(pose =>
          pose.category === 'couples' ||
          pose.category === 'wedding' ||
          pose.category === 'maternity'
        );
        reasons.push('Couple poses selected for two people');
      } else {
        filtered = filtered.filter(pose =>
          pose.category === 'friends-groups' ||
          pose.category === 'family'
        );
        reasons.push('Group poses selected for multiple people');
      }
    }

    // Filter by location
    if (request.location) {
      if (request.location === 'indoor') {
        filtered = filtered.filter(pose =>
          pose.environment.toLowerCase().includes('indoor') ||
          pose.environment.toLowerCase().includes('studio') ||
          pose.environment.toLowerCase().includes('home') ||
          pose.environment.toLowerCase().includes('cafe') ||
          pose.environment.toLowerCase().includes('library') ||
          pose.environment.toLowerCase().includes('museum')
        );
        reasons.push('Indoor poses selected for indoor location');
      } else if (request.location === 'outdoor') {
        filtered = filtered.filter(pose =>
          pose.environment.toLowerCase().includes('outdoor') ||
          pose.environment.toLowerCase().includes('beach') ||
          pose.environment.toLowerCase().includes('nature') ||
          pose.environment.toLowerCase().includes('park') ||
          pose.environment.toLowerCase().includes('street') ||
          pose.environment.toLowerCase().includes('urban') ||
          pose.environment.toLowerCase().includes('travel') ||
          pose.environment.toLowerCase().includes('forest') ||
          pose.environment.toLowerCase().includes('mountain')
        );
        reasons.push('Outdoor poses selected for outdoor location');
      }
    }

    // Filter by occasion
    if (request.occasion) {
      const occasionLower = request.occasion.toLowerCase();
      filtered = filtered.filter(pose =>
        pose.category.toLowerCase().includes(occasionLower) ||
        pose.tags.some(tag => tag.toLowerCase().includes(occasionLower)) ||
        pose.environment.toLowerCase().includes(occasionLower) ||
        pose.description.toLowerCase().includes(occasionLower)
      );
      reasons.push(`Poses matching "${request.occasion}" occasion`);
    }

    // Filter by mood
    if (request.mood) {
      const moodLower = request.mood.toLowerCase();
      filtered = filtered.filter(pose =>
        pose.facialExpression.toLowerCase().includes(moodLower) ||
        pose.tags.some(tag => tag.toLowerCase().includes(moodLower)) ||
        pose.description.toLowerCase().includes(moodLower)
      );
      reasons.push(`Poses matching "${request.mood}" mood`);
    }

    // Filter by aesthetic
    if (request.aesthetic) {
      const aestheticLower = request.aesthetic.toLowerCase();
      filtered = filtered.filter(pose =>
        pose.tags.some(tag => tag.toLowerCase().includes(aestheticLower)) ||
        pose.category.toLowerCase().includes(aestheticLower) ||
        pose.description.toLowerCase().includes(aestheticLower)
      );
      reasons.push(`Poses matching "${request.aesthetic}" aesthetic`);
    }

    // Filter by framing
    if (request.framing) {
      filtered = filtered.filter(pose => pose.framing === request.framing);
      reasons.push(`Poses with ${request.framing} framing`);
    }

    // Filter by experience level
    if (request.experience) {
      if (request.experience === 'beginner') {
        filtered = filtered.filter(pose => pose.difficulty === 'beginner');
        reasons.push('Beginner-friendly poses selected');
      } else {
        filtered = filtered.filter(pose =>
          pose.difficulty === 'intermediate' || pose.difficulty === 'advanced'
        );
        reasons.push('Intermediate and advanced poses selected');
      }
    }

    // Filter by body preferences
    if (request.bodyPreferences && request.bodyPreferences.length > 0) {
      const prefsLower = request.bodyPreferences.map(p => p.toLowerCase());
      filtered = filtered.filter(pose =>
        prefsLower.some(pref =>
          pose.bodyInstructions.head?.toLowerCase().includes(pref) ||
          pose.bodyInstructions.shoulders?.toLowerCase().includes(pref) ||
          pose.bodyInstructions.arms?.toLowerCase().includes(pref) ||
          pose.bodyInstructions.hands?.toLowerCase().includes(pref) ||
          pose.bodyInstructions.torso?.toLowerCase().includes(pref) ||
          pose.bodyInstructions.legs?.toLowerCase().includes(pref) ||
          pose.bodyInstructions.feet?.toLowerCase().includes(pref) ||
          pose.bodyInstructions.posture?.toLowerCase().includes(pref)
        )
      );
      reasons.push('Poses matching body position preferences');
    }

    // If no filters applied, return all poses sorted by relevance
    if (filtered.length === 0 && poses.length > 0) {
      filtered = [...poses];
      reasons.push('Showing all available poses');
    }

    // Sort by relevance (more specific matches first)
    const scored = filtered.map(pose => {
      let score = 0;

      // Higher score for exact category matches
      if (request.occasion && pose.category.toLowerCase().includes(request.occasion.toLowerCase())) {
        score += 10;
      }

      // Higher score for difficulty match
      if (request.experience === 'beginner' && pose.difficulty === 'beginner') {
        score += 5;
      }

      // Higher score for framing match
      if (request.framing && pose.framing === request.framing) {
        score += 5;
      }

      // Higher score for tag matches
      if (request.mood) {
        const moodTags = pose.tags.filter(tag => tag.toLowerCase().includes(request.mood!.toLowerCase()));
        score += moodTags.length * 3;
      }

      // Prefer beginner poses by default
      if (pose.difficulty === 'beginner') {
        score += 2;
      }

      return { pose, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Return top results
    const topPoses = scored.slice(0, limit).map(item => item.pose);

    return topPoses.map(pose => ({
      pose,
      reason: reasons.join('. '),
      confidence: this.calculateConfidence(pose, request),
      alternatives: this.getAlternatives(poses, pose, request, 3)
    }));
  }

  /**
   * Calculate confidence score for a recommendation
   */
  private static calculateConfidence(pose: Pose, request: PoseRecommendationRequest): number {
    let confidence = 0.5; // Base confidence

    const matches = [];

    if (request.peopleCount) {
      if (request.peopleCount === 1 && (
        pose.category === 'solo-portraits' ||
        pose.category === 'selfies'
      )) {
        confidence += 0.2;
        matches.push('people count');
      }
      if (request.peopleCount === 2 && pose.category === 'couples') {
        confidence += 0.2;
        matches.push('people count');
      }
    }

    if (request.location) {
      const envLower = pose.environment.toLowerCase();
      if (request.location === 'indoor' && (
        envLower.includes('indoor') ||
        envLower.includes('studio') ||
        envLower.includes('home')
      )) {
        confidence += 0.15;
        matches.push('location');
      }
      if (request.location === 'outdoor' && (
        envLower.includes('outdoor') ||
        envLower.includes('beach') ||
        envLower.includes('nature')
      )) {
        confidence += 0.15;
        matches.push('location');
      }
    }

    if (request.framing && pose.framing === request.framing) {
      confidence += 0.15;
      matches.push('framing');
    }

    if (request.experience === 'beginner' && pose.difficulty === 'beginner') {
      confidence += 0.2;
      matches.push('difficulty');
    }

    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Get alternative poses similar to the recommended one
   */
  private static getAlternatives(
    poses: Pose[],
    pose: Pose,
    request: PoseRecommendationRequest,
    limit: number
  ): Pose[] {
    const similar = PoseFilterService.getSimilarPoses(poses, pose, limit * 2);

    // Filter out poses that don't match basic criteria
    const filtered = similar.filter(alt => {
      if (request.experience === 'beginner' && alt.difficulty !== 'beginner') {
        return false;
      }
      return true;
    });

    return filtered.slice(0, limit);
  }

  /**
   * Explain why a pose was recommended
   */
  static explainPose(pose: Pose, request: PoseRecommendationRequest): string {
    const explanations: string[] = [];

    explanations.push(`"${pose.title}" is a ${pose.difficulty} ${pose.category} pose.`);

    if (pose.difficulty === 'beginner') {
      explanations.push('This pose is beginner-friendly and easy to execute.');
    } else if (pose.difficulty === 'intermediate') {
      explanations.push('This pose requires some practice but is achievable.');
    } else {
      explanations.push('This pose is advanced and may require multiple attempts.');
    }

    if (request.location === 'indoor' && pose.environment.toLowerCase().includes('indoor')) {
      explanations.push('It works well in indoor settings.');
    } else if (request.location === 'outdoor' && pose.environment.toLowerCase().includes('outdoor')) {
      explanations.push('It\'s perfect for outdoor locations.');
    }

    if (request.framing && pose.framing === request.framing) {
      explanations.push(`It uses ${pose.framing} framing as requested.`);
    }

    explanations.push(`The ${pose.lighting} lighting suggestion matches typical conditions.`);
    explanations.push(`Key instructions: ${pose.bodyInstructions.posture || pose.bodyInstructions.head || 'follow the detailed body positioning guide'}.`);

    return explanations.join(' ');
  }

  /**
   * Get quick suggestions based on simple criteria
   */
  static getQuickSuggestions(poses: Pose[], category?: string, count: number = 5): Pose[] {
    let filtered = [...poses];

    if (category) {
      filtered = filtered.filter(pose => pose.category === category);
    }

    // Prefer beginner poses for quick suggestions
    const beginnerFirst = filtered.sort((a, b) => {
      if (a.difficulty === 'beginner' && b.difficulty !== 'beginner') return -1;
      if (a.difficulty !== 'beginner' && b.difficulty === 'beginner') return 1;
      return 0;
    });

    return beginnerFirst.slice(0, count);
  }
}
