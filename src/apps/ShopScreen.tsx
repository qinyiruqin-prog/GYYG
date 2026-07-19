import { useState } from 'react';
import { Search, ShoppingCart, Star, Plus, Minus, Check, X, Package, Sparkles, PlusCircle, Trash2, Image, AlertCircle, Loader2 } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { uid, cls } from '../utils';
import { askAIJson, generateImage } from '../api';
import type { Product, CartItem, Order, ApiConfig } from '../types';

const COVER = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;

const SEED_PRODUCTS: Product[] = [
  { id: 'p1', name: '极简陶瓷茶杯', price: 68, originalPrice: 98, cover: COVER('2531197'), images: [COVER('2531197')], desc: '手工拉坯，温润釉色，握感舒适。250ml。', category: '家居', rating: 4.8, sales: 1200, tags: ['手工', '陶瓷', '茶具'] },
  { id: 'p2', name: '亚麻棉质T恤', price: 128, originalPrice: 199, cover: COVER('996329'), images: [COVER('996329')], desc: '70%亚麻+30%棉，透气亲肤，宽松版型。', category: '服饰', rating: 4.6, sales: 3400, tags: ['亚麻', '基础款'] },
  { id: 'p3', name: '复古皮质笔记本', price: 89, cover: COVER('606547'), images: [COVER('606547')], desc: '头层牛皮封面，内页米黄道林纸，192页。', category: '文具', rating: 4.9, sales: 890, tags: ['复古', '皮面', '手账'] },
  { id: 'p4', name: '香薰蜡烛礼盒', price: 158, originalPrice: 218, cover: COVER('3270223'), images: [COVER('3270223')], desc: '大豆蜡+精油，三种香型：雪松/白茶/琥珀。', category: '家居', rating: 4.7, sales: 2100, tags: ['香薰', '礼盒', '放松'] },
  { id: 'p5', name: '北欧风落地灯', price: 399, originalPrice: 599, cover: COVER('1099814'), images: [COVER('1099814')], desc: '可调色温，暖白/自然白，1.6m高度。', category: '家居', rating: 4.5, sales: 560, tags: ['灯具', '北欧', '节能'] },
  { id: 'p6', name: '不锈钢保温杯', price: 99, cover: COVER('1188649'), images: [COVER('1188649')], desc: '316不锈钢，12小时保温，500ml。', category: '生活', rating: 4.8, sales: 5200, tags: ['保温', '便携'] },
];

const FALLBACK_PHOTO_IDS = [
  '2531197', '996329', '606547', '3270223', '1099814', '1188649',
  '3785693', '1640777', '4041391', '2082087', '3585965', '1450116'
];

const CATS = ['全部', '家居', '服饰', '文具', '生活'];

