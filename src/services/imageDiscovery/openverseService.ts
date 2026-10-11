import { Pose, SourceType } from '../../types/pose';
import { Linking } from 'react-native';

export interface OnlineDiscoveryItem {
  id: string;
  title: string;
  creator?: string;
  sourceProvider: 'openverse' | 'wikimedia';
  thumbnailUrl: string;
  originalUrl: string;
  landingPageUrl: string;
  licenseName: string;
  licenseUrl?: string;
  attribution: string;
  tags: string[];
}

export interface OnlineDiscoveryResponse {
  items: OnlineDiscoveryItem[];
  page: number;
  totalPages: number;
  totalResults: number;
  source: 'openverse' | 'wikimedia' | 'fallback';
}

export class OnlineDiscoveryService {
  private static OPENVERSE_BASE_URL = 'https://api.openverse.org/v1/images/';
  private static WIKIMEDIA_BASE_URL = 'https://commons.wikimedia.org/w/api.php';

  /**
   * Search Openverse for openly-licensed photography poses
   */
  static async searchOpenverse(
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<OnlineDiscoveryResponse> {
    const formattedQuery = encodeURIComponent(`${query} portrait pose`);
    const url = `${this.OPENVERSE_BASE_URL}?q=${formattedQuery}&page=${page}&page_size=${pageSize}&mature=false`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PoseGeniusAI/1.0 (Free Photography Pose Assistant; contact@posegenius.local)',
          'Accept': 'application/json',
        },
      });

      if (response.status === 429) {
        console.warn('Openverse rate limit reached, falling back to Wikimedia Commons');
        return this.searchWikimedia(query, page, pageSize);
      }

      if (!response.ok) {
        throw new Error(`Openverse API returned status ${response.status}`);
      }

      const data = await response.json();
      const results = data.results || [];

      const items: OnlineDiscoveryItem[] = results.map((item: any) => {
        const licenseCode = (item.license || 'unknown').toUpperCase();
        const licenseVersion = item.license_version ? ` ${item.license_version}` : '';
        const licenseDisplay = `CC ${licenseCode}${licenseVersion}`;

        const creator = item.creator || 'Unknown Creator';
        const attribution =
          item.attribution ||
          `"${item.title || 'Untitled'}" by ${creator}, licensed under ${licenseDisplay}`;

        return {
          id: `openverse-${item.id}`,
          title: item.title || `${query} Reference Pose`,
          creator,
          sourceProvider: 'openverse',
          thumbnailUrl: item.thumbnail || item.url,
          originalUrl: item.url,
          landingPageUrl: item.foreign_landing_url || item.url,
          licenseName: licenseDisplay,
          licenseUrl: item.license_url || 'https://creativecommons.org/licenses/',
          attribution,
          tags: item.tags?.map((t: any) => t.name).slice(0, 5) || [query],
        };
      });

      return {
        items,
        page,
        totalPages: data.page_count || 1,
        totalResults: data.result_count || items.length,
        source: 'openverse',
      };
    } catch (error) {
      console.warn('Openverse search failed, attempting Wikimedia fallback:', error);
      return this.searchWikimedia(query, page, pageSize);
    }
  }

  /**
   * Search Wikimedia Commons for public domain & CC media
   */
  static async searchWikimedia(
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<OnlineDiscoveryResponse> {
    try {
      const gsrOffset = (page - 1) * pageSize;
      const url =
        `${this.WIKIMEDIA_BASE_URL}?action=query&generator=search` +
        `&gsrsearch=${encodeURIComponent(query + ' pose portrait')}` +
        `&gsrnamespace=6&gsroffset=${gsrOffset}&gsrlimit=${pageSize}` +
        `&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=400&format=json&origin=*`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PoseGeniusAI/1.0 (Free Photography Pose Assistant; contact@posegenius.local)',
        },
      });

      if (!response.ok) {
        throw new Error(`Wikimedia API error: ${response.status}`);
      }

      const data = await response.json();
      const pages = data.query?.pages || {};

      const rawItems = Object.values(pages).map((p: any) => {
        const info = p.imageinfo?.[0];
        if (!info) return null;

        const meta = info.extmetadata || {};
        const title = p.title?.replace('File:', '').replace(/\.[^/.]+$/, '') || 'Wikimedia Reference';
        const artist = meta.Artist?.value?.replace(/<[^>]*>/g, '') || 'Wikimedia Contributor';
        const license = meta.LicenseShortName?.value || 'CC BY-SA / Public Domain';
        const licenseUrl = meta.LicenseUrl?.value || 'https://creativecommons.org/';
        const attribution = `"${title}" by ${artist}, licensed under ${license}`;

        const item: OnlineDiscoveryItem = {
          id: `wiki-${p.pageid}`,
          title,
          creator: artist,
          sourceProvider: 'wikimedia',
          thumbnailUrl: info.thumburl || info.url,
          originalUrl: info.url,
          landingPageUrl: info.descriptionurl || info.url,
          licenseName: license,
          licenseUrl,
          attribution,
          tags: [query, 'wikimedia', 'public-domain'],
        };
        return item;
      });

      const items: OnlineDiscoveryItem[] = rawItems.filter((item): item is OnlineDiscoveryItem => item !== null);

      return {
        items,
        page,
        totalPages: 10,
        totalResults: items.length * 5,
        source: 'wikimedia',
      };
    } catch (err) {
      console.warn('Wikimedia discovery failed:', err);
      return {
        items: [],
        page: 1,
        totalPages: 0,
        totalResults: 0,
        source: 'fallback',
      };
    }
  }

  /**
   * Convert an online discovered item into an app Pose object for camera coach or favorites
   */
  static convertToPose(item: OnlineDiscoveryItem): Pose {
    return {
      id: item.id,
      title: item.title,
      description: `Discovered from ${item.sourceProvider.toUpperCase()}. Attribution: ${item.attribution}`,
      category: 'creative',
      tags: item.tags,
      difficulty: 'beginner',
      framing: 'full-body',
      cameraAngle: 'eye-level',
      bodyInstructions: {
        posture: `Follow reference contour from ${item.title}`,
        head: 'Align angle toward lens',
        shoulders: 'Keep relaxed and level',
      },
      facialExpression: 'Natural expression to match lighting',
      lighting: 'Natural ambient lighting',
      environment: 'Matches reference setting',
      sourceType: item.sourceProvider as SourceType,
      imageUrl: item.originalUrl,
      thumbnailUrl: item.thumbnailUrl,
      sourcePageUrl: item.landingPageUrl,
      creator: item.creator,
      licenseName: item.licenseName,
      licenseUrl: item.licenseUrl,
      attribution: item.attribution,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Open the original source license / creator page in browser
   */
  static async openSourcePage(url: string): Promise<void> {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }

  /**
   * Open public web image search as a legal fallback
   */
  static async openExternalWebSearch(query: string): Promise<void> {
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query + ' photography pose ideas')}&iax=images&ia=images`;
    await Linking.openURL(searchUrl);
  }
}
