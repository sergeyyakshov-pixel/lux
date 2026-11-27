
(() => {
  'use strict';

  const $ = id => document.getElementById(id);

  const form = $('loginForm');
  const status = $('status');

  if (!form || !status) {
    console.error('LUX: loginForm или status не найдены');
    return;
  }

  const URL = window.LUX_SUPABASE_URL;
  const KEY = window.LUX_SUPABASE_ANON_KEY;

  const client = URL && KEY && window.supabase?.createClient
    ? window.supabase.createClient(URL, KEY)
    : null;

  const CATEGORIES = [
    'Новости',
    'Инфраструктура',
    'Мини-игры'
  ];

  let admin = null;
  let adminUserId = null;
  let editingId = null;
  let newsCache = [];
  let vacancyCache = [];

  function message(text, error = false) {
    status.textContent = text;
    status.style.color = error ? '#ff9aaa' : '#9bd0ff';
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function date(value) {
    if (!value) return 'Дата не указана';

    const result = new Date(value);

    return Number.isNaN(result.getTime())
      ? 'Дата не указана'
      : result.toLocaleString('ru-RU');
  }

  function createPanel() {
    if ($('luxDashboard')) return;

    const panel = document.createElement('section');
    panel.id = 'luxDashboard';

    panel.innerHTML = `
      <style>
        #luxDashboard {
          max-width: 900px;
          margin: 30px auto;
          padding: 18px;
          color: #eef4ff;
          font-family: system-ui,sans-serif;
        }

        #luxDashboard .card {
          background: #101b30;
          border: 1px solid #b9d5ff35;
          border-radius: 18px;
          padding: 20px;
          margin-bottom: 18px;
        }

        #luxDashboard input:not([type=checkbox]),
        #luxDashboard textarea,
        #luxDashboard select {
          box-sizing: border-box;
          width: 100%;
          padding: 12px;
          margin: 7px 0 15px;
          border-radius: 10px;
          border: 1px solid #526b91;
          background: #080f1e;
          color: white;
          font: inherit;
        }

        #luxDashboard select option {
          background: #101b30;
        }

        #luxDashboard button {
          padding: 11px 15px;
          margin: 5px;
          border: 0;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
        }

        #luxDashboard button:disabled {
          opacity: .5;
          cursor: wait;
        }

        #luxDashboard .primary {
          background: linear-gradient(130deg,#f4f7fc,#a9b8ce);
          color: #101827;
        }

        #luxDashboard .secondary {
          background: #203653;
          color: white;
        }

        #luxDashboard .success {
          background: #24543f;
          color: white;
        }

        #luxDashboard .danger {
          background: #542c3a;
          color: white;
        }

        #luxDashboard .news,
        #luxDashboard .application {
          padding: 17px;
          margin: 12px 0;
          border: 1px solid #b9d5ff35;
          border-radius: 14px;
          background: #0b1528;
        }

        #luxDashboard .muted {
          color: #a9b8d0;
          font-size: 13px;
        }

        #luxDashboard .badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          background: #8bc5ff20;
          color: #b9d9ff;
          font-size: 12px;
        }

        #luxDashboard .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        #luxDashboard .application p {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        #luxDashboard [hidden] {
          display: none !important;
        }

        @media(max-width:600px) {
          #luxDashboard {
            padding: 10px;
          }
        }
      </style>

      <div class="card">
        <h1>✦ LUX ADMIN</h1>
        <p id="luxAdminName"></p>
        <button class="secondary" id="luxLogout">Выйти</button>
      </div>

      <div class="card">
        <h2 id="formTitle">Создать новость 📰</h2>

        <form id="newsForm">
          <label>Заголовок</label>
          <input id="newsTitle" maxlength="160" required>

          <label>Категория</label>
          <select id="newsCategory" required>
            <option value="Новости">📰 Новости</option>
            <option value="Инфраструктура">🏛️ Инфраструктура</option>
            <option value="Мини-игры">🎮 Мини-игры</option>
          </select>

          <label>Текст публикации</label>
          <textarea
            id="newsContent"
            rows="7"
            maxlength="10000"
            required
          ></textarea>

          <label>
            <input
              id="newsPublished"
              type="checkbox"
              style="width:auto"
            >
            Опубликовать сразу
          </label>

          <div class="toolbar">
            <button class="primary" id="saveNews">
              Сохранить публикацию
            </button>

            <button
              type="button"
              class="secondary"
              id="cancelEdit"
              hidden
            >
              Отмена
            </button>
          </div>
        </form>
      </div>

      <div class="card">
        <h2>📰 Управление публикациями</h2>

        <div class="toolbar">
          <button class="secondary" data-filter="all">Все</button>
          <button class="secondary" data-filter="Новости">📰 Новости</button>
          <button class="secondary" data-filter="Инфраструктура">🏛️ Инфраструктура</button>
          <button class="secondary" data-filter="Мини-игры">🎮 Мини-игры</button>
          <button class="secondary" data-filter="draft">Черновики</button>
        </div>

        <div id="newsList">Загрузка...</div>
      </div>

      <div class="card">
        <h2>📋 Заявки на вакансии</h2>
        <p class="muted">
          Здесь отображаются только заявки на должности,
          ожидающие решения администрации.
        </p>

        <div class="toolbar">
          <button class="secondary" id="refreshVacancies">
            🔄 Обновить заявки
          </button>
        </div>

        <div id="vacancyList">Загрузка заявок...</div>
      </div>
    `;

    const main = document.querySelector('main');

    if (!main) {
      message('На странице не найден элемент main.', true);
      return;
    }

    main.append(panel);

    $('luxAdminName').textContent =
      admin.username + ' · ' + admin.role;

    let activeFilter = 'all';

    // -------------------------
    // НОВОСТИ
    // -------------------------

    async function loadNews() {
      const list = $('newsList');
      list.textContent = 'Загружаем публикации...';

      const { data, error } = await client
        .from('lux_news')
        .select('id,title,content,category,published,created_at')
        .order('created_at', { ascending: false });

      if (error) {
        list.textContent = 'Ошибка: ' + error.message;
        return;
      }

      newsCache = data || [];
      renderNews();
    }

    function renderNews() {
      const list = $('newsList');

      let items = newsCache;

      if (activeFilter === 'draft') {
        items = items.filter(item => !item.published);
      } else if (activeFilter !== 'all') {
        items = items.filter(
          item => item.category === activeFilter
        );
      }

      if (!items.length) {
        list.textContent = 'В этой категории пока нет публикаций.';
        return;
      }

      list.innerHTML = items.map(item => `
        <article class="news">
          <div class="toolbar">
            <span class="badge">
              ${esc(item.category || 'Новости')}
            </span>

            <span class="muted">
              ${item.published ? 'Опубликована' : 'Черновик'}
            </span>
          </div>

          <h3>${esc(item.title)}</h3>

          <p style="white-space:pre-wrap">${esc(item.content)}</p>

          <small class="muted">
            ${esc(date(item.created_at))}
          </small>

          <div class="toolbar">
            <button class="secondary" data-edit="${esc(item.id)}">
              ✏️ Изменить
            </button>

            <button class="secondary" data-publish="${esc(item.id)}">
              ${item.published
                ? 'Снять с публикации'
                : 'Опубликовать'}
            </button>

            ${admin.role === 'owner' ? `
              <button class="danger" data-delete="${esc(item.id)}">
                🗑️ Удалить
              </button>
            ` : ''}
          </div>
        </article>
      `).join('');
    }

    function resetForm() {
      editingId = null;
      $('newsForm').reset();

      $('newsCategory').value = 'Новости';
      $('formTitle').textContent = 'Создать новость 📰';
      $('saveNews').textContent = 'Сохранить публикацию';
      $('cancelEdit').hidden = true;
    }

    $('newsForm').addEventListener('submit', async event => {
      event.preventDefault();

      const button = $('saveNews');
      button.disabled = true;

      try {
        const payload = {
          title: $('newsTitle').value.trim(),
          category: $('newsCategory').value,
          content: $('newsContent').value.trim(),
          published: $('newsPublished').checked
        };

        if (!payload.title || !payload.content) {
          throw new Error('Заполни заголовок и текст.');
        }

        if (!CATEGORIES.includes(payload.category)) {
          throw new Error('Неизвестная категория.');
        }

        const result = editingId
          ? await client
              .from('lux_news')
              .update(payload)
              .eq('id', editingId)
          : await client
              .from('lux_news')
              .insert(payload);

        if (result.error) throw result.error;

        resetForm();
        await loadNews();

        message('Публикация успешно сохранена! ✦');

      } catch (error) {
        message('Ошибка: ' + error.message, true);
      } finally {
        button.disabled = false;
      }
    });

    $('cancelEdit').addEventListener('click', resetForm);

    panel.querySelectorAll('[data-filter]').forEach(button => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        renderNews();
      });
    });

    $('newsList').addEventListener('click', async event => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const edit = target.closest('[data-edit]');
      const publish = target.closest('[data-publish]');
      const remove = target.closest('[data-delete]');

      try {
        if (edit) {
          const item = newsCache.find(
            news => String(news.id) === edit.dataset.edit
          );

          if (!item) throw new Error('Публикация не найдена.');

          editingId = item.id;

          $('newsTitle').value = item.title;
          $('newsCategory').value = item.category || 'Новости';
          $('newsContent').value = item.content;
          $('newsPublished').checked = item.published;

          $('formTitle').textContent = 'Редактирование публикации';
          $('saveNews').textContent = 'Сохранить изменения';
          $('cancelEdit').hidden = false;

          panel.scrollIntoView({ behavior: 'smooth' });
        }

        if (publish) {
          const item = newsCache.find(
            news => String(news.id) === publish.dataset.publish
          );

          if (!item) throw new Error('Публикация не найдена.');

          const { error } = await client
            .from('lux_news')
            .update({ published: !item.published })
            .eq('id', item.id);

          if (error) throw error;

          await loadNews();
          message('Статус публикации изменён.');
        }

        if (remove) {
          if (admin.role !== 'owner') {
            throw new Error('Недостаточно прав.');
          }

          if (!confirm('Удалить публикацию без возможности восстановления?')) {
            return;
          }

          const { error } = await client
            .from('lux_news')
            .delete()
            .eq('id', remove.dataset.delete);

          if (error) throw error;

          await loadNews();
          message('Публикация удалена.');
        }

      } catch (error) {
        message('Ошибка: ' + error.message, true);
      }
    });

    // -------------------------
    // ЗАЯВКИ НА ВАКАНСИИ
    // -------------------------

    let vacancyFilter = 'all';
    let vacancyBusy = false;

    const VACANCY_STATUSES = {
      pending: 'Ожидает рассмотрения',
      approved: 'Одобрена',
      rejected: 'Отклонена'
    };

    async function loadVacancies() {
      const list = $('vacancyList');
      list.textContent = 'Загружаем заявки...';

      const { data, error } = await client
        .from('lux_applications')
        .select(`
          id,
          minecraft_nickname,
          telegram,
          message,
          status,
          created_at,
          application_type,
          position,
          admin_comment,
          reviewed_by,
          reviewed_at
        `)
        .eq('application_type', 'vacancy')
        .order('created_at', { ascending: false });

      if (error) {
        list.textContent = 'Ошибка: ' + error.message;
        return;
      }

      vacancyCache = data || [];
      renderVacancies();
    }

    function renderVacancies() {
      const list = $('vacancyList');
      const count = $('vacancyCount');

      let items = vacancyCache;

      if (vacancyFilter !== 'all') {
        items = items.filter(
          item => item.status === vacancyFilter
        );
      }

      if (count) {
        count.textContent =
          `Всего заявок: ${vacancyCache.length} · Показано: ${items.length}`;
      }

      if (!items.length) {
        list.textContent = 'В этой категории заявок пока нет.';
        return;
      }

      list.innerHTML = items.map(item => {
        const pending = item.status === 'pending';

        const statusText =
          VACANCY_STATUSES[item.status] || item.status;

        return `
          <article class="application">

            <div class="toolbar">
              <span class="badge">
                ${esc(statusText)}
              </span>

              <span class="muted">
                ${esc(date(item.created_at))}
              </span>
            </div>

            <h3>👤 ${esc(item.minecraft_nickname)}</h3>

            <p>
              <strong>Должность:</strong>
              ${esc(item.position || 'Не указана')}
            </p>

            <p>
              <strong>Telegram:</strong>
              ${esc(item.telegram || 'Не указан')}
            </p>

            <p>
              <strong>Сообщение:</strong><br>
              ${esc(item.message || 'Без сообщения')}
            </p>

            ${!pending ? `
              <div class="muted">
                <p>
                  <strong>Дата рассмотрения:</strong>
                  ${esc(date(item.reviewed_at))}
                </p>

                <p>
                  <strong>Комментарий администрации:</strong><br>
                  ${esc(item.admin_comment || 'Не указан')}
                </p>
              </div>
            ` : ''}

            ${pending ? `
              <div class="toolbar">

                <button
                  class="success"
                  data-approve="${esc(item.id)}"
                  ${vacancyBusy ? 'disabled' : ''}
                >
                  ✓ Одобрить
                </button>

                <button
                  class="danger"
                  data-reject="${esc(item.id)}"
                  ${vacancyBusy ? 'disabled' : ''}
                >
                  ✕ Отклонить
                </button>

              </div>
            ` : ''}

          </article>
        `;
      }).join('');
    }

    async function reviewVacancy(id, newStatus) {
      if (vacancyBusy) return;

      if (!['approved', 'rejected'].includes(newStatus)) {
        throw new Error('Неизвестный статус заявки.');
      }

      const application = vacancyCache.find(
        item => String(item.id) === String(id)
      );

      if (!application || application.status !== 'pending') {
        throw new Error('Заявка уже обработана или не найдена.');
      }

      let comment = '';

      if (newStatus === 'rejected') {
        comment = prompt('Укажи причину отклонения:');

        if (comment === null) return;

        comment = comment.trim();

        if (!comment) {
          throw new Error('Причина отклонения обязательна.');
        }
      } else {
        comment = prompt(
          'Комментарий администрации (необязательно):'
        );

        if (comment === null) return;

        comment = comment.trim();
      }

      vacancyBusy = true;
      renderVacancies();

      try {
        const { data, error } = await client
          .from('lux_applications')
          .update({
            status: newStatus,
            reviewed_by: adminUserId,
            reviewed_at: new Date().toISOString(),
            admin_comment: comment || null
          })
          .eq('id', id)
          .eq('application_type', 'vacancy')
          .eq('status', 'pending')
          .select('id');

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error(
            'Заявка не обновлена. Проверь права Supabase.'
          );
        }

        message(
          newStatus === 'approved'
            ? 'Заявка одобрена! ✓'
            : 'Заявка отклонена. ✕'
        );

        await loadVacancies();

      } finally {
        vacancyBusy = false;
        renderVacancies();
      }
    }

    $('vacancyList').addEventListener('click', async event => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const approve = target.closest('[data-approve]');
      const reject = target.closest('[data-reject]');

      try {
        if (approve) {
          await reviewVacancy(
            approve.dataset.approve,
            'approved'
          );
        }

        if (reject) {
          await reviewVacancy(
            reject.dataset.reject,
            'rejected'
          );
        }

      } catch (error) {
        message('Ошибка модерации: ' + error.message, true);
      }
    });

    $('vacancyFilters').addEventListener('click', event => {
      const button = event.target.closest('[data-vacancy-filter]');

      if (!button) return;

      vacancyFilter = button.dataset.vacancyFilter;

      $('vacancyFilters')
        .querySelectorAll('button')
        .forEach(item => {
          item.className =
            item === button ? 'primary' : 'secondary';
        });

      renderVacancies();
    });

    $('refreshVacancies').addEventListener('click', async () => {
      await loadVacancies();
      message('Заявки обновлены.');
    });

    // -------------------------
    // ВЫХОД
    // -------------------------

    $('luxLogout').addEventListener('click', async () => {
      const { error } = await client.auth.signOut();

      if (error) {
        message('Ошибка выхода: ' + error.message, true);
        return;
      }

      panel.remove();
      admin = null;
      adminUserId = null;
      message('Вы вышли из системы.');
    });

    loadNews();
    loadVacancies();
  }

  // -------------------------
  // ПРОВЕРКА АДМИНИСТРАТОРА
  // -------------------------

  async function authorize(user) {
    if (!user) {
      admin = null;
      adminUserId = null;
      return;
    }

    const { data, error } = await client
      .from('lux_admins')
      .select('username,role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data || !['owner', 'editor'].includes(data.role)) {
      await client.auth.signOut();
      throw new Error('Нет доступа к панели LUX ADMIN.');
    }

    admin = data;
    adminUserId = user.id;

    createPanel();
  }

  // -------------------------
  // ВХОД
  // -------------------------

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!client) {
      message('Проверь настройки Supabase.', true);
      return;
    }

    const button = form.querySelector('button[type="submit"]');

    if (button) button.disabled = true;

    message('Выполняется вход...');

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: $('email').value.trim(),
        password: $('password').value
      });

      if (error) throw error;

      await authorize(data.user);

      message('Добро пожаловать в LUX ADMIN! ✦');

    } catch (error) {
      message('Ошибка: ' + error.message, true);
    } finally {
      if (button) button.disabled = false;
    }
  });

  // -------------------------
  // ВОССТАНОВЛЕНИЕ СЕССИИ
  // -------------------------

  async function initialize() {
    if (!client) {
      message('Supabase не настроен.', true);
      return;
    }

    try {
      const { data, error } = await client.auth.getSession();

      if (error) throw error;

      if (data.session?.user) {
        await authorize(data.session.user);
        message('Сессия восстановлена.');
      }

      client.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          admin = null;
          adminUserId = null;
          $('luxDashboard')?.remove();
        }
      });

    } catch (error) {
      message(
        'Ошибка восстановления сессии: ' + error.message,
        true
      );
    }
  }

  initialize();
})();
