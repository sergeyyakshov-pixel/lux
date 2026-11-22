const $ = id => document.getElementById(id);

const STORE = 'lux_ai_chats_v2';

let chats = [];

try {
  chats = JSON.parse(localStorage.getItem(STORE) || '[]');
} catch {
  chats = [];
}

let activeId = null;

/* НАСТРОЙКИ SUPABASE */

const SUPABASE_URL = 'https://hxdlrvrymoffsjebereh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-FBkXbHAFe9PYVBJZjcCQ_5drtgLhB';

/* СОХРАНЕНИЕ ЧАТОВ */

function persist() {
  try {
    localStorage.setItem(STORE, JSON.stringify(chats));
  } catch (error) {
    console.error('LUX AI: ошибка сохранения истории', error);
  }
}

function createChat() {
  const chat = {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    title: 'Новый чат',
    messages: []
  };

  chats.unshift(chat);
  activeId = chat.id;
  persist();
  draw();
}

function current() {
  return chats.find(chat => chat.id === activeId);
}

function draw() {
  const box = $('messages');
  if (!box) return;

  box.innerHTML = '';

  const chat = current();

  if (!chat) {
    box.textContent = 'Нажми «Новый чат», чтобы начать.';
    return;
  }

  for (const message of chat.messages) {
    const element = document.createElement('div');

    element.className =
      'msg ' + (message.role === 'user' ? 'user' : '');

    element.textContent = message.text;
    box.append(element);
  }

  box.scrollTop = box.scrollHeight;
}

function open() {
  $('chat')?.classList.add('open');

  if (!activeId) {
    if (chats.length) {
      activeId = chats[0].id;
    } else {
      createChat();
    }
  }

  draw();
}

/* ОТВЕТЫ LUX AI */

function reply(question) {
  const text = question.toLowerCase();

  if (/привет|здравств|хай|добрый/.test(text)) {
    return 'Привет! 👋 Я LUX AI — дружелюбный помощник. Спрашивай о городе LUX или Minecraft.';
  }

  if (/кто основател|основател|администрац/.test(text)) {
    return 'Основатели и главные администраторы LUX: GienaSergo01 и XXOmegaRavenXX.';
  }

  if (/истори|когда появился|когда основан|появилс/.test(text)) {
    return 'Идея создать LUX появилась весной 2026 года по предложению GienaSergo01. Раньше LUX был небольшим магазином, который позже разросся в город.';
  }

  if (/правил|грифер|вороват|ломать/.test(text)) {
    return 'В городе запрещено гриферить, воровать чужие ресурсы и ломать городские постройки и инфраструктуру. За нарушение предусмотрено предупреждение.';
  }

  if (/телеграм|telegram|связаться/.test(text)) {
    return 'Официальное Telegram-сообщество LUX: https://t.me/SkyLUX110';
  }

  if (/рын|ресторан|вкусно/.test(text)) {
    return 'В LUX есть небольшой рынок с разными категориями товаров, а также ресторан быстрого питания «Вкусно — и точка». Цены и ассортимент пока не указаны.';
  }

  if (/транспорт|автобус|машин|мотоцикл/.test(text)) {
    return 'В городе предусмотрены легковые автомобили, грузовики, автобусы и мотоциклы.';
  }

  if (/открыти|откроется|когда откро/.test(text)) {
    return 'Планируемая дата открытия города LUX — 18 ноября 2026 года (ориентировочно). Следи за официальными объявлениями.';
  }

  if (/minecraft|майнкрафт|выжив|строительств|крафт|команд/.test(text)) {
    return 'Помогу с Minecraft! Напиши, что именно нужно: строительство, выживание, команды или игровые механики. Для особенностей сервера AnMine PE лучше сверяться с его правилами.';
  }

  return 'Пока я работаю в демонстрационном SMART MODE и отвечаю по встроенной базе знаний. У меня ещё нет полноценной нейросети и доступа к интернету. Если вопрос касается неизвестных фактов о LUX, уточни его у администрации города.';
}

