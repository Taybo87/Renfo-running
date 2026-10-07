
const LIB={"Jambes": ["Squat", "Front squat", "Goblet squat", "Split squat", "Bulgarian split squat", "Fentes avant", "Fentes arrière", "Fentes marchées", "Step-up", "Step-down", "Presse à cuisses", "Hack squat", "Wall sit", "Spanish squat", "Soulevé de terre", "RDL", "Soulevé de terre jambes tendues", "Good morning", "Hip thrust", "Glute bridge", "Glute bridge une jambe", "Extension de hanche poulie", "Leg extension", "Leg curl assis", "Leg curl couché", "Nordic curl", "Reverse Nordic curl", "Copenhagen plank"], "Mollets / pied": ["Mollets debout", "Mollets assis", "Mollets une jambe", "Mollets sur marche", "Tibialis raises", "Flexion dorsale élastique", "Inversion du pied élastique", "Éversion du pied élastique", "Short foot", "Toe yoga", "Équilibre une jambe"], "Fessiers / hanches": ["Abduction élastique", "Abduction poulie", "Clamshell", "Monster walk", "Lateral band walk", "Fire hydrant", "Donkey kick", "Hip airplane", "Single-leg RDL", "Banded glute bridge"], "Gainage / tronc": ["Planche", "Planche latérale", "Planche latérale avec abduction", "Dead bug", "Bird dog", "Hollow body hold", "Crunch", "Crunch lesté", "Reverse crunch", "Pallof press", "Suitcase carry", "Farmer carry", "Bear crawl", "Mountain climber", "Russian twist", "Back extension"], "Haut du corps": ["Pompes", "Pompes inclinées", "Développé couché", "Développé incliné haltères", "Rowing haltère", "Rowing poulie", "Tirage vertical", "Tractions", "Tractions assistées", "Face pull", "Élévations latérales", "Développé épaules", "Curl biceps", "Extension triceps poulie", "Dips assistés"], "Mobilité": ["Mobilité cheville genou au mur", "Étirement soléaire", "Étirement gastrocnémien", "Rotation thoracique", "90/90 hanches", "Étirement fléchisseur de hanche"]};
let custom=JSON.parse(localStorage.getItem('rr_custom')||'[]');
let plan=JSON.parse(localStorage.getItem('rr_plan')||'[]');
let templates=JSON.parse(localStorage.getItem('rr_templates')||'[]');
let week=JSON.parse(localStorage.getItem('rr_week')||'null')||{count:2,goal:'Course à pied',days:[1,3],wish:'',constraints:''};
let activities=JSON.parse(localStorage.getItem('rr_activities')||'[]');
let targetGoal=JSON.parse(localStorage.getItem('rr_target_goal')||'null');
let weekSchedule=JSON.parse(localStorage.getItem('rr_week_schedule')||'{}');
let selectedWeekDay=null;
let wo=[],current=null;

const dayNames=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const dayFull=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

function allExercises(){return Object.values(LIB).flat().concat(custom)}
function histories(){return JSON.parse(localStorage.getItem('rr_hist')||'[]')}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function save(key,val){localStorage.setItem(key,JSON.stringify(val))}
function show(id,n){document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));document.querySelectorAll('nav button')[n]?.classList.add('active');if(id==='builder')picker();if(id==='templates'){renderTemplates();renderMyTemplates()}if(id==='week')renderWeek();if(id==='coach')renderCoach();window.scrollTo({top:0,behavior:'smooth'})}

function targetDaysLeft(){
 if(!targetGoal?.date)return null;
 const today=new Date(); const d=new Date(targetGoal.date+'T00:00:00');
 return Math.ceil((d-today)/(1000*60*60*24));
}
function renderTargetGoal(){
 const e=document.getElementById('targetGoalCard'); if(!e)return;
 if(!targetGoal){e.innerHTML=`<div class="target-empty"><div><h3 style="margin:0">🎯 Aucun objectif défini</h3><div class="muted" style="margin-top:5px">Définis ton prochain objectif pour que le Coach puisse adapter ta préparation.</div></div><button class="green" type="button" onclick="openTargetModal()">＋ Créer mon objectif</button></div>`;return;}
 const left=targetDaysLeft(); const countdown=left===null?'':left<0?`Échéance dépassée de ${Math.abs(left)} j`:left===0?'🎯 Aujourd’hui !':`${left} jours restants`;
 e.innerHTML=`<div class="row wrap"><div><div class="muted">🎯 Objectif actuel</div><div class="target-name">${esc(targetGoal.name)}</div><div class="target-meta">${esc(targetGoal.type)} · 📅 ${new Date(targetGoal.date+'T00:00:00').toLocaleDateString('fr-FR')}${targetGoal.performance?' · 🎯 '+esc(targetGoal.performance):''}</div><div class="target-days" style="margin-top:7px">${countdown}</div></div><div class="row"><button class="small secondary" type="button" onclick="openTargetModal(true)">✏️ Modifier</button><button class="small danger" type="button" onclick="deleteTargetGoal()">Supprimer</button></div></div>`;
}
function openTargetModal(edit=false){
 document.getElementById('targetModal').style.display='flex';
 document.getElementById('targetName').value=edit&&targetGoal?targetGoal.name:'';
 document.getElementById('targetType').value=edit&&targetGoal?targetGoal.type:'Marathon';
 document.getElementById('targetDate').value=edit&&targetGoal?targetGoal.date:'';
 document.getElementById('targetPerformance').value=edit&&targetGoal?(targetGoal.performance||''):'';
 setTimeout(()=>document.getElementById('targetName').focus(),0);
}
function closeTargetModal(){document.getElementById('targetModal').style.display='none'}
function saveTargetGoal(){
 const name=document.getElementById('targetName').value.trim(), date=document.getElementById('targetDate').value;
 if(!name||!date)return alert('Renseigne au minimum le nom et la date cible.');
 const d=new Date(date+'T00:00:00'); if(Number.isNaN(d.getTime()))return alert('Date invalide.');
 targetGoal={name,type:document.getElementById('targetType').value,date,performance:document.getElementById('targetPerformance').value.trim()}; save('rr_target_goal',targetGoal);closeTargetModal();renderWeek();
}
function deleteTargetGoal(){if(confirm('Supprimer cet objectif ?')){targetGoal=null;localStorage.removeItem('rr_target_goal');renderWeek();}}

