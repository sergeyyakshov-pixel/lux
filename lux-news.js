
(() => {
  const categories = {
    "Новости": "newsGeneral",
    "Инфраструктура": "newsInfrastructure",
    "Мини-игры": "newsGames"
  };

  const escapeHTML = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  function showMessage(container, title, description = "") {
    container.innerHTML = `
      <article class="glass">
        <h3>${escapeHTML(title)}</h3>
        ${description ? `<p>${escapeHTML(description)}</p>` : ""}
      </article>
    `;
  }

  async function loadNews() {
    const containers = {};

    for (const [category, id] of Object.entries(categories)) {
      containers[category] = document.getElementById(id);

      if (!containers[category]) {
        console.error("LUX: не найден контейнер " + id);
        return;
      }

      showMessage(containers[category], "Загружаем...");
    }

    const url = window.LUX_SUPABASE_URL;
    const key = window.LUX_SUPABASE_ANON_KEY;

    if (!url || !key || !window.supabase?.createClient) {
      Object.values(containers).forEach(container =>
        showMessage(container, "Новости временно недоступны",
          "Проверьте подключение к базе данных.")
      );
      console.error("LUX: Supabase не настроен");
      return;
    }

    try {
      const db = window.supabase.createClient(url, key);

      const { data, error } = await db
        .from("lux_news")
        .select("id,title,content,category,created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      for (const category of Object.keys(categories)) {
        const container = containers[category];
        const items = (data || []).filter(
          item => (item.category || "Новости") === category
        );

        if (!items.length) {
          showMessage(container, "Пока нет публикаций",
            "Следите за обновлениями LUX!");
          continue;
        }

        container.innerHTML = items.map(news => `
          <article class="glass">
            <span class="pill">${escapeHTML(category)}</span>
            <h3>${escapeHTML(news.title)}</h3>
            <p style="white-space:pre-wrap">${escapeHTML(news.content)}</p>
            <small>${escapeHTML(
              news.created_at
                ? new Date(news.created_at).toLocaleDateString("ru-RU")
                : ""
            )}</small>
          </article>
        `).join("");
      }
    } catch (error) {
      console.error("LUX NEWS ERROR:", error);

      Object.values(containers).forEach(container =>
        showMessage(container, "Ошибка загрузки",
          "Попробуйте обновить страницу позже.")
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadNews);
  } else {
    loadNews();
  }
})();

