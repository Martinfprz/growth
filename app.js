import { db } from './supabase.js';

/* ============================================================
   UTILITIES
   ============================================================ */
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a, b) {
  a = new Date(a); b = new Date(b);
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

function fmtDate(date, fmt) {
  const d = new Date(date);
  const MON  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DAY  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  if (fmt === 'EEE')      return DAY[d.getDay()];
  if (fmt === 'd')        return String(d.getDate());
  if (fmt === 'MMM d')    return `${MON[d.getMonth()]} ${d.getDate()}`;
  if (fmt === 'MMMM yyyy')return `${FULL[d.getMonth()]} ${d.getFullYear()}`;
  return d.toLocaleDateString();
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0,0,0,0);
  return d;
}

function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function endOfMonth(date)   { return new Date(date.getFullYear(), date.getMonth()+1, 0); }
function uid()              { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const CAT_CLASSES = ['cat-0','cat-1','cat-2','cat-3','cat-4','cat-5','cat-6','cat-7'];
function catClass(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return CAT_CLASSES[Math.abs(h) % CAT_CLASSES.length];
}

/* ============================================================
   SUPABASE DIAGNOSTICS
   ============================================================ */
function diagSupabaseError(err) {
  if (!err) return 'Error desconocido al conectar con Supabase.';
  const msg = (err.message || err.toString()).toLowerCase();
  const code = err.code || err.status || '';

  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed')) {
    return 'Error de red. Verifica tu conexión a internet.';
  }
  if (code === '42P01' || msg.includes('relation') || msg.includes('does not exist')) {
    return 'Las tablas no existen. Ejecuta schema.sql en tu proyecto de Supabase.';
  }
  if (code === '42501' || msg.includes('permission') || msg.includes('rls') || msg.includes('policy')) {
    return 'Acceso bloqueado por RLS. Revisa que hayas ejecutado los ALTER TABLE en schema.sql.';
  }
  if (code === 'PGRST116' || msg.includes('jwt') || msg.includes('token') || msg.includes('invalid key')) {
    return 'Clave de Supabase inválida. Verifica SUPABASE_ANON en supabase.js.';
  }
  return `Error Supabase: ${err.message || code || 'desconocido'}`;
}

/* ============================================================
   MD3 CONFIRM SHEET — reemplaza window.confirm()
   Devuelve Promise<boolean>
   ============================================================ */
function mdConfirm(msg, okLabel = 'Eliminar') {
  return new Promise(resolve => {
    const overlay  = document.getElementById('confirm-sheet');
    const msgEl    = document.getElementById('confirm-msg');
    const okBtn    = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    msgEl.textContent  = msg;
    okBtn.textContent  = okLabel;
    overlay.style.display = 'flex';

    function done(result) {
      overlay.style.display = 'none';
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlay);
      resolve(result);
    }

    const onOk      = () => done(true);
    const onCancel  = () => done(false);
    const onOverlay = e => { if (e.target === overlay) done(false); };

    okBtn.addEventListener('click',      onOk,      { once: true });
    cancelBtn.addEventListener('click',  onCancel,  { once: true });
    overlay.addEventListener('click',    onOverlay);
  });
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg, duration = 2200) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.getElementById('app-frame').appendChild(el);
  }
  el.textContent = msg;
  el.classList.remove('toast-out');
  el.classList.add('toast-in');
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.replace('toast-in', 'toast-out');
  }, duration);
}

/* ============================================================
   ICONS
   ============================================================ */