export function ShopScreen({
  api,
  products = [],
  onChangeProducts,
  cart,
  onChangeCart,
  orders,
  onChangeOrders,
  onBack,
}: {
  api: ApiConfig;
  products: Product[];
  onChangeProducts: (p: Product[]) => void;
  cart: CartItem[];
  onChangeCart: (c: CartItem[]) => void;
  orders: Order[];
  onChangeOrders: (o: Order[]) => void;
  onBack: () => void;
}) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('全部');
  const [active, setActive] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [tab, setTab] = useState<'home' | 'orders' | 'manage'>('home');
  const [ordered, setOrdered] = useState(false);

  // --- Manual Add Form State ---
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOrigPrice, setFormOrigPrice] = useState('');
  const [formCat, setFormCat] = useState('家居');
  const [formDesc, setFormDesc] = useState('');
  const [formCover, setFormCover] = useState('');
  const [formTags, setFormTags] = useState('');
  const [addMsg, setAddMsg] = useState('');

  // --- AI Generate State ---
  const [keyword, setKeyword] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiErr, setAiErr] = useState('');

  const list = products.length > 0 ? products : SEED_PRODUCTS;
  
  // ensure first initialization triggers save to prevent empty states
  if (products.length === 0) {
    onChangeProducts(SEED_PRODUCTS);
  }

  const filtered = list.filter((p) => (cat === '全部' || p.category === cat) && (p.name.includes(q) || p.tags.some((t) => t.includes(q))));
  
  const add = (pid: string) => { 
    const ex = cart.find((c) => c.productId === pid); 
    if (ex) {
      onChangeCart(cart.map((c) => c.productId === pid ? { ...c, qty: c.qty + 1 } : c)); 
    } else {
      onChangeCart([...cart, { productId: pid, qty: 1 }]); 
    }
  };

  const sub = (pid: string) => { 
    const ex = cart.find((c) => c.productId === pid); 
    if (!ex) return; 
    if (ex.qty <= 1) {
      onChangeCart(cart.filter((c) => c.productId !== pid)); 
    } else {
      onChangeCart(cart.map((c) => c.productId === pid ? { ...c, qty: c.qty - 1 } : c)); 
    }
  };

  const cartDetails = cart.map((c) => ({ ...c, p: list.find((x) => x.id === c.productId) })).filter((x) => x.p);
  const total = cartDetails.reduce((s, x) => s + (x.p!.price * x.qty), 0);
  const totalCount = cart.reduce((s, c) => s + c.qty, 0);

  const checkout = () => {
    if (cartDetails.length === 0) return;
    const o: Order = { 
      id: uid(), 
      items: cartDetails.map((x) => ({ productId: x.p!.id, name: x.p!.name, price: x.p!.price, qty: x.qty, cover: x.p!.cover })), 
      total, 
      status: 'paid', 
      ts: Date.now() 
    };
    onChangeOrders([o, ...orders]); 
    onChangeCart([]); 
    setShowCart(false); 
    setOrdered(true); 
    setTimeout(() => setOrdered(false), 2500);
  };

  // --- Manual Add Action ---
  const handleManualAdd = (e: any) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice.trim()) {
      setAddMsg('❌ 请填写完整的商品名称与价格');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setAddMsg('❌ 请输入合法的价格数值');
      return;
    }

    const randomPhotoId = FALLBACK_PHOTO_IDS[Math.floor(Math.random() * FALLBACK_PHOTO_IDS.length)];
    const finalCover = formCover.trim() || COVER(randomPhotoId);

    const newProduct: Product = {
      id: 'p-' + uid(),
      name: formName.trim(),
      price: priceNum,
      originalPrice: formOrigPrice ? parseFloat(formOrigPrice) : undefined,
      category: formCat,
      desc: formDesc.trim() || '暂无详细描述。',
      cover: finalCover,
      images: [finalCover],
      rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
      sales: Math.floor(Math.random() * 100),
      tags: formTags ? formTags.split(/[，,]/).map(t => t.trim()).filter(Boolean) : [formCat]
    };

    onChangeProducts([...list, newProduct]);
    setAddMsg('✅ 自定义商品发布成功！已加入货架');
    
    // clear fields
    setFormName('');
    setFormPrice('');
    setFormOrigPrice('');
    setFormDesc('');
    setFormCover('');
    setFormTags('');
  };

  // --- AI Generate Action ---
  const handleAiGenerate = async () => {
    if (!keyword.trim()) {
      setAiErr('请输入想要生成的商品关键词');
      return;
    }
    if (!api.chat.baseUrl) {
      setAiErr('请先在「我的 → API配置」中配置 Chat API');
      return;
    }

    setAiGenerating(true);
    setAiErr('');
    try {
      // 1. Ask Chat API to design product metadata
      const system = `你是一个潮流好物设计师与商品策划师。根据用户的商品关键词，设计一款高品质且充满设计感的创意商品。请返回规范的 JSON 数据。`;
      const prompt = `关键词：「${keyword.trim()}」\n设计一款商品并返回以下JSON格式：\n{\n  "name": "极简好物名称",\n  "price": 129,\n  "originalPrice": 199,\n  "desc": "极具画面感的商品设计细节、工艺及情感描述",\n  "category": "家居/服饰/文具/生活 之一",\n  "tags": ["高质标签1", "标签2"],\n  "imagePrompt": "A professional product studio photography of the designed item, white background, cinematic soft lighting, award-winning product design, extremely detailed, 8k"\n}\n请严格只返回 JSON。`;
      
      const designResult = await askAIJson<any>(api, system, prompt);
      
      if (!designResult || !designResult.name) {
        throw new Error('AI 返回的商品格式不完整');
      }

      // 2. Generate cover image (or fallback to stock photo based on seed)
      let finalCoverUrl = '';
      if (api.image && api.image.baseUrl && designResult.imagePrompt) {
        try {
          const generatedUrl = await generateImage(api.image, designResult.imagePrompt);
          if (generatedUrl) finalCoverUrl = generatedUrl;
        } catch (imgErr) {
          console.warn('Image generation failed, using stock photo fallback:', imgErr);
        }
      }

      if (!finalCoverUrl) {
        const randomPhotoId = FALLBACK_PHOTO_IDS[Math.floor(Math.random() * FALLBACK_PHOTO_IDS.length)];
        finalCoverUrl = COVER(randomPhotoId);
      }

      // 3. Insert product
      const newProduct: Product = {
        id: 'p-ai-' + uid(),
        name: designResult.name,
        price: Number(designResult.price) || 99,
        originalPrice: designResult.originalPrice ? Number(designResult.originalPrice) : undefined,
        category: ['家居', '服饰', '文具', '生活'].includes(designResult.category) ? designResult.category : '生活',
        desc: designResult.desc || '由智能 AI 设计的概念性商品。',
        cover: finalCoverUrl,
        images: [finalCoverUrl],
        rating: parseFloat((4.6 + Math.random() * 0.4).toFixed(1)),
        sales: Math.floor(Math.random() * 50) + 10,
        tags: Array.isArray(designResult.tags) ? designResult.tags : ['智能好物']
      };

      onChangeProducts([...list, newProduct]);
      setKeyword('');
      setAddMsg(`✨ 智能设计成功！已将「${newProduct.name}」加入商城！`);
      setTab('home');
    } catch (err) {
      setAiErr('生成失败：' + (err as Error).message);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleRemoveProduct = (pid: string) => {
    onChangeProducts(list.filter((p) => p.id !== pid));
  };

  if (active) {
    return (
      <AppScreen title="商品详情" onBack={() => setActive(null)} noPad>
        <div className="flex flex-col h-full bg-neutral-950 text-white">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <img src={active.cover} className="w-full h-72 object-cover" alt="" referrerPolicy="no-referrer" />
            <div className="px-4 py-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-[var(--accent)]">¥{active.price}</span>
                {active.originalPrice && <span className="text-[14px] text-neutral-500 line-through">¥{active.originalPrice}</span>}
              </div>
              <div className="font-title text-base font-bold text-white mb-2">{active.name}</div>
              <div className="flex items-center gap-3 text-[11px] text-neutral-400 mb-3">
                <span className="flex items-center gap-0.5"><Star size={11} className="text-[var(--accent)] fill-current" /> {active.rating}</span>
                <span>已售 {active.sales} 件</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {active.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300">{t}</span>)}
              </div>
              <div className="text-xs leading-relaxed text-neutral-300 border-t border-neutral-800 pt-4 whitespace-pre-wrap">{active.desc}</div>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-neutral-900 flex items-center gap-3 shrink-0 bg-neutral-900/60 backdrop-blur-md">
            <button onClick={() => setShowCart(true)} className="tap relative w-11 h-11 rounded-full bg-neutral-800 flex items-center justify-center text-white"><ShoppingCart size={20} />{totalCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white" style={{ background: 'var(--danger)' }}>{totalCount}</span>}</button>
            <button onClick={() => add(active.id)} className="tap flex-1 h-11 rounded-full font-bold text-xs text-[var(--bg)]" style={{ background: 'var(--accent)' }}>加入购物车</button>
          </div>
        </div>
        <CartSheet open={showCart} onClose={() => setShowCart(false)} cartDetails={cartDetails} total={total} onAdd={add} onSub={sub} onCheckout={checkout} />
        {ordered && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass-strong rounded-2xl px-6 py-4 flex items-center gap-2 animate-sheet-up"><Check size={20} className="txt-accent" /> 下单成功</div>}
      </AppScreen>
    );
  }

  return (
    <AppScreen title="商城" onBack={onBack} noPad right={tab === 'home' ? <button onClick={() => setShowCart(true)} className="tap relative text-[var(--accent)]"><ShoppingCart size={22} />{totalCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center text-white" style={{ background: 'var(--danger)' }}>{totalCount}</span>}</button> : undefined}>
      {/* Navigation tabs */}
      <div className="flex gap-2 px-4 pt-3 pb-2 shrink-0 bg-neutral-950 border-b border-neutral-900">
        <button onClick={() => { setTab('home'); setAddMsg(''); }} className={cls('tap flex-1 h-8 rounded-full text-xs font-bold transition-colors', tab === 'home' ? 'bg-[var(--accent)] text-neutral-950' : 'bg-neutral-900 text-neutral-400')}>
          🛒 商城货架
        </button>
        <button onClick={() => { setTab('orders'); setAddMsg(''); }} className={cls('tap flex-1 h-8 rounded-full text-xs font-bold transition-colors', tab === 'orders' ? 'bg-[var(--accent)] text-neutral-950' : 'bg-neutral-900 text-neutral-400')}>
          📦 我的订单
        </button>
        <button onClick={() => { setTab('manage'); setAddMsg(''); }} className={cls('tap flex-1 h-8 rounded-full text-xs font-bold transition-colors', tab === 'manage' ? 'bg-[var(--accent)] text-neutral-950' : 'bg-neutral-900 text-neutral-400')}>
          🛠️ 商品管理
        </button>
      </div>

      {addMsg && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium text-center animate-fade-in flex items-center justify-center gap-1.5">
          <Sparkles size={14} /> {addMsg}
        </div>
      )}

      {tab === 'home' ? (
        <>
          <div className="px-4 py-2 shrink-0 bg-neutral-950">
            <div className="flex items-center gap-2 bg-neutral-900 rounded-2xl px-3.5 h-10 mb-3 border border-neutral-800"><Search size={15} className="text-neutral-500" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索商品、标签..." className="flex-1 bg-transparent outline-none text-xs text-white" /></div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {CATS.map((c) => <button key={c} onClick={() => setCat(c)} className={cls('tap shrink-0 px-4 h-7 rounded-full text-xs font-medium border transition-colors', cat === c ? 'bg-[var(--accent)] text-neutral-950 border-[var(--accent)]' : 'bg-neutral-900 text-neutral-400 border-neutral-800')}>{c}</button>)}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 bg-neutral-950 pt-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-500 text-xs">没有找到符合条件的商品</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((p) => (
                  <div key={p.id} className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800/80 flex flex-col justify-between">
                    <button onClick={() => setActive(p)} className="tap w-full relative"><img src={p.cover} className="w-full aspect-square object-cover" alt="" referrerPolicy="no-referrer" /><span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] bg-black/60 text-white border border-white/5 font-semibold">{p.category}</span></button>
                    <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-neutral-100 line-clamp-1 leading-snug">{p.name}</div>
                        <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5 mb-2 leading-relaxed">{p.desc}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5"><span className="text-sm font-black text-[var(--accent)]">¥{p.price}</span></div>
                        <button onClick={() => add(p.id)} className="tap w-7 h-7 rounded-full flex items-center justify-center text-[var(--bg)]" style={{ background: 'var(--accent)' }}><Plus size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : tab === 'orders' ? (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-3 bg-neutral-950 pt-3">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-500"><div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-2 border border-neutral-800"><Package size={22} className="text-neutral-400" /></div><div className="text-xs">还没有任何订单记录</div></div>
          ) : orders.map((o) => (
            <div key={o.id} className="bg-neutral-900 rounded-2xl p-3.5 border border-neutral-800">
              <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-neutral-500">{new Date(o.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span><span className="text-[11px] font-bold text-[var(--accent)]">{o.status === 'paid' ? '已付款' : o.status}</span></div>
              {o.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3.5 mb-2.5"><img src={it.cover} className="w-10 h-10 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" /><div className="flex-1 min-w-0"><div className="text-xs font-bold text-white truncate">{it.name}</div><div className="text-[11px] text-neutral-400">¥{it.price} × {it.qty}</div></div></div>
              ))}
              <div className="text-right text-xs font-black text-[var(--accent)] border-t border-neutral-800 pt-2 mt-1">合计 ¥{o.total}</div>
            </div>
          ))}
        </div>
      ) : (
        /* --- Product Management Dashboard --- */
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-5 bg-neutral-950 pt-4">
          
          {/* AI Generator Box */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-400" /> AI 智能生成好物
              </h3>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/15">
                搭载 Gemini
              </span>
            </div>
            
            <p className="text-[10px] text-neutral-400 leading-normal">
              输入你想要的创意商品关键词（如：“和风手绘陶瓷猫咪水杯”、“北欧复古原木咖啡机”），AI 会自动撰写文案并绘制商品美图！
            </p>

            {aiErr && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] flex items-center gap-1 animate-fade-in">
                <AlertCircle size={12} className="shrink-0" /> {aiErr}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="例如：怀旧朋克风打字机"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={aiGenerating}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 text-xs text-white outline-none focus:border-indigo-500/50"
              />
              <button
                onClick={handleAiGenerate}
                disabled={aiGenerating || !keyword.trim()}
                className="tap px-4 h-9 bg-indigo-600 hover:bg-indigo-500 hover:disabled:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                {aiGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                <span>{aiGenerating ? '生成中...' : '生成'}</span>
              </button>
            </div>
          </div>

          {/* Custom Add Form */}
          <form onSubmit={handleManualAdd} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3.5">
            <h3 className="text-xs font-black text-white flex items-center gap-1.5 border-b border-neutral-800/80 pb-2">
              <PlusCircle size={14} className="text-[var(--accent)]" /> 手动发布新商品
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">商品名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="如: 手工藤编野餐篮"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[var(--accent)]/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">所属分类</label>
                <select
                  value={formCat}
                  onChange={(e) => setFormCat(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white outline-none focus:border-[var(--accent)]/50 cursor-pointer"
                >
                  {CATS.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">售价 (元) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="如: 58"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[var(--accent)]/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">原价/划线价 (选填)</label>
                <input
                  type="number"
                  placeholder="如: 99"
                  value={formOrigPrice}
                  onChange={(e) => setFormOrigPrice(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[var(--accent)]/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">商品描述</label>
              <textarea
                placeholder="介绍一下这个宝贝的材质、规格或精美卖点吧..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[var(--accent)]/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">封面图片网址 (选填)</label>
                <input
                  type="text"
                  placeholder="可留空使用精美图库"
                  value={formCover}
                  onChange={(e) => setFormCover(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[var(--accent)]/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">自定义标签 (逗号隔开)</label>
                <input
                  type="text"
                  placeholder="如: 复古, 手工, 拍照出片"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[var(--accent)]/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="tap w-full py-2 bg-[var(--accent)] text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> 确认上架发布
            </button>
          </form>

          {/* Delete list / Shelved products management */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-black text-white px-1">当前在售商品货架 ({list.length})</h3>
            <div className="space-y-2">
              {list.map((p) => (
                <div key={p.id} className="bg-neutral-900 border border-neutral-850 p-2 rounded-xl flex items-center gap-3">
                  <img src={p.cover} className="w-11 h-11 rounded-lg object-cover border border-neutral-800" alt="" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{p.name}</div>
                    <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span className="text-[var(--accent)] font-semibold">¥{p.price}</span>
                      <span>分类: {p.category}</span>
                      <span>已售: {p.sales}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveProduct(p.id)}
                    className="tap p-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/15 text-rose-400 rounded-lg"
                    title="下架删除"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CartSheet open={showCart} onClose={() => setShowCart(false)} cartDetails={cartDetails} total={total} onAdd={add} onSub={sub} onCheckout={checkout} />
      {ordered && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass-strong rounded-2xl px-6 py-4 flex items-center gap-2 animate-sheet-up"><Check size={20} className="txt-accent" /> 下单成功</div>}
    </AppScreen>
  );
}

function CartSheet({ open, onClose, cartDetails, total, onAdd, onSub, onCheckout }: {
  open: boolean; onClose: () => void;
  cartDetails: { productId: string; qty: number; p?: Product }[];
  total: number; onAdd: (id: string) => void; onSub: (id: string) => void; onCheckout: () => void;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      <div className="relative animate-slide-up bg-neutral-900 border-t border-neutral-800 rounded-t-[28px] max-h-[70%] flex flex-col shadow-2xl text-white">
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0 border-b border-neutral-800/60"><div className="font-title text-sm font-bold">🛒 我的购物车</div><button onClick={onClose} className="tap w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400"><X size={15} /></button></div>
        <div className="px-4 pb-4 pt-3 overflow-y-auto no-scrollbar flex-1 space-y-2">
          {cartDetails.length === 0 ? <div className="py-12 text-center text-neutral-500 text-xs">购物车空空如也</div> : cartDetails.map((c) => c.p && (
            <div key={c.productId} className="flex items-center gap-3 bg-neutral-950 rounded-xl p-2.5 border border-neutral-905">
              <img src={c.p.cover} className="w-11 h-11 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0"><div className="text-xs font-bold truncate text-white">{c.p.name}</div><div className="text-xs text-[var(--accent)] mt-0.5">¥{c.p.price}</div></div>
              <div className="flex items-center gap-2"><button onClick={() => onSub(c.productId)} className="tap w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300"><Minus size={13} /></button><span className="text-xs font-black tabular-nums w-5 text-center text-white">{c.qty}</span><button onClick={() => onAdd(c.productId)} className="tap w-7 h-7 rounded-full flex items-center justify-center text-neutral-950" style={{ background: 'var(--accent)' }}><Plus size={13} /></button></div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 pt-3.5 border-t border-neutral-850 flex items-center gap-3"><div className="flex-1"><span className="text-[11px] text-neutral-500">应付合计 </span><span className="text-lg font-black text-[var(--accent)]">¥{total}</span></div><button onClick={onCheckout} disabled={cartDetails.length === 0} className="tap px-6 h-10 rounded-xl font-bold text-xs text-neutral-950 disabled:opacity-50" style={{ background: 'var(--accent)' }}>立即付款结算</button></div>
      </div>
    </div>
  );
}
