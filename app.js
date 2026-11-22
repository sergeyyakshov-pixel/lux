
/* ==========================================
   LUX — MAIN APP.JS
   Luminous Urban Xperience
========================================== */

const $ = id => document.getElementById(id);

/* SUPABASE */

const SUPABASE_URL = 'https://hxdlrvrymoffsjebereh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-FBkXbHAFe9PYVBJZjcCQ_5drtgLhB';

const supabase = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/* ==========================================
   LUX AI — ИСТОРИЯ ЧАТОВ
========================================== */

const STORE = 'lux_ai_chats_v2';

let chats = [];

try {
  chats = JSON.parse(localStorage.getItem(STORE) || '[]');
  if (!Array.isArray(chats)) chats = [];
} catch {
  chats = [];
}

let activeId = null;

function persist() {
  try {
    localStorage.setItem(STORE, JSON.stringify(chats));
  } catch (error) {
    console.error('LUX AI: ошибка сохранения', error);
  }
}

function current() {
  return chats.find(chat => chat.id === activeId);
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

function draw() {
  const box = $('messages');
  if (!box) return;

  box.innerHTML = '';

  const chat = current();

  if (!chat) {
    box.textContent = 'Нажми «Новый чат», чтобы начать.';
    return;
  }

  chat.messages.forEach(message => {
    const element = document.createElement('div');

    element.className =
      'msg ' + (message.role === 'user' ? 'user' : '');

    element.textContent = message.text;
    box.append(element);
  });

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
    return 'Привет! 👋 Я LUX AI — официальный помощник города LUX. Чем могу помочь?';
  }

  if (/кто основател|основател|администрац/.test(text)) {
    return 'Основатели и главные администраторы города LUX:\n\n👑 GienaSergo01\n👑 XXOmegaRavenXX';
  }

  if (/истори|когда появился|когда основан/.test(text)) {
    return 'LUX появился благодаря идее GienaSergo01 весной 2026 года. Изначально это был небольшой магазин, который впоследствии превратился в город.';
  }

  if (/правил|грифер|вороват|ломать/.test(text)) {
    return 'Правила города LUX:\n\n1. Запрещено гриферить.\n2. Запрещено воровать чужие ресурсы.\n3. Запрещено ломать городские постройки и инфраструктуру.\n\nЗа нарушение предусмотрено предупреждение.';
  }

  if (/телеграм|telegram|связаться/.test(text)) {
    return 'Официальное Telegram-сообщество LUX:\nhttps://t.me/SkyLUX110';
  }

  if (/рын|магазин|ресторан|вкусно/.test(text)) {
    return 'В городе LUX есть небольшой рынок, множество различных магазинов, а также ресторан быстрого питания «Вкусно — и точка». 🏙️';
  }

  if (/открыти|откроется|когда откро/.test(text)) {
    return 'Город LUX уже открыт! 🏙️ Жители могут вступать в город через подачу заявки.';
  }

  if (/жител|каталог|паспорт/.test(text)) {
    return 'В LUX предусмотрен каталог жителей. В нём можно посмотреть Minecraft-ники, должности и информацию об участниках города.';
  }

  if (/транспорт|автобус|машин|мотоцикл/.test(text)) {
    return 'В городе предусмотрены легковые автомобили, грузовики, автобусы и мотоциклы.';
  }

  if (/minecraft|майнкрафт|выжив|строительств|крафт|команд/.test(text)) {
    return 'Помогу с Minecraft! Напиши, что именно тебя интересует.';
  }

  return 'Пока я работаю в демонстрационном SMART MODE и отвечаю по встроенной базе знаний. Если информации недостаточно, обратись к администрации LUX.';
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

    actions.onclick = () => {
      const answer = prompt(
        'Новое название чата. Оставь пустым для удаления:',
        chat.title
      );

      if (answer === null) return;

      if (answer.trim()) {
        chat.title = answer.trim().slice(0, 50);
      } else if (confirm('Удалить чат?')) {
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

/* ==========================================
   КАТАЛОГ ЖИТЕЛЕЙ LUX
========================================== */

let residents = [];
let filteredResidents = [];

function residentsStyles() {
  if ($('luxResidentsStyles')) return;

  const style = document.createElement('style');
  style.id = 'luxResidentsStyles';

  style.textContent = `
    .lux-resident-controls {
      display: grid;
      grid-template-columns: 1fr 220px;
      gap: 12px;
      margin: 20px 0;
    }

    .lux-resident-controls input,
    .lux-resident-controls select {
      min-width: 0;
      width: 100%;
      padding: 13px 15px;
      color: #eef4ff;
      background: #0b1830;
      border: 1px solid #8bc5ff55;
      border-radius: 12px;
      font: inherit;
      outline: none;
    }

    .lux-resident-controls input:focus,
    .lux-resident-controls select:focus {
      border-color: #8bc5ff;
    }

    .lux-resident-controls select option {
      background: #101b30;
    }

    .lux-residents-count {
      margin: 12px 0;
      color: #a9c9ef;
      font-size: 13px;
    }

    .lux-residents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit,minmax(230px,1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .lux-resident-card {
      padding: 20px;
      border: 1px solid #8bc5ff55;
      border-radius: 19px;
      background: linear-gradient(145deg,#152b4b,#0b162b);
      text-align: center;
      transition: transform .2s,border-color .2s;
    }

    .lux-resident-card:hover {
      transform: translateY(-4px);
      border-color: #8bc5ff;
    }

    .lux-resident-avatar {
      width: 90px;
      height: 90px;
      margin: 0 auto 13px;
      border-radius: 17px;
      object-fit: cover;
      display: grid;
      place-items: center;
      background: #1c3557;
      border: 1px solid #8bc5ff70;
      color: #dceaff;
      font-size: 30px;
      font-weight: 800;
    }

    .lux-resident-name {
      font-size: 19px;
      margin: 5px 0;
      overflow-wrap: anywhere;
    }

    .lux-resident-role {
      display: inline-block;
      padding: 5px 12px;
      margin: 7px 0;
      border: 1px solid #8bc5ff70;
      border-radius: 30px;
      background: #8bc5ff15;
      color: #b9d9ff;
      font-size: 12px;
    }

    .lux-passport-button {
      width: 100%;
      margin-top: 15px;
      padding: 11px;
      border: 1px solid #b7d8ff;
      border-radius: 11px;
      background: linear-gradient(120deg,#eaf4ff,#a9c9ef);
      color: #10213b;
      font-weight: 800;
      cursor: pointer;
    }

    .lux-passport-button:hover {
      filter: brightness(1.08);
    }

    .lux-residents-message {
      padding: 25px;
      border: 1px solid #8bc5ff40;
      border-radius: 18px;
      background: #101b30;
      text-align: center;
      color: #b9cce5;
    }

    /* ЦИФРОВОЙ ПАСПОРТ */

    .passportModal {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .passportModal.active {
      display: flex;
    }

    .passportOverlay {
      position: absolute;
      inset: 0;
      background: #020712dc;
      backdrop-filter: blur(8px);
    }

    .passportWindow {
      position: relative;
      z-index: 1;
      width: min(520px,100%);
      max-height: 90vh;
      overflow-y: auto;
      padding: 12px;
      border: 1px solid #a6d0ff80;
      border-radius: 23px;
      background: #0a1427;
      box-shadow: 0 20px 80px #000b;
    }

    .passportClose {
      position: sticky;
      top: 0;
      float: right;
      z-index: 2;
      width: 38px;
      height: 38px;
      border: 1px solid #8bc5ff60;
      border-radius: 50%;
      background: #152b49;
      color: white;
      font-size: 23px;
      cursor: pointer;
    }

    .passportDocument {
      padding: 25px;
      margin-top: 28px;
      border: 1px solid #8bc5ff80;
      border-radius: 18px;
      background: linear-gradient(145deg,#17385d,#0a1830 70%);
    }

    .passportHeader {
      text-align: center;
      padding-bottom: 17px;
      border-bottom: 1px solid #a9d0ff55;
    }

    .passportHeader small {
      color: #a9d0ff;
      letter-spacing: 2px;
    }

    .passportHeader h2 {
      margin: 7px 0;
      color: #edf6ff;
      font-size: 23px;
    }

    .passportPortrait {
      width: 115px;
      height: 115px;
      margin: 22px auto;
      display: grid;
      place-items: center;
      border: 2px solid #a9d0ff;
      border-radius: 16px;
      background: #27466b;
      object-fit: cover;
      color: white;
      font-size: 38px;
      font-weight: 800;
    }

    .passportField {
      padding: 12px 0;
      border-bottom: 1px solid #a9d0ff30;
    }

    .passportField small {
      display: block;
      color: #a9c9ef;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .passportField strong {
      display: block;
      margin-top: 4px;
      color: #fff;
      overflow-wrap: anywhere;
    }

    .passportFooter {
      padding-top: 18px;
      text-align: center;
      color: #a9c9ef;
      font-size: 11px;
      letter-spacing: 1px;
    }

    @media(max-width:600px) {
      .lux-resident-controls {
        grid-template-columns: 1fr;
      }

      .passportDocument {
        padding: 17px;
      }
    }
  `;

  document.head.append(style);
}

/* Создание окна паспорта */

function ensurePassportModal() {
  if ($('passportModal')) return;

  const modal = document.createElement('div');
  modal.id = 'passportModal';
  modal.className = 'passportModal';

  modal.innerHTML = `
    <div class="passportOverlay" id="passportOverlay"></div>

    <div class="passportWindow">
      <button class="passportClose" id="passportClose"
        aria-label="Закрыть">×</button>

      <div id="passportContent"></div>
    </div>
  `;

  document.body.append(modal);

  $('passportClose').addEventListener('click', closePassport);
  $('passportOverlay').addEventListener('click', closePassport);
}

function closePassport() {
  $('passportModal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function getInitials(nick) {
  return String(nick || '?').trim().slice(0, 2).toUpperCase();
}

function safeDate(date) {
  if (!date) return 'Не указана';

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return 'Не указана';

  return value.toLocaleDateString('ru-RU');
}

/* Открытие цифрового паспорта */

function openPassport(resident) {
  ensurePassportModal();

  const content = $('passportContent');
  if (!content) return;

  content.innerHTML = '';

  const documentBox = document.createElement('div');
  documentBox.className = 'passportDocument';

  const header = document.createElement('div');
  header.className = 'passportHeader';

  header.innerHTML = `
    <small>LUMINOUS URBAN XPERIENCE</small>
    <h2>ПАСПОРТ ЖИТЕЛЯ</h2>
    <small>ГОРОД LUX · ANMINE PE</small>
  `;

  documentBox.append(header);

  const portrait = document.createElement(
    resident.avatar_url ? 'img' : 'div'
  );

  portrait.className = 'passportPortrait';

  if (resident.avatar_url) {
    portrait.src = resident.avatar_url;
    portrait.alt = 'Аватар жителя';

    portrait.onerror = () => {
      const fallback = document.createElement('div');
      fallback.className = 'passportPortrait';
      fallback.textContent = getInitials(resident.minecraft_nick);
      portrait.replaceWith(fallback);
    };
  } else {
    portrait.textContent = getInitials(resident.minecraft_nick);
  }

  documentBox.append(portrait);

  const fields = [
    ['Игровой ник', resident.minecraft_nick],
    ['Должность', resident.role || 'Житель'],
    ['Дата вступления', safeDate(resident.joined_at)],
    ['Статус', resident.is_active ? 'Активный житель' : 'Неактивный житель'],
    ['Telegram', resident.telegram || 'Не указан'],
    ['Информация', resident.description || 'Дополнительная информация отсутствует']
  ];

  fields.forEach(([label, value]) => {
    const field = document.createElement('div');
    field.className = 'passportField';

    const small = document.createElement('small');
    small.textContent = label;

    const strong = document.createElement('strong');
    strong.textContent = value || 'Не указано';

    field.append(small, strong);
    documentBox.append(field);
  });

  const footer = document.createElement('div');
  footer.className = 'passportFooter';
  footer.textContent = 'LUX ✦ LUMINOUS URBAN XPERIENCE';

  documentBox.append(footer);
  content.append(documentBox);

  $('passportModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* Создание карточки жителя */

function createResidentCard(resident) {
  const card = document.createElement('article');
  card.className = 'lux-resident-card';

  const avatar = document.createElement(
    resident.avatar_url ? 'img' : 'div'
  );

  avatar.className = 'lux-resident-avatar';

  if (resident.avatar_url) {
    avatar.src = resident.avatar_url;
    avatar.alt = `Аватар ${resident.minecraft_nick}`;

    avatar.onerror = () => {
      const fallback = document.createElement('div');
      fallback.className = 'lux-resident-avatar';
      fallback.textContent = getInitials(resident.minecraft_nick);
      avatar.replaceWith(fallback);
    };
  } else {
    avatar.textContent = getInitials(resident.minecraft_nick);
  }

  const name = document.createElement('h3');
  name.className = 'lux-resident-name';
  name.textContent = resident.minecraft_nick;

  const role = document.createElement('div');
  role.className = 'lux-resident-role';
  role.textContent = resident.role || 'Житель';

  const button = document.createElement('button');
  button.className = 'lux-passport-button';
  button.textContent = 'Открыть паспорт 🪪';

  button.addEventListener('click', () => openPassport(resident));

  card.append(avatar, name, role, button);

  return card;
}

/* Поиск и фильтрация */

function filterResidents() {
  const search = ($('residentSearch')?.value || '')
    .trim()
    .toLowerCase();

  const selectedRole = $('residentRoleFilter')?.value || '';

  filteredResidents = residents.filter(resident => {
    const nick = String(resident.minecraft_nick || '').toLowerCase();
    const role = resident.role || 'Житель';

    return nick.includes(search) &&
      (!selectedRole || role === selectedRole);
  });

  renderResidents();
}

function renderResidents() {
  const container = $('residentsList');
  if (!container) return;

  container.innerHTML = '';

  const count = $('residentsCount');

  if (count) {
    count.textContent =
      `Найдено жителей: ${filteredResidents.length}`;
  }

  if (!filteredResidents.length) {
    const message = document.createElement('div');
    message.className = 'lux-residents-message';
    message.textContent = residents.length
      ? 'По твоему запросу никого не найдено.'
      : 'В каталоге пока нет жителей.';

    container.append(message);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'lux-residents-grid';

  filteredResidents.forEach(resident => {
    grid.append(createResidentCard(resident));
  });

  container.append(grid);
}

/* Загрузка из Supabase */

async function loadResidents() {
  const container = $('residentsList');
  if (!container) return;

  residentsStyles();
  ensurePassportModal();

  container.innerHTML = `
    <div class="lux-residents-message">
      Загружаем каталог жителей LUX...
    </div>
  `;

  if (!supabase) {
    container.innerHTML = `
      <div class="lux-residents-message">
        Не удалось подключить Supabase.
        Проверь подключение библиотеки и настройки.
      </div>
    `;
    return;
  }

  try {
    const { data, error } = await supabase
      .from('residents')
      .select('id,minecraft_nick,telegram,role,description,avatar_url,joined_at,is_active')
      .eq('is_active', true)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    const founders = [
      'gienasergo01',
      'xxomegaravenxx'
    ];

    residents = (data || []).filter(resident => {
      return !founders.includes(
        String(resident.minecraft_nick || '').toLowerCase()
      );
    });

    filterResidents();

  } catch (error) {
    console.error('LUX: ошибка загрузки жителей:', error);

    container.innerHTML = `
      <div class="lux-residents-message">
        Не удалось загрузить каталог жителей.
        <br>
        Проверь таблицу residents и настройки RLS.
        <br>
        <button class="lux-passport-button" id="residentRetry">
          Попробовать снова
        </button>
      </div>
    `;

    $('residentRetry')?.addEventListener('click', loadResidents);
  }
}

/* ==========================================
   ЗАПУСК ЧАТА
========================================== */

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

/* ==========================================
   ФОРМА ВСТУПЛЕНИЯ
========================================== */

$('joinForm')?.addEventListener('submit', event => {
  event.preventDefault();

  const result = $('joinResult');

  if (result) {
    result.textContent =
      'Форма проверена. Для отправки заявки свяжись с администрацией LUX: https://t.me/SkyLUX110';
  }
});

/* ==========================================
   МОБИЛЬНОЕ МЕНЮ
========================================== */

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

/* ЗАКРЫТИЕ ПАСПОРТА ПО ESC */

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closePassport();
  }
});

/* ==========================================
   ЗАПУСК
========================================== */

function initializeLux() {
  residentsStyles();
  ensurePassportModal();

  $('residentSearch')?.addEventListener('input', filterResidents);
  $('residentRoleFilter')?.addEventListener('change', filterResidents);

  loadResidents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLux);
} else {
  initializeLux();
}