const ICONS = {
  water:  `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  gym:    `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h.01M17.5 6.5h.01M6.5 17.5h.01M17.5 17.5h.01M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="3"/><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`,
  read:   `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  sleep:  `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  energy: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  smile:  `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  coffee: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`,
  brain:  `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/></svg>`,
  timer:  `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6M22 6l-3-3M9 3h6"/></svg>`,
  heart:  `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
};

// All colors verified WCAG AAA (≥7:1) on light surfaces (#F9F6FC, #FCE8F0)
// All verified ≥7:1 AAA on warm cream surfaces (#FFF8F0, #FFF3E8, #FFF0F4)
const HABIT_COLORS = ['#7A3500','#145000','#7A1A3A','#3D5A4A','#5A3A6A','#6B4C00','#003F8A'];

/* ============================================================
   STATE
   ============================================================ */
const S = {
  activeTab: 'home',
  navCollapsed: false,

  tasks:      [],
  selTaskCat: '',

  expenses:  [],
  selExpCat: 'Comida',

  habits:        [],
  habitFormOpen: false,
  selHabitIcon:  'heart',

  notes:        [],
  activeNoteId: null,
};

/* ============================================================
   NAVIGATION
   ============================================================ */
function goTo(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

  const section = document.getElementById(`tab-${tab}`);
  if (section) section.classList.add('active');
  document.querySelectorAll(`.nav-btn[data-tab="${tab}"]`).forEach(el => el.classList.add('active'));
  document.getElementById('bottom-nav').dataset.active = tab;

  S.activeTab = tab;

  const sc  = document.getElementById('scroll-container');
  const nav = document.getElementById('bottom-nav');
  const fab = document.getElementById('notes-fab');
  sc.scrollTop = 0;
  sc.dispatchEvent(new Event('scroll'));

  // Hide nav on home, show on all other tabs
  nav.style.display = tab === 'home' ? 'none' : '';

  if (fab) {
    if (tab === 'notes') {
      fab.style.display = 'flex';
      fab.classList.remove('fab-visible');
      void fab.offsetWidth;
      fab.classList.add('fab-visible');
    } else {
      fab.style.display = 'none';
    }
  }

  if (tab === 'planner')  renderPlanner();
  if (tab === 'expenses') renderExpenses();
  if (tab === 'health')   renderHealth();
  if (tab === 'notes')    renderNotes();
  if (tab === 'home')     renderHomeStats();
}

/* ============================================================
   HOME STATS — dynamic badges
   ============================================================ */
function renderHomeStats() {
  // Planner: pending (not done) tasks
  const pending = S.tasks.filter(t => !t.done).length;
  const plannerBadge = document.getElementById('badge-planner');
  if (plannerBadge) {
    plannerBadge.textContent = pending > 0
      ? `${pending} tarea${pending === 1 ? '' : 's'} pendiente${pending === 1 ? '' : 's'}`
      : 'Todo al día';
  }

  // Expenses: sum of today's expenses
  const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const todayTotal = S.expenses
    .filter(e => e.date && e.date.slice(0, 10) === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);
  const expBadge = document.getElementById('badge-expenses');
  if (expBadge) {
    expBadge.textContent = todayTotal > 0
      ? `$${todayTotal.toFixed(2)} hoy`
      : 'Sin gastos hoy';
  }

  // Health: completed habits vs total
  const total     = S.habits.length;
  const completed = S.habits.filter(h => h.current >= h.goal).length;
  const healthBadge = document.getElementById('badge-health');
  if (healthBadge) {
    healthBadge.textContent = total > 0
      ? `${completed} / ${total} hábitos completados`
      : 'Sin hábitos registrados';
  }

  // Notes: count
  const notesBadge = document.getElementById('badge-notes');
  if (notesBadge) {
    notesBadge.textContent = S.notes.length > 0
      ? `${S.notes.length} nota${S.notes.length === 1 ? '' : 's'} guardada${S.notes.length === 1 ? '' : 's'}`
      : 'Sin notas';
  }
}

/* ============================================================
   SCROLL — sticky header + nav collapse
   ============================================================ */
function initScroll() {
  const sc = document.getElementById('scroll-container');

  sc.addEventListener('scroll', () => {
    const scrolled = sc.scrollTop > 50;

    const hdr = document.querySelector(`#tab-${S.activeTab} .sticky-header`);
    if (hdr) hdr.classList.toggle('scrolled', scrolled);
  }, { passive: true });
}

/* ============================================================
   PLANNER
   ============================================================ */
function taskCategories() {
  const cats = [...new Set(S.tasks.map(t => t.cat))];
  if (!cats.includes('Trabajo'))   cats.push('Trabajo');
  if (!cats.includes('Personal')) cats.push('Personal');
  return cats;
}

function renderPlanner() {
  renderTaskCatChips();
  renderTaskList('planner');
  renderTaskList('todo');
}

function renderTaskCatChips() {
  const el = document.getElementById('task-cat-chips');
  if (!el) return;
  el.innerHTML = taskCategories().map(cat => {
    const active = S.selTaskCat === cat;
    return `<button type="button" class="chip ${active ? catClass(cat)+' active' : ''}" onclick="selTaskCat('${cat}')">${cat}</button>`;
  }).join('');
}

window.selTaskCat = function(cat) {
  S.selTaskCat = S.selTaskCat === cat ? '' : cat;
  renderTaskCatChips();
};

