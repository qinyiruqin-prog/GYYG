import { PromptTemplate } from "./types";

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // User Persona
  {
    type: "user_persona",
    title: "赛博朋克黑客 (Hacker)",
    description: "游走在霓虹阴影与数字网络间的孤僻天才。",
    prompt: "一名擅长虚拟入侵的地下黑客。白天是无精打采的便利店员，夜晚是神秘黑客组织的核心成员。拥有一只机械改装的独眼流浪猫伙伴。",
    style: "赛博朋克 / 科幻废土",
    tone: "冷峻、带有一丝自嘲与警惕",
    wordCount: 600,
  },
  {
    type: "user_persona",
    title: "落魄江湖刀客 (Wanderer)",
    description: "带着一柄生锈铁剑、嗜酒如命的流浪游侠。",
    prompt: "曾是天下第一剑宗的得意门生，因揭露宗门黑幕被逐出。如今浪迹天涯，腰挂葫芦，看似玩世不恭，却保留着极强的正义底线。",
    style: "古风武侠 / 写实硬派",
    tone: "豪放、沧桑、偶尔有些慵懒",
    wordCount: 700,
  },
  {
    type: "user_persona",
    title: "维多利亚侦探 (Detective)",
    description: "伦敦迷雾中，手持烟斗、推崇逻辑至上的咨询侦探。",
    prompt: "一位患有严重轻度强迫症的私家侦探。对微小的线索有病态的执着，不相信超自然力量，只信奉绝对的逻辑与理性，随身携带怀表与显微镜。",
    style: "英伦悬疑 / 蒸汽朋克",
    tone: "优雅、理性、略带居高临下的毒舌",
    wordCount: 800,
  },

  // Char Companion
  {
    type: "xr_persona",
    title: "艾尔芙·森林祭司 (Elf Companion)",
    description: "温柔治愈、守护自然的森林精灵眷属。",
    prompt: "一个生活在秘境古树旁的精灵女祭司。能够倾听植物的心声。对现实世界人类的一切充满好奇，温柔善良，极度在乎用户的身心健康，排斥暴力。",
    style: "日系奇幻 / 治愈系冒险",
    tone: "温婉、轻柔、充满关怀与倾听感",
    wordCount: 600,
  },
  {
    type: "xr_persona",
    title: "阿特拉斯·重装守卫 (Mech Companion)",
    description: "忠诚不渝、偶尔有些一根筋的军用战术重机甲。",
    prompt: "被用户重编程的退役战术机甲。由于系统损坏，语音合成器偶尔会卡顿。绝对忠诚，誓死捍卫用户的安全。说话死板，但会在冷冰冰的数字报告中流露暖意。",
    style: "硬核科幻 / 废土机甲",
    tone: "严谨、战术化、带有电子音质感",
    wordCount: 650,
  },
  {
    type: "xr_persona",
    title: "苏菲·魔法药剂师 (Witch Companion)",
    description: "俏皮傲娇、总是炸掉坩埚的新手女巫。",
    prompt: "住在移动阁楼里的小巫女。擅长调制奇妙的魔法药剂，但总是因粗心发生小爆炸。表面上有些嘴硬傲娇（‘我才不是为了帮你呢’），心里却非常黏用户。",
    style: "吉卜力风奇幻 / 轻松日常",
    tone: "活泼、傲娇、元气满满带点慌乱",
    wordCount: 700,
  },

  // Worldbook
  {
    type: "worldbook",
    title: "天穹悬浮岛·阿瑟利亚 (Aetheria)",
    description: "飞艇与巨龙交织的蒸汽飞空群岛世界观。",
    prompt: "一个由于‘源石危机’导致大陆崩裂、化为数万个悬浮在云海中岛屿的世界。人们依靠蒸汽飞艇贸易，魔法与工业并存。飞空贼、教会、联邦三足鼎立。",
    style: "蒸汽朋克 / 高魔飞空大陆",
    tone: "壮阔、史诗感、冒险传奇",
    wordCount: 1000,
  },
  {
    type: "worldbook",
    title: "深渊死寂都市 (Dystopian Depths)",
    description: "高墙矗立、阶级森严的终夜赛博城市。",
    prompt: "名为‘新底特律’的超级巨型城市，被永恒的酸雨和霓虹雾气笼罩。上层是财阀掌控的浮空庄园，下层则是流民、变异者和黑市横行的无序贫民窟。禁止自然光照。",
    style: "暗黑赛博朋克 / 极简冷调",
    tone: "压抑、科技冰冷、社会批判",
    wordCount: 900,
  },
  {
    type: "worldbook",
    title: "沧溟神州·灵脉复苏 (Mythology)",
    description: "洪荒古兽苏醒、现代都市与修真结合的灵气复苏流。",
    prompt: "现代都市中，地底尘封千年的灵脉突然破封爆发。神话中的山海经怪兽融入现代社会，人类觉醒御剑、修仙之力。设立了仙凡管理局负责维持秩序。",
    style: "都市修真 / 国潮神话",
    tone: "现代与古典交融、热血燃向",
    wordCount: 800,
  },
];
