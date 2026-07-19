// Global type definitions for 羊羊机

export type ID = string;

/* ---------- Theme ---------- */
export interface ThemeDef {
  id: string;
  name: string;
  vars: Record<string, string>;
}

/* ---------- API config ---------- */
export type ChatApiConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
};
export type VoiceApiConfig = {
  provider: 'minimax' | 'custom';
  baseUrl: string;
  apiKey: string;
  model: string;
};
export type ImageApiConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  stylePrompt: string; // global style prompt prepended to every image generation
};
export interface ApiConfig {
  chat: ChatApiConfig;
  voice: VoiceApiConfig;
  image: ImageApiConfig;
}

/* API presets: named snapshots of chat/voice/image configs */
export type ApiPreset = {
  id: string;
  name: string;
  chat: ChatApiConfig;
  voice: VoiceApiConfig;
  image: ImageApiConfig;
};

/* ---------- User identity ---------- */
export interface UserIdentity {
  id: ID;
  nickname: string;
  avatar?: string; // data URL
  signature: string;
  faceRef?: string; // data URL, face reference image
  imagePromptTemplate: string; // for image generation as this user
  isAlt: boolean; // small account / alt
  parentId?: ID; // if alt, who it belongs to
  createdAt: number;
}

/* ---------- Partition / pairing ---------- */
export interface Partition {
  id: ID;
  name: string;
  userIds: ID[];
  charIds: ID[];
}

/* ---------- Desktop layout ---------- */
export type WidgetType = 'music' | 'calendar' | 'album';
export interface WidgetDef {
  id: ID;
  type: WidgetType;
  page: number;
}
export interface DesktopLayout {
  pages: ID[][];
  widgets: WidgetDef[];
  wallpaper?: string;
}

/* ---------- Characters (AI personas) ---------- */
export interface Character {
  id: ID;
  name: string;
  avatar?: string;
  signature: string;
  persona: string;      // system prompt describing the character
  greeting: string;     // opening message
  partitionId?: ID;
  imagePromptTemplate: string; // appearance prompt for generating images of this character
  faceRef?: string;     // data URL, uploaded face reference image
  balance?: number;     // wallet balance
  createdAt: number;
}

/* ---------- Chat ---------- */
export type MessageMedia =
  | { kind: 'image'; url: string }
  | { kind: 'voice'; url: string; duration?: number; text?: string };
export interface ChatMessage {
  id: ID;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
  media?: MessageMedia[];
  innerThought?: string;
}
export interface ChatThread {
  id: ID;
  characterId: ID;
  userId?: ID; // The user identity who is chatting in this thread
  charAltName?: string; // If this thread is with a character's alt-account, store the fake name
  charAltAvatar?: string; // Optional fake avatar/emoji
  messages: ChatMessage[];
  updatedAt: number;
}

/* ---------- Friend Request (好友申请) ---------- */
export interface FriendRequest {
  id: ID;
  type: 'incoming' | 'outgoing'; // incoming: Character alt-account testing user; outgoing: User alt-account testing Character
  userId: ID; // Which user identity (could be main or alt-account) this request is for/from
  characterId: ID; // Which AI Character is involved
  charAltName?: string; // If incoming, the fake name/alt-account used by the AI Character to test the user (e.g. "神秘少女")
  charAltAvatar?: string; // Optional fake avatar/emoji
  intro: string; // The verification message / testing message / self-introduction
  status: 'pending' | 'accepted' | 'declined';
  reply?: string; // AI Character's accept/decline quote
  ts: number;
}

/* ---------- Contacts ---------- */
export interface Contact {
  id: ID;
  name: string;
  avatar?: string;
  phone: string;
  signature: string;
  characterId?: ID;  // linked AI character (if any)
  createdAt: number;
}

/* ---------- SMS ---------- */
export interface SmsMessage {
  id: ID;
  from: 'me' | 'them';
  content: string;
  ts: number;
}
export interface SmsThread {
  id: ID;
  contactId: ID;     // who we're texting
  messages: SmsMessage[];
  updatedAt: number;
}

/* ---------- Mail ---------- */
export interface Mail {
  id: ID;
  from: string;
  to: string;
  subject: string;
  body: string;
  ts: number;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'draft' | 'trash';
}

/* ---------- Moments (朋友圈) ---------- */
export interface Moment {
  id: ID;
  authorId: ID;       // user id or character id
  authorName: string;
  authorAvatar?: string;
  text: string;
  images: string[];   // data URLs
  likes: string[];    // names of likers
  comments: { id: ID; authorName: string; text: string; ts: number }[];
  ts: number;
  aiGenerated?: boolean;
}

/* ---------- Xiaohongshu (小红书) ---------- */
export interface Note {
  id: ID;
  title: string;
  authorName: string;
  authorAvatar?: string;
  cover: string;      // image URL
  body: string;
  likes: number;
  collects: number;
  comments: { id: ID; authorName: string; text: string; ts: number }[];
  tags: string[];
  ts: number;
}

/* ---------- Memos (备忘录) ---------- */
export interface MemoNote {
  id: ID;
  title: string;
  content: string;
  category: string;
  updatedAt: number;
}