function renderTaskList(type) {
  const listEl  = document.getElementById(type === 'planner' ? 'planner-task-list' : 'todo-task-list');
  const countEl = document.getElementById(type === 'planner' ? 'planner-count'     : 'todo-count');
  if (!listEl) return;

  const tasks = S.tasks.filter(t => type === 'planner' ? !t.today : t.today);
  if (countEl) countEl.textContent = tasks.length;

  if (!tasks.length) {
    listEl.innerHTML = `<div class="empty-state">
      <p>${type === 'planner' ? 'Tu planificador está vacío.' : 'No hay tareas para hoy.'}</p>
      <span>${type === 'planner' ? 'Agrega tareas para comenzar.' : 'Mueve tareas desde el área de tareas.'}</span>
    </div>`;
    return;
  }

  const grouped = {};
  tasks.forEach(t => { (grouped[t.cat] || (grouped[t.cat] = [])).push(t); });

  const TAG = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>`;
  const CHECK_ON  = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`;
  const CHECK_OFF = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
  const ARROW_R   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
  const ARROW_L   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>`;
  const TRASH     = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;

  listEl.innerHTML = Object.entries(grouped).map(([cat, catTasks]) => `
    <div class="cat-group">
      <div class="cat-label ${catClass(cat)}">${TAG} ${cat}</div>
      <div class="cat-items">
        ${catTasks.map(t => `
          <div class="task-item ${t.done ? 'done-item' : ''}">
            <div class="task-left">
              <button class="task-check ${t.done ? 'checked' : ''}" onclick="toggleTask('${t.id}')">${t.done ? CHECK_ON : CHECK_OFF}</button>
              <span class="task-title ${t.done ? 'struck' : ''}">${t.title}</span>
            </div>
            <div class="task-actions">
              ${type === 'planner'
                ? `<button class="task-btn btn-today"   onclick="moveToday('${t.id}')"   title="Mover a Hoy">${ARROW_R}</button>`
                : `<button class="task-btn btn-planner" onclick="movePlanner('${t.id}')" title="Mover al planificador">${ARROW_L}</button>`}
              <button class="task-btn btn-del" onclick="delTask('${t.id}')">${TRASH}</button>
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

window.toggleTask = id => {
  const t = S.tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  renderTaskList('planner'); renderTaskList('todo'); renderHomeStats();
  db.updateTask(id, { done: t.done }).catch(() => {
    t.done = !t.done; renderTaskList('planner'); renderTaskList('todo'); renderHomeStats();
    showToast('Error al guardar');
  });
};

window.delTask = async id => {
  if (!await mdConfirm('¿Eliminar esta tarea?')) return;
  const prev = [...S.tasks];
  S.tasks = S.tasks.filter(x => x.id !== id);
  renderTaskList('planner'); renderTaskList('todo'); renderHomeStats();
  db.deleteTask(id).catch(() => {
    S.tasks = prev; renderTaskList('planner'); renderTaskList('todo'); renderHomeStats();
    showToast('Error al eliminar');
  });
};

window.moveToday = id => {
  const t = S.tasks.find(x => x.id === id);
  if (!t) return;
  t.today = true;
  renderTaskList('planner'); renderTaskList('todo');
  db.updateTask(id, { today: true }).catch(() => {
    t.today = false; renderTaskList('planner'); renderTaskList('todo');
    showToast('Error al guardar');
  });
};

window.movePlanner = id => {
  const t = S.tasks.find(x => x.id === id);
  if (!t) return;
  t.today = false;
  renderTaskList('planner'); renderTaskList('todo');
  db.updateTask(id, { today: false }).catch(() => {
    t.today = true; renderTaskList('planner'); renderTaskList('todo');
    showToast('Error al guardar');
  });
};

function initPlannerForm() {
  const form      = document.getElementById('add-task-form');
  if (!form) return;
  const taskInput = document.getElementById('task-input');
  const submitBtn = form.querySelector('.submit-btn');

  function checkPlannerValid() {
    submitBtn.disabled = !taskInput.value.trim();
  }
  checkPlannerValid();
  taskInput.addEventListener('input', checkPlannerValid);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;
    const newCat = document.getElementById('task-new-cat').value.trim();
    const cat  = newCat || S.selTaskCat || 'General';
    const task = { id: uid(), title, done: false, today: false, cat };
    S.tasks.unshift(task);
    showToast('Tarea agregada');
    taskInput.value = '';
    document.getElementById('task-new-cat').value = '';
    S.selTaskCat = '';
    checkPlannerValid();
    renderPlanner(); renderHomeStats();
    db.addTask(task).catch(() => {
      S.tasks = S.tasks.filter(t => t.id !== task.id);
      renderPlanner(); renderHomeStats();
      showToast('Error al guardar la tarea');
    });
  });

  // Switcher
  document.querySelectorAll('.sw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sw-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      if (view === 'planner-area') {
        document.getElementById('planner-area-view').classList.add('active');
        document.getElementById('todo-list-view').classList.remove('active');
      } else {
        document.getElementById('todo-list-view').classList.add('active');
        document.getElementById('planner-area-view').classList.remove('active');
      }
    });
  });
}

/* ============================================================
   EXPENSES
   ============================================================ */
function expCategories() {
  const cats = [...new Set(S.expenses.map(e => e.cat))];
  ['Comida','Transporte','Compras'].forEach(c => { if (!cats.includes(c)) cats.push(c); });
  return cats;
}

function renderExpenses() {
  renderExpSummary();
  renderExpCatChips();
  renderWeekDays();
  renderTransactions();
  renderChart();
}

function renderExpSummary() {
  const today = S.expenses.filter(e => isSameDay(e.date, new Date())).reduce((s,e) => s+e.amount, 0);
  const total = S.expenses.reduce((s,e) => s+e.amount, 0);
  const t = document.getElementById('total-today');
  const a = document.getElementById('total-all');
  if (t) t.textContent = `$${today.toFixed(2)}`;
  if (a) a.textContent = `$${total.toFixed(2)}`;
}

function renderExpCatChips() {
  const el = document.getElementById('exp-cat-chips');
  if (!el) return;
  el.innerHTML = expCategories().map(cat => {
    const active = S.selExpCat === cat;
    return `<button type="button" class="chip ${active ? catClass(cat)+' active' : ''}" onclick="selExpCat('${cat}')">${cat}</button>`;
  }).join('');
}

window.selExpCat = function(cat) { S.selExpCat = cat; renderExpCatChips(); };

function renderWeekDays() {
  const el = document.getElementById('week-days');
  if (!el) return;
  const start = startOfWeek(new Date());
  el.innerHTML = Array.from({length:7}, (_,i) => {
    const date = addDays(start, i);
    const total = S.expenses.filter(e => isSameDay(e.date, date)).reduce((s,e) => s+e.amount, 0);
    const today = isSameDay(date, new Date());
    return `<div class="week-day ${today ? 'today' : ''}">
      <span class="wd-name">${fmtDate(date,'EEE')}</span>
      <span class="wd-num">${fmtDate(date,'d')}</span>
      <span class="wd-amt">$${total > 0 ? total.toFixed(0) : '0'}</span>
    </div>`;
  }).join('');
}

function renderTransactions() {
  const el = document.getElementById('transactions-list');
  if (!el) return;
  const TAG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`;
  el.innerHTML = S.expenses.map(e => `
    <div class="trans-item">
      <div class="trans-left">
        <div class="trans-icon ${catClass(e.cat)}">${TAG}</div>
        <div>
          <div class="trans-desc">${e.desc}</div>
          <div class="trans-meta">${e.cat} · ${fmtDate(e.date,'MMM d')}</div>
        </div>
      </div>
      <div class="trans-amt">-$${e.amount.toFixed(2)}</div>
    </div>`).join('');
}

function renderChart() {
  const el = document.getElementById('weekly-chart');
  if (!el) return;

  const data = Array.from({length:7}, (_,i) => {
    const date = addDays(new Date(), i-6);
    const total = S.expenses.filter(e => isSameDay(e.date, date)).reduce((s,e) => s+e.amount, 0);
    return { name: fmtDate(date,'EEE'), total };
  });

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const W = el.clientWidth || 340;
  const H = 200, pT = 28, pB = 24, pL = 0, pR = 8;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const slot = cW / 7;
  const bW = Math.max(Math.floor(slot) - 8, 12);

  const gridLines = [.25,.5,.75,1].map(f =>
    `<line x1="${pL}" y1="${pT + cH - f*cH}" x2="${W-pR}" y2="${pT + cH - f*cH}" stroke="rgba(0,0,0,0.07)" stroke-width="1" stroke-dasharray="4,4"/>`
  ).join('');

  const bars = data.map((d,i) => {
    const x  = pL + i * slot + (slot - bW) / 2;
    const bH = d.total > 0 ? Math.max((d.total / maxVal) * cH, 4) : 4;
    const y  = pT + cH - bH;
    const fill = d.total > 0 ? 'url(#barGrad)' : 'rgba(28,26,20,0.08)';
    // #1A5247 = 8.5:1 on chart bg → AAA ✓ | rgba(28,26,20,0.7) ≈ 7.2:1 → AAA ✓
    const lbl  = d.total > 0 ? `<text x="${x+bW/2}" y="${y-6}" text-anchor="middle" font-size="10" font-weight="500" fill="#1A5247">$${d.total.toFixed(0)}</text>` : '';
    return `${lbl}
      <rect x="${x}" y="${y}" width="${bW}" height="${bH}" rx="6" fill="${fill}"/>
      <text x="${x+bW/2}" y="${H-4}" text-anchor="middle" font-size="10" font-weight="500" fill="rgba(28,26,20,0.72)">${d.name}</text>`;
  }).join('');

  const defs = `<defs>
    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1A5247"/>
      <stop offset="100%" stop-color="#7DC5B2"/>
    </linearGradient>
  </defs>`;

  el.innerHTML = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${defs}${gridLines}${bars}</svg>`;
}

function initExpensesForm() {
  const form      = document.getElementById('add-expense-form');
  if (!form) return;
  const amountInp = document.getElementById('exp-amount');
  const descInp   = document.getElementById('exp-desc');
  const submitBtn = form.querySelector('.submit-btn');

  function checkExpValid() {
    const amt = parseFloat(amountInp.value);
    submitBtn.disabled = !(amt > 0 && descInp.value.trim());
  }
  checkExpValid();
  amountInp.addEventListener('input', checkExpValid);
  descInp.addEventListener('input', checkExpValid);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const amount = parseFloat(amountInp.value);
    const desc   = descInp.value.trim();
    if (!amount || !desc) return;
    const newCat  = document.getElementById('exp-new-cat').value.trim();
    const cat     = newCat || S.selExpCat || 'Otro';
    const expense = { id: uid(), amount, desc, cat, date: new Date().toISOString() };
    S.expenses.unshift(expense);
    showToast('Gasto agregado');
    amountInp.value = '';
    descInp.value   = '';
    document.getElementById('exp-new-cat').value = '';
    checkExpValid();
    renderExpenses(); renderHomeStats();
    db.addExpense(expense).catch(() => {
      S.expenses = S.expenses.filter(e => e.id !== expense.id);
      renderExpenses(); renderHomeStats();
      showToast('Error al guardar el gasto');
    });
  });

  document.getElementById('open-month-btn').addEventListener('click', openMonthModal);
}

/* ============================================================
   MONTH MODAL
   ============================================================ */
function openMonthModal() {
  const modal   = document.getElementById('month-modal');
  const content = document.getElementById('month-content');
  const now = new Date();
  const start = startOfMonth(now);
  const end   = endOfMonth(now);

  const offset = start.getDay();
  const cells  = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
    const date  = new Date(d);
    const total = S.expenses.filter(e => isSameDay(e.date, date)).reduce((s,e) => s+e.amount, 0);
    cells.push({ date, total });
  }

  const monthTotal = cells.filter(Boolean).reduce((s,d) => s+d.total, 0);

  const headers = ['D','L','M','X','J','V','S'].map(h => `<div class="mo-dh">${h}</div>`).join('');
  const days    = cells.map(c => {
    if (!c) return `<div></div>`;
    const today = isSameDay(c.date, now);
    return `<div class="mo-day ${today ? 'today' : ''}">
      <span class="mo-dn">${fmtDate(c.date,'d')}</span>
      ${c.total > 0 ? `<span class="mo-da">$${c.total.toFixed(0)}</span>` : ''}
    </div>`;
  }).join('');

  content.innerHTML = `
    <h2 class="mo-title">${fmtDate(now,'MMMM yyyy')}</h2>
    <p class="mo-sub">Resumen de gastos del mes.</p>
    <div class="mo-grid">${headers}${days}</div>
    <div class="mo-total">
      <div class="mo-total-lbl">Total del mes</div>
      <div class="mo-total-amt">$${monthTotal.toFixed(2)}</div>
    </div>`;

  modal.style.display = 'flex';
  initDragDismiss();
}

function closeMonthModal() {
  const modal = document.getElementById('month-modal');
  const sheet = document.getElementById('month-sheet');
  modal.style.display = 'none';
  sheet.style.transform = '';
  if (sheet._cleanup) { sheet._cleanup(); sheet._cleanup = null; }
}

function initDragDismiss() {
  const sheet = document.getElementById('month-sheet');
  // Clean up any previous listeners before adding new ones
  if (sheet._cleanup) { sheet._cleanup(); sheet._cleanup = null; }

  let startY = 0, currentY = 0, dragging = false;

  function onStart(e) {
    startY   = e.touches ? e.touches[0].clientY : e.clientY;
    dragging = true;
    sheet.style.transition = 'none';
  }
  function onMove(e) {
    if (!dragging) return;
    currentY = (e.touches ? e.touches[0].clientY : e.clientY) - startY;
    if (currentY > 0) sheet.style.transform = `translateY(${currentY}px)`;
  }
  function onEnd() {
    if (!dragging) return;
    dragging = false;
    sheet.style.transition = '';
    currentY > 80 ? closeMonthModal() : (sheet.style.transform = '');
    currentY = 0;
  }

  // Touch: on element (scroll inside sheet still works via passive)
  sheet.addEventListener('touchstart', onStart, { passive: true });
  sheet.addEventListener('touchmove',  onMove,  { passive: true });
  sheet.addEventListener('touchend',   onEnd);
  // Mouse: on document so drag works even when cursor leaves the sheet
  sheet.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onEnd);

  sheet._cleanup = () => {
    sheet.removeEventListener('touchstart', onStart);
    sheet.removeEventListener('touchmove',  onMove);
    sheet.removeEventListener('touchend',   onEnd);
    sheet.removeEventListener('mousedown',  onStart);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onEnd);
  };
}

/* ============================================================
   HEALTH
   ============================================================ */
function renderHealth() {
  renderHabits();
  renderIconPicker();
}

function renderHabits() {
  const el = document.getElementById('habits-list');
  if (!el) return;

  const TRASH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
  const BOLT  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

  el.innerHTML = S.habits.map(h => {
    const Icon     = ICONS[h.icon] || ICONS.heart;
    const pct      = Math.round((h.current / h.goal) * 100);
    const done     = h.current >= h.goal;
    const fillClr  = done ? '#1A6B00' : h.color; // #1A6B00 = 7.9:1 on track, AAA ✓

    return `<div class="habit-card">
      <div class="habit-hd">
        <div class="habit-hd-l">
          <div class="habit-icon" style="background:${h.color}20;color:${h.color}">${Icon}</div>
          <h3 class="habit-name">${h.name}</h3>
        </div>
        <button class="habit-del" onclick="delHabit('${h.id}')" aria-label="Eliminar ${h.name}">${TRASH}</button>
      </div>
      <div class="habit-stepper-row">
        <div class="habit-stepper">
          <button class="stepper-btn" onclick="updHabit('${h.id}',-1)" aria-label="Disminuir">−</button>
          <span class="stepper-val" style="color:${h.color}">${h.current}</span>
          <button class="stepper-btn" onclick="updHabit('${h.id}',1)" style="color:${h.color}" aria-label="Aumentar">+</button>
        </div>
        <p class="habit-goal-txt">/ ${h.goal} ${h.unit}</p>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${fillClr};box-shadow:0 0 8px ${fillClr}80"></div></div>
      ${done ? `<div class="goal-done">${BOLT} Meta cumplida!</div>` : ''}
    </div>`;
  }).join('');
}

window.updHabit = function(id, delta) {
  const h = S.habits.find(x => x.id === id);
  if (!h) return;
  const prev = h.current;
  h.current = Math.max(0, Math.min(h.goal, h.current + delta));
  renderHabits();
  // bump animation on the stepper value
  const card = [...document.querySelectorAll('.habit-card')].find(el =>
    el.querySelector('.habit-del')?.getAttribute('onclick')?.includes(id)
  );
  if (card) {
    const val = card.querySelector('.stepper-val');
    if (val) {
      val.classList.remove('bump');
      void val.offsetWidth;
      val.classList.add('bump');
      setTimeout(() => val.classList.remove('bump'), 150);
    }
  }
  renderHomeStats();
  db.updateHabit(id, { current: h.current }).catch(() => {
    h.current = prev; renderHabits(); renderHomeStats();
    showToast('Error al guardar');
  });
};

window.delHabit = async function(id) {
  if (!await mdConfirm('¿Eliminar este hábito?')) return;
  const prev = [...S.habits];
  S.habits = S.habits.filter(x => x.id !== id);
  renderHabits(); renderHomeStats();
  db.deleteHabit(id).catch(() => {
    S.habits = prev; renderHabits(); renderHomeStats();
    showToast('Error al eliminar');
  });
};

function renderIconPicker() {
  const el = document.getElementById('icon-picker');
  if (!el) return;
  el.innerHTML = Object.keys(ICONS).map(k =>
    `<button type="button" class="icon-btn ${S.selHabitIcon === k ? 'active' : ''}" onclick="selIcon('${k}')">${ICONS[k]}</button>`
  ).join('');
}
window.selIcon = function(k) { S.selHabitIcon = k; renderIconPicker(); };

function initHealthForm() {
  const btn     = document.getElementById('toggle-habit-btn');
  const wrapper = document.getElementById('habit-form-wrapper');

  btn.addEventListener('click', () => {
    S.habitFormOpen = !S.habitFormOpen;
    wrapper.style.maxHeight = S.habitFormOpen ? '600px' : '0';
    wrapper.style.opacity   = S.habitFormOpen ? '1' : '0';

    if (S.habitFormOpen) {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg><span>Cancelar</span>`;
      btn.className = 'add-habit-btn cancel';
    } else {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg><span>Agregar hábito</span>`;
      btn.className = 'add-habit-btn';
    }
  });

  const habitForm   = document.getElementById('add-habit-form');
  const habitNameInp = document.getElementById('habit-name');
  const habitSubmit  = habitForm.querySelector('.submit-btn');

  function checkHabitValid() {
    habitSubmit.disabled = !habitNameInp.value.trim();
  }
  checkHabitValid();
  habitNameInp.addEventListener('input', checkHabitValid);

  habitForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = habitNameInp.value.trim();
    if (!name) return;
    const goal  = parseInt(document.getElementById('habit-goal').value) || 1;
    const unit  = document.getElementById('habit-unit').value.trim() || 'veces';
    const color = HABIT_COLORS[S.habits.length % HABIT_COLORS.length];

    const habit = { id: uid(), name, icon: S.selHabitIcon, goal, current: 0, unit, color };
    S.habits.push(habit);
    db.addHabit(habit).catch(() => {
      S.habits = S.habits.filter(h => h.id !== habit.id);
      renderHealth(); renderHomeStats();
      showToast('Error al guardar el hábito');
    });
    showToast('Hábito agregado');
    habitForm.reset();
    document.getElementById('habit-goal').value = '1';
    checkHabitValid();
    S.habitFormOpen = false;
    wrapper.style.maxHeight = '0';
    wrapper.style.opacity   = '0';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg><span>Agregar hábito</span>`;
    btn.className = 'add-habit-btn';
    renderHealth(); renderHomeStats();
  });
}

