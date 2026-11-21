const $ = (id) => document.getElementById(id);
const today = new Date();
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parseDate = key => { const [y,m,d]=key.split('-').map(Number); return new Date(y,m-1,d); };
const storeKey = 'dreamyDiaries.v1';
let data = {};
try { data = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch { data = {}; }
let selected = dateKey(today);
let viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let toastTimer;
function dayData(key){ if(!data[key]) data[key]={title:'',text:'',mood:'',tasks:[],favorite:false}; if(!Array.isArray(data[key].tasks))data[key].tasks=[]; if(typeof data[key].favorite!=='boolean')data[key].favorite=false; return data[key]; }
function save(){ try { localStorage.setItem(storeKey, JSON.stringify(data)); $('saveStatus').textContent='Saved on this device'; } catch { $('saveStatus').textContent='Could not save — storage may be full'; } }
function notify(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200);}
function pretty(key, opts={weekday:'long',year:'numeric',month:'long',day:'numeric'}){return parseDate(key).toLocaleDateString(undefined,opts);}
function renderCalendar(){
  $('monthTitle').textContent=viewMonth.toLocaleDateString(undefined,{month:'long',year:'numeric'});
  $('selectedDateLabel').textContent=pretty(selected);
  const first=new Date(viewMonth.getFullYear(),viewMonth.getMonth(),1);
  const offset=(first.getDay()+6)%7;
  const start=new Date(first);start.setDate(first.getDate()-offset);
  const cal=$('calendar');cal.innerHTML='';
  for(let i=0;i<42;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);const key=dateKey(d);const rec=data[key];
    const b=document.createElement('button');b.className='day'+(d.getMonth()!==viewMonth.getMonth()?' other':'')+(key===selected?' selected':'')+(key===dateKey(today)?' today':'');
    b.type='button';b.textContent=d.getDate();b.setAttribute('aria-label',pretty(key));
    if(rec&&(rec.text||rec.title||rec.mood||rec.tasks?.length)){
      const marks=document.createElement('span');marks.className='marks';
      if(rec.text||rec.title){const dot=document.createElement('i');dot.className='dot journal-dot';marks.append(dot);}
      if(rec.tasks?.length){const dot=document.createElement('i');dot.className='dot task-dot';marks.append(dot);}
      b.append(marks);
    }
    b.addEventListener('click',()=>{selected=key;viewMonth=new Date(d.getFullYear(),d.getMonth(),1);renderAll();});
    cal.append(b);
  }
}
function renderDay(){
  const rec=dayData(selected);
  $('entryTitle').value=rec.title;$('entryText').value=rec.text;$('moodSelect').value=rec.mood;
  const fav=$('favoriteBtn');fav.classList.toggle('is-favorite',rec.favorite);fav.textContent=rec.favorite?'♥':'♡';fav.setAttribute('aria-pressed',String(rec.favorite));fav.title=rec.favorite?'Remove from favourites':'Add this entry to favourites';
  renderTasks();
}
function renderTasks(){
  const tasks=dayData(selected).tasks;const list=$('taskList');list.innerHTML='';
  if(!tasks.length){const p=document.createElement('p');p.className='empty';p.textContent='Nothing on your list yet. Add a little task above.';list.append(p);}
  tasks.forEach((task,index)=>{
    const row=document.createElement('div');row.className='task-item'+(task.done?' done':'');
    const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!task.done;cb.setAttribute('aria-label','Mark task complete');
    cb.addEventListener('change',()=>{tasks[index].done=cb.checked;save();renderTasks();renderCalendar();});
    const label=document.createElement('span');label.textContent=task.text;
    const del=document.createElement('button');del.className='delete-task';del.type='button';del.textContent='×';del.title='Delete task';
    del.addEventListener('click',()=>{tasks.splice(index,1);save();renderTasks();renderCalendar();});
    row.append(cb,label,del);list.append(row);
  });
  const done=tasks.filter(t=>t.done).length;const pct=tasks.length?Math.round(done/tasks.length*100):0;
  $('taskCount').textContent=`${tasks.length} task${tasks.length===1?'':'s'}`;$('progressText').textContent=pct+'%';$('progressBar').style.width=pct+'%';
}

