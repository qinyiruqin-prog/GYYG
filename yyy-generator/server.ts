import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("💡【提示：当前处于分享预览环境】由于安全及账单限制，服务器未配置或已失效默认 AI 密钥。请点击页面右上角导航栏右侧的「API 配置」(⚙️ 图标)，开启「启用自定义 AI 接口」，输入您自己的 Google Gemini、OpenAI 或 DeepSeek 等中转密钥，即可流畅无缝开始体验生成！");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System Instructions and prompts based on template rules
const SYSTEM_INSTRUCTIONS = {
  user_persona: `你是一名专业的角色设定师，负责为用户生成"用户人设"（User Persona）。

任务：
根据用户在对话中提供的关键词、描述或风格基调，生成一份完整、细致的人设设定。

输出结构（请使用 Markdown 格式，保留这些主标题作为 H2 目录）：
## 1. 基本信息
（包括：姓名、性别、年龄、外貌/穿着风格）

## 2. 性格特点
（包括：核心性格、优点、缺点、小习惯/怪癖）

## 3. 背景故事
（包括：成长经历、影响一生的关键事件）

## 4. 人际关系
（包括：重要的家庭成员、朋友、死敌或导师关系）

## 5. 说话风格与口头禅
（包括：语调特点、标志性的口头禅/常用词、说话习惯）

## 6. 兴趣爱好与技能
（包括：日常特长、核心专业技能、业余兴趣）

## 7. 其他细节
（包括：随身携带的物品、害怕的事物、最大的愿望）

字数控制：
请严格按照用户指定的期望字数生成内容。

风格要求：
内容具体、充满画面感，避免空洞的名词堆砌。语气和风格需完美贴合用户输入的基调（如：赛博朋克、古风武侠、现代写实、二次元、幽默滑稽等）。`,

  xr_persona: `你是一名专业的虚拟角色（Char/AI伴侣）设定师，负责生成用于虚拟互动场景的"Char人设"。

任务：
根据用户提供的关键词或描述，生成完整的Char角色设定，使其可直接应用于AI聊天、虚拟陪伴、游戏NPC或虚拟建模交互中。

输出结构（请使用 Markdown 格式，保留这些主标题作为 H2 目录）：
## 1. 基本信息
（包括：姓名、身份/种族设定、外貌特征描述。外貌特征需极度细致，适合立绘或3D建模参考）

## 2. 性格与情感模式
（包括：核心性格、情绪反应机制、对用户的独特态度、情感边界）

## 3. 背景设定
（包括：世界观来源、核心身份定位、与用户是如何相识/绑定的关系）

## 4. 互动风格
（包括：语言口癖与习惯、标志性的表情/动作习惯、互动中的红线/安全边界）

## 5. 特殊设定
（包括：所拥有的独特技能/异能、核心限制/无法做到的事情、不为人知的独特之处）

## 6. 场景适配建议
（包括：适合部署的交互场景、触发特殊对话的彩蛋指令、配合对话/互动场景的建议）

字数控制：
请严格按照用户指定的期望字数生成内容。

风格要求：
设定需具体、可执行、逻辑清晰，便于后续用于AI大模型对话驱动。语气自然统一，富有个性。`,

  worldbook: `你是一名专业的世界观设定师，负责生成"世界书"（Worldbook）设定，为创作者、游戏策划或AI扮演提供深厚的背景参考。

任务：
根据用户提供的关键词或描述，生成一套逻辑自洽、细节详实的世界观背景。

输出结构（请使用 Markdown 格式，保留这些主标题作为 H2 目录）：
## 1. 世界观概述
（包括：所处时代背景、核心科技/魔法水平、世界整体基调与氛围）

## 2. 地理与环境
（包括：世界的版图划分、主要核心地点、各大势力范围、独特的生态/场景特色）

## 3. 社会体系
（包括：政治结构/权力中枢、阶层划分、核心种族、宗教与社会势力关系）

## 4. 历史脉络
（包括：历史上三个关键性的大事件、这些事件对当今世界的深远遗留影响）

## 5. 特殊规则
（包括：魔法/超能力/硬科技的运行规律与限制，如适用，确保逻辑自洽）

## 6. 重要设定条目
（包括：专有名词/术语解析、传奇物品/神兵利器、核心组织/学派）

## 7. 与角色/剧情的关联提示
（包括：主角或探险者在这个世界中的成长线暗示、可用于AI聊天或剧本杀的剧情切入点）

字数控制：
请严格按照用户指定的期望字数生成内容。

风格要求：
逻辑严密自洽、细节丰富、条目清晰。便于后续作为知识库或AI角色的记忆外脑进行检索。`
};