/* ============================================================
   NOTES
   ============================================================ */
function fmtNoteDate(ts) {
  const now  = new Date();
  const d    = new Date(ts);
  const diff = now - d;
  const DAY  = 86400000;
  const pad  = n => String(n).padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const MONS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  if (diff < DAY && now.getDate() === d.getDate()) return `Hoy, ${time}`;
  if (diff < 2 * DAY) return `Ayer, ${time}`;
  if (diff < 7 * DAY) return `${DAYS[d.getDay()]}, ${time}`;
  return `${d.getDate()} ${MONS[d.getMonth()]}`;
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function renderNotes() {
  const grid = document.getElementById('notes-grid');
  if (!grid) return;

  const sorted = [...S.notes].sort((a, b) => b.updated - a.updated);

  if (!sorted.length) {
    grid.innerHTML = `
      <div class="notes-empty">
        <div class="notes-empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
        </div>
        <p>Sin notas todavía</p>
        <span>Toca el botón + para crear tu primera nota.</span>
      </div>`;
    return;
  }

  grid.innerHTML = sorted.map(n => {
    const preview = stripHtml(n.body).trim().slice(0, 120);
    const hasTitle = n.title.trim();
    return `<div class="note-card" onclick="openNote('${n.id}')">
      <div class="note-card-title ${hasTitle ? '' : 'untitled'}">${hasTitle || 'Sin título'}</div>
      ${preview ? `<div class="note-card-preview">${preview}</div>` : ''}
      <div class="note-card-date">${fmtNoteDate(n.updated)}</div>
    </div>`;
  }).join('');
}

window.openNote = function(id) {
  const note = S.notes.find(n => n.id === id);
  if (!note) return;
  S.activeNoteId = id;

  document.getElementById('note-title-input').value = note.title;
  document.getElementById('note-body-input').innerHTML = note.body || '';
  document.getElementById('note-topbar-date').textContent = fmtNoteDate(note.updated);

  const overlay = document.getElementById('note-editor');
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
  // Force reflow then animate in
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));

  // Focus body if title exists, else title
  setTimeout(() => {
    if (note.title.trim()) {
      const body = document.getElementById('note-body-input');
      body.focus();
      // Move caret to end
      const range = document.createRange();
      const sel   = window.getSelection();
      range.selectNodeContents(body);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      document.getElementById('note-title-input').focus();
    }
  }, 320);
};

