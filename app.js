const $ = id => document.getElementById(id);

const STORE = 'lux_ai_chats_v2';

let chats = [];

try {
  chats = JSON.parse(localStorage.getItem(STORE) || '[]');
} catch {
  chats = [];
}

let activeId = null;

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
