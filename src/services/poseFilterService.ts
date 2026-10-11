import { Pose, PoseFilter } from '../types/pose';

export class PoseFilterService {
  /**
   * Filter poses based on provided filter criteria
   */
  static filterPoses(poses: Pose[], filter: PoseFilter): Pose[] {
    let filtered = [...poses];

    // Filter by category
    if (filter.category) {
      filtered = filtered.filter(pose => pose.category === filter.category);
    }

    // Filter by difficulty
    if (filter.difficulty) {
      filtered = filtered.filter(pose => pose.difficulty === filter.difficulty);
    }

    // Filter by framing
    if (filter.framing) {
      filtered = filtered.filter(pose => pose.framing === filter.framing);
    }

    // Filter by camera angle
    if (filter.cameraAngle) {
      filtered = filtered.filter(pose => pose.cameraAngle === filter.cameraAngle);
    }

    // Filter by tags (poses must have ALL specified tags)
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(pose =>
        filter.tags!.every(tag => pose.tags.includes(tag))
      );
    }

    // Filter by search query (searches in title, description, and tags)
    if (filter.searchQuery && filter.searchQuery.trim() !== '') {
      const query = filter.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(pose =>
        pose.title.toLowerCase().includes(query) ||
        pose.description.toLowerCase().includes(query) ||
        pose.tags.some(tag => tag.toLowerCase().includes(query)) ||
        pose.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  /**
   * Sort poses by various criteria
   */
  static sortPoses(poses: Pose[], sortBy: 'newest' | 'oldest' | 'difficulty' | 'title'): Pose[] {
    const sorted = [...poses];

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'difficulty':
        const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        return sorted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }

  /**
   * Get unique categories from poses
   */
  static getCategories(poses: Pose[]): string[] {
    const categories = new Set(poses.map(pose => pose.category));
    return Array.from(categories).sort();
  }

  /**
   * Get unique tags from poses
   */
  static getTags(poses: Pose[]): string[] {
    const tags = new Set<string>();
    poses.forEach(pose => pose.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }

  /**
   * Get poses by category
   */
  static getPosesByCategory(poses: Pose[], category: string): Pose[] {
    return poses.filter(pose => pose.category === category);
  }

  /**
   * Get similar poses based on tags and category
   */
  static getSimilarPoses(poses: Pose[], pose: Pose, limit: number = 5): Pose[] {
    const scored = poses
      .filter(p => p.id !== pose.id)
      .map(otherPose => {
        let score = 0;

        // Same category gets high score
        if (otherPose.category === pose.category) {
          score += 10;
        }

        // Same tags get points
        const commonTags = otherPose.tags.filter(tag => pose.tags.includes(tag));
        score += commonTags.length * 5;

        // Only add nuance bonuses if there is an underlying topic/category connection
        if (score > 0) {
          // Same difficulty
          if (otherPose.difficulty === pose.difficulty) {
            score += 3;
          }

          // Same framing
          if (otherPose.framing === pose.framing) {
            score += 2;
          }
        }

        return { pose: otherPose, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.pose);

    return scored;
  }

  /**
   * Paginate poses
   */
  static paginatePoses(poses: Pose[], page: number, pageSize: number): {
    poses: Pose[];
    totalPages: number;
    currentPage: number;
  } {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPoses = poses.slice(startIndex, endIndex);
    const totalPages = Math.ceil(poses.length / pageSize);

    return {
      poses: paginatedPoses,
      totalPages,
      currentPage: page
    };
  }
}