function createNote() {
  const note = { id: uid(), title: '', body: '', updated: Date.now() };
  S.notes.unshift(note);
  renderHomeStats();
  // Persist immediately so it survives a reload even if the user never types
  db.upsertNote(note).catch(err => console.error('[Growth] createNote:', err));
  openNote(note.id);
  setTimeout(() => document.getElementById('note-title-input').focus(), 360);
}

let _noteSaveTimer = null;
function scheduleSave() {
  clearTimeout(_noteSaveTimer);
  _noteSaveTimer = setTimeout(saveActiveNote, 400);
}

function saveActiveNote() {
  if (!S.activeNoteId) return;
  const note = S.notes.find(n => n.id === S.activeNoteId);
  if (!note) return;
  note.title   = document.getElementById('note-title-input').value.trim();
  note.body    = document.getElementById('note-body-input').innerHTML;
  note.updated = Date.now();
  document.getElementById('note-topbar-date').textContent = fmtNoteDate(note.updated);
  // Fire-and-forget — already debounced by scheduleSave
  db.upsertNote(note).catch(err => console.error('[Growth] saveNote:', err));
}

function closeNoteEditor() {
  saveActiveNote();
  const overlay = document.getElementById('note-editor');
  overlay.classList.add('closing');
  overlay.classList.remove('open');
  overlay.addEventListener('transitionend', () => {
    overlay.style.display = 'none';
    overlay.classList.remove('closing');
    overlay.setAttribute('aria-hidden', 'true');
    S.activeNoteId = null;
    renderNotes();
  }, { once: true });
}