function send(text) {
  const input = $('chatInput');
  const question = (text ?? input?.value ?? '').trim();

  if (!question) return;

  if (!activeId) createChat();

  const chat = current();
  if (!chat) return;

  chat.messages.push(
    { role: 'user', text: question },
    { role: 'assistant', text: reply(question) }
  );

  if (chat.title === 'Новый чат') {
    chat.title = question.slice(0, 38);
  }

  if (input) input.value = '';

  persist();
  draw();
}

/* ИСТОРИЯ ЧАТОВ */

function historyDraw() {
  const history = $('history');
  if (!history) return;

  history.innerHTML = '';

  chats.forEach(chat => {
    const row = document.createElement('div');
    row.style.display = 'flex';

    const button = document.createElement('button');
    button.textContent = chat.title;
    button.style.flex = '1';

    button.onclick = () => {
      activeId = chat.id;
      draw();
      history.classList.add('hidden');
    };

    const actions = document.createElement('button');
    actions.textContent = '⋯';
    actions.title = 'Действия';

    actions.onclick = () => {
      const answer = prompt(
        'Введи новое название чата или оставь пустым для удаления:',
        chat.title
      );

      if (answer === null) return;

      if (answer.trim()) {
        chat.title = answer.trim().slice(0, 50);
      } else if (confirm('Удалить этот чат?')) {
        chats = chats.filter(item => item.id !== chat.id);

        if (activeId === chat.id) {
          activeId = chats[0]?.id || null;
        }
      }

      persist();
      historyDraw();
      draw();
    };

    row.append(button, actions);
    history.append(row);
  });
}

/* КАТАЛОГ ЖИТЕЛЕЙ LUX */

function residentsStyles() {
  if ($('luxResidentsStyles')) return;

  const style = document.createElement('style');
  style.id = 'luxResidentsStyles';

  style.textContent = `
    .lux-residents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
      margin-top: 22px;
    }

    .lux-resident-card {
      min-width: 0;
      padding: 20px;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 18px;
      background: rgba(255,255,255,.045);
      text-align: center;
      overflow-wrap: anywhere;
    }

    .lux-resident-avatar {
      width: 88px;
      height: 88px;
      margin: 0 auto 14px;
      border-radius: 18px;
      object-fit: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,.1);
      font-size: 30px;
      font-weight: 700;
    }

    .lux-resident-name {
      margin: 0 0 7px;
      font-size: 19px;
      font-weight: 700;
    }

    .lux-resident-role {
      display: inline-block;
      margin-bottom: 12px;
      padding: 5px 11px;
      border-radius: 30px;
      background: rgba(255,255,255,.09);
      font-size: 12px;
    }

    .lux-resident-description {
      margin: 0;
      opacity: .78;
      font-size: 14px;
      line-height: 1.5;
    }

    .lux-residents-message {
      padding: 22px;
      margin-top: 20px;
      border-radius: 16px;
      background: rgba(255,255,255,.045);
      text-align: center;
      opacity: .85;
    }

    .lux-residents-retry {
      margin-top: 12px;
      padding: 9px 16px;
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 10px;
      background: rgba(255,255,255,.08);
      color: inherit;
      cursor: pointer;
    }
  `;

  document.head.append(style);
}

function getResidentsContainer() {
  const section = $('residents');
  if (!section) return null;

  let container = $('residentsList');

  if (!container) {
    container = document.createElement('div');
    container.id = 'residentsList';

    const oldContent = section.querySelector('.glass');

    if (oldContent) {
      oldContent.replaceWith(container);
    } else {
      section.append(container);
    }
  }

  return container;
}

function showResidentsMessage(container, message, retry = false) {
  container.innerHTML = '';

  const box = document.createElement('div');
  box.className = 'lux-residents-message';

  const text = document.createElement('p');
  text.textContent = message;
  box.append(text);

  if (retry) {
    const button = document.createElement('button');
    button.className = 'lux-residents-retry';
    button.textContent = 'Попробовать снова';
    button.addEventListener('click', loadResidents);
    box.append(button);
  }

  container.append(box);
}

