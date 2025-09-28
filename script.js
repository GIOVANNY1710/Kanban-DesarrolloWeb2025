document.addEventListener('DOMContentLoaded', ()=>{
  // LOGIN
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const u = document.getElementById('user').value.trim();
      const p = document.getElementById('pass').value.trim();
      if(u === 'estudiante' && p === '1234'){
        sessionStorage.setItem('kanban-auth','1');
        window.location.href = 'kanban.html';
      } else alert('Usuario o contraseña incorrectos');
    });
    document.getElementById('demoBtn').addEventListener('click', ()=>{
      document.getElementById('user').value='estudiante';
      document.getElementById('pass').value='1234';
    });
  }

  // Protect kanban page
  if(location.pathname.endsWith('kanban.html')){
    const auth = sessionStorage.getItem('kanban-auth');
    if(!auth){ window.location.href = 'index.html'; }
  }

  // LOGOUT
  const logout = document.getElementById('logout');
  if(logout) logout.addEventListener('click', ()=>{ sessionStorage.removeItem('kanban-auth'); window.location.href='index.html'; });

  // Simple board storage and rendering
  const key = 'kanban-data-v2';
  function defaultBoard(){ return { todo:[{id: id(), title:'Preparar presentación',desc:'Slides y demo', avatar:'avatar1.svg'}], doing:[], done:[] }; }
  function id(){ return 'c'+Math.random().toString(36).slice(2,9); }
  function load(){ try{ return JSON.parse(localStorage.getItem(key)) || defaultBoard(); }catch(e){ return defaultBoard(); } }
  function save(data){ localStorage.setItem(key, JSON.stringify(data)); }

  function renderBoard(){
    const data = load();
    ['todo','doing','done'].forEach(col=>{
      const zone = document.getElementById(col);
      if(!zone) return;
      zone.innerHTML='';
      data[col].forEach(card=>{
        const el = document.createElement('div');
        el.className='card-item';
        el.draggable = true;
        el.dataset.id = card.id;
        el.innerHTML = `<div class="avatar"><img src="imagenes/${card.avatar}" width="36" height="36"></div><div class="meta"><strong>${escapeHTML(card.title)}</strong><div class="muted small">${escapeHTML(card.desc||'')}</div></div>`;
        zone.appendChild(el);
      });
    });
    attachDrag();
  }

  function escapeHTML(s){ return String(s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function attachDrag(){
    const items = document.querySelectorAll('.card-item');
    const zones = document.querySelectorAll('.col-body');
    items.forEach(it=>{
      it.addEventListener('dragstart', ()=> it.classList.add('dragging'));
      it.addEventListener('dragend', ()=> it.classList.remove('dragging'));
    });
    zones.forEach(z=>{
      z.addEventListener('dragover', e=>{ e.preventDefault(); z.classList.add('dragover'); const dragging=document.querySelector('.dragging'); if(dragging) z.appendChild(dragging); });
      z.addEventListener('dragleave', ()=> z.classList.remove('dragover'));
      z.addEventListener('drop', ()=> { z.classList.remove('dragover'); updateDataFromDOM(); });
    });
  }

  function updateDataFromDOM(){
    const newData={ todo:[], doing:[], done:[] };
    ['todo','doing','done'].forEach(col=>{
      const zone = document.getElementById(col);
      if(!zone) return;
      zone.querySelectorAll('.card-item').forEach(cardEl=>{
        const idd = cardEl.dataset.id || id();
        const title = cardEl.querySelector('.meta strong').innerText;
        const desc = cardEl.querySelector('.meta .small').innerText;
        const avatar = cardEl.querySelector('.avatar img') ? cardEl.querySelector('.avatar img').getAttribute('src').split('/').pop() : 'avatar1.svg';
        newData[col].push({id:idd, title, desc, avatar});
      });
    });
    save(newData);
  }

  // add new card
  const addBtn = document.getElementById('addBoardBtn');
  if(addBtn) addBtn.addEventListener('click', ()=>{
    const title = prompt('Título de la nueva tarjeta:');
    if(!title) return;
    const desc = prompt('Descripción (opcional):')||'';
    const avatarChoices = ['avatar1.svg','avatar2.svg','avatar3.svg'];
    const avatar = avatarChoices[Math.floor(Math.random()*avatarChoices.length)];
    const data = load();
    data.todo.unshift({id:id(), title, desc, avatar});
    save(data); renderBoard();
  });

  // on kanban page render on load
  if(location.pathname.endsWith('kanban.html')) renderBoard();

  // contact form
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', e=>{
      e.preventDefault();
      alert('Gracias por tu mensaje — demo solamente.');
      contactForm.reset();
    });
  }

});