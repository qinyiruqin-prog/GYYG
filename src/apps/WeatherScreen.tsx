import { useState, useEffect } from 'react';
import { Search, MapPin, CloudRain, Sun, Cloud, Snowflake, CloudLightning, Wind, Droplets, Compass, Sparkles, Navigation } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { askAIJson } from '../api';
import type { ApiConfig } from '../types';

interface WeatherData {
  city: string;
  temp: number;
  type: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'thunder';
  typeName: string;
  high: number;
  low: number;
  wind: string;
  humidity: number;
  aqi: number;
  hourly: { time: string; temp: number; type: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'thunder' }[];
  aiAdvice: string;
}

const DEFAULT_WEATHER_LIST: Record<string, WeatherData> = {
  '北京': {
    city: '北京', temp: 26, type: 'sunny', typeName: '晴朗', high: 32, low: 18, wind: '西南风 2级', humidity: 45, aqi: 52,
    hourly: [
      { time: '现在', temp: 26, type: 'sunny' },
      { time: '14:00', temp: 31, type: 'sunny' },
      { time: '17:00', temp: 28, type: 'cloudy' },
      { time: '20:00', temp: 23, type: 'cloudy' },
      { time: '23:00', temp: 19, type: 'sunny' },
    ],
    aiAdvice: '今天阳光充足，体感较热，建议穿着短袖 T 恤及轻薄防晒衣。午后紫外线强，出门记得带墨镜和遮阳伞哦！'
  },
  '纽约': {
    city: '纽约', temp: 18, type: 'rainy', typeName: '小雨', high: 22, low: 14, wind: '东北风 4级', humidity: 85, aqi: 35,
    hourly: [
      { time: '现在', temp: 18, type: 'rainy' },
      { time: '14:00', temp: 20, type: 'rainy' },
      { time: '17:00', temp: 19, type: 'thunder' },
      { time: '20:00', temp: 17, type: 'cloudy' },
      { time: '23:00', temp: 15, type: 'cloudy' },
    ],
    aiAdvice: '细雨微凉，空气湿润。建议随身携带雨具，着一袭轻便风衣挡风，适合在街角咖啡馆静读。'
  },
  '冰岛': {
    city: '冰岛', temp: -2, type: 'snowy', typeName: '暴风雪', high: 1, low: -6, wind: '北风 6级', humidity: 90, aqi: 12,
    hourly: [
      { time: '现在', temp: -2, type: 'snowy' },
      { time: '14:00', temp: -1, type: 'snowy' },
      { time: '17:00', temp: -3, type: 'snowy' },
      { time: '20:00', temp: -5, type: 'cloudy' },
      { time: '23:00', temp: -6, type: 'cloudy' },
    ],
    aiAdvice: '极寒之境，瑞雪纷飞。请裹紧厚羽绒服，佩戴毛线帽和保暖手套，今晚说不定有美妙的极光哦！'
  },
  '东京': {
    city: '东京', temp: 21, type: 'cloudy', typeName: '多云', high: 24, low: 17, wind: '东风 3级', humidity: 60, aqi: 40,
    hourly: [
      { time: '现在', temp: 21, type: 'cloudy' },
      { time: '14:00', temp: 23, type: 'cloudy' },
      { time: '17:00', temp: 22, type: 'sunny' },
      { time: '20:00', temp: 19, type: 'sunny' },
      { time: '23:00', temp: 18, type: 'cloudy' },
    ],
    aiAdvice: '温和的多云天气，凉爽宜人。穿件长袖衬衫或针织开衫正合适，适合漫步原宿或新宿街头。'
  },
};

