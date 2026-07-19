import { useState } from 'react';
import { Star, Clock, Bike, Search, Plus, Minus, ShoppingCart, Check, X } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import type { Restaurant, CartItem } from '../types';

// Pexels food photos (stock)
const IMG = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;

const SEED_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1', name: '兰州拉面馆', cover: IMG('2347313'), rating: 4.6, sales: 1280, deliveryFee: 3, deliveryTime: '25分钟', tags: ['面食', '快餐', '热汤'],
    dishes: [
      { id: 'd1', name: '招牌牛肉拉面', price: 18, desc: '手工拉面，醇厚牛骨汤底', image: IMG('2347313'), popular: true },
      { id: 'd2', name: '牛肉拌面', price: 20, desc: '酱香浓郁，配卤牛肉', image: IMG('1438605256886' ) },
      { id: 'd3', name: '小菜拼盘', price: 12, desc: '凉拌三丝+卤蛋', image: IMG('1213710') },
    ],
  },
  {
    id: 'r2', name: '日式寿司屋', cover: IMG('2098085'), rating: 4.8, sales: 860, deliveryFee: 5, deliveryTime: '35分钟', tags: ['日料', '寿司', '轻食'],
    dishes: [
      { id: 'd4', name: '三文鱼刺身', price: 38, desc: '挪威三文鱼，现切现送', image: IMG('2098085'), popular: true },
      { id: 'd5', name: '什锦寿司拼盘', price: 58, desc: '8件握寿司+6件卷', image: IMG('2284168') },
      { id: 'd6', name: '味噌汤', price: 8, desc: '日式家常味噌', image: IMG('566560') },
    ],
  },
  {
    id: 'r3', name: '川味小炒', cover: IMG('1279330'), rating: 4.5, sales: 2100, deliveryFee: 2, deliveryTime: '20分钟', tags: ['川菜', '辣', '下饭'],
    dishes: [
      { id: 'd7', name: '麻婆豆腐', price: 22, desc: '麻辣鲜香，下饭神器', image: IMG('1279330'), popular: true },
      { id: 'd8', name: '宫保鸡丁', price: 28, desc: '花生鸡丁，酸甜微辣', image: IMG('2310525') },
      { id: 'd9', name: '鱼香肉丝', price: 24, desc: '经典家常菜', image: IMG('675951') },
    ],
  },
  {
    id: 'r4', name: '轻食沙拉吧', cover: IMG('1213710'), rating: 4.7, sales: 540, deliveryFee: 4, deliveryTime: '30分钟', tags: ['轻食', '健康', '沙拉'],
    dishes: [
      { id: 'd10', name: '牛油果鸡胸沙拉', price: 32, desc: '低脂高蛋白', image: IMG('1213710'), popular: true },
      { id: 'd11', name: '酸奶水果碗', price: 26, desc: '希腊酸奶+时令水果', image: IMG('1099680') },
    ],
  },
];

