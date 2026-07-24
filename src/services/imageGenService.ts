import type { ApiConfig } from '../types';

/**
 * 生成社交媒体图片
 * 如果有图片API配置，调用API生成图片
 * 如果没有，返回图片描述
 */
export async function generateSocialImage(
  api: ApiConfig,
  prompt: string
): Promise<{ url?: string; description: string; hasApi: boolean }> {
  const hasImageApi = !!(api.image?.baseUrl && api.image?.apiKey && api.image?.model);

  if (!hasImageApi) {
    // 没有API配置，返回描述
    return {
      description: prompt,
      hasApi: false,
    };
  }

  try {
    // 调用图片生成API
    const stylePrompt = api.image.stylePrompt || '';
    const fullPrompt = stylePrompt ? `${stylePrompt}, ${prompt}` : prompt;

    const response = await fetch(`${api.image.baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.image.apiKey}`,
      },
      body: JSON.stringify({
        model: api.image.model,
        prompt: fullPrompt,
        n: 1,
        size: '512x512',
      }),
    });

    if (!response.ok) {
      throw new Error(`图片生成失败: ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json;

    if (!imageUrl) {
      throw new Error('图片生成失败：未返回图片URL');
    }

    return {
      url: imageUrl.startsWith('data:') ? imageUrl : imageUrl,
      description: prompt,
      hasApi: true,
    };
  } catch (error) {
    console.error('图片生成失败:', error);
    // API调用失败，返回描述
    return {
      description: prompt,
      hasApi: false,
    };
  }
}

/**
 * 批量生成社交媒体图片
 */
export async function generateSocialImages(
  api: ApiConfig,
  prompts: string[]
): Promise<Array<{ url?: string; description: string; hasApi: boolean }>> {
  const results = await Promise.all(prompts.map((prompt) => generateSocialImage(api, prompt)));
  return results;
}
