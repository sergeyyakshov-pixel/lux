(() => {
  async function loadNews() {
    const container = document.querySelector('#news .cards');

    if (!container) {
      console.error('LUX: контейнер новостей не найден');
      return;
    }

    const url = window.LUX_SUPABASE_URL;
    const key = window.LUX_SUPABASE_ANON_KEY;

    if (!url || !key || !window.supabase?.createClient) {
      console.error('LUX: Supabase не настроен');
      return;
    }

    container.innerHTML =
      '<article class="glass"><h3>Загружаем новости...</h3></article>';

    try {
      const db = window.supabase.createClient(url, key);

      const { data, error } = await db
        .from('lux_news')
        .select('id,title,content,category,created_at')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const escapeHTML = value =>
        String(value ?? '').replace(/[&<>"']/g, c => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        })[c]);

      if (!data || data.length === 0) {
        container.innerHTML =
          '<article class="glass"><h3>Пока нет новостей</h3><p>Следите за обновлениями LUX!</p></article>';
        return;
      }

      container.innerHTML = data.map(news => `
        <article class="glass">
          <span class="pill">${escapeHTML(news.category || 'Новости')}</span>
          <h3>${escapeHTML(news.title)}</h3>
          <p style="white-space:pre-wrap">${escapeHTML(news.content)}</p>
          <small>${escapeHTML(
            news.created_at
              ? new Date(news.created_at).toLocaleDateString('ru-RU')
              : ''
          )}</small>
        </article>
      `).join('');

    } catch (error) {
      console.error('LUX NEWS ERROR:', error);

      container.innerHTML =
        '<article class="glass"><h3>Ошибка загрузки новостей</h3><p>Попробуйте обновить страницу позже.</p></article>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNews);
  } else {
    loadNews();
  }
})();
