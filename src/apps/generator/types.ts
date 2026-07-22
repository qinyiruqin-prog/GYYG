export type SettingType = "user_persona" | "xr_persona" | "worldbook";

export interface SettingVersion {
  timestamp: string;
  content: string;
  feedback?: string;
}

export interface GeneratedSetting {
  id: string;
  type: SettingType;
  title: string;
  prompt: string;
  content: string;
  createdAt: string;
  wordCount: number;
  customStyle: string;
  tone: string;
  customStructure?: string;
  versions: SettingVersion[];
}

export interface PromptTemplate {
  title: string;
  description: string;
  prompt: string;
  style: string;
  tone: string;
  wordCount: number;
  type: SettingType;
}