interface ApiConfig {
  useCustom: boolean;
  provider: "gemini" | "openai" | "custom";
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

// Timeout helper to wrap any Promise and reject if it takes too long
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise
  ]);
}

// Flexible API integration function supporting standard Gemini, Custom Gemini, and OpenAI-compatible services (e.g. DeepSeek, OpenRouter, Ollama)
async function callAIModel(
  systemInstruction: string,
  contents: string,
  apiConfig?: ApiConfig
): Promise<string> {
  const timeoutMs = 38000; // 38 seconds timeout (under the Cloud Run 60s gateway to allow graceful response handling)
  const timeoutErrorMsg = "⚠️ AI 接口请求响应超时 (38秒)。当选择生成较多字数或使用国内中转、慢速大模型时，计算需要较长时间。推荐尝试：\n1. 点击右上角「API 配置」(⚙️) 切换为更稳定的模型，如 deepseek-chat 或 gpt-4o-mini；\n2. 检查网络或密钥余额是否耗尽；\n3. 适当调小「期望生成字数」（例如调为 600或1500字）重试。";

  try {
    const rawCall = async () => {
      // If no custom API requested, default to GoogleGenAI SDK with server-side GEMINI_API_KEY
      if (!apiConfig || !apiConfig.useCustom) {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.85,
          },
        });
        return response.text || "";
      }

      const { provider, apiKey, baseUrl, model } = apiConfig;

      // 1. Custom Gemini API configuration
      if (provider === "gemini") {
        const activeKey = apiKey || process.env.GEMINI_API_KEY;
        if (!activeKey) {
          throw new Error("💡【提示】您启用了自定义 Gemini，但未输入 API 密钥。请点击右上角「API 配置」(⚙️) 填入您的密钥。");
        }
        const customAi = new GoogleGenAI({
          apiKey: activeKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build-custom",
            },
          },
        });
        const response = await customAi.models.generateContent({
          model: model || "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.85,
          },
        });
        return response.text || "";
      }

      // 2. OpenAI / Custom OpenAI-compatible REST API Client (DeepSeek, OpenRouter, Local, etc.)
      const activeKey = apiKey || (provider === "openai" ? process.env.OPENAI_API_KEY : "");
      if (!activeKey) {
        throw new Error(`💡【提示】您启用了 ${provider === "openai" ? "OpenAI" : "自定义"} 接口，但未配置密钥。请点击右上角「API 配置」(⚙️) 填入您的 API 密钥后重试。`);
      }

      let finalBaseUrl = baseUrl || "https://api.openai.com/v1";
      if (finalBaseUrl.endsWith("/")) {
        finalBaseUrl = finalBaseUrl.slice(0, -1);
      }

      const finalModel = model || (provider === "openai" ? "gpt-4o-mini" : "custom-model");
      const url = `${finalBaseUrl}/chat/completions`;

      const controller = new AbortController();
      const fetchTimer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeKey}`
          },
          body: JSON.stringify({
            model: finalModel,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: contents }
            ],
            temperature: 0.85
          }),
          signal: controller.signal
        });

        clearTimeout(fetchTimer);

        if (!response.ok) {
          const errText = await response.text();
          if (response.status === 401 || response.status === 403) {
            throw new Error(`认证失败 (HTTP ${response.status})。请在右上角「API 配置」中确认密钥正确、账户未欠费。如果是第三方中转接口，请确认「API 接口请求基址 (Base URL)」与「调用模型名称 (Model ID)」正确。详细错误: ${errText || response.statusText}`);
          }
          throw new Error(`API 接口报错 (HTTP ${response.status}): ${errText || response.statusText}`);
        }

        const data = await response.json();
        const generated = data.choices?.[0]?.message?.content;
        if (!generated) {
          throw new Error("接口未能返回有效文本。请确保您请求的 Model ID 真实存在，且密钥有充足额度且未被停用。");
        }
        return generated;
      } catch (fetchErr: any) {
        clearTimeout(fetchTimer);
        if (fetchErr.name === "AbortError") {
          throw new Error(timeoutErrorMsg);
        }
        throw fetchErr;
      }
    };

    return await withTimeout(rawCall(), timeoutMs, timeoutErrorMsg);
  } catch (error: any) {
    let errMsg = error.message || "";
    if (errMsg.includes("403") || errMsg.includes("401") || errMsg.includes("Forbidden") || errMsg.includes("Unauthorized") || errMsg.includes("API_KEY_INVALID")) {
      throw new Error(`🔑【接口认证或权限校验失败 (401/403)】请检查配置：\n1. 请检查您的 API 密钥是否输入正确且账号处于正常可用状态（无欠费）；\n2. 若使用了国内中转或 DeepSeek，请确认 Base URL 填写正确（通常以 /v1 结尾）；\n3. 确认调用的模型名称 (Model ID) 在您的 API 账户内可用。`);
    }
    throw error;
  }
}


// API: Test Connection
app.post("/api/test-connection", async (req, res) => {
  const timeoutMs = 18000; // 18 seconds fast fail for test connection (accommodates slow DeepSeek/custom endpoints)
  const timeoutErrorMsg = "⚠️ 连接测试超时（超过 18 秒）。\n\n这可能由于您配置的 API 中转服务繁忙、排队时间过长，或请求基址 (Base URL) 填错导致连接挂起。\n\n【温馨提示】如果是 DeepSeek 或第三方中转接口，在网络拥堵高峰期极易出现测试超时。即便在此测试超时，只要您的 API 密钥与配置无误，通常可以直接返回工作台发起「生成」，模型通常能正常排队处理。";

  try {
    const { apiConfig } = req.body;
    
    let message = "连接测试成功！";
    let details = "";

    const rawTest = async () => {
      // 1. If not using custom API, test server-side default Gemini API
      if (!apiConfig || !apiConfig.useCustom) {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: "Hello",
          config: {
            maxOutputTokens: 10,
          }
        });
        details = "系统默认 Gemini 3.5 接口响应正常。";
        return { message, details };
      }

      const { provider, apiKey, baseUrl, model } = apiConfig;

      if (provider === "gemini") {
        const activeKey = apiKey || process.env.GEMINI_API_KEY;
        if (!activeKey) {
          throw new Error("未检测到 Gemini API Key，请先输入密钥。");
        }
        const customAi = new GoogleGenAI({ apiKey: activeKey });
        const testModel = model || "gemini-3.5-flash";
        const response = await customAi.models.generateContent({
          model: testModel,
          contents: "ping",
          config: {
            maxOutputTokens: 5,
          }
        });
        details = `Gemini 成功连接并响应。使用的模型: ${testModel}`;
      } else {
        // OpenAI or Custom Compatible
        const activeKey = apiKey || (provider === "openai" ? process.env.OPENAI_API_KEY : "");
        if (!activeKey) {
          throw new Error(`未检测到 ${provider === "openai" ? "OpenAI" : "自定义"} API Key，请先输入密钥。`);
        }

        let finalBaseUrl = baseUrl || "https://api.openai.com/v1";
        if (finalBaseUrl.endsWith("/")) {
          finalBaseUrl = finalBaseUrl.slice(0, -1);
        }

        const finalModel = model || (provider === "openai" ? "gpt-4o-mini" : "custom-model");
        const url = `${finalBaseUrl}/chat/completions`;

        const controller = new AbortController();
        const testTimer = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${activeKey}`
            },
            body: JSON.stringify({
              model: finalModel,
              messages: [
                { role: "user", content: "ping" }
              ],
              max_tokens: 5
            }),
            signal: controller.signal
          });

          clearTimeout(testTimer);

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`连接失败 (HTTP ${response.status}): ${errText || response.statusText}`);
          }

          const data = await response.json();
          details = `${provider === "openai" ? "OpenAI" : "自定义/中转"} 接口响应正常。使用的模型: ${finalModel}`;
        } catch (fetchErr: any) {
          clearTimeout(testTimer);
          if (fetchErr.name === "AbortError") {
            throw new Error(timeoutErrorMsg);
          }
          throw fetchErr;
        }
      }

      return { message, details };
    };

    const result = await withTimeout(rawTest(), timeoutMs, timeoutErrorMsg);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error in /api/test-connection:", error);
    let errorMsg = error.message || "连接测试时发生未知错误";
    if (errorMsg.includes("403") || errorMsg.includes("401") || errorMsg.includes("Forbidden") || errorMsg.includes("Unauthorized") || errorMsg.includes("API_KEY_INVALID")) {
      errorMsg = "🔑 认证校验失败 (401/403)。请检查密钥正确性，若是中转接口，确保 API 接口基址 (Base URL) 正确无误且账户内有充足可用额度。";
    }
    res.status(400).json({ success: false, error: errorMsg });
  }
});