function renderDayPicker(){
 const el=document.getElementById('renfoDays');el.innerHTML='';
 dayNames.forEach((d,i)=>{const l=document.createElement('label');l.innerHTML=`<input type="checkbox" value="${i}" ${week.days.includes(i)?'checked':''}><span>${d}</span>`;el.appendChild(l)});
}
function saveWeek(){
 const renfoDays=Object.entries(weekSchedule).filter(([d,a])=>a.type==='renfo').map(([d])=>+d);
 week={count:+document.getElementById('renfoCount').value,goal:document.getElementById('weekGoal').value,days:renfoDays,wish:document.getElementById('weekWish').value,constraints:document.getElementById('weekConstraints').value};
 save('rr_week',week);renderWeek();alert('Préférences de la semaine enregistrées.');
}
function scheduleForDay(d){return weekSchedule[d]||{type:'rest',name:'',duration:'',intensity:'',plan:''}}
function renfoChoices(){
  const choices=[];
  if(plan.length) choices.push({name:(document.getElementById('planName')?.value||'Ma séance renfo'),value:'current'});
  templates.forEach((t,i)=>choices.push({name:t.name,value:'template:'+i}));
  return choices;
}
function saveScheduleDay(d){
  const type=document.getElementById('dayType').value;
  const item={type,name:document.getElementById('dayName').value.trim(),duration:document.getElementById('dayDuration')?.value||'',intensity:document.getElementById('dayIntensity')?.value||'',plan:document.getElementById('dayPlan')?.value||''};
  if(type==='rest') Object.assign(item,{name:'',duration:'',intensity:'',plan:''});
  weekSchedule[d]=item; save('rr_week_schedule',weekSchedule); renderWeekPlanner();
}
function renderWeekPlanner(){
 const e=document.getElementById('weekPlanner'); if(!e)return;
 const labelFor=t=>t==='running'?'🏃 Running':t==='renfo'?'🏋️ Renfo':t==='cycling'?'🚴 Vélo':t==='swimming'?'🏊 Natation':t==='other'?'🏅 Autre':'😴 Repos';
 const rows=dayFull.map((d,i)=>{
   const s=scheduleForDay(i), label=labelFor(s.type), detail=s.type==='rest'?'':(s.name||label);
   let editor='';
   if(selectedWeekDay===i){
     const opts=renfoChoices().map(x=>`<option value="${esc(x.value)}" ${s.plan===x.value?'selected':''}>${esc(x.name)}</option>`).join('');
     editor=`<div class="day-editor"><div class="grid"><label>Type<select id="dayType" onchange="toggleDayFields()"><option value="rest" ${s.type==='rest'?'selected':''}>😴 Repos</option><option value="running" ${s.type==='running'?'selected':''}>🏃 Running</option><option value="renfo" ${s.type==='renfo'?'selected':''}>🏋️ Renfo</option><option value="cycling" ${s.type==='cycling'?'selected':''}>🚴 Vélo</option><option value="swimming" ${s.type==='swimming'?'selected':''}>🏊 Natation</option><option value="other" ${s.type==='other'?'selected':''}>🏅 Autre sport</option></select></label><label>Nom / séance<input id="dayName" value="${esc(s.name)}" placeholder="Ex : footing EF, sortie longue, renfo jambes..."></label></div><div class="grid" id="dayFields" style="margin-top:9px;display:${s.type==='rest'?'none':'grid'}"><label>Durée (min)<input id="dayDuration" type="number" min="0" value="${esc(s.duration)}"></label><label>Intensité<select id="dayIntensity"><option ${s.intensity==='facile'?'selected':''}>facile</option><option ${s.intensity==='modérée'?'selected':''}>modérée</option><option ${s.intensity==='difficile'?'selected':''}>difficile</option><option ${s.intensity==='très difficile'?'selected':''}>très difficile</option></select></label></div><div id="renfoPlanField" style="margin-top:9px;display:${s.type==='renfo'?'block':'none'}"><label>Séance renfo<select id="dayPlan"><option value="">Choisir une séance</option>${opts}</select></label></div><div class="row" style="margin-top:10px"><button class="green" type="button" onclick="saveScheduleDay(${i})">💾 Enregistrer</button>${s.type!=='rest'?`<button class="secondary" type="button" onclick="clearScheduleDay(${i})">Effacer</button>`:''}</div></div>`;
   }
   return `<div class="week-day-row ${selectedWeekDay===i?'open':''}"><button type="button" class="week-day-btn" onclick="selectWeekDay(${i})"><span><b>${d}</b><small>${label}${detail&&detail!==label?' · '+esc(detail).slice(0,38):''}</small></span><strong>${selectedWeekDay===i?'⌃':'›'}</strong></button>${editor}</div>`;
 }).join('');
 e.innerHTML=`<div class="week-day-list">${rows}</div>`;
}
function selectWeekDay(d){selectedWeekDay=selectedWeekDay===d?null:d;renderWeekPlanner()}
function toggleDayFields(){const t=document.getElementById('dayType')?.value;const f=document.getElementById('dayFields');const r=document.getElementById('renfoPlanField');if(f)f.style.display=t==='rest'?'none':'grid';if(r)r.style.display=t==='renfo'?'block':'none'}
function clearScheduleDay(d){weekSchedule[d]={type:'rest',name:'',duration:'',intensity:'',plan:''};save('rr_week_schedule',weekSchedule);renderWeekPlanner()}
function openWeekSettings(){const e=document.getElementById('weekPreferences');if(!e)return;e.style.display=e.style.display==='none'?'block':'none';if(e.style.display==='block'){document.getElementById('renfoCount').value=week.count;document.getElementById('weekGoal').value=week.goal;document.getElementById('weekWish').value=week.wish||'';document.getElementById('weekConstraints').value=week.constraints||''}}
function renderWeek(){
  renderTargetGoal();
  const pref=document.getElementById('weekPreferences');
  if(pref){document.getElementById('renfoCount').value=week.count;document.getElementById('weekGoal').value=week.goal;document.getElementById('weekWish').value=week.wish||'';document.getElementById('weekConstraints').value=week.constraints||''}
  renderWeekPlanner();
}
function openActivity(){
 const d=prompt('Jour (0=Lun, 1=Mar, ... 6=Dim)','1');if(d===null)return;const day=Math.max(0,Math.min(6,parseInt(d)||0));
 const name=prompt('Nom de la séance','Course à pied');if(!name)return;
 const duration=prompt('Durée en minutes','45');if(duration===null)return;
 const intensity=prompt('Intensité : facile / modérée / difficile / très difficile','modérée')||'modérée';
 const distance=prompt('Distance en km (facultatif)','');
 activities.push({day,name,duration:+duration||0,intensity,distance:distance?+distance:0,kind:'sport'});save('rr_activities',activities);renderWeek();
}
function removeActivity(i){activities.splice(i,1);save('rr_activities',activities);renderWeek()}
function proposeWeek(){
 const scheduled=dayFull.map((d,i)=>({d,i,s:scheduleForDay(i)}));
 const renfo=scheduled.filter(x=>x.s.type==='renfo');
 if(!renfo.length)return document.getElementById('proposal').innerHTML='<div class="muted">Clique sur un jour et choisis « Renfo » pour planifier une séance.</div>';
 const hard=scheduled.filter(x=>/difficile|très/i.test(x.s.intensity||''));
 const proposal=renfo.map((x,i)=>{const nearby=hard.some(y=>Math.abs(y.i-x.i)<=1);let focus=i%2===0?'Force / jambes + gainage':'Prévention / stabilité + haut du corps';if(nearby)focus='Prévention / stabilité + gainage léger';return `<div class="event"><div class="icon">🤖</div><div class="event-main"><div class="event-title">${x.d} · Renfo ${i+1}</div><div class="event-meta">${focus}${nearby?' · charge réduite car séance intense proche':''}</div></div></div>`}).join('');
 document.getElementById('proposal').innerHTML=proposal;
}

