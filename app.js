const initialTasks = [
  {id:'d-marcas',title:'Práctica 1 · Protocolos web',subject:'Marcas',date:'2026-11-21',kind:'delivery',status:'waiting',notes:'Entrega hasta el sábado 21 de noviembre. La plataforma muestra 21-10, pero Jorge dijo que no se haga todavía: el enunciado parece del año pasado. Espera su aviso.',uncertain:true},
  {id:'d-db',title:'Reto 1 · The Architect',subject:'Bases de datos',date:'2026-12-04',kind:'delivery',status:'pending',notes:'Fecha límite: viernes 4 de diciembre.',uncertain:false},
  {id:'d-hw',title:'Reto 1 · Diagnóstico de equipos',subject:'Hardware',date:'',deadlineLabel:'Antes de Navidad · día exacto por confirmar',sortDate:'2026-12-24',kind:'delivery',status:'pending',notes:'La entrega es antes de Navidad; falta concretar el día.',uncertain:true},
  {id:'d-prog1',title:'Reto 1',subject:'Programación',date:'2027-01-22',kind:'delivery',status:'pending',notes:'Fecha límite: 22 de enero de 2027.',uncertain:false},
  {id:'d-prog2',title:'Reto 2',subject:'Programación',date:'2027-04-23',kind:'delivery',status:'pending',notes:'Fecha límite: 23 de abril de 2027.',uncertain:false},
  {id:'d-pc',title:'Tres presupuestos de PC · 550 €, 1.200 € y 2.500 €',subject:'Hardware',date:'',deadlineLabel:'Antes de fin de curso · voluntario',kind:'delivery',status:'pending',notes:'Trabajo voluntario que cuenta dentro del 20 % del trabajo de clase. Incluye componentes reales y sus enlaces.',uncertain:true},
  {id:'d-impl',title:'Calendario de retos',subject:'Implantación',date:'',kind:'delivery',status:'waiting',notes:'Todavía no hay fecha; pendiente de que publiquen el calendario de retos.',uncertain:true},
  {id:'d-redes',title:'Calendario de retos',subject:'Redes',date:'',kind:'delivery',status:'waiting',notes:'Todavía no hay fecha; pendiente de que publiquen el calendario de retos.',uncertain:true},
  {id:'d-ipe',title:'Calendario de retos',subject:'IPE',date:'',kind:'delivery',status:'waiting',notes:'Todavía no hay fecha; pendiente de que publiquen el calendario de retos.',uncertain:true}
];
const storeKey='asir-en-marcha-v1';
let tasks;
try {
  const saved=JSON.parse(localStorage.getItem(storeKey)) || [];
  tasks=initialTasks.map(seed=>{const previous=saved.find(t=>t.id===seed.id);return previous?{...seed,status:previous.status}:seed;});
  tasks.push(...saved.filter(t=>t.id.startsWith('u-')&&t.kind==='delivery'));
} catch { tasks=[...initialTasks]; }
let activeFilter='all';
const $=s=>document.querySelector(s);
const dateFmt=new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'});
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function dateLabel(d){return d?dateFmt.format(new Date(`${d}T12:00:00`)).replace('.',''):'';}
function save(){localStorage.setItem(storeKey,JSON.stringify(tasks));render();}
function getVisible(){return tasks.filter(t=>t.kind==='delivery'&&(activeFilter==='all'||(activeFilter==='pending'&&t.status!=='done'&&!t.uncertain)||(activeFilter==='uncertain'&&t.uncertain)||(activeFilter==='done'&&t.status==='done')));}
function render(){
  const open=tasks.filter(t=>t.status!=='done');
  const deadlineCount=open.filter(t=>t.kind==='delivery'&&t.date&&new Date(`${t.date}T23:59:59`)>new Date()).length;
  $('#statUpcoming').textContent=open.length; $('#statDeadlines').textContent=deadlineCount; $('#statConfirm').textContent=open.filter(t=>t.uncertain).length; $('#countAll').textContent=tasks.length; $('#countDone').textContent=tasks.filter(t=>t.status==='done').length;
  const visible=getVisible().sort((a,b)=>{const ad=a.date||a.sortDate||'9999';const bd=b.date||b.sortDate||'9999';return ad.localeCompare(bd)});
  $('#taskList').innerHTML=visible.length?visible.map(t=>`<article class="task-row ${t.status==='done'?'done':''}"><input class="task-check" type="checkbox" aria-label="Marcar ${esc(t.title)} como completada" data-check="${esc(t.id)}" ${t.status==='done'?'checked':''}><div class="task-main"><div class="task-title">${esc(t.title)}</div><div class="task-course">ASIR 1.º · ${esc(t.subject)}</div><div class="task-note">${esc(t.notes||'')}</div></div><div class="subject">${esc(t.subject)}</div><div class="task-date">${t.date?dateLabel(t.date):esc(t.deadlineLabel||'Sin fecha')}<small>${t.date?(t.uncertain?'fecha por confirmar':'fecha indicada'):(t.uncertain?'fecha aproximada / por confirmar':'esperando aviso')}</small></div><span class="badge ${t.kind==='delivery'?'delivery':''} ${t.uncertain?'uncertain':''}">${t.uncertain?'Por confirmar':t.status==='done'?'Hecho':'Entrega / reto'}</span>${t.id.startsWith('u-')?`<button class="delete-task" data-delete="${esc(t.id)}" aria-label="Eliminar entregable">×</button>`:'<span></span>'}</article>`).join(''):`<div class="empty-state">No hay entregables en esta vista. ✳</div>`;
  document.querySelectorAll('[data-check]').forEach(el=>el.addEventListener('change',()=>{let t=tasks.find(x=>x.id===el.dataset.check);if(t)t.status=el.checked?'done':'pending';save()}));
  document.querySelectorAll('[data-delete]').forEach(el=>el.addEventListener('click',()=>{tasks=tasks.filter(x=>x.id!==el.dataset.delete);save()}));
}
function openDialog(){ $('#taskForm').reset(); $('#taskDialog').showModal(); }
$('#addTop').addEventListener('click',openDialog);
$('#taskForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);tasks.unshift({id:`u-${Date.now()}`,title:f.get('title').trim(),subject:f.get('subject'),date:f.get('date'),kind:'delivery',status:'pending',notes:f.get('notes').trim(),uncertain:f.has('uncertain')});$('#taskDialog').close();activeFilter='all';document.querySelectorAll('.view-tab').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));save();});
document.querySelectorAll('.view-tab').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;document.querySelectorAll('.view-tab').forEach(x=>x.classList.toggle('active',x===b));render()}));
$('#weekLink').addEventListener('click',()=>$('#calendario').scrollIntoView({behavior:'smooth'}));
render();
