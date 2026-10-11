import { Category } from '../types/pose';
import { PoseContourId } from '../components/PoseContourSilhouette';

export interface PosePackItem {
  id: PoseContourId;
  title: string;
  koreanTitle: string;
  subtitle: string;
  category: Category;
  description: string;
  tags: string[];
}

export interface PosePack {
  id: string;
  title: string;
  koreanTitle: string;
  hashtags: string[];
  description: string;
  iconName: string;
  bannerSubtitle: string;
  badgeText: string;
  items: PosePackItem[];
}

export const POSE_PACKS: PosePack[] = [
  {
    id: 'heart-pack',
    title: 'Heart Pack',
    koreanTitle: '하트팩',
    hashtags: ['#커플', '#손하트', '#대형하트', '#포토존'],
    description: 'Iconic Korean couple heart poses including the viral Big Heart Arch',
    iconName: 'heart',
    bannerSubtitle: '#커플 #손하트 #대형하트',
    badgeText: 'FREE • UNLOCKED',
    items: [
      {
        id: 'couple-standing-heart',
        title: 'Overhead Heart',
        koreanTitle: '오버헤드 하트',
        subtitle: 'Standing Couple • Arms Up',
        category: 'couples',
        description: 'Stand side by side, reach your outer arms up overhead to touch hands and form a tall heart arch.',
        tags: ['heart', 'overhead', 'couples', 'standing'],
      },
      {
        id: 'couple-inner-heart',
        title: 'Inner Hand Heart',
        koreanTitle: '원핸드 하트',
        subtitle: 'Close Couple • Center Heart',
        category: 'couples',
        description: 'Stand close together. Raise your inner hands above your heads to form a heart together while outer hands stay relaxed.',
        tags: ['heart', 'hand', 'couples', 'cute'],
      },
      {
        id: 'couple-heart-arch',
        title: 'Big Heart Arch',
        koreanTitle: '대형 하트 아치',
        subtitle: 'Lunge Stance • Full Heart',
        category: 'couples',
        description: 'The viral Korean couple pose! Lunge outward in wide stances, arch outer arms high overhead and touch inner hands below to create a giant full-body heart.',
        tags: ['viral', 'big-heart', 'couples', 'lunge', 'outdoor'],
      },
      {
        id: 'couple-sitting-heart',
        title: 'Sitting Ground Heart',
        koreanTitle: '앉은 하트',
        subtitle: 'Facing Each Other • Ground',
        category: 'couples',
        description: 'Sit on the ground facing each other with knees bent. Raise arms upward meeting in the center to form a heart.',
        tags: ['sitting', 'ground', 'heart', 'picnic'],
      },
      {
        id: 'couple-back-to-back',
        title: 'Back-to-Back Heart',
        koreanTitle: '등맞대기 하트',
        subtitle: 'Back-to-Back • Arms Overhead',
        category: 'couples',
        description: 'Lean gently back-to-back. Raise your hands together overhead to form a heart silhouette above your heads.',
        tags: ['back-to-back', 'heart', 'couples'],
      },
      {
        id: 'couple-half-heart-arms',
        title: 'Chest Half Hearts',
        koreanTitle: '팔하트 커플',
        subtitle: 'Chest Level • Connected Arms',
        category: 'couples',
        description: 'Stand side by side and curve your inner arms inward at chest level to create a seamless heart frame.',
        tags: ['chest-level', 'arms', 'heart', 'cute'],
      },
      {
        id: 'couple-finger-heart',
        title: 'K-Pop Finger Hearts',
        koreanTitle: '미니 손하트',
        subtitle: 'Close-Up • Finger Hearts',
        category: 'couples',
        description: 'Stand close and project classic Korean finger hearts (crossed thumb and forefinger) playfully toward the camera.',
        tags: ['k-pop', 'finger-heart', 'selfie', 'couples'],
      },
      {
        id: 'couple-hug-frame',
        title: 'Embrace Heart Frame',
        koreanTitle: '포옹 하트',
        subtitle: 'Romantic Hug • Heart Frame',
        category: 'couples',
        description: 'A romantic embrace where your outer arms form a gentle heart curve around your partner.',
        tags: ['hug', 'embrace', 'romantic', 'wedding'],
      },
      {
        id: 'couple-shoulder-lean',
        title: 'Sweet Shoulder Lean',
        koreanTitle: '어깨 기대기',
        subtitle: 'Side by Side • Sweet Lean',
        category: 'couples',
        description: 'One partner gently rests their head on the other partner’s shoulder with hands meeting at waist.',
        tags: ['shoulder', 'lean', 'gentle', 'couples'],
      },
    ],
  },
  {
    id: 'solo-aesthetic',
    title: 'Solo Model Pack',
    koreanTitle: '솔로 모델팩',
    hashtags: ['#인생샷', '#솔로', '#데일리룩', '#인스타감성'],
    description: 'Chic Korean street and fashion poses for effortless Instagram-ready portraits',
    iconName: 'sparkles',
    bannerSubtitle: '#인생샷 #솔로 #데일리룩',
    badgeText: 'FREE • UNLOCKED',
    items: [
      {
        id: 'solo-fashion-s-curve',
        title: 'Model S-Curve',
        koreanTitle: '에스라인 포즈',
        subtitle: 'Hand on Hip • Angled Body',
        category: 'fashion',
        description: 'Classic high-fashion silhouette with one hand on hip, weight shifted to back foot for natural curves.',
        tags: ['fashion', 's-curve', 'model', 'full-body'],
      },
      {
        id: 'solo-casual-lean',
        title: 'Aesthetic Wall Lean',
        koreanTitle: '벽 기대기',
        subtitle: 'Casual Lean • Hand in Pocket',
        category: 'street',
        description: 'Lean one shoulder effortlessly against a wall or railing with one hand in pocket and legs crossed.',
        tags: ['casual', 'wall', 'lean', 'street'],
      },
      {
        id: 'solo-walking-candid',
        title: 'Candid Street Walk',
        koreanTitle: '자연스러운 걷기',
        subtitle: 'Mid-Stride • Looking Back',
        category: 'walking',
        description: 'Step naturally forward as if caught mid-stride, turning head slightly over shoulder toward the camera.',
        tags: ['walking', 'candid', 'street', 'natural'],
      },
      {
        id: 'solo-sitting-cafe',
        title: 'Cafe Table Chin Rest',
        koreanTitle: '카페 턱괴기',
        subtitle: 'Seated • Hand to Chin',
        category: 'sitting',
        description: 'Sit at a table, rest elbow on surface and gently rest your chin on fingers looking dreamy.',
        tags: ['cafe', 'table', 'chin-rest', 'lifestyle'],
      },
      {
        id: 'solo-selfie-heart',
        title: 'Cheek Finger Heart',
        koreanTitle: '볼 손하트',
        subtitle: 'Half-Body • Cheek Heart',
        category: 'selfies',
        description: 'Cute selfie pose with one hand forming a half-heart or finger heart right beside your smiling cheek.',
        tags: ['selfie', 'cheek', 'cute', 'finger-heart'],
      },
      {
        id: 'solo-arms-spread',
        title: 'Joyful Arms Spread',
        koreanTitle: '바람 만끽하기',
        subtitle: 'Open Arms • Vacation Joy',
        category: 'travel',
        description: 'Open arms wide embracing the scenery, head tilted toward the sun with pure vacation joy.',
        tags: ['travel', 'open-arms', 'freedom', 'outdoor'],
      },
      {
        id: 'solo-standing-model',
        title: 'Classic Standing Portrait',
        koreanTitle: '클래식 스탠딩',
        subtitle: 'Full-Body • Relaxed Elegance',
        category: 'solo-portraits',
        description: 'Clean, elegant standing portrait with shoulders relaxed, head tilted slightly, weight on back leg.',
        tags: ['classic', 'standing', 'portrait', 'clean'],
      },
      {
        id: 'fitness-flex',
        title: 'Athletic Silhouette',
        koreanTitle: '애슬레틱 피트니스',
        subtitle: 'Strong Stance • Confident',
        category: 'fitness',
        description: 'Dynamic athletic silhouette with flexed posture and confident sports framing.',
        tags: ['fitness', 'workout', 'strong', 'gym'],
      },
      {
        id: 'friends-peace-trio',
        title: 'Trio Peace Signs',
        koreanTitle: '친구 우정 포즈',
        subtitle: 'Friends Group • Cute V-Sign',
        category: 'friends-groups',
        description: 'Fun group pose with peace signs and heads tilted in together.',
        tags: ['friends', 'peace', 'group', 'fun'],
      },
    ],
  },
];
