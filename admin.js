
(() => {
  const $ = id => document.getElementById(id);
  const form = $("loginForm");
  const status = $("status");

  if (!form || !status) {
    console.error("LUX: loginForm или status не найдены");
    return;
  }

  const client = window.LUX_SUPABASE_URL &&
    window.LUX_SUPABASE_ANON_KEY &&
    window.supabase?.createClient
      ? window.supabase.createClient(
          window.LUX_SUPABASE_URL,
          window.LUX_SUPABASE_ANON_KEY
        )
      : null;

  let admin = null;
  let editingId = null;

  const message = (text, error = false) => {
    status.textContent = text;
    status.style.color = error ? "#ff9aaa" : "#9bd0ff";
  };

  const esc = value => String(value ?? "").replace(
    /[&<>"']/g,
    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]
  );

  function createPanel() {
    if ($("luxDashboard")) return;

    const panel = document.createElement("section");
    panel.id = "luxDashboard";

    panel.innerHTML = `
      <style>
        #luxDashboard {
          max-width: 850px;
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
        #luxDashboard input,
        #luxDashboard textarea {
          box-sizing: border-box;
          width: 100%;
          padding: 12px;
          margin: 7px 0;
          border-radius: 10px;
          border: 1px solid #526b91;
          background: #080f1e;
          color: white;
          font: inherit;
        }
        #luxDashboard button {
          padding: 11px 15px;
          margin: 5px;
          border: 0;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
        }
        #luxDashboard .primary {
          background: linear-gradient(130deg,#f4f7fc,#a9b8ce);
          color: #101827;
        }
        #luxDashboard .secondary {
          background: #203653;
          color: white;
        }
        #luxDashboard .danger {
          background: #542c3a;
          color: white;
        }
        #luxDashboard .news {
          padding: 15px;
          margin: 12px 0;
          border: 1px solid #b9d5ff35;
          border-radius: 14px;
          background: #0b1528;
        }
        #luxDashboard .muted {
          color: #a9b8d0;
          font-size: 13px;
        }
        #luxDashboard [hidden] {
          display: none !important;
        }
      </style>

      <div class="card">
        <h1>✦ LUX ADMIN</h1>
        <p id="luxAdminName"></p>
        <button class="secondary" id="luxLogout">Выйти</button>
      </div>

      <div class="card">
        <h2 id="formTitle">Создать новость</h2>

        <form id="newsForm">
          <label>Заголовок</label>
          <input id="newsTitle" maxlength="160" required>

          <label>Категория</label>
          <input id="newsCategory" value="Новости" maxlength="60">

          <label>Текст новости</label>
          <textarea id="newsContent" rows="6" required></textarea>

          <label>
            <input id="newsPublished" type="checkbox" style="width:auto">
            Опубликовать сразу
          </label>

          <button class="primary" id="saveNews">
            Сохранить новость
          </button>

          <button type="button" class="secondary"
            id="cancelEdit" hidden>
            Отмена
          </button>
        </form>
      </div>

      <div class="card">
        <h2>📰 Новости города</h2>
        <div id="newsList">Загрузка...</div>
      </div>
    `;

    document.querySelector("main")?.append(panel);

    $("luxAdminName").textContent =
      admin.username + " (" + admin.role + ")";

    async function loadNews() {
      const list = $("newsList");
      list.textContent = "Загружаем новости...";

      const { data, error } = await client
        .from("lux_news")
        .select("id,title,content,category,published,created_at")
        .order("created_at", { ascending: false });

      if (error) {
        list.textContent = "Ошибка: " + error.message;
        return;
      }

      if (!data.length) {
        list.textContent = "Новостей пока нет.";
        return;
      }

      list.innerHTML = data.map(n => `
        <article class="news">
          <div class="muted">
            ${esc(n.category || "Новости")} ·
            ${n.published ? "Опубликована" : "Черновик"}
          </div>
          <h3>${esc(n.title)}</h3>
          <p style="white-space:pre-wrap">${esc(n.content)}</p>

          <button class="secondary"
            data-edit="${esc(n.id)}">Изменить</button>

          <button class="secondary"
            data-publish="${esc(n.id)}"
            data-state="${n.published}">
            ${n.published ? "Снять с публикации" : "Опубликовать"}
          </button>

          ${admin.role === "owner" ? `
            <button class="danger"
              data-delete="${esc(n.id)}">Удалить</button>
          ` : ""}
        </article>
      `).join("");
    }

    function resetForm() {
      editingId = null;
      $("newsForm").reset();
      $("newsCategory").value = "Новости";
      $("formTitle").textContent = "Создать новость";
      $("saveNews").textContent = "Сохранить новость";
      $("cancelEdit").hidden = true;
    }

    $("newsForm").addEventListener("submit", async e => {
      e.preventDefault();

      const button = $("saveNews");
      button.disabled = true;

      try {
        const payload = {
          title: $("newsTitle").value.trim(),
          category: $("newsCategory").value.trim() || "Новости",
          content: $("newsContent").value.trim(),
          published: $("newsPublished").checked
        };

        if (!payload.title || !payload.content) {
          throw new Error("Заполни все обязательные поля.");
        }

        const result = editingId
          ? await client.from("lux_news")
              .update(payload).eq("id", editingId)
          : await client.from("lux_news").insert(payload);

        if (result.error) throw result.error;

        resetForm();
        await loadNews();
        message("Новость успешно сохранена!");
      } catch (error) {
        message("Ошибка: " + error.message, true);
      } finally {
        button.disabled = false;
      }
    });

    $("cancelEdit").onclick = resetForm;

    $("newsList").addEventListener("click", async e => {
      const edit = e.target.closest("[data-edit]");
      const publish = e.target.closest("[data-publish]");
      const remove = e.target.closest("[data-delete]");

      try {
        if (edit) {
          const { data, error } = await client
            .from("lux_news")
            .select("*")
            .eq("id", edit.dataset.edit)
            .single();

          if (error) throw error;

          editingId = data.id;
          $("newsTitle").value = data.title;
          $("newsCategory").value = data.category || "Новости";
          $("newsContent").value = data.content;
          $("newsPublished").checked = data.published;

          $("formTitle").textContent = "Редактировать новость";
          $("saveNews").textContent = "Сохранить изменения";
          $("cancelEdit").hidden = false;

          panel.scrollIntoView({ behavior: "smooth" });
        }

        if (publish) {
          const { error } = await client
            .from("lux_news")
            .update({
              published: publish.dataset.state !== "true"
            })
            .eq("id", publish.dataset.publish);

          if (error) throw error;

          await loadNews();
          message("Статус публикации изменён.");
        }

        if (remove) {
          if (admin.role !== "owner") {
            throw new Error("Недостаточно прав.");
          }

          if (!confirm("Удалить эту новость?")) return;

          const { error } = await client
            .from("lux_news")
            .delete()
            .eq("id", remove.dataset.delete);

          if (error) throw error;

          await loadNews();
          message("Новость удалена.");
        }
      } catch (error) {
        message("Ошибка: " + error.message, true);
      }
    });

    $("luxLogout").onclick = async () => {
      await client.auth.signOut();
      panel.remove();
      form.closest("section")?.scrollIntoView();
      message("Вы вышли из системы.");
    };

    loadNews();
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();

    if (!client) {
      message("Проверь настройки Supabase.", true);
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;

    message("Выполняется вход...");

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: $("email").value.trim(),
        password: $("password").value
      });

      if (error) throw error;

      const { data: record, error: adminError } = await client
        .from("lux_admins")
        .select("username,role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError) throw adminError;

      if (!record || !["owner", "editor"].includes(record.role)) {
        await client.auth.signOut();
        throw new Error("UID не найден в lux_admins.");
      }

      admin = record;
      message("Авторизация успешна!");

      createPanel();

    } catch (error) {
      message("Ошибка: " + error.message, true);
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