function latestHistory(){const h=histories();return h.length?h[0]:null}
function coachIntensityScore(){
  const h=latestHistory();
  const recent=activities.slice(-7);
  let score=0;
  recent.forEach(a=>{if(/très difficile/i.test(a.intensity))score+=3;else if(/difficile/i.test(a.intensity))score+=2;else if(/modérée/i.test(a.intensity))score+=1});
  if(h) score+=Math.min(3,Math.round((h.fatigue||0)/3));
  if(h) score+=Math.min(2,Math.round(Math.max(h.foot||0,h.ankle||0,h.hip||0)/4));
  return score;
}
function coachRecommendation(){
  const h=latestHistory(), score=coachIntensityScore();
  const goal=week.goal||'Course à pied';
  let mode='normal', label='Charge modérée';
  if(score>=7){mode='light';label='Semaine allégée';}
  else if(score>=4){mode='moderate';label='Charge prudente';}
  const wish=(week.wish||'').toLowerCase();
  let focus=goal;
  if(wish) focus=week.wish;
  let note=score>=7?'La charge globale récente paraît élevée : mieux vaut privilégier la qualité, la technique et garder 2–3 répétitions en réserve.':score>=4?'La charge récente est déjà conséquente : je réduirais légèrement le volume ou le RPE.':'La charge récente paraît compatible avec une séance de renforcement normale, en restant attentif au ressenti.';
  if(h && Math.max(h.foot||0,h.ankle||0,h.hip||0)>=5) note+=' Une douleur notable a été signalée à la dernière séance : évite de pousser la zone douloureuse et adapte si elle augmente.';
  return {score,mode,label,focus,note};
}
function buildCoachPlan(){
  const r=coachRecommendation();
  const templatesBuilt=[
    {name:'Force jambes + gainage',goal:'Force',items:[{name:'Squat',sets:3,mode:'reps',reps:r.mode==='light'?5:6,load:0,rest:150,rpe:r.mode==='light'?6:7,series:[]},{name:'Hip thrust',sets:3,mode:'reps',reps:8,load:0,rest:120,rpe:r.mode==='light'?6:7,series:[]},{name:'Mollets debout',sets:3,mode:'reps',reps:12,load:0,rest:60,rpe:6,series:[]},{name:'Planche',sets:3,mode:'time',sec:40,load:0,rest:45,rpe:6,series:[]}]},
    {name:'Prévention course à pied',goal:'Prévention / stabilité',items:[{name:'Split squat',sets:3,mode:'reps',reps:r.mode==='light'?6:8,load:0,rest:90,rpe:6,series:[]},{name:'Mollets une jambe',sets:3,mode:'reps',reps:12,load:0,rest:60,rpe:6,series:[]},{name:'Clamshell',sets:3,mode:'reps',reps:15,load:0,rest:45,rpe:5,series:[]},{name:'Pallof press',sets:3,mode:'reps',reps:10,load:0,rest:45,rpe:6,series:[]}]},
    {name:'Haut du corps + tronc',goal:'Mixte',items:[{name:'Pompes',sets:3,mode:'reps',reps:10,load:0,rest:75,rpe:7,series:[]},{name:'Rowing haltère',sets:3,mode:'reps',reps:10,load:0,rest:75,rpe:7,series:[]},{name:'Face pull',sets:3,mode:'reps',reps:12,load:0,rest:60,rpe:7,series:[]},{name:'Dead bug',sets:3,mode:'reps',reps:10,load:0,rest:45,rpe:6,series:[]}]}
  ];
  let requestedGoal=(r.focus||week.goal||'').toLowerCase();
  let t=templatesBuilt.find(x=>requestedGoal===x.goal.toLowerCase())||templatesBuilt.find(x=>/prévention|stabilité|cheville|pied/i.test(week.wish||''))||templatesBuilt[0];
  if(/haut|tronc/i.test(week.wish||'')) t=templatesBuilt[2];
  if(/prévention|stabilité|cheville|pied/i.test(week.wish||'')) t=templatesBuilt[1];
  const p={...t,items:t.items.map(x=>({...x,series:makeSeries(x)}))};
  return p;
}
function renderCoach(){
  const a=document.getElementById('coachAnalysis'),p=document.getElementById('coachProposal');
  if(!a||!p)return;
  const r=coachRecommendation(),h=latestHistory();
  const hard=activities.filter(x=>/difficile|très/i.test(x.intensity)).length;
  a.innerHTML=`<div class="card"><h3>🔎 Lecture de la semaine</h3><div class="statgrid"><div class="stat"><b>${week.count}</b><span>séances renfo</span></div><div class="stat"><b>${activities.length}</b><span>autres séances</span></div><div class="stat"><b>${r.score}</b><span>charge ressentie</span></div></div><p class="muted" style="margin-bottom:0">Objectif : <b>${esc(week.goal)}</b>${week.wish?' · Travail demandé : <b>'+esc(week.wish)+'</b>':''}</p>${hard?'<p class="muted">'+hard+' séance(s) difficile(s) sont renseignée(s) cette semaine.</p>':''}${h?'<p class="muted">Dernière séance : fatigue <b>'+h.fatigue+'/10</b> · pied <b>'+h.foot+'/10</b> · cheville <b>'+h.ankle+'/10</b> · hanche <b>'+h.hip+'/10</b>.</p>'+(h.note?'<div class="notice">📝 <b>Dernier commentaire :</b> '+esc(h.note)+'</div>':''):'<p class="muted">Pas encore d’historique de séance : la proposition sera prudente.</p>'}</div>`;
  const q=buildCoachPlan();
  p.innerHTML=`<div class="card"><div class="row"><div><h3>💡 Proposition</h3><span class="pill">${esc(r.label)}</span></div><button class="green small" onclick="acceptCoach()">✅ Utiliser cette séance</button></div><p>${esc(r.note)}</p><div class="event"><div class="icon">🏋️</div><div class="event-main"><div class="event-title">${esc(q.name)}</div><div class="event-meta">${q.items.length} exercices · objectif ${esc(q.goal)}</div></div></div>${q.items.map(x=>`<div class="event"><div class="event-main"><div class="event-title">${esc(x.name)}</div><div class="event-meta">${x.series.length} × ${x.mode==='reps'?x.series[0].target+' reps':x.series[0].target+' sec'} · RPE cible ${x.rpe||'—'} · repos ${x.series[0].rest}s</div></div></div>`).join('')}<div class="notice" style="margin-top:10px">Tu gardes la main : « Utiliser » charge la séance dans le préparateur, où tu peux modifier chaque série avant de démarrer.</div></div>`;
  window._coachPlan=q;
}
const DEFAULT_AI_ENDPOINT='https://renfo-running-ai.thibaud-hennequin.workers.dev';
function getAIEndpoint(){return localStorage.getItem('rr_ai_endpoint')||DEFAULT_AI_ENDPOINT}
function saveAIEndpoint(){const v=(document.getElementById('aiEndpoint').value||'').trim().replace(/\/$/,'');if(v)localStorage.setItem('rr_ai_endpoint',v);else localStorage.removeItem('rr_ai_endpoint');alert(v?'Backend IA enregistré.':'Backend IA réinitialisé.')}
async function checkAIConnection(){
  const e=document.getElementById('coachStatus');
  const endpoint=getAIEndpoint();
  if(!e||!endpoint) return false;
  e.className='notice';
  e.textContent='⏳ Vérification de la connexion IA…';
  try{
    const r=await fetch(endpoint,{method:'GET',cache:'no-store'});
    const d=await r.json().catch(()=>({}));
    if(r.ok && d.ok){
      e.className='notice success';
      e.textContent='🟢 IA connectée · backend sécurisé';
      return true;
    }
    throw new Error(d.error||('Backend indisponible ('+r.status+')'));
  }catch(err){
    e.className='notice danger';
    e.textContent='🔴 IA non connectée · vérifie le backend';
    return false;
  }
}
async function runRealCoach(){
  const endpoint=getAIEndpoint();
  if(!endpoint) return null;
  const h=latestHistory();
  const payload=h?.aiPayload||{version:'1.0',session:null,week:{...week, targetGoal:targetGoal?{...targetGoal,daysLeft:targetDaysLeft()}:null, schedule:weekSchedule, activities:activities.map(a=>({...a}))},recentHistory:histories().slice(0,10),instruction:'Proposer la prochaine séance de renforcement en tenant compte de toutes les données disponibles, notamment de l’objectif cible et du nombre de jours restant avant l’échéance.'};
  const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error||('Erreur backend '+res.status));
  return data;
}
async function runCoach(){
  const e=document.getElementById('coachStatus');
  if(e){e.className='notice';e.textContent='⏳ Analyse en cours…';}
  try{
    const endpoint=getAIEndpoint();
    if(endpoint){
      const data=await runRealCoach();
      if(data?.proposal?.plan){
        const prop=data.proposal; const q=prop.plan;
        q.items=(q.items||[]).map(x=>({...x,sets:x.sets||x.series?.length||3,series:makeSeries(x)}));
        window._coachPlan=q;
        document.getElementById('coachAnalysis').innerHTML=`<div class="card"><h3>🧠 Retour du Coach</h3><p>${esc(prop.analysis||'Analyse reçue.')}</p>${prop.recommendations?'<div class="notice">'+esc(prop.recommendations)+'</div>':''}</div>`;
        document.getElementById('coachProposal').innerHTML=`<div class="card"><div class="row"><div><h3>💡 ${esc(q.name||'Prochaine séance')}</h3><span class="pill">${esc(q.goal||'Renforcement')}</span></div><button class="green small" onclick="acceptCoach()">✅ Utiliser cette séance</button></div><p>${esc(prop.reason||'Proposition générée par le Coach IA.')}</p>${q.items.map(x=>`<div class="event"><div class="icon">🏋️</div><div class="event-main"><div class="event-title">${esc(x.name)}</div><div class="event-meta">${x.series.length} séries · RPE cible ${esc(x.rpe||'—')}</div></div></div>`).join('')}</div>`;
        if(e){e.className='notice success';e.textContent='✅ Analyse IA terminée.';}
        document.getElementById('coachProposal').scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
      throw new Error('Réponse IA inattendue');
    }
    renderCoach();
    if(e){e.className='notice';e.textContent='ℹ️ Mode local : renseigne le backend pour utiliser le vrai Coach IA.';}
  }catch(err){
    console.error('Coach IA:',err); renderCoach();
    if(e){e.className='notice danger';e.textContent='⚠️ '+(err.message||'Connexion impossible')+' — proposition locale affichée.';}
  }
}
function acceptCoach(){if(!window._coachPlan)return;loadPlanData(window._coachPlan)}

function picker(){const s=document.getElementById('picker');s.innerHTML='';Object.entries(LIB).forEach(([c,a])=>{const g=document.createElement('optgroup');g.label=c;a.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;g.appendChild(o)});s.appendChild(g)});if(custom.length){const g=document.createElement('optgroup');g.label='Mes exercices';custom.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;g.appendChild(o)});s.appendChild(g)}}
function newEx(){const n=prompt('Nom de l’exercice');if(!n||allExercises().includes(n))return;custom.push(n);save('rr_custom',custom);picker();document.getElementById('picker').value=n;addEx()}
function makeSeries(x){
  const n=Math.max(1,Math.min(20,Number(x.sets)||3));
  const old=Array.isArray(x.series)?x.series:[];
  return Array.from({length:n},(_,i)=>{const z=old[i]||{};return {target:Number(z.target??(x.mode==='reps'?x.reps:x.sec))||1,load:Number(z.load??x.load)||0,rest:Number(z.rest??x.rest)||0,rpe:z.rpe??x.rpe??''}});
}
function addEx(){const name=document.getElementById('picker').value;const x={name,sets:3,mode:'reps',reps:10,sec:30,load:0,rest:90,rpe:'',series:[]};x.series=makeSeries(x);plan.push(x);renderPlan()}
function delEx(i){plan.splice(i,1);renderPlan()}
function updEx(i,k,v){if(k==='mode'){plan[i].mode=v;plan[i].series=makeSeries(plan[i])}else if(k==='sets'){plan[i].sets=Math.max(1,Math.min(20,Number(v)||1));plan[i].series=makeSeries(plan[i])}else{plan[i][k]=Number(v)||0;plan[i].series=makeSeries(plan[i])}renderPlan()}
function updSeries(i,j,k,v){const x=plan[i];x.series=makeSeries(x);x.series[j][k]=(k==='rpe'&&v==='')?'':(Number(v)||0);x.sets=x.series.length;renderPlan()}
function renderPlan(){const e=document.getElementById('planList');e.innerHTML='';if(!plan.length){e.innerHTML='<div class="empty">Aucun exercice. Ajoute ton premier mouvement.</div>';return}plan.forEach((x,i)=>{x.series=makeSeries(x);const d=document.createElement('div');d.className='exercise-card';const rows=x.series.map((z,j)=>`<div class="series-row"><b>S${j+1}</b><input type="number" min="1" value="${z.target}" onchange="updSeries(${i},${j},'target',this.value)" aria-label="Objectif ${x.mode==='reps'?'répétitions':'secondes'} série ${j+1}"><input type="number" min="0" step="0.5" value="${z.load}" onchange="updSeries(${i},${j},'load',this.value)" aria-label="Charge série ${j+1}"><input type="number" min="0" value="${z.rest}" onchange="updSeries(${i},${j},'rest',this.value)" aria-label="Repos série ${j+1}"></div>`).join('');d.innerHTML=`<div class="row"><h3>${esc(x.name)}</h3><button class="danger remove" onclick="delEx(${i})">Supprimer</button></div><div class="grid" style="margin-top:9px"><label>Séries<input type="number" min="1" max="20" value="${x.sets}" onchange="updEx(${i},'sets',this.value)"></label><label>Type<select onchange="updEx(${i},'mode',this.value)"><option value="reps" ${x.mode==='reps'?'selected':''}>Répétitions</option><option value="time" ${x.mode==='time'?'selected':''}>Temps</option></select></label><label>RPE cible<input type="number" min="1" max="10" step="0.5" value="${x.rpe}" onchange="updEx(${i},'rpe',this.value)"></label><label>Charge de base<input type="number" min="0" step="0.5" value="${x.load}" onchange="updEx(${i},'load',this.value)"></label></div><div class="muted" style="margin-top:10px">Tu peux programmer une charge et un objectif différents pour chaque série.</div><div class="series-head"><span>Série</span><span>${x.mode==='reps'?'Reps':'Sec.'}</span><span>Kg</span><span>Repos</span></div>${rows}`;e.appendChild(d)})}
function syncPlanName(v){ if(plan && plan._meta) plan._meta.name=v; }
function renameCurrentPlan(){ const input=document.getElementById('planName'); const name=prompt('Nouveau nom de la séance',input.value||'Séance renfo'); if(name===null)return; const clean=name.trim(); if(!clean)return; input.value=clean; if(plan._meta) plan._meta.name=clean; const saved=JSON.parse(localStorage.getItem('rr_plan')||'null'); if(saved){saved.name=clean;save('rr_plan',saved);} alert('Nom de séance modifié.'); }
function renameTemplate(i){ const t=templates[i]; if(!t)return; const name=prompt('Nouveau nom du modèle',t.name); if(name===null)return; const clean=name.trim(); if(!clean)return; t.name=clean; save('rr_templates',templates); renderMyTemplates(); }
function savePlan(){
  const data={name:document.getElementById('planName').value,goal:document.getElementById('planGoal').value,items:plan.map(x=>({...x,series:makeSeries(x)}))};
  save('rr_plan',data);alert('Séance enregistrée.');
}
function saveAsTemplate(){
  if(!plan.length)return alert('Ajoute au moins un exercice.');
  const name=prompt('Nom du modèle',document.getElementById('planName').value||'Mon programme');if(!name)return;
  templates.unshift({id:Date.now(),name,goal:document.getElementById('planGoal').value,items:plan.map(x=>({...x,series:makeSeries(x)}))});save('rr_templates',templates);alert('Modèle enregistré.');
}
function loadPlanData(p){document.getElementById('planName').value=p.name||'Séance renfo';document.getElementById('planGoal').value=p.goal||'Force';plan=(p.items||[]).map(x=>({...x,series:makeSeries(x)}));renderPlan();show('builder',2)}
function loadSavedPlan(){const p=JSON.parse(localStorage.getItem('rr_plan')||'null');if(!p)return alert('Aucune séance enregistrée.');loadPlanData(p)}
function loadTemplate(i){loadPlanData(templates[i])}
function deleteTemplate(i){templates.splice(i,1);save('rr_templates',templates);renderTemplates()}
function renderTemplates(){
 const e=document.getElementById('templatesList');
 const built=[
  {name:'Force jambes + gainage',goal:'Force',items:[{name:'Squat',sets:3,mode:'reps',reps:6,load:0,rest:150,rpe:7,series:[]},{name:'Hip thrust',sets:3,mode:'reps',reps:8,load:0,rest:120,rpe:7,series:[]},{name:'Mollets debout',sets:3,mode:'reps',reps:12,load:0,rest:60,rpe:7,series:[]},{name:'Planche',sets:3,mode:'time',sec:40,load:0,rest:45,rpe:6,series:[]}]},
  {name:'Prévention course à pied',goal:'Prévention / stabilité',items:[{name:'Split squat',sets:3,mode:'reps',reps:8,load:0,rest:90,rpe:6,series:[]},{name:'Mollets une jambe',sets:3,mode:'reps',reps:12,load:0,rest:60,rpe:6,series:[]},{name:'Clamshell',sets:3,mode:'reps',reps:15,load:0,rest:45,rpe:6,series:[]},{name:'Pallof press',sets:3,mode:'reps',reps:10,load:0,rest:45,rpe:6,series:[]}]},
  {name:'Haut du corps + tronc',goal:'Mixte',items:[{name:'Pompes',sets:3,mode:'reps',reps:10,load:0,rest:75,rpe:7,series:[]},{name:'Rowing haltère',sets:3,mode:'reps',reps:10,load:0,rest:75,rpe:7,series:[]},{name:'Face pull',sets:3,mode:'reps',reps:12,load:0,rest:60,rpe:7,series:[]},{name:'Dead bug',sets:3,mode:'reps',reps:10,load:0,rest:45,rpe:6,series:[]}]},
 ];
 e.innerHTML=built.map((t,i)=>`<div class="template-card"><div class="row"><div><h3>${esc(t.name)}</h3><span class="pill">${esc(t.goal)}</span></div><button class="green" onclick="loadBuilt(${i})">Utiliser</button></div><ul>${t.items.map(x=>`<li>${esc(x.name)} — ${x.sets} × ${x.mode==='reps'?x.reps+' reps':x.sec+' sec'}</li>`).join('')}</ul></div>`).join('');
 window._builtTemplates=built;
}
function loadBuilt(i){loadPlanData(window._builtTemplates[i])}
function renderMyTemplates(){const e=document.getElementById('myTemplates');e.innerHTML=templates.length?templates.map((t,i)=>`<div class="event"><div class="event-main"><div class="event-title">${esc(t.name)}</div><div class="event-meta">${esc(t.goal)} · ${t.items.length} exercices</div></div><button class="secondary small" onclick="loadTemplate(${i})">Utiliser</button><button class="secondary small" onclick="renameTemplate(${i})">✏️</button><button class="danger small" onclick="deleteTemplate(${i})">×</button></div>`).join(''):'<div class="empty">Aucun modèle personnel.</div>'}
function start(){if(!plan.length)return alert('Ajoute au moins un exercice.');current={name:document.getElementById('planName').value,goal:document.getElementById('planGoal').value,items:plan.map(x=>({...x,series:makeSeries(x)}))};wo=current.items.map(x=>({...x,done:Array(x.series.length).fill(false)}));document.getElementById('wt').textContent=current.name;renderWo();show('workout',1)}
function renderWo(){const e=document.getElementById('workoutList');e.innerHTML='';wo.forEach((x,i)=>{const d=document.createElement('div');d.className='card';const rows=x.done.map((z,j)=>{const q=x.series[j]||{target:x.mode==='reps'?x.reps:x.sec,load:x.load,rest:x.rest,rpe:x.rpe};return `<div class="setrow"><button class="${z?'done':''}" onclick="toggleSet(${i},${j})">S${j+1}</button><input id="v${i}-${j}" type="number" min="0" value="${q.target}" aria-label="Réalisation série ${j+1}"><input id="w${i}-${j}" type="number" min="0" step="0.5" value="${q.load}" aria-label="Charge réelle série ${j+1}"><button class="secondary" onclick="restTimer(document.getElementById('r${i}-${j}').value)">⏱</button><input id="r${i}-${j}" type="number" min="0" value="${q.rest}" aria-label="Repos série ${j+1}"><input id="rpe${i}-${j}" type="number" min="1" max="10" step="0.5" value="${q.rpe||''}" placeholder="RPE" aria-label="RPE série ${j+1}"></div>`}).join('');d.innerHTML=`<div class="row"><h3>${esc(x.name)}</h3><button class="secondary small" onclick="editWorkoutExercise(${i})">✏️ Modifier prévu</button></div><p class="muted">Chaque série est modifiable pendant la séance : reps/temps, charge, repos et RPE.</p><div style="overflow-x:auto"><div style="min-width:430px"><div class="series-head"><span>Série</span><span>${x.mode==='reps'?'Rép.':'Sec.'}</span><span>Kg</span><span>Repos</span></div>${rows}</div></div>`;e.appendChild(d)})}
function editWorkoutExercise(i){const x=wo[i];x.series=makeSeries(x);x.series.forEach((q,j)=>{const target=prompt(`Série ${j+1} — ${x.mode==='reps'?'répétitions':'secondes'} prévues`,q.target);if(target!==null)q.target=Math.max(0,Number(target)||0);const load=prompt(`Série ${j+1} — charge prévue (kg)`,q.load);if(load!==null)q.load=Math.max(0,Number(load)||0);const rest=prompt(`Série ${j+1} — repos (sec)`,q.rest);if(rest!==null)q.rest=Math.max(0,Number(rest)||0)});renderWo()}
function toggleSet(i,j){wo[i].done[j]=!wo[i].done[j];renderWo()}
function restTimer(sec){let left=Math.max(0,Number(sec)||0);alert('Repos lancé : '+left+' secondes');const id=setInterval(()=>{left--;if(left<=0){clearInterval(id);alert('Repos terminé !')}},1000)}
function buildAIPayload(s){
  return {
    version:'1.0',
    session:{date:s.date,name:s.name,goal:s.goal,total:s.total,done:s.done,feedback:{foot:s.foot,ankle:s.ankle,hip:s.hip,fatigue:s.fatigue,comment:s.note||''},items:s.items},
    week:{...week,targetGoal:targetGoal?{...targetGoal,daysLeft:targetDaysLeft()}:null,schedule:weekSchedule,activities:activities.map(a=>({...a}))},
    recentHistory:histories().slice(0,10).map(h=>({date:h.date,name:h.name,goal:h.goal,total:h.total,done:h.done,foot:h.foot,ankle:h.ankle,hip:h.hip,fatigue:h.fatigue,note:h.note,items:h.items})),
    instruction:'Analyser la séance prévue et réellement réalisée, toutes les séries, charges, repos, RPE, modifications, douleurs, fatigue et commentaire utilisateur. Comparer à l’historique, à la charge de la semaine et à l’objectif cible avec son échéance. Proposer une séance suivante cohérente, avec justification, sans remplacer la validation de l’utilisateur.'
  };
}
function finish(){const total=wo.reduce((a,x)=>a+x.done.length,0),done=wo.reduce((a,x)=>a+x.done.filter(Boolean).length,0);if(!done)return alert('Coche au moins une série.');const s={date:new Date().toISOString(),name:current.name,goal:current.goal,total,done,foot:+document.getElementById('foot').value||0,ankle:+document.getElementById('ankle').value||0,hip:+document.getElementById('hip').value||0,fatigue:+document.getElementById('fatigue').value||0,note:document.getElementById('note').value,weekSnapshot:JSON.parse(JSON.stringify(week)),activitiesSnapshot:JSON.parse(JSON.stringify(activities)),plannedItems:current.items.map(x=>({...x,series:makeSeries(x)})),items:wo.map((x,i)=>({name:x.name,mode:x.mode,sets:x.series.length,reps:x.reps,sec:x.sec,load:x.load,series:x.series.map(q=>({...q})),done:x.done.map((z,j)=>({ok:z,value:+document.getElementById('v'+i+'-'+j).value||0,load:+document.getElementById('w'+i+'-'+j).value||0,rest:+document.getElementById('r'+i+'-'+j).value||0,rpe:+document.getElementById('rpe'+i+'-'+j).value||0}))}))};s.aiPayload=buildAIPayload(s);const d=histories();d.unshift(s);save('rr_hist',d);makeSummary(s);alert('Séance enregistrée : '+done+'/'+total+' séries. Le Coach dispose maintenant de toutes les données de la séance et de ton commentaire.')}
function makeSummary(s){const a=[`🏋️ ${s.name} — ${new Date(s.date).toLocaleDateString('fr-FR')}`,`Objectif : ${s.goal}`,'',`Séries : ${s.done}/${s.total}`,''];s.items.forEach(x=>{const r=x.done.map((z,j)=>z.ok?`S${j+1}: ${z.value}${x.mode==='reps'?' reps':' sec'} @ ${z.load||0} kg · RPE ${z.rpe||'—'}`:`S${j+1}: non faite`).join(' | ');a.push(`• ${x.name} — ${r}`)});a.push('','🦶 Pied : '+s.foot+'/10','🦵 Cheville : '+s.ankle+'/10','🦵 Hanche : '+s.hip+'/10','😴 Fatigue : '+s.fatigue+'/10','','📝 '+(s.note||'Aucun commentaire'),'','🤖 Coach IA : données complètes enregistrées (prévu + réalisé + charges + repos + RPE + douleurs + fatigue + commentaire + contexte de semaine).');document.getElementById('out').value=a.join('\\n')}
function copySummary(){const s=document.getElementById('out').value;if(navigator.clipboard)navigator.clipboard.writeText(s).then(()=>alert('Résumé copié.'));else alert('Sélectionne le résumé pour le copier.')}
async function shareSummary(){const s=document.getElementById('out').value;if(navigator.share){try{await navigator.share({title:'Renfo Running — séance',text:s})}catch(e){}}else copySummary()}
function exerciseCategory(name){for(const [c,a] of Object.entries(LIB))if(a.includes(name))return c;return 'Mes exercices'}
function openExercise(name,category){const m=document.getElementById('exerciseModal');const c=document.getElementById('exerciseModalContent');document.getElementById('exerciseModalTitle').textContent=name;const muscles={Jambes:'Quadriceps · fessiers · ischio-jambiers','Mollets / pied':'Mollets · pied · cheville','Fessiers / hanches':'Fessiers · moyen fessier · hanches','Gainage / tronc':'Abdominaux · gainage · stabilité du tronc','Haut du corps':'Dos · épaules · pectoraux · bras',Mobilité:'Mobilité · amplitude · contrôle'};const descriptions={'Squat':'Flexion de jambes avec le dos stable, en poussant le sol pour remonter.','Front squat':'Squat avec la charge à l’avant, demandant un tronc très gainé et une bonne mobilité de cheville.','RDL':'Charnière de hanche : recule les hanches en gardant le dos neutre et les jambes légèrement fléchies.','Soulevé de terre':'Soulever la charge depuis le sol en utilisant principalement les jambes et la chaîne postérieure.','Hip thrust':'Extension de hanche en appui sur un banc, en contractant fortement les fessiers en haut.','Glute bridge':'Extension de hanche au sol, en montant le bassin sans cambrer excessivement.','Fentes avant':'Un pas vers l’avant puis une flexion contrôlée avant de repousser pour revenir.','Bulgarian split squat':'Squat unilatéral avec le pied arrière surélevé, très sollicitant pour les jambes et les fessiers.','Step-up':'Monter sur un support en poussant principalement avec la jambe placée dessus.','Mollets debout':'Monter sur la pointe des pieds puis redescendre lentement avec une amplitude contrôlée.','Mollets assis':'Extension de cheville assise, particulièrement orientée vers le soléaire.','Clamshell':'Abduction de hanche sur le côté, genoux fléchis, en gardant le bassin stable.','Planche latérale':'Maintenir le corps aligné sur un côté en résistant à la chute du bassin.','Planche':'Maintenir le corps gainé en ligne, sans creuser le bas du dos.','Dead bug':'Mouvement alterné des bras et jambes en gardant le bas du dos contrôlé.','Bird dog':'Depuis quatre appuis, tendre bras et jambe opposés en gardant le bassin stable.'};c.innerHTML=`<div class="card"><b>${esc(category)}</b><p><strong>À quoi ça sert :</strong> ${esc(descriptions[name]||'Exercice de renforcement à réaliser avec un mouvement contrôlé et une amplitude confortable.')}</p><p><strong>Muscles / zone :</strong> ${esc(muscles[category]||'Zone ciblée selon l’exercice')}</p><p><strong>Conseils :</strong> commence léger, privilégie une technique propre et augmente progressivement si le mouvement reste maîtrisé.</p></div>`;m.classList.add('open');document.body.style.overflow='hidden'}
function closeExercise(){document.getElementById('exerciseModal').classList.remove('open');document.body.style.overflow=''}
function renderLib(){const e=document.getElementById('lib');e.innerHTML='';Object.entries(LIB).forEach(([c,a])=>{const d=document.createElement('div');d.className='card';d.innerHTML=`<h3>${esc(c)}</h3>${a.map(x=>`<button class="exercise-list-item" onclick="openExercise(${JSON.stringify(x)},${JSON.stringify(c)})"><span>${esc(x)}</span><span>›</span></button>`).join('')}`;e.appendChild(d)})
 if(custom.length){const d=document.createElement('div');d.className='card';d.innerHTML='<h3>Mes exercices</h3>'+custom.map(x=>`<button class="exercise-list-item" onclick="openExercise(${JSON.stringify(x),'Mes exercices'})"><span>${esc(x)}</span><span>›</span></button>`).join('');e.appendChild(d)}
}
function deleteHistory(i){const d=histories();if(!confirm('Supprimer cette séance de l’historique ?'))return;d.splice(i,1);save('rr_hist',d);renderHist();renderProg()}
function clearHistory(){const d=histories();if(!d.length)return;if(!confirm(`Supprimer les ${d.length} séances de l’historique ? Cette action ne peut pas être annulée.`))return;save('rr_hist',[]);renderHist();renderProg()}
function renderHist(){const e=document.getElementById('hist'),d=histories();e.innerHTML=d.length?d.map((s,i)=>`<div class="card"><div class="row"><div><b>${esc(s.name)}</b><div class="muted">${new Date(s.date).toLocaleString('fr-FR')} · ${s.done}/${s.total} séries · fatigue ${s.fatigue}/10 · pied ${s.foot}/10</div></div><button class="danger small" onclick="deleteHistory(${i})">🗑️</button></div></div>`).join(''):'<div class="empty">Aucune séance.</div>'}
function renderProg(){const e=document.getElementById('prog'),d=histories();if(!d.length){e.innerHTML='<div class="empty">Fais des séances pour voir ta progression.</div>';return}const recent=d.slice(0,8).reverse();const names=[...new Set(d.flatMap(s=>s.items.map(x=>x.name)))];const painAvg=k=>{const v=d.filter(s=>(+s[k]||0)>0).map(s=>+s[k]);return v.length?(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):'0'};const bars=recent.map(s=>{const score=Math.max(1,Math.min(10,Math.round((s.fatigue||0)+((s.done/(s.total||1))*4))));return `<div class="prog-bar-row"><span>${new Date(s.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})}</span><div class="prog-bar"><i style="width:${score*10}%"></i></div><b>${score}/10</b></div>`}).join('');e.innerHTML='<div class="statgrid"><div class="stat"><b>'+d.length+'</b><span>séances</span></div><div class="stat"><b>'+Math.round(d.reduce((a,x)=>a+x.fatigue,0)/d.length*10)/10+'</b><span>fatigue moyenne</span></div><div class="stat"><b>'+Math.max(...d.map(x=>x.done))+'</b><span>séries max</span></div></div><div class="card"><h3>📊 Charge récente</h3><div class="muted" style="margin-bottom:10px">Indicateur simple basé sur la fatigue et le volume réalisé.</div>'+bars+'</div><div class="card"><h3>🦶 Douleurs / fatigue</h3><div class="grid"><div><b>'+painAvg('foot')+'/10</b><div class="muted">Pied moyen</div></div><div><b>'+painAvg('ankle')+'/10</b><div class="muted">Cheville moyenne</div></div><div><b>'+painAvg('hip')+'/10</b><div class="muted">Hanche moyenne</div></div><div><b>'+painAvg('fatigue')+'/10</b><div class="muted">Fatigue moyenne</div></div></div></div>'+names.map(n=>{const v=d.flatMap(s=>s.items.filter(x=>x.name===n).flatMap(x=>x.done.filter(z=>z.ok).map(z=>z.load))).filter(x=>x>0);return `<div class="card"><div class="row"><h3>${esc(n)}</h3><b>${v.length?Math.max(...v)+' kg':'—'}</b></div><span class="muted">Meilleure charge enregistrée</span></div>`}).join('')}
function homeInit(){const ep=document.getElementById('aiEndpoint');if(ep)ep.value=getAIEndpoint();renderDayPicker();renderWeek();picker();renderTemplates();renderMyTemplates();renderPlan();renderCoach();const p=JSON.parse(localStorage.getItem('rr_plan')||'null');if(p){document.getElementById('planName').value=p.name||'Séance renfo';document.getElementById('planGoal').value=p.goal||'Force';plan=p.items||[];renderPlan()}if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});checkAIConnection()}
homeInit();