async function deleteActiveNote() {
  if (!S.activeNoteId) return;
  if (!await mdConfirm('¿Eliminar esta nota?')) return;
  const deletedId = S.activeNoteId;
  const prev = [...S.notes];
  S.notes = S.notes.filter(n => n.id !== deletedId);
  renderHomeStats();
  db.deleteNote(deletedId).catch(() => {
    S.notes = prev;
    renderHomeStats();
    showToast('Error al eliminar la nota');
  });
  showToast('Nota eliminada');
  const overlay = document.getElementById('note-editor');
  overlay.classList.add('closing');
  overlay.classList.remove('open');
  overlay.addEventListener('transitionend', () => {
    overlay.style.display = 'none';
    overlay.classList.remove('closing');
    overlay.setAttribute('aria-hidden', 'true');
    S.activeNoteId = null;
    renderNotes();
  }, { once: true });
}

function updateToolbarState() {
  const QUERY_CMDS = ['bold','italic','underline','strikeThrough','insertUnorderedList','insertOrderedList'];
  document.querySelectorAll('.note-fmt-btn').forEach(btn => {
    const cmd = btn.dataset.cmd;
    if (!cmd) return;
    let active = false;
    try {
      if (QUERY_CMDS.includes(cmd)) {
        active = document.queryCommandState(cmd);
      } else if (cmd === 'formatBlock') {
        const block = document.queryCommandValue('formatBlock');
        active = block.toLowerCase() === (btn.dataset.val || '').toLowerCase();
      }
    } catch(e) { /* ignore */ }
    btn.classList.toggle('fmt-active', active);
  });
}

