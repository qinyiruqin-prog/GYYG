const CACHE_VERSION = 'yangyangji-v2.1-20260724';
const RUNTIME_CACHE = 'yangyangji-runtime-v2.1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// 安装事件 - 预缓存核心资源
self.addEventListener('install', (e) => {
  console.log('[SW] 安装中...');
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        console.log('[SW] 预缓存资源');
        return cache.addAll(ASSETS);
      })
      .catch((err) => {
        console.error('[SW] 预缓存失败:', err);
      })
  );
  self.skipWaiting(); // 强制激活新版本
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (e) => {
  console.log('[SW] 激活中...');
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // 删除旧版本缓存
            return cacheName !== CACHE_VERSION && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim(); // 立即接管所有页面

  // 通知客户端更新可用
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'SW_UPDATED' });
    });
  });
});

// 获取事件 - 网络优先策略（确保实时更新）
self.addEventListener('fetch', (e) => {
  const { request } = e;

  // 只处理 GET 请求
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 只处理同源请求
  if (url.origin !== location.origin) return;

  // API 请求直接走网络
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(request));
    return;
  }

  // 网络优先策略（确保获取最新内容）
  e.respondWith(
    fetch(request)
      .then((response) => {
        // 检查响应是否有效
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 克隆响应并缓存
        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // 网络失败时使用缓存
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] 使用缓存:', request.url);
            return cachedResponse;
          }

          // 如果是导航请求且没有缓存，返回离线页面
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }

          return new Response('离线状态，资源不可用', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// 监听消息事件
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // 手动触发缓存清理
  if (e.data && e.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      e.ports[0].postMessage({ success: true });
    });
  }
});