function createResidentCard(resident) {
  const card = document.createElement('article');
  card.className = 'lux-resident-card';

  const avatar = document.createElement('div');
  avatar.className = 'lux-resident-avatar';

  if (resident.avatar_url) {
    const image = document.createElement('img');

    image.src = resident.avatar_url;
    image.alt = `Аватар ${resident.minecraft_nick}`;
    image.className = 'lux-resident-avatar';

    image.addEventListener('error', () => {
      image.replaceWith(createResidentFallback(resident.minecraft_nick));
    });

    avatar.replaceWith(image);
  } else {
    avatar.textContent = getInitials(resident.minecraft_nick);
    card.append(avatar);
  }

  const name = document.createElement('h3');
  name.className = 'lux-resident-name';
  name.textContent = resident.minecraft_nick || 'Без ника';

  const role = document.createElement('div');
  role.className = 'lux-resident-role';
  role.textContent = resident.role || 'Житель';

  card.append(name, role);

  if (resident.description) {
    const description = document.createElement('p');
    description.className = 'lux-resident-description';
    description.textContent = resident.description;
    card.append(description);
  }

  return card;
}

function getInitials(nick) {
  const value = String(nick || '?').trim();
  return value.slice(0, 2).toUpperCase() || '?';
}

function createResidentFallback(nick) {
  const fallback = document.createElement('div');
  fallback.className = 'lux-resident-avatar';
  fallback.textContent = getInitials(nick);
  return fallback;
}

async function loadResidents() {
  const container = getResidentsContainer();
  if (!container) return;

  residentsStyles();

  showResidentsMessage(container, 'Загружаем каталог жителей LUX...');

  const endpoint =
    `${SUPABASE_URL}/rest/v1/residents` +
    '?select=minecraft_nick,role,description,avatar_url,is_active' +
    '&is_active=eq.true' +
    '&order=joined_at.asc';

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('LUX: ошибка загрузки жителей', response.status, details);
      throw new Error('Не удалось получить список жителей.');
    }

    const residents = await response.json();

    container.innerHTML = '';

    if (!Array.isArray(residents) || residents.length === 0) {
      showResidentsMessage(
        container,
        'В каталоге пока нет жителей. Когда администрация добавит первых участников, они появятся здесь.'
      );
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'lux-residents-grid';

    residents.forEach(resident => {
      grid.append(createResidentCard(resident));
    });

    container.append(grid);

  } catch (error) {
    console.error('LUX: каталог жителей недоступен', error);

    showResidentsMessage(
      container,
      'Не удалось загрузить каталог жителей. Попробуй немного позже.',
      true
    );
  }
}

/* ЧАТ LUX AI */

$('chatForm')?.addEventListener('submit', event => {
  event.preventDefault();
  send();
});

$('openChat')?.addEventListener('click', open);
$('chatFab')?.addEventListener('click', open);

$('closeChat')?.addEventListener('click', () => {
  $('chat')?.classList.remove('open');
});

$('newChat')?.addEventListener('click', createChat);

$('historyBtn')?.addEventListener('click', () => {
  historyDraw();
  $('history')?.classList.toggle('hidden');
});

$('clearChat')?.addEventListener('click', () => {
  const chat = current();

  if (!chat) return;

  if (confirm('Удалить сообщения текущего чата?')) {
    chat.messages = [];
    persist();
    draw();
  }
});

/* ФОРМА ВСТУПЛЕНИЯ */

$('joinForm')?.addEventListener('submit', event => {
  event.preventDefault();

  const result = $('joinResult');

  if (result) {
    result.textContent =
      'Форма проверена. Автоматическая отправка заявок пока не подключена. Напиши администрации через https://t.me/SkyLUX110';
  }
});

/* МОБИЛЬНОЕ МЕНЮ */

const menuBtn = $('menuBtn');
const nav = $('nav');

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('show');

    menuBtn.setAttribute('aria-expanded', String(isOpen));

    menuBtn.setAttribute(
      'aria-label',
      isOpen ? 'Закрыть меню' : 'Открыть меню'
    );

    menuBtn.textContent = isOpen ? '×' : '☰';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('show');

      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Открыть меню');
      menuBtn.textContent = '☰';
    });
  });
}

/* ЗАПУСК КАТАЛОГА */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadResidents);
} else {
  loadResidents();
}
