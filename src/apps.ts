import type { ID } from './types';

export interface AppMeta {
  id: ID;
  name: string;
  icon: string;
  available: boolean;
  /** a movable ball on desktop that opens a shortcuts sheet */
  shortcutBall?: boolean;
  /** emoji glyph rendered instead of a lucide icon */
  emoji?: string;
}

export const APPS: AppMeta[] = [
  { id: 'moments',      name: '朋友圈',  icon: 'Camera',           available: true },
  { id: 'contacts',     name: '通讯录',  icon: 'Contact',          available: true },
  { id: 'sms',          name: '短信',    icon: 'MessageSquare',    available: true },
  { id: 'mail',         name: '邮箱',    icon: 'Mail',             available: true },
  { id: 'waimai',       name: '外卖',    icon: 'UtensilsCrossed',  available: true },
  { id: 'xiaohongshu',  name: '小红书',  icon: 'BookHeart',        available: true },
  { id: 'novel',        name: '小说',    icon: 'BookOpen',         available: true },
  { id: 'shop',         name: '商城',    icon: 'ShoppingBag',      available: true },
  { id: 'me',           name: '我的',    icon: 'UserRound',        available: true },
  { id: 'forum',        name: '论坛',    icon: 'MessagesSquare',   available: true },
  { id: 'chat',         name: '聊天',    icon: 'MessageCircle',    available: true },
  { id: 'calendar',     name: '日历',    icon: 'CalendarDays',     available: true },
  { id: 'worldbook',    name: '世界书',  icon: 'BookMarked',       available: true },
  { id: 'generator',    name: '人设生成', icon: 'Sparkles',          available: true },
  { id: 'album',        name: '相册',    icon: 'Images',           available: true },
  { id: 'music',        name: '音乐',    icon: 'Music',            available: true },
  { id: 'social',       name: '广场',    icon: 'Globe',            available: true },
  { id: 'truth_or_dare', name: '真心话大冒险', icon: 'Dice5',          available: true },
  { id: 'period',       name: '经期助手',  icon: 'Heart',            available: true },
  { id: 'notes_app',    name: '备忘录',    icon: 'FileText',         available: true },
  { id: 'diary',        name: '日记',      icon: 'BookOpen',         available: true },
  { id: 'wallet',       name: '钱包',      icon: 'Wallet',           available: true },
  { id: 'weather',      name: '天气',      icon: 'CloudSun',         available: true },
  { id: 'calculator',   name: '计算器',    icon: 'Calculator',       available: true },
  { id: 'browser',      name: '浏览器',    icon: 'Compass',          available: true },
  // one shortcut ball — tap opens a sheet with assistant / API preset / manual
  { id: 'sheep',        name: '羊羊',    icon: '',                 available: true, shortcutBall: true, emoji: '🐑' },
];

export const APP_MAP: Record<string, AppMeta> = Object.fromEntries(APPS.map((a) => [a.id, a]));
export const getApp = (id: string): AppMeta | undefined => {
  if (id.startsWith('web-')) {
    try {
      const raw = localStorage.getItem('yangyangji:v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        const webApps = parsed?.settings?.installedWebApps || [];
        const found = webApps.find((w: any) => w.id === id);
        if (found) {
          return {
            id: found.id,
            name: found.name,
            icon: 'Globe',
            available: true,
            emoji: found.emoji || '🌐',
            shortcutBall: true,
          };
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }
  return APP_MAP[id];
};

/** ids that live in the dock (not in the grid) */
export const DOCK_IDS = ['chat', 'album', 'music', 'me'];
/** the single shortcut ball */
export const SHORTCUT_BALL_ID = 'sheep';