function initNotes() {
  // FAB
  document.getElementById('notes-fab').addEventListener('click', createNote);

  // Back button
  document.getElementById('note-back-btn').addEventListener('click', closeNoteEditor);

  // Delete button
  document.getElementById('note-delete-btn').addEventListener('click', deleteActiveNote);

  // Title: auto-save + Enter jumps to body
  const titleInput = document.getElementById('note-title-input');
  titleInput.addEventListener('input', scheduleSave);
  titleInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('note-body-input').focus();
    }
  });

  // Body: auto-save + toolbar state update
  const bodyInput = document.getElementById('note-body-input');
  bodyInput.addEventListener('input', () => {
    scheduleSave();
    updateToolbarState();
  });
  bodyInput.addEventListener('keyup',    updateToolbarState);
  bodyInput.addEventListener('mouseup',  updateToolbarState);
  bodyInput.addEventListener('touchend', updateToolbarState);

  // Format buttons
  document.getElementById('note-toolbar').addEventListener('mousedown', e => {
    const btn = e.target.closest('.note-fmt-btn');
    if (!btn) return;
    e.preventDefault(); // prevent losing body focus
    const cmd = btn.dataset.cmd;
    const val = btn.dataset.val || null;
    if (!cmd) return;

    bodyInput.focus();
    try {
      document.execCommand(cmd, false, val);
    } catch(err) { /* ignore */ }
    updateToolbarState();
    scheduleSave();
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.addEventListener('click', () => goTo(btn.dataset.tab))
  );

  // data-navigate links (stack cards, section cards)
  document.querySelectorAll('[data-navigate]').forEach(el =>
    el.addEventListener('click', () => goTo(el.dataset.navigate))
  );

  // Month modal close
  document.getElementById('close-month-btn').addEventListener('click', closeMonthModal);
  document.getElementById('month-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeMonthModal();
  });

  // Forms + scroll (sync — no data needed)
  initPlannerForm();
  initExpensesForm();
  initHealthForm();
  initNotes();
  initScroll();

  // ── Load all data from Supabase ──────────────────────────────
  const loadingEl = document.getElementById('db-loading');
  try {
    const data  = await db.loadAll();
    S.tasks    = data.tasks;
    S.expenses = data.expenses;
    S.habits   = data.habits;
    S.notes    = data.notes;
  } catch (err) {
    console.error('[Growth] DB load error:', err);
    const hint = diagSupabaseError(err);
    showToast(hint, 5000);
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }

  // Render with loaded data, then navigate home
  renderPlanner();
  renderExpenses();
  renderHealth();
  renderNotes();
  goTo('home');
});
