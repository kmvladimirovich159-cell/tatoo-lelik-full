<?php
require __DIR__ . '/config.php';
start_admin_session();
$logged = is_admin();
?><!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>LELKINO TATOO — Админка</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
<style>
:root{--bg:#111014;--card:#1d1a20;--white:#f8f5f8;--muted:#a9a3aa;--line:rgba(255,255,255,.1);--accent:#fff;--danger:#ff6d7a}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0%,#29232d 0,#111014 42%);color:var(--white);font-family:Manrope,Arial,sans-serif;min-height:100vh}.wrap{width:min(1180px,calc(100% - 32px));margin:auto}.top{padding:28px 0 18px;display:flex;align-items:center;justify-content:space-between;gap:15px}.brand{font-weight:800;letter-spacing:.12em;color:#fff;text-decoration:none}.brand span{font-weight:500}.btn{border:1px solid var(--line);background:#f8f5f8;color:#151318;border-radius:999px;padding:12px 18px;font-weight:800;cursor:pointer}.btn.dark{background:transparent;color:#fff}.panel{background:rgba(29,26,32,.9);border:1px solid var(--line);border-radius:24px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.2);margin-bottom:20px}.login{max-width:460px;margin:12vh auto}.eyebrow{font-size:12px;letter-spacing:.18em;color:var(--muted);font-weight:800}.h{font:600 34px/1.05 'Playfair Display',serif;margin:8px 0 20px}.h em{font-style:italic}.input,.select{width:100%;background:#131116;color:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 15px;outline:0;font:inherit}.label{display:block;font-size:13px;font-weight:700;margin:12px 0 7px}.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.upload{border:1px dashed rgba(255,255,255,.25);padding:24px;border-radius:18px;text-align:center}.file{width:100%;padding:16px;border:1px solid var(--line);border-radius:14px;background:#131116;color:#fff}.hint{color:var(--muted);font-size:13px;line-height:1.6}.status{min-height:22px;margin-top:10px;font-weight:700}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.item{overflow:hidden;background:#141217;border:1px solid var(--line);border-radius:18px}.thumb{aspect-ratio:1/1;overflow:hidden;background:#0e0d10}.thumb img{width:100%;height:100%;object-fit:cover;display:block}.body{padding:14px}.body input,.body select{margin-bottom:9px}.actions{display:flex;gap:8px}.actions .btn{flex:1}.danger{background:transparent;color:var(--danger);border-color:rgba(255,109,122,.35)}.drag{cursor:grab}.empty{text-align:center;padding:40px;color:var(--muted)}@media(max-width:800px){.grid{grid-template-columns:1fr 1fr}.row{grid-template-columns:1fr}}@media(max-width:520px){.grid{grid-template-columns:1fr}.top{align-items:flex-start}.h{font-size:29px}}
</style>
</head>
<body>
<div class="wrap">
  <div class="top"><a class="brand" href="index.html">LELKINO <span>TATOO</span></a><?php if($logged): ?><button class="btn dark" id="logout">Выйти</button><?php endif; ?></div>
<?php if(!$logged): ?>
  <section class="panel login"><p class="eyebrow">LELKINO TATOO</p><div class="h">УПРАВЛЕНИЕ <em>САЙТОМ</em></div>
    <form id="loginForm"><label class="label">Пароль</label><input class="input" id="password" type="password" autocomplete="current-password" placeholder="Введите пароль" required><button class="btn" style="width:100%;margin-top:14px">ВОЙТИ</button><div class="status" id="loginStatus"></div></form>
    <p class="hint">После загрузки сайта открой: <b>/admin.php</b>. Пароль по умолчанию указан в файле <b>config.php</b>.</p>
  </section>
<?php else: ?>
  <section class="panel">
    <p class="eyebrow">ПОРТФОЛИО</p><div class="h">ДОБАВИТЬ <em>НОВЫЕ РАБОТЫ</em></div>
    <form id="uploadForm" class="upload" enctype="multipart/form-data">
      <input class="file" id="photos" name="photos[]" type="file" accept="image/jpeg,image/png,image/webp" multiple required>
      <div class="row"><div><label class="label">Категория для новых фото</label><select class="select" name="category"><option value="minimalism">Минимализм</option><option value="nadpisi">Надписи</option><option value="grafika" selected>Графика</option><option value="floristika">Флористика</option><option value="realizm">Реализм</option></select></div><div><label class="label">Лимит</label><p class="hint">JPG / PNG / WEBP, до 12 МБ на одну фотографию. Можно выбрать сразу несколько.</p></div></div>
      <button class="btn" style="margin-top:14px">ЗАГРУЗИТЬ ФОТО</button><div class="status" id="uploadStatus"></div>
    </form>
  </section>
  <section class="panel"><p class="eyebrow">УПРАВЛЕНИЕ</p><div class="h">МОИ <em>РАБОТЫ</em></div><p class="hint">Перетаскивай карточки мышкой, чтобы менять порядок. Название и стиль можно менять прямо здесь.</p><div class="grid" id="items"></div><div class="empty" id="empty">Загрузка…</div></section>
<?php endif; ?>
</div>
<script>
const $=s=>document.querySelector(s);
async function api(formData){const r=await fetch('api.php',{method:'POST',body:formData,cache:'no-store'});let d={};try{d=await r.json()}catch{}if(!r.ok)throw new Error(d.message||'Ошибка сервера');return d}
<?php if(!$logged): ?>
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData();fd.append('action','login');fd.append('password',$('#password').value);const st=$('#loginStatus');st.textContent='Вход…';try{await api(fd);location.reload()}catch(err){st.textContent=err.message}});
<?php else: ?>
const cats={minimalism:'Минимализм',nadpisi:'Надписи',grafika:'Графика',floristika:'Флористика',realizm:'Реализм'};
let items=[];
function render(){const box=$('#items');box.innerHTML='';$('#empty').style.display=items.length?'none':'block';items.forEach((x,i)=>{const card=document.createElement('article');card.className='item drag';card.draggable=true;card.dataset.id=x.id;card.innerHTML=`<div class="thumb"><img src="${esc(x.src)}" alt=""></div><div class="body"><input class="input title" value="${esc(x.title||'Работа')}"><select class="select category">${Object.entries(cats).map(([k,v])=>`<option value="${k}" ${x.category===k?'selected':''}>${v}</option>`).join('')}</select><div class="actions"><button class="btn save">Сохранить</button><button class="btn danger del">Удалить</button></div></div>`;card.querySelector('.save').onclick=()=>save(card,x.id);card.querySelector('.del').onclick=()=>del(x.id);card.addEventListener('dragstart',()=>card.classList.add('dragging'));card.addEventListener('dragend',()=>{card.classList.remove('dragging');reorder()});box.appendChild(card)});}
function esc(v){const d=document.createElement('div');d.textContent=v??'';return d.innerHTML}
async function load(){const r=await fetch('api.php?action=list',{cache:'no-store'});const d=await r.json();items=d.items||[];render()}
async function save(card,id){const fd=new FormData();fd.append('action','update');fd.append('id',id);fd.append('title',card.querySelector('.title').value);fd.append('category',card.querySelector('.category').value);const st=$('#uploadStatus');try{const d=await api(fd);items=d.items;render();st.textContent='Сохранено ✦';setTimeout(()=>st.textContent='',1600)}catch(e){st.textContent=e.message}}
async function del(id){if(!confirm('Удалить эту работу из портфолио?'))return;const fd=new FormData();fd.append('action','delete');fd.append('id',id);try{const d=await api(fd);items=d.items;render()}catch(e){alert(e.message)}}
async function reorder(){const ids=[...document.querySelectorAll('.item')].map(x=>x.dataset.id);const fd=new FormData();fd.append('action','reorder');ids.forEach(id=>fd.append('ids[]',id));try{const d=await api(fd);items=d.items}catch(e){alert(e.message)}}
$('#items').addEventListener('dragover',e=>{e.preventDefault();const dragging=document.querySelector('.dragging');const after=[...$('#items').querySelectorAll('.item:not(.dragging)')].find(el=>e.clientY<el.getBoundingClientRect().top+el.offsetHeight/2);if(after)$('#items').insertBefore(dragging,after);else $('#items').appendChild(dragging)});
$('#uploadForm').addEventListener('submit',async e=>{e.preventDefault();const st=$('#uploadStatus');st.textContent='Загрузка…';const fd=new FormData(e.target);fd.append('action','upload');try{const d=await api(fd);items=d.items;render();e.target.reset();st.textContent=d.message;setTimeout(()=>st.textContent='',2500)}catch(err){st.textContent=err.message}});
$('#logout')?.addEventListener('click',async()=>{const fd=new FormData();fd.append('action','logout');await api(fd);location.reload()});load();
<?php endif; ?>
</script>
</body></html>
