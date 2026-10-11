jest.mock('react-native', () => ({
  Linking: {
    canOpenURL: jest.fn().mockResolvedValue(true),
    openURL: jest.fn().mockResolvedValue(true),
  },
}));

import { OnlineDiscoveryService, OnlineDiscoveryItem } from '../imageDiscovery/openverseService';

describe('OnlineDiscoveryService', () => {
  const sampleItem: OnlineDiscoveryItem = {
    id: 'openverse-12345',
    title: 'Beach Golden Hour Portrait',
    creator: 'Jane Doe',
    sourceProvider: 'openverse',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    originalUrl: 'https://example.com/original.jpg',
    landingPageUrl: 'https://example.com/photo/12345',
    licenseName: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    attribution: '"Beach Golden Hour Portrait" by Jane Doe, licensed under CC BY-SA 2.0',
    tags: ['beach', 'golden-hour', 'portrait'],
  };

  it('should convert OnlineDiscoveryItem to app Pose object accurately', () => {
    const pose = OnlineDiscoveryService.convertToPose(sampleItem);

    expect(pose.id).toBe('openverse-12345');
    expect(pose.title).toBe('Beach Golden Hour Portrait');
    expect(pose.sourceType).toBe('openverse');
    expect(pose.imageUrl).toBe('https://example.com/original.jpg');
    expect(pose.thumbnailUrl).toBe('https://example.com/thumb.jpg');
    expect(pose.creator).toBe('Jane Doe');
    expect(pose.licenseName).toBe('CC BY-SA 2.0');
    expect(pose.attribution).toContain('Jane Doe');
    expect(pose.bodyInstructions.posture).toBeDefined();
  });
});
