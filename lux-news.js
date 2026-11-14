
(() => {
  async function loadNews() {
    const container = document.querySelector('#news .grid');
    if (!container) {
      console.error('LUX: контейнер новостей не найден');
      return;
    }

    const url = window.LUX_SUPABASE_URL;
    const key = window.LUX_SUPABASE_ANON_KEY;

    if (!url || !key || !window.supabase) {
      console.error('LUX: Supabase не настроен');
      return;
    }

    const db = window.supabase.createClient(url, key);

    container.innerHTML =
      '<article class="card"><h3>Загружаем новости...</h3></article>';

    const { data, error } = await db
      .from('lux_news')
      .select('id,title,content,category,created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('LUX NEWS ERROR:', error);
      container.innerHTML =
        '<article class="card"><h3>Ошибка загрузки новостей</h3><p>Проверьте подключение к базе.</p></article>';
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML =
        '<article class="card"><h3>Пока нет новостей</h3></article>';
      return;
    }

    const escapeHTML = value =>
      String(value ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[c]);

    container.innerHTML = data.map(news => `
      <article class="card">
        <span class="tag">${escapeHTML(news.category || 'Новости')}</span>
        <h3>${escapeHTML(news.title)}</h3>
        <p style="white-space:pre-wrap">${escapeHTML(news.content)}</p>
        <small class="muted">
          ${escapeHTML(new Date(news.created_at).toLocaleDateString('ru-RU'))}
        </small>
      </article>
    `).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNews);
  } else {
    loadNews();
  }
})();
