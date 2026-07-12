/**
 * service-worker.js
 * オフライン起動用。index.html のみをキャッシュする（Cache First）。
 *
 * 重要：index.html の中身を更新するたびに、下の CACHE_VERSION を
 * 必ず変更すること（例：日時を書き換える）。
 * これを忘れると、ブラウザがこのファイル自体の変化を検知できず、
 * 古いキャッシュのindex.htmlが配信され続けてしまう。
 */

const CACHE_VERSION = '20260713-0100'; // ← index.html更新時は必ずここを変更する
const CACHE_NAME = `dailyplanner-ai-${CACHE_VERSION}`;
const APP_SHELL = ['./', './index.html'];

self.addEventListener('install', (event) => {
  // 待機せず、新しいSWをすぐにインストール状態から先へ進める
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim()) // 既に開いているタブもすぐ新SWの管理下に置く
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});
