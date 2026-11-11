const form = document.getElementById('loginForm');
const statusBox = document.getElementById('status');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusBox.textContent = 'Подключение Supabase ещё не настроено. Заполни supabase-config.js и подключи библиотеку Supabase JS.';
});