/* ---------- Diary (日记) ---------- */
export interface DiaryEntry {
  id: ID;
  authorId: ID; // "user" or a Character's ID
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  keywords?: string[];
  ts: number;
}

/* ---------- Novel (小说) ---------- */
export interface Novel {
  id: ID;
  title: string;
  author: string;
  cover: string;
  chapters: { id: ID; title: string; content: string }[];
  addedAt: number;
  lastReadChapter?: ID;
  lastReadOffset?: number;
}

/* ---------- Shop (商城) ---------- */
export interface Product {
  id: ID;
  name: string;
  price: number;
  originalPrice?: number;
  cover: string;
  images: string[];
  desc: string;
  category: string;
  rating: number;
  sales: number;
  tags: string[];
}
export interface CartItem {
  productId: ID;
  qty: number;
}
export interface Order {
  id: ID;
  items: { productId: ID; name: string; price: number; qty: number; cover: string }[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'done';
  ts: number;
}

/* ---------- Forum (论坛) ---------- */
export interface ForumPost {
  id: ID;
  title: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
  board: string;      // board name
  views: number;
  replies: ForumReply[];
  ts: number;
  pinned?: boolean;
}
export interface ForumReply {
  id: ID;
  authorName: string;
  authorAvatar?: string;
  text: string;
  ts: number;
}

/* ---------- Story events (cross-character plot perception) ---------- */
export interface StoryEvent {
  id: ID;
  characterId: ID;       // the character who should know about this
  sourceThreadId: ID;     // which conversation it came from
  sourceCharName: string;  // the character who mentioned it
  summary: string;        // what happened (e.g. "user told char they went to find NPC")
  ts: number;
  consumed?: boolean;     // whether the target character has acknowledged it
}

/* ---------- Worldbook (世界书) ---------- */
export interface WorldEntry {
  id: ID;
  key: string;        // trigger keyword
  content: string;    // lore text injected when keyword appears
  priority: number;
}

/* ---------- Social / Square (广场) ---------- */
export interface SquarePost {
  id: ID;
  authorName: string;
  authorAvatar?: string;
  text: string;
  image?: string;
  likes: number;
  comments: { id: ID; authorName: string; text: string; ts: number }[];
  ts: number;
  aiGenerated?: boolean;
}

/* ---------- Waimai (外卖) ---------- */
export interface Dish {
  id: ID;
  name: string;
  price: number;
  desc: string;
  image: string;
  popular?: boolean;
}
export interface Restaurant {
  id: ID;
  name: string;
  cover: string;
  rating: number;
  sales: number;
  deliveryFee: number;
  deliveryTime: string;
  tags: string[];
  dishes: Dish[];
}

import type { CalendarEvent } from './apps/CalendarScreen';

export interface WalletTransaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  fromName: string;
  toName: string;
  category: string; // e.g. "系统发放", "转账", "购买外卖", "聊天打赏", "小说订阅"
  description: string;
  ts: number;
}

/* ---------- App settings ---------- */
export interface AppSettings {
  themeId: string;
  api: ApiConfig;
  users: UserIdentity[];
  activeUserId: ID | null;
  presets: ApiPreset[];
  activePresetId: ID | null;
  partitions: Partition[];
  desktop: DesktopLayout;
  // imported local assets
  music: MusicTrack[];
  albumImages: AlbumImage[];
  // user-created data
  calendarEvents: CalendarEvent[];
  characters: Character[];
  autoNpc: boolean;
  activeInteractMode?: 'manual' | 'auto';
  activeInteractEnabled?: boolean;
  storyEvents: StoryEvent[];
  chatThreads: ChatThread[];
  contacts: Contact[];
  smsThreads: SmsThread[];
  mails: Mail[];
  moments: Moment[];
  notes: Note[];
  memos?: MemoNote[];
  diaries?: DiaryEntry[];
  novels: Novel[];
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  forumPosts: ForumPost[];
  worldEntries: WorldEntry[];
  squarePosts: SquarePost[];
  restaurants: Restaurant[];
  friendRequests?: FriendRequest[];
  fontSize?: 'md' | 'lg' | 'xl';
  notifSoundEnabled?: boolean;
  notifProactiveFrequency?: 'high' | 'medium' | 'low' | 'off';
  periodRecords?: PeriodRecord[];
  periodCycleDays?: number;
  periodDurationDays?: number;
  userBalance?: number;
  walletFlows?: WalletTransaction[];
  installedWebApps?: InstalledWebApp[];
}

export interface InstalledWebApp {
  id: string;
  name: string;
  url: string;
  emoji: string;
}

export interface PeriodRecord {
  id: ID;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  symptoms: string[];
  flow?: 'light' | 'medium' | 'heavy';
  mood?: string;
  notes?: string;
  ts: number;
}

export interface MusicTrack {
  id: ID;
  name: string;
  artist?: string;
  url: string;
  duration?: number;
}

export interface AlbumImage {
  id: ID;
  url: string;
  tag?: string;
}

/* ---------- Persistence shape ---------- */
export interface PersistShape {
  version: number;
  settings: AppSettings;
}