export function WaimaiScreen({
  restaurants,
  onChangeRestaurants,
  cart,
  onChangeCart,
  onBack,
}: {
  restaurants: Restaurant[];
  onChangeRestaurants: (r: Restaurant[]) => void;
  cart: CartItem[];
  onChangeCart: (c: CartItem[]) => void;
  onBack: () => void;
}) {
  const list = restaurants.length > 0 ? restaurants : SEED_RESTAURANTS;
  const [q, setQ] = useState('');
  const [active, setActive] = useState<Restaurant | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [ordered, setOrdered] = useState(false);

  // ensure seed loaded
  if (restaurants.length === 0) onChangeRestaurants(SEED_RESTAURANTS);

  const filtered = list.filter((r) => r.name.includes(q) || r.tags.some((t) => t.includes(q)));
  const qtyOf = (dishId: string) => cart.find((c) => c.productId === dishId)?.qty ?? 0;
  const add = (dishId: string) => {
    const ex = cart.find((c) => c.productId === dishId);
    if (ex) onChangeCart(cart.map((c) => c.productId === dishId ? { ...c, qty: c.qty + 1 } : c));
    else onChangeCart([...cart, { productId: dishId, qty: 1 }]);
  };
  const sub = (dishId: string) => {
    const ex = cart.find((c) => c.productId === dishId);
    if (!ex) return;
    if (ex.qty <= 1) onChangeCart(cart.filter((c) => c.productId !== dishId));
    else onChangeCart(cart.map((c) => c.productId === dishId ? { ...c, qty: c.qty - 1 } : c));
  };

  // build cart details from all restaurants
  const allDishes = list.flatMap((r) => r.dishes.map((d) => ({ d, r })));
  const cartDetails = cart.map((c) => ({ ...c, dish: allDishes.find((x) => x.d.id === c.productId)?.d })).filter((x) => x.dish);
  const total = cartDetails.reduce((s, x) => s + (x.dish!.price * x.qty), 0);
  const totalCount = cart.reduce((s, c) => s + c.qty, 0);

  const placeOrder = () => { onChangeCart([]); setShowCart(false); setOrdered(true); setTimeout(() => setOrdered(false), 2500); };

  // restaurant detail
  if (active) {
    return (
      <AppScreen title={active.name} onBack={() => setActive(null)} noPad>
        <img src={active.cover} className="w-full h-32 object-cover" alt="" />
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <div className="font-title text-lg">{active.name}</div>
          <div className="flex items-center gap-3 text-[12px] txt-faint mt-1">
            <span className="flex items-center gap-0.5"><Star size={12} className="txt-accent fill-current" /> {active.rating}</span>
            <span>月售{active.sales}</span>
            <span className="flex items-center gap-0.5"><Clock size={12} /> {active.deliveryTime}</span>
            <span className="flex items-center gap-0.5"><Bike size={12} /> ¥{active.deliveryFee}配送</span>
          </div>
          <div className="flex gap-1.5 mt-2">{active.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded-full text-[11px] glass txt-dim">{t}</span>)}</div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {active.dishes.map((d) => (
            <div key={d.id} className="flex gap-3 px-4 py-3 border-b border-[var(--border)]">
              <img src={d.image} className="w-20 h-20 rounded-xl object-cover shrink-0" alt="" />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium">{d.name}{d.popular && <span className="ml-1.5 text-[10px] txt-accent px-1.5 py-px rounded-full" style={{ background: 'var(--icon-bg-active)' }}>招牌</span>}</div>
                <div className="text-[12px] txt-faint mt-0.5 line-clamp-2">{d.desc}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[16px] txt-accent font-bold">¥{d.price}</span>
                  <div className="flex items-center gap-2">
                    {qtyOf(d.id) > 0 && <button onClick={() => sub(d.id)} className="tap w-7 h-7 rounded-full glass flex items-center justify-center"><Minus size={14} /></button>}
                    {qtyOf(d.id) > 0 && <span className="text-[14px] tabular-nums w-5 text-center">{qtyOf(d.id)}</span>}
                    <button onClick={() => add(d.id)} className="tap w-7 h-7 rounded-full flex items-center justify-center text-[var(--bg)]" style={{ background: 'var(--accent)' }}><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {totalCount > 0 && (
          <div className="px-4 py-3 border-t border-[var(--border)] flex items-center gap-3 bg-[var(--bg-soft)]">
            <button onClick={() => setShowCart(true)} className="tap relative w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <ShoppingCart size={20} className="text-[var(--bg)]" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white" style={{ background: 'var(--danger)' }}>{totalCount}</span>
            </button>
            <div className="flex-1"><span className="text-[18px] font-bold txt-accent">¥{total}</span></div>
            <button onClick={() => setShowCart(true)} className="tap px-5 h-11 rounded-full font-medium text-[var(--bg)]" style={{ background: 'var(--accent)' }}>去结算</button>
          </div>
        )}
        <CartSheet open={showCart} onClose={() => setShowCart(false)} cartDetails={cartDetails} total={total} onAdd={add} onSub={sub} onOrder={placeOrder} />
        {ordered && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass-strong rounded-2xl px-6 py-4 flex items-center gap-2 animate-sheet-up"><Check size={20} className="txt-accent" /> 下单成功！</div>}
      </AppScreen>
    );
  }

  return (
    <AppScreen title="外卖" onBack={onBack} noPad>
      <div className="px-4 pt-3 pb-2 sticky top-0 app-bg z-10">
        <div className="flex items-center gap-2 glass rounded-xl px-3 h-10">
          <Search size={16} className="txt-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索餐厅或美食" className="flex-1 bg-transparent outline-none text-[14px]" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-3">
        {filtered.map((r) => (
          <button key={r.id} onClick={() => setActive(r)} className="tap w-full glass rounded-2xl overflow-hidden text-left">
            <img src={r.cover} className="w-full h-28 object-cover" alt="" />
            <div className="p-3">
              <div className="font-title text-[15px]">{r.name}</div>
              <div className="flex items-center gap-3 text-[12px] txt-faint mt-1">
                <span className="flex items-center gap-0.5"><Star size={12} className="txt-accent fill-current" /> {r.rating}</span>
                <span>月售{r.sales}</span>
                <span className="flex items-center gap-0.5"><Clock size={12} /> {r.deliveryTime}</span>
                <span>¥{r.deliveryFee}配送</span>
              </div>
              <div className="flex gap-1.5 mt-1.5">{r.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded-full text-[10px] glass txt-dim">{t}</span>)}</div>
            </div>
          </button>
        ))}
      </div>
      {totalCount > 0 && (
        <div className="px-4 py-2.5 border-t border-[var(--border)] flex items-center gap-3">
          <button onClick={() => setShowCart(true)} className="tap relative w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <ShoppingCart size={20} className="text-[var(--bg)]" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white" style={{ background: 'var(--danger)' }}>{totalCount}</span>
          </button>
          <div className="flex-1"><span className="text-[16px] font-bold txt-accent">¥{total}</span></div>
          <button onClick={() => setShowCart(true)} className="tap px-5 h-10 rounded-full font-medium text-[var(--bg)]" style={{ background: 'var(--accent)' }}>结算</button>
        </div>
      )}
      <CartSheet open={showCart} onClose={() => setShowCart(false)} cartDetails={cartDetails} total={total} onAdd={add} onSub={sub} onOrder={placeOrder} />
      {ordered && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass-strong rounded-2xl px-6 py-4 flex items-center gap-2 animate-sheet-up"><Check size={20} className="txt-accent" /> 下单成功！</div>}
    </AppScreen>
  );
}

function CartSheet({ open, onClose, cartDetails, total, onAdd, onSub, onOrder }: {
  open: boolean; onClose: () => void;
  cartDetails: { productId: string; qty: number; dish?: { id: string; name: string; price: number; image: string } }[];
  total: number; onAdd: (id: string) => void; onSub: (id: string) => void; onOrder: () => void;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative animate-slide-up glass-strong rounded-t-[28px] max-h-[70%] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <div className="font-title text-base">购物车</div>
          <button onClick={onClose} className="tap w-7 h-7 rounded-full glass flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="px-4 pb-4 overflow-y-auto no-scrollbar flex-1 space-y-2">
          {cartDetails.length === 0 ? <div className="py-10 text-center txt-faint">购物车是空的</div> : cartDetails.map((c) => c.dish && (
            <div key={c.productId} className="flex items-center gap-3 glass rounded-xl p-2.5">
              <img src={c.dish.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
              <div className="flex-1 min-w-0"><div className="text-[14px] truncate">{c.dish.name}</div><div className="text-[13px] txt-accent">¥{c.dish.price}</div></div>
              <div className="flex items-center gap-2">
                <button onClick={() => onSub(c.productId)} className="tap w-7 h-7 rounded-full glass flex items-center justify-center"><Minus size={14} /></button>
                <span className="text-[14px] tabular-nums w-5 text-center">{c.qty}</span>
                <button onClick={() => onAdd(c.productId)} className="tap w-7 h-7 rounded-full flex items-center justify-center text-[var(--bg)]" style={{ background: 'var(--accent)' }}><Plus size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 pt-2 border-t border-[var(--border)] flex items-center gap-3">
          <div className="flex-1"><span className="text-[12px] txt-faint">合计 </span><span className="text-[20px] font-bold txt-accent">¥{total}</span></div>
          <button onClick={onOrder} disabled={cartDetails.length === 0} className="tap px-6 h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>下单</button>
        </div>
      </div>
    </div>
  );
}
