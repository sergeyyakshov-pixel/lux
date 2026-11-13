
(() => {
  const loadNews = async () => {
    const container = document.querySelector('#news .cards');
    if (!container) {
      console.error('LUX: не найден #news .cards');
      return;
    }

    const url = window.LUX_SUPABASE_URL;
    const key = window.LUX_SUPABASE_ANON_KEY;

    if (!url || !key || !window.supabase) {
      container.textContent = 'Не удалось подключиться к базе новостей.';
      return;
    }

    const db = window.supabase.createClient(url, key);

    container.innerHTML = '<article class="glass">Загружаем новости...</article>';

    const { data, error } = await db
      .from('lux_news')
      .select('id,title,content,category,created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('LUX news:', error);
      container.innerHTML =
        '<article class="glass"><h3>Ошибка загрузки новостей</h3><p>Попробуйте обновить страницу.</p></article>';
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML =
        '<article class="glass"><h3>Пока нет новостей</h3><p>Следите за обновлениями LUX!</p></article>';
      return;
    }

    const escapeHTML = value =>
      String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]);

    container.innerHTML = data.map(news => {
      const date = news.created_at
        ? new Date(news.created_at).toLocaleDateString('ru-RU')
        : '';

      return `
        <article class="glass">
          <span class="pill">${escapeHTML(news.category || 'Новости')}</span>
          <h3>${escapeHTML(news.title)}</h3>
          <p style="white-space:pre-wrap">${escapeHTML(news.content)}</p>
          <small>${escapeHTML(date)}</small>
        </article>
      `;
    }).join('');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNews);
  } else {
    loadNews();
  }
})();
