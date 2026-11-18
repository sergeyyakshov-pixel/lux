(() => {
  async function loadNews() {
    const containers = {
      'Новости': document.getElementById('newsGeneral'),
      'Инфраструктура': document.getElementById('newsInfrastructure'),
      'Мини-игры': document.getElementById('newsGames')
    };

    const showMessage = (container, title, message = '') => {
      if (!container) return;

      container.innerHTML = `
        <article class="glass">
          <h3>${title}</h3>
          ${message ? `<p>${message}</p>` : ''}
        </article>
      `;
    };

    if (Object.values(containers).some(container => !container)) {
      console.error('LUX: не найдены контейнеры категорий новостей');

      Object.values(containers).forEach(container => {
        showMessage(container, 'Ошибка отображения');
      });
      return;
    }

    const url = window.LUX_SUPABASE_URL;
    const key = window.LUX_SUPABASE_ANON_KEY;

    if (!url || !key || !window.supabase?.createClient) {
      console.error('LUX: Supabase не настроен');

      Object.values(containers).forEach(container => {
        showMessage(container, 'Новости временно недоступны');
      });
      return;
    }

    Object.values(containers).forEach(container => {
      showMessage(container, 'Загружаем публикации...');
    });

    try {
      const db = window.supabase.createClient(url, key);

      const { data, error } = await db
        .from('lux_news')
        .select('id,title,content,category,created_at')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const escapeHTML = value =>
        String(value ?? '').replace(/[&<>"']/g, char => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        })[char]);

      const grouped = {
        'Новости': [],
        'Инфраструктура': [],
        'Мини-игры': []
      };

      (data || []).forEach(news => {
        const category = String(news.category || 'Новости').trim();

        if (grouped[category]) {
          grouped[category].push(news);
        } else {
          console.warn('LUX: неизвестная категория публикации:', category);
        }
      });

      Object.entries(grouped).forEach(([category, newsList]) => {
        const container = containers[category];

        if (newsList.length === 0) {
          showMessage(
            container,
            'Пока нет публикаций',
            'Следите за обновлениями LUX!'
          );
          return;
        }

        container.innerHTML = newsList.map(news => `
          <article class="glass">
            <span class="pill">${escapeHTML(category)}</span>
            <h3>${escapeHTML(news.title)}</h3>
            <p style="white-space: pre-wrap">${escapeHTML(news.content)}</p>
            <small>
              ${escapeHTML(
                news.created_at
                  ? new Date(news.created_at).toLocaleDateString('ru-RU')
                  : ''
              )}
            </small>
          </article>
        `).join('');
      });

    } catch (error) {
      console.error('LUX NEWS ERROR:', error);

      Object.values(containers).forEach(container => {
        showMessage(
          container,
          'Ошибка загрузки публикаций',
          'Попробуйте обновить страницу позже.'
        );
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNews);
  } else {
    loadNews();
  }
})();

