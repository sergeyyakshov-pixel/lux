```javascript
(() => {
  'use strict';

  const client = window.supabase?.createClient(
    window.LUX_SUPABASE_URL,
    window.LUX_SUPABASE_ANON_KEY
  );

  if (!client) {
    console.error('LUX: Supabase не настроен');
    return;
  }

  const tabs = document.querySelectorAll('.joinTab');
  const contents = document.querySelectorAll('.joinContent');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(item => item.classList.remove('active'));
      contents.forEach(item => item.classList.remove('active'));

      tab.classList.add('active');

      document.getElementById(tab.dataset.tab)
        ?.classList.add('active');
    });
  });

  const form = document.getElementById('vacancyForm');
  const result = document.getElementById('vacancyResult');

  if (!form || !result) return;

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    result.textContent = 'Отправляем заявку...';

    try {
      const nickname = form.elements.nickname.value.trim();
      const telegram = form.elements.telegram.value.trim();
      const position = form.elements.position.value;
      const message = form.elements.message.value.trim();

      const { error } = await client
        .from('lux_applications')
        .insert({
          minecraft_nickname: nickname,
          telegram: telegram,
          position: position,
          message: message,
          application_type: 'vacancy',
          status: 'pending'
        });

      if (error) throw error;

      result.textContent =
        '✓ Заявка успешно отправлена! Ожидай решения администрации LUX.';

      form.reset();

    } catch (error) {
      console.error('LUX vacancy:', error);

      result.textContent =
        'Не удалось отправить заявку. Попробуй позже.';

    } finally {
      button.disabled = false;
    }
  });
})();
```
