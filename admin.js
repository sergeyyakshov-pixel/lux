const form=document.getElementById("loginForm");
const statusEl=document.getElementById("status");
const configured=window.LUX_SUPABASE_URL && window.LUX_SUPABASE_ANON_KEY &&
 !window.LUX_SUPABASE_URL.includes("ВСТАВЬ") && !window.LUX_SUPABASE_ANON_KEY.includes("ВСТАВЬ");
const client=configured ? window.supabase.createClient(window.LUX_SUPABASE_URL,window.LUX_SUPABASE_ANON_KEY) : null;
form.addEventListener("submit",async e=>{
 e.preventDefault();
 if(!client){statusEl.textContent="Сначала настрой supabase-config.js: Project URL и Publishable Key.";return;}
 statusEl.textContent="Выполняется вход…";
 const {data,error}=await client.auth.signInWithPassword({
  email:document.getElementById("email").value,
  password:document.getElementById("password").value
 });
 if(error){statusEl.textContent="Ошибка входа: "+error.message;return;}
 const {data:admin,error:adminError}=await client.from("lux_admins")
  .select("username,role").eq("user_id",data.user.id).maybeSingle();
 if(adminError || !admin){
  await client.auth.signOut();
  statusEl.textContent="Аккаунт вошёл, но его UID не найден в lux_admins. Доступ закрыт.";
  return;
 }
 statusEl.textContent="Авторизация успешна: "+admin.username+" ("+admin.role+"). Интерфейс управления новостями и жителями подключим следующим этапом.";
});
