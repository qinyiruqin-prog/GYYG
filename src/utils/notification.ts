/**
 * 通知工具函数
 * 用于在角色主动发送消息时显示系统通知
 */

// 请求通知权限
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('浏览器不支持通知功能');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// 检查用户是否在当前页面
export function isPageVisible(): boolean {
  return document.visibilityState === 'visible';
}

// 发送通知
export function sendNotification(options: {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}) {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  // 如果用户正在当前页面，不发送通知
  if (isPageVisible()) {
    return;
  }

  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon || '/icon.png',
    tag: options.tag || 'chat-message',
    badge: options.icon || '/icon.png',
  });

  if (options.onClick) {
    notification.onclick = () => {
      window.focus();
      options.onClick?.();
      notification.close();
    };
  }

  // 5秒后自动关闭
  setTimeout(() => notification.close(), 5000);
}