function renderFavorites(){
  const list=$('favoriteList');list.innerHTML='';
  const favorites=Object.entries(data).filter(([,rec])=>rec&&rec.favorite).sort((a,b)=>b[0].localeCompare(a[0]));
  $('favoriteCount').textContent=`${favorites.length} saved`;
  if(!favorites.length){const p=document.createElement('p');p.className='muted';p.textContent='Entries you favourite will appear here.';list.append(p);return;}
  favorites.forEach(([key,rec])=>{
    const item=document.createElement('div');item.className='favorite-item';
    const details=document.createElement('div');details.className='favorite-details';
    const title=document.createElement('strong');title.textContent=rec.title||'Untitled entry';
    const date=document.createElement('span');date.className='muted';date.textContent=pretty(key);
    const excerpt=document.createElement('p');excerpt.textContent=(rec.text||'').slice(0,160)+(rec.text?.length>160?'…':'');
    details.append(title,date,excerpt);
    const actions=document.createElement('div');actions.className='favorite-actions';
    const open=document.createElement('button');open.className='text-btn';open.type='button';open.textContent='Open';open.addEventListener('click',()=>{selected=key;const d=parseDate(key);viewMonth=new Date(d.getFullYear(),d.getMonth(),1);renderAll();window.scrollTo({top:0,behavior:'smooth'});});
    const remove=document.createElement('button');remove.className='text-btn';remove.type='button';remove.textContent='Remove ♥';remove.addEventListener('click',()=>{dayData(key).favorite=false;save();renderFavorites();if(key===selected)renderDay();notify('Removed from favourites');});
    actions.append(open,remove);item.append(details,actions);list.append(item);
  });
}
$('favoriteBtn').addEventListener('click',()=>{const rec=dayData(selected);rec.favorite=!rec.favorite;save();renderDay();renderFavorites();notify(rec.favorite?'Added to favourites':'Removed from favourites');});

function renderAll(){renderCalendar();renderDay();renderFavorites();}
function updateEntry(){const rec=dayData(selected);rec.title=$('entryTitle').value;rec.text=$('entryText').value;rec.mood=$('moodSelect').value;save();renderCalendar();if(rec.favorite)renderFavorites();}
$('entryTitle').addEventListener('input',updateEntry);$('entryText').addEventListener('input',updateEntry);$('moodSelect').addEventListener('change',updateEntry);
$('taskForm').addEventListener('submit',e=>{e.preventDefault();const text=$('taskInput').value.trim();if(!text)return;dayData(selected).tasks.push({text,done:false});$('taskInput').value='';save();renderTasks();renderCalendar();});
$('prevMonth').addEventListener('click',()=>{viewMonth.setMonth(viewMonth.getMonth()-1);renderCalendar();});
$('nextMonth').addEventListener('click',()=>{viewMonth.setMonth(viewMonth.getMonth()+1);renderCalendar();});
$('todayBtn').addEventListener('click',()=>{selected=dateKey(today);viewMonth=new Date(today.getFullYear(),today.getMonth(),1);renderAll();});
$('todayLabel').textContent=pretty(dateKey(today),{weekday:'short',month:'short',day:'numeric',year:'numeric'});
$('themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');const dark=document.body.classList.contains('dark');localStorage.setItem('dreamyDiaries.theme',dark?'dark':'light');$('themeBtn').textContent=dark?'☀':'☾';});
if(localStorage.getItem('dreamyDiaries.theme')==='dark'){document.body.classList.add('dark');$('themeBtn').textContent='☀';}
function runSearch(){
  const q=$('searchInput').value.trim().toLowerCase();const out=$('searchResults');out.innerHTML='';
  if(!q){out.innerHTML='<p class="muted">Type a word or phrase to search your entries.</p>';return;}
  const matches=Object.entries(data).filter(([key,r])=>(r.title||'').toLowerCase().includes(q)||(r.text||'').toLowerCase().includes(q)).sort((a,b)=>b[0].localeCompare(a[0]));
  if(!matches.length){out.innerHTML='<p class="muted">No matching entries found.</p>';return;}
  matches.forEach(([key,r])=>{const item=document.createElement('div');item.className='result-item';const title=document.createElement('strong');title.textContent=r.title||'Untitled entry';const date=document.createElement('span');date.className='muted';date.textContent=' · '+pretty(key);const p=document.createElement('p');p.textContent=(r.text||'').slice(0,240)+(r.text?.length>240?'…':'');const open=document.createElement('button');open.className='text-btn';open.textContent='Open this day';open.addEventListener('click',()=>{selected=key;const d=parseDate(key);viewMonth=new Date(d.getFullYear(),d.getMonth(),1);renderAll();window.scrollTo({top:0,behavior:'smooth'});});item.append(title,date,p,open);out.append(item);});
}
$('searchBtn').addEventListener('click',runSearch);$('searchInput').addEventListener('keydown',e=>{if(e.key==='Enter')runSearch();});
$('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({version:1,entries:data},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='DreamyDiaries-backup.json';a.click();URL.revokeObjectURL(url);notify('Backup downloaded. Keep it somewhere safe!');});
$('importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());const incoming=parsed.entries||parsed;if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))throw Error();if(!confirm('Import this backup? It will replace the diary data currently stored in this browser.'))return;data=incoming;save();renderAll();notify('Backup imported successfully.');}catch{alert('That backup file could not be read.');}e.target.value='';});
renderAll();

// Register the offline app shell when served from HTTPS or localhost.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
