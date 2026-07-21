export type TestStatus = 'idle' | 'testing' | 'ok' | 'fail';

export interface TestResult {
  status: TestStatus;
  message: string;
}

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_URL ?? '') as string;

async function directTest(cfg: Record<string, string>, mode: 'chat' | 'image' | 'voice'): Promise<TestResult> {
  if (!cfg.baseUrl) return { status: 'fail', message: '请填写接口地址' };
  if (!cfg.apiKey) return { status: 'fail', message: '请填写API Key' };

  try {
    const base = cfg.baseUrl.replace(/\/+$/, '');
    let endpoint = '';
    let body: any = {};

    if (mode === 'chat') {
      endpoint = `${base}/chat/completions`;
      body = {
        model: cfg.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 5,
      };
    } else if (mode === 'image') {
      endpoint = `${base}/images/generations`;
      body = {
        model: cfg.model || 'dall-e-3',
        prompt: 'test',
        n: 1,
        size: '1024x1024',
      };
    } else if (mode === 'voice') {
      endpoint = `${base}/audio/speech`;
      body = {
        model: cfg.model || 'tts-1',
        input: 'test',
        voice: 'alloy',
      };
    }

    console.log(`Testing ${mode} API: ${endpoint}`);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.error?.message) {
          errorMsg += `: ${errorData.error.message}`;
        } else if (errorData.message) {
          errorMsg += `: ${errorData.message}`;
        }
      } catch {
        const errorText = await res.text().catch(() => '');
        if (errorText) {
          errorMsg += `: ${errorText.substring(0, 100)}`;
        }
      }

      // 提供更友好的错误提示
      if (res.status === 401) {
        return { status: 'fail', message: '认证失败：API Key无效或过期' };
      } else if (res.status === 403) {
        return { status: 'fail', message: '权限不足：API Key没有权限访问此接口' };
      } else if (res.status === 404) {
        return { status: 'fail', message: '接口不存在：请检查API地址是否正确' };
      } else if (res.status === 429) {
        return { status: 'fail', message: '请求过多：API配额已用完或触发限流' };
      } else if (res.status >= 500) {
        return { status: 'fail', message: '服务器错误：API服务暂时不可用' };
      }

      return { status: 'fail', message: errorMsg };
    }

    // 验证响应格式
    try {
      const data = await res.json();
      if (mode === 'chat') {
        if (!data.choices || data.choices.length === 0) {
          return { status: 'fail', message: '响应格式错误：缺少choices字段' };
        }
      } else if (mode === 'image') {
        if (!data.data || data.data.length === 0) {
          return { status: 'fail', message: '响应格式错误：缺少data字段' };
        }
      }
    } catch (e) {
      // voice返回的是二进制数据，不需要JSON解析
      if (mode !== 'voice') {
        return { status: 'fail', message: '响应格式错误：无法解析JSON' };
      }
    }

    return { status: 'ok', message: '连接成功！API正常工作' };
  } catch (e) {
    const error = e as Error;
    console.error('API test error:', error);

    // 检测常见错误
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        status: 'fail',
        message: 'CORS错误：浏览器阻止了跨域请求，请确保API支持CORS或使用代理'
      };
    } else if (error.message.includes('timeout')) {
      return { status: 'fail', message: '连接超时：API响应时间过长' };
    } else if (error.name === 'TypeError') {
      return { status: 'fail', message: '网络错误：无法连接到API服务器' };
    }

    return { status: 'fail', message: `错误: ${error.message}` };
  }
}

async function callProxy(cfg: Record<string, string>, mode: 'chat' | 'image' | 'voice'): Promise<TestResult> {
  if (!cfg.baseUrl && mode !== 'voice') return { status: 'fail', message: '请填写接口地址' };
  if (!cfg.baseUrl && mode === 'voice' && cfg.provider === 'custom') return { status: 'fail', message: '请填写接口地址' };

  // 如果没有配置Supabase代理，直接测试
  if (!supabaseUrl) {
    return directTest(cfg, mode);
  }

  try {
    const fnUrl = `${supabaseUrl}/functions/v1/api-test`;
    const res = await fetch(fnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl: cfg.baseUrl, apiKey: cfg.apiKey, mode }),
    });
    if (!res.ok) {
      // 如果代理失败，尝试直接连接
      console.warn('代理连接失败，尝试直接连接API');
      return directTest(cfg, mode);
    }
    const data = await res.json();
    return data.ok
      ? { status: 'ok', message: data.message ?? '连接成功' }
      : { status: 'fail', message: data.message ?? '连接失败' };
  } catch (e) {
    // 代理失败，尝试直接连接
    console.warn('代理连接出错，尝试直接连接API');
    return directTest(cfg, mode);
  }
}

export async function testChat(cfg: Record<string, string>): Promise<TestResult> {
  return callProxy(cfg, 'chat');
}

export async function testImage(cfg: Record<string, string>): Promise<TestResult> {
  return callProxy(cfg, 'image');
}

export async function testVoice(cfg: Record<string, string>): Promise<TestResult> {
  if (cfg.provider === 'minimax') {
    if (!cfg.apiKey) return { status: 'fail', message: '请填写 MiniMax API Key' };
    return { status: 'ok', message: '已保存 MiniMax 配置（联网时调用）' };
  }
  return callProxy(cfg, 'voice');
}
