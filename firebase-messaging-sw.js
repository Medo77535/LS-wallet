// firebase-messaging-sw.js
/* global importScripts, firebase, self */
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

  // نفس إعدادات الصفحة
  firebase.initializeApp({
    apiKey: "AIzaSyCHVcGostwCnIvJXsjX60xWWVqF_RAbzn4",
    authDomain: "medo-cf169.firebaseapp.com",
    projectId: "medo-cf169",
    storageBucket: "medo-cf169.firebasestorage.app",
    messagingSenderId: "265864107835",
    appId: "1:265864107835:web:0f78740bdc24f4661c091e",
    measurementId: "G-10R049D0BD"
  });

  const messaging = firebase.messaging();

  // استلام الرسالة في الخلفية (عند عدم وجود تبويب فوكس)
  messaging.onBackgroundMessage((payload) => {
    // payload.notification متوفرة عندما ترسل من FCM باستخدام notification body
    const n = payload.notification || {};
    const data = payload.data || {};

    const title = n.title || 'إشعار جديد';
    const options = {
      body: n.body || '',
      icon:  n.icon || '/icons/icon-192.png',      // اختياري: غيّره إن وجد
      badge: n.badge || '/icons/badge-72.png',     // اختياري
      data: {
        // نمرر بيانات مفيدة لحدث click
        url:  data.url || data.link || data.redir || '/', // أين نفتح عند النقر
        ...data
      }
    };

    self.registration.showNotification(title, options);
  });

  // عند النقر على الإشعار: افتح/ركّز تبويب الموقع
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || '/';

    event.waitUntil((async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

      // إن كان فيه تبويب مفتوح لنفس الأصل، ركّزه وغيّر عنوانه إذا نحتاج
      for (const client of allClients) {
        try {
          const cUrl = new URL(client.url);
          // نفس الأصل فقط
          if (cUrl.origin === self.location.origin) {
            // لو نحتاج نوديه لمسار/صفحة معيّنة
            if (targetUrl && client.url !== targetUrl) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        } catch (_) {}
      }

      // لا يوجد تبويب مناسب: افتح واحد جديد
      return self.clients.openWindow(targetUrl);
    })());
  });

} catch (e) {
  // لو صار خطأ مبكر (مثلاً importScripts فشل)، نسجله للديباغ
  console.error('[SW] init error:', e);
}
