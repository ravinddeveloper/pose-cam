import { PoseFilterService } from '../poseFilterService';
import { Pose } from '../../types/pose';

describe('PoseFilterService', () => {
  const mockPoses: Pose[] = [
    {
      id: 'pose-001',
      title: 'Classic Standing Portrait',
      description: 'A timeless standing pose perfect for beginners',
      category: 'solo-portraits',
      tags: ['standing', 'beginner', 'classic', 'portrait'],
      difficulty: 'beginner',
      framing: 'full-body',
      cameraAngle: 'eye-level',
      bodyInstructions: {},
      facialExpression: 'Natural smile',
      lighting: 'Soft light',
      environment: 'Indoor studio',
      sourceType: 'local',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'pose-002',
      title: 'Beach Sunset',
      description: 'Romantic beach pose at sunset',
      category: 'beach',
      tags: ['beach', 'sunset', 'romantic', 'couple'],
      difficulty: 'intermediate',
      framing: 'full-body',
      cameraAngle: 'low-angle',
      bodyInstructions: {},
      facialExpression: 'Romantic',
      lighting: 'Golden hour',
      environment: 'Beach at sunset',
      sourceType: 'local',
      createdAt: '2024-01-02T00:00:00Z'
    },
    {
      id: 'pose-003',
      title: 'Advanced Fashion',
      description: 'High-fashion runway pose',
      category: 'fashion',
      tags: ['fashion', 'advanced', 'runway', 'model'],
      difficulty: 'advanced',
      framing: 'full-body',
      cameraAngle: 'low-angle',
      bodyInstructions: {},
      facialExpression: 'Confident',
      lighting: 'Dramatic',
      environment: 'Runway',
      sourceType: 'local',
      createdAt: '2024-01-03T00:00:00Z'
    },
    {
      id: 'pose-004',
      title: 'Close-up Portrait',
      description: 'Intimate close-up shot',
      category: 'solo-portraits',
      tags: ['portrait', 'close-up', 'intimate'],
      difficulty: 'beginner',
      framing: 'close-up',
      cameraAngle: 'eye-level',
      bodyInstructions: {},
      facialExpression: 'Intimate',
      lighting: 'Soft',
      environment: 'Indoor',
      sourceType: 'local',
      createdAt: '2024-01-04T00:00:00Z'
    }
  ];

  describe('filterPoses', () => {
    it('should return all poses when no filter is provided', () => {
      const result = PoseFilterService.filterPoses(mockPoses, {});
      expect(result).toHaveLength(4);
    });

    it('should filter by category', () => {
      const result = PoseFilterService.filterPoses(mockPoses, { category: 'solo-portraits' });
      expect(result).toHaveLength(2);
      expect(result.every(pose => pose.category === 'solo-portraits')).toBe(true);
    });

    it('should filter by difficulty', () => {
      const result = PoseFilterService.filterPoses(mockPoses, { difficulty: 'beginner' });
      expect(result).toHaveLength(2);
      expect(result.every(pose => pose.difficulty === 'beginner')).toBe(true);
    });

    it('should filter by framing', () => {
      const result = PoseFilterService.filterPoses(mockPoses, { framing: 'close-up' });
      expect(result).toHaveLength(1);
      expect(result[0].framing).toBe('close-up');
    });

    it('should filter by camera angle', () => {
      const result = PoseFilterService.filterPoses(mockPoses, { cameraAngle: 'low-angle' });
      expect(result).toHaveLength(2);
      expect(result.every(pose => pose.cameraAngle === 'low-angle')).toBe(true);
    });

    it('should filter by tags (must match all)', () => {
      const result = PoseFilterService.filterPoses(mockPoses, { tags: ['standing', 'beginner'] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('pose-001');
    });

    it('should filter by search query in title', () => {
      const result = PoseFilterService.filterPoses(mockPoses, { searchQuery: 'classic' });
      expect(result).toHaveLength(1);
      expect(result[0].title.toLowerCase()).toContain('classic');
    });

    it('should filter by search query in description', () => {
      const result = PoseFilterService.filterPoses(mockPoses, { searchQuery: 'timeless' });
      expect(result).toHaveLength(1);
      expect(result[0].description.toLowerCase()).toContain('timeless');
    });

    it('should filter by search query in tags', () => {
      const result = PoseFilterService.filterPoses(mockPoses, { searchQuery: 'runway' });
      expect(result).toHaveLength(1);
      expect(result[0].tags.some(tag => tag.toLowerCase().includes('runway'))).toBe(true);
    });

    it('should filter by search query in category', () => {
      const result = PoseFilterService.filterPoses(mockPoses, { searchQuery: 'beach' });
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('beach');
    });

    it('should combine multiple filters', () => {
      const result = PoseFilterService.filterPoses(mockPoses, {
        category: 'solo-portraits',
        difficulty: 'beginner'
      });
      expect(result).toHaveLength(2);
      expect(result.every(pose =>
        pose.category === 'solo-portraits' && pose.difficulty === 'beginner'
      )).toBe(true);
    });

    it('should return empty array when no matches', () => {
      const result = PoseFilterService.filterPoses(mockPoses, {
        category: 'wedding',
        difficulty: 'advanced'
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('sortPoses', () => {
    it('should sort by newest', () => {
      const result = PoseFilterService.sortPoses(mockPoses, 'newest');
      expect(result[0].id).toBe('pose-004');
      expect(result[3].id).toBe('pose-001');
    });

    it('should sort by oldest', () => {
      const result = PoseFilterService.sortPoses(mockPoses, 'oldest');
      expect(result[0].id).toBe('pose-001');
      expect(result[3].id).toBe('pose-004');
    });

    it('should sort by difficulty', () => {
      const result = PoseFilterService.sortPoses(mockPoses, 'difficulty');
      expect(result[0].difficulty).toBe('beginner');
      expect(result[3].difficulty).toBe('advanced');
    });

    it('should sort by title alphabetically', () => {
      const result = PoseFilterService.sortPoses(mockPoses, 'title');
      const titles = result.map(p => p.title);
      expect(titles).toEqual(titles.sort());
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', () => {
      const result = PoseFilterService.getCategories(mockPoses);
      expect(result).toEqual(['beach', 'fashion', 'solo-portraits']);
    });

    it('should return empty array for empty poses', () => {
      const result = PoseFilterService.getCategories([]);
      expect(result).toEqual([]);
    });
  });

  describe('getTags', () => {
    it('should return unique tags', () => {
      const result = PoseFilterService.getTags(mockPoses);
      expect(result).toContain('standing');
      expect(result).toContain('beach');
      expect(result).toContain('fashion');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for empty poses', () => {
      const result = PoseFilterService.getTags([]);
      expect(result).toEqual([]);
    });
  });

  describe('getPosesByCategory', () => {
    it('should return poses for specific category', () => {
      const result = PoseFilterService.getPosesByCategory(mockPoses, 'solo-portraits');
      expect(result).toHaveLength(2);
      expect(result.every(pose => pose.category === 'solo-portraits')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const result = PoseFilterService.getPosesByCategory(mockPoses, 'wedding');
      expect(result).toHaveLength(0);
    });
  });

  describe('getSimilarPoses', () => {
    it('should return similar poses based on category and tags', () => {
      const targetPose = mockPoses[0]; // solo-portraits, standing, beginner
      const result = PoseFilterService.getSimilarPoses(mockPoses, targetPose, 2);
      expect(result.length).toBeLessThanOrEqual(2);
      expect(result).not.toContain(targetPose);
    });

    it('should return empty array when no similar poses', () => {
      const uniquePose: Pose = {
        id: 'pose-999',
        title: 'Unique Pose',
        description: 'A unique pose',
        category: 'wedding',
        tags: ['unique', 'special'],
        difficulty: 'advanced',
        framing: 'full-body',
        cameraAngle: 'eye-level',
        bodyInstructions: {},
        facialExpression: 'Happy',
        lighting: 'Natural',
        environment: 'Wedding venue',
        sourceType: 'local',
        createdAt: '2024-01-01T00:00:00Z'
      };
      const result = PoseFilterService.getSimilarPoses(mockPoses, uniquePose, 5);
      expect(result).toHaveLength(0);
    });

    it('should respect limit parameter', () => {
      const targetPose = mockPoses[0];
      const result = PoseFilterService.getSimilarPoses(mockPoses, targetPose, 1);
      expect(result.length).toBeLessThanOrEqual(1);
    });
  });

  describe('paginatePoses', () => {
    it('should paginate poses correctly', () => {
      const result = PoseFilterService.paginatePoses(mockPoses, 1, 2);
      expect(result.poses).toHaveLength(2);
      expect(result.totalPages).toBe(2);
      expect(result.currentPage).toBe(1);
    });

    it('should return correct page', () => {
      const result = PoseFilterService.paginatePoses(mockPoses, 2, 2);
      expect(result.poses).toHaveLength(2);
      expect(result.currentPage).toBe(2);
    });

    it('should handle page beyond range', () => {
      const result = PoseFilterService.paginatePoses(mockPoses, 10, 2);
      expect(result.poses).toHaveLength(0);
    });

    it('should calculate total pages correctly', () => {
      const result = PoseFilterService.paginatePoses(mockPoses, 1, 3);
      expect(result.totalPages).toBe(2);
    });
  });
});