export function WeatherScreen({
  api,
  onBack,
}: {
  api: ApiConfig;
  onBack: () => void;
}) {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<WeatherData>(DEFAULT_WEATHER_LIST['北京']);
  const [loading, setLoading] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);
  const [err, setErr] = useState('');

  // lightning flash simulation for thunder weather
  useEffect(() => {
    if (data.type !== 'thunder') return;
    const interval = setInterval(() => {
      setFlashEffect(true);
      setTimeout(() => setFlashEffect(false), 200);
    }, 8000);
    return () => clearInterval(interval);
  }, [data.type]);

  const handleSearch = async (city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    setErr('');

    // If it's a known default, first load it immediately for response speed
    if (DEFAULT_WEATHER_LIST[trimmed]) {
      setData(DEFAULT_WEATHER_LIST[trimmed]);
    }

    if (!api.chat.baseUrl) {
      // client-side offline mode using fallback
      if (!DEFAULT_WEATHER_LIST[trimmed]) {
        // generate realistic mock
        const types: WeatherData['type'][] = ['sunny', 'rainy', 'cloudy', 'snowy', 'thunder'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const names = { sunny: '晴朗', rainy: '阴雨', cloudy: '多云', snowy: '大雪', thunder: '雷阵雨' };
        const baseTemp = Math.floor(Math.random() * 35) - 5;
        const mock: WeatherData = {
          city: trimmed,
          temp: baseTemp,
          type: randomType,
          typeName: names[randomType],
          high: baseTemp + 5,
          low: baseTemp - 5,
          wind: '微风 2级',
          humidity: Math.floor(Math.random() * 50) + 40,
          aqi: Math.floor(Math.random() * 80) + 20,
          hourly: [
            { time: '现在', temp: baseTemp, type: randomType },
            { time: '14:00', temp: baseTemp + 3, type: randomType },
            { time: '17:00', temp: baseTemp + 1, type: 'cloudy' },
            { time: '20:00', temp: baseTemp - 2, type: 'cloudy' },
            { time: '23:00', temp: baseTemp - 4, type: 'sunny' },
          ],
          aiAdvice: `这是针对「${trimmed}」的模拟天气。今天是${names[randomType]}，温度约${baseTemp}℃。出行请带好心情！`
        };
        setData(mock);
      }
      return;
    }

    // AI active mode
    setLoading(true);
    try {
      const system = `你是一个专业的趣味气象预报大师。你需要根据用户提供的城市名字，模拟生成该城市当下的精美天气数据。包含实时温度、天气类型（sunny、rainy、cloudy、snowy、thunder 之一）、高低温、湿度、AQI、24小时段简短预报，以及一小段优雅、充满情调的AI穿着与出行情绪建议（aiAdvice，约60-100字）。请只返回 JSON。`;
      const user = `城市名：「${trimmed}」\n请按照以下格式返回JSON，不要有任何多余文字：\n{\n  "city": "城市名",\n  "temp": 24,\n  "type": "sunny/rainy/cloudy/snowy/thunder之一",\n  "typeName": "晴天/中雨/多云等具体称呼",\n  "high": 28,\n  "low": 15,\n  "wind": "东南风 3级",\n  "humidity": 60,\n  "aqi": 42,\n  "hourly": [\n    {"time": "12:00", "temp": 24, "type": "sunny"},\n    {"time": "15:00", "temp": 26, "type": "sunny"},\n    {"time": "18:00", "temp": 21, "type": "cloudy"},\n    {"time": "21:00", "temp": 18, "type": "cloudy"},\n    {"time": "00:00", "temp": 16, "type": "sunny"}\n  ],\n  "aiAdvice": "优雅有情调的建议内容"\n}`;
      const result = await askAIJson<WeatherData>(api, system, user, { temperature: 0.85 });
      if (result && result.city) {
        setData(result);
      }
    } catch (e) {
      setErr('AI 气象生成失败，已加载本地预测。');
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (type: WeatherData['type'], size = 48) => {
    switch (type) {
      case 'sunny': return <Sun size={size} className="text-amber-400 animate-spin-slow" />;
      case 'rainy': return <CloudRain size={size} className="text-blue-400 animate-bounce" />;
      case 'cloudy': return <Cloud size={size} className="text-slate-300" />;
      case 'snowy': return <Snowflake size={size} className="text-sky-200 animate-pulse" />;
      case 'thunder': return <CloudLightning size={size} className="text-indigo-400" />;
    }
  };

  const getBackgroundStyle = (type: WeatherData['type']) => {
    switch (type) {
      case 'sunny':
        return 'bg-gradient-to-b from-sky-400 via-orange-300 to-amber-200 text-neutral-900';
      case 'rainy':
        return 'bg-gradient-to-b from-slate-700 via-sky-900 to-slate-900 text-white';
      case 'cloudy':
        return 'bg-gradient-to-b from-neutral-600 via-sky-800 to-slate-800 text-white';
      case 'snowy':
        return 'bg-gradient-to-b from-sky-800 via-slate-600 to-neutral-200 text-slate-900';
      case 'thunder':
        return 'bg-gradient-to-b from-zinc-900 via-indigo-950 to-slate-900 text-white';
    }
  };

  return (
    <AppScreen title="天气" onBack={onBack} noPad>
      <div className={`relative h-full w-full overflow-hidden transition-all duration-1000 ${getBackgroundStyle(data.type)}`}>
        {/* Lightning flash effect overlay */}
        {flashEffect && <div className="absolute inset-0 bg-white/30 z-10 transition-opacity" />}

        {/* Floating particles effect based on weather */}
        {data.type === 'rainy' && (
          <div className="absolute inset-0 pointer-events-none select-none z-[1] overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[1.5px] h-[15px] bg-sky-200/40 rounded animate-rain-down"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}%`,
                  animationDuration: `${1 + Math.random() * 1.5}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {data.type === 'snowy' && (
          <div className="absolute inset-0 pointer-events-none select-none z-[1] overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute text-sky-100/60 font-serif select-none animate-snow-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 10}%`,
                  fontSize: `${10 + Math.random() * 15}px`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              >
                ❄
              </div>
            ))}
          </div>
        )}

        {/* Screen Header/Search inside the App body */}
        <div className="relative z-10 px-4 pt-4 space-y-4">
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-2xl px-3 h-10 border border-white/10">
            <Search size={15} className="text-white/60" />
            <input
              type="text"
              placeholder="搜索任何城市 (如：大理、巴黎、西藏)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              className="flex-1 bg-transparent outline-none text-xs text-white placeholder-white/40"
            />
            <button
              onClick={() => handleSearch(query)}
              className="tap p-1.5 rounded-full hover:bg-white/10 text-white"
            >
              <Navigation size={13} />
            </button>
          </div>

          {err && (
            <div className="text-[11px] bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl px-3 py-1.5 text-center backdrop-blur">
              {err}
            </div>
          )}

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {Object.keys(DEFAULT_WEATHER_LIST).map((city) => (
              <button
                key={city}
                onClick={() => { setQuery(city); handleSearch(city); }}
                className={`tap text-[11px] px-3.5 py-1 rounded-full transition-all border ${
                  data.city === city
                    ? 'bg-white/90 text-neutral-900 border-white font-semibold'
                    : 'bg-black/15 text-white/80 border-white/10 hover:bg-black/25'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Current weather card */}
          <div className="flex flex-col items-center text-center pt-4 pb-2 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white/95">
              <MapPin size={13} className="text-rose-500 fill-rose-500" />
              <span>{data.city}</span>
            </div>

            <div className="flex items-center justify-center pt-2 relative">
              {getWeatherIcon(data.type, 72)}
              {loading && (
                <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-white animate-spin" />
                </div>
              )}
            </div>

            <div className="text-6xl font-extralight tracking-tighter text-white select-none relative pl-3 pt-2">
              {data.temp}<span className="absolute top-2 text-2xl">°</span>
            </div>

            <div className="text-sm font-semibold text-white/90">
              {data.typeName}
            </div>

            <div className="text-xs text-white/70 space-x-2">
              <span>H: {data.high}°</span>
              <span>L: {data.low}°</span>
            </div>
          </div>

          {/* Key Indicators */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="bg-black/20 backdrop-blur rounded-2xl p-2.5 text-center border border-white/5 flex flex-col items-center">
              <Wind size={15} className="text-teal-300 mb-1" />
              <span className="text-[9px] text-white/50 block">风速</span>
              <span className="text-xs text-white font-bold mt-0.5 truncate max-w-full">{data.wind}</span>
            </div>
            <div className="bg-black/20 backdrop-blur rounded-2xl p-2.5 text-center border border-white/5 flex flex-col items-center">
              <Droplets size={15} className="text-blue-300 mb-1" />
              <span className="text-[9px] text-white/50 block">湿度</span>
              <span className="text-xs text-white font-bold mt-0.5">{data.humidity}%</span>
            </div>
            <div className="bg-black/20 backdrop-blur rounded-2xl p-2.5 text-center border border-white/5 flex flex-col items-center">
              <Compass size={15} className="text-purple-300 mb-1" />
              <span className="text-[9px] text-white/50 block">AQI指数</span>
              <span className="text-xs text-white font-bold mt-0.5">{data.aqi}</span>
            </div>
          </div>

          {/* 24-Hour Forecast */}
          <div className="bg-black/25 backdrop-blur-md rounded-3xl p-4 border border-white/10 space-y-3">
            <h4 className="text-[10px] text-white/60 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Compass size={12} /> 24小时简报
            </h4>
            <div className="flex justify-between items-center overflow-x-auto no-scrollbar gap-4 py-1">
              {data.hourly.map((h, i) => (
                <div key={i} className="flex flex-col items-center space-y-1.5 shrink-0 text-center">
                  <span className="text-[10px] text-white/60">{h.time}</span>
                  {getWeatherIcon(h.type, 18)}
                  <span className="text-xs text-white font-bold">{h.temp}°</span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart AI Advice Panel */}
          <div className="bg-white/95 rounded-3xl p-4 shadow-xl text-neutral-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="fill-current" /> 羊羊机·AI 穿搭指南
              </span>
              <span className="text-[9px] font-semibold bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full">
                {api.chat.baseUrl ? 'AI 生成' : '预置指南'}
              </span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed font-medium">
              {data.aiAdvice}
            </p>
          </div>
        </div>

        {/* Just a tiny elegant spacer */}
        <div className="h-10" />
      </div>
    </AppScreen>
  );
}