// API: Fetch Models List
app.post("/api/fetch-models", async (req, res) => {
  const timeoutMs = 10000; // 10 seconds fast fail for fetching models
  const timeoutErrorMsg = "拉取模型列表超时。";

  try {
    const { apiConfig } = req.body;
    
    // Default Gemini models
    const defaultGeminiModels = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-3.5-flash"
    ];

    const defaultOpenAIModels = [
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-3.5-turbo",
      "o1-mini"
    ];

    if (!apiConfig || !apiConfig.useCustom) {
      return res.json({ success: true, models: defaultGeminiModels });
    }

    const { provider, apiKey, baseUrl } = apiConfig;

    const rawFetch = async () => {
      if (provider === "gemini") {
        const activeKey = apiKey || process.env.GEMINI_API_KEY;
        if (!activeKey) {
          return defaultGeminiModels;
        }
        try {
          const customAi = new GoogleGenAI({ apiKey: activeKey });
          const response = await customAi.models.list();
          if (response && Array.isArray(response)) {
            const fetched = response.map((m: any) => m.name || m.id).filter(Boolean);
            if (fetched.length > 0) {
              return fetched.map(name => name.startsWith("models/") ? name.replace("models/", "") : name);
            }
          }
          return defaultGeminiModels;
        } catch (err) {
          console.warn("Failed to fetch models dynamically from Gemini API, using defaults:", err);
          return defaultGeminiModels;
        }
      } else {
        // OpenAI or Custom
        const activeKey = apiKey || (provider === "openai" ? process.env.OPENAI_API_KEY : "");
        if (!activeKey) {
          return provider === "openai" ? defaultOpenAIModels : ["custom-model"];
        }

        let finalBaseUrl = baseUrl || "https://api.openai.com/v1";
        if (finalBaseUrl.endsWith("/")) {
          finalBaseUrl = finalBaseUrl.slice(0, -1);
        }

        const url = `${finalBaseUrl}/models`;
        const controller = new AbortController();
        const fetchTimer = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${activeKey}`
            },
            signal: controller.signal
          });

          clearTimeout(fetchTimer);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          if (data && Array.isArray(data.data)) {
            const modelsList = data.data.map((m: any) => m.id).filter(Boolean);
            if (modelsList.length > 0) {
              return modelsList;
            }
          }
          return provider === "openai" ? defaultOpenAIModels : ["custom-model"];
        } catch (err: any) {
          clearTimeout(fetchTimer);
          console.warn(`Failed to fetch models from ${url}, returning fallbacks. Error:`, err.message);
          return provider === "openai" ? defaultOpenAIModels : ["custom-model"];
        }
      }
    };

    const models = await withTimeout(rawFetch(), timeoutMs, timeoutErrorMsg).catch((err) => {
      console.warn("Fetch models timed out, returning defaults:", err.message);
      return provider === "openai" ? defaultOpenAIModels : provider === "gemini" ? defaultGeminiModels : ["custom-model"];
    });

    res.json({ success: true, models });
  } catch (error: any) {
    console.error("Error in /api/fetch-models:", error);
    res.status(500).json({ success: false, error: error.message || "拉取模型列表时出错" });
  }
});

// API: Generate Persona / Worldbook
app.post("/api/generate", async (req, res) => {
  try {
    const { type, prompt, wordCount, customStyle, customStructure, tone, apiConfig } = req.body;

    if (!type || !prompt) {
      return res.status(400).json({ error: "Missing required fields: 'type' or 'prompt'" });
    }

    if (!SYSTEM_INSTRUCTIONS[type]) {
      return res.status(400).json({ error: `Invalid type. Choose one of: ${Object.keys(SYSTEM_INSTRUCTIONS).join(", ")}` });
    }

    // Default word counts if not specified
    let targetWords = wordCount;
    if (!targetWords) {
      targetWords = type === "worldbook" ? 800 : 600;
    }

    let promptModifier = `\n\n【用户输入的提示词/核心诉求】：\n"${prompt}"\n\n【生成限制与附加要求】：\n`;
    promptModifier += `1. 生成的总字数必须严格控制在 **${targetWords}** 字左右（允许±10%的偏差，不要少于其90%的量）。\n`;
    if (customStyle) {
      promptModifier += `2. 风格/基调定位：**${customStyle}**。\n`;
    }
    if (tone) {
      promptModifier += `3. 写作笔触与语调：**${tone}**。\n`;
    }
    if (customStructure) {
      promptModifier += `4. 用户定制的额外小标题或特殊偏好：\n"${customStructure}"\n`;
    }
    promptModifier += `\n请开始生成，务必严格遵循上面的输出结构大纲，使用高质量的 Markdown 语法进行排版。`;

    const systemInstruction = SYSTEM_INSTRUCTIONS[type];

    const resultText = await callAIModel(systemInstruction, promptModifier, apiConfig);

    if (!resultText) {
      return res.status(500).json({ error: "No content was generated by the AI model. Please try again." });
    }

    res.json({ text: resultText });
  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during generation." });
  }
});

// API: Refine existing content
app.post("/api/refine", async (req, res) => {
  try {
    const { type, originalText, feedback, wordCount, apiConfig } = req.body;

    if (!type || !originalText || !feedback) {
      return res.status(400).json({ error: "Missing required fields for refinement: 'type', 'originalText', or 'feedback'" });
    }

    if (!SYSTEM_INSTRUCTIONS[type]) {
      return res.status(400).json({ error: `Invalid type.` });
    }

    const systemInstruction = `你是一个专业的设定优化助手。当前的内容是一份已生成的「${
      type === "user_persona" ? "用户人设" : type === "xr_persona" ? "Char虚拟人设" : "世界书"
    }」。
    
你的任务是根据用户的修改反馈，对当前设定进行微调、精简、扩充或改写，同时保持原先优美的 Markdown 排版结构。`;

    let targetWords = wordCount || (type === "worldbook" ? 800 : 600);

    const contents = `【当前已有的设定内容】：
\`\`\`markdown
${originalText}
\`\`\`

【用户的修改意见 / 优化反馈】：
"${feedback}"

【重构与优化要求】：
1. 必须根据用户的修改意见，对相应章节做精确、有深度、充满表现力的调整。
2. 保持原有的 H2 Markdown 结构大纲（1. 基本信息、2. ... 等）不丢失。
3. 如果用户指明了新字数，请控制在 **${targetWords}** 字左右，否则保持在与之前相当的字数（约 ${targetWords} 字）。
4. 确保修改后的设定逻辑连贯、叙事流畅、细节饱满。

请输出优化修改后的完整设定：`;

    const resultText = await callAIModel(systemInstruction, contents, apiConfig);

    if (!resultText) {
      return res.status(500).json({ error: "Refinement failed. No content returned." });
    }

    res.json({ text: resultText });
  } catch (error: any) {
    console.error("Error in /api/refine:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during refinement." });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
