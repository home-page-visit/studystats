const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state=JSON.parse(localStorage.getItem('focusflowState')||'null')||{tasks:[{id:1,title:'Revise one important concept',subject:'Physics',done:false},{id:2,title:'Solve 10 practice questions',subject:'Maths',done:false}],notes:'',goal:120,minutes:0,sessions:0,theme:'dark',history:[]};
state.history=state.history||[];
let remaining=1500,initialSeconds=1500,timer=null,running=false,sessionLabel='Focus session';
const prompts=['What is one concept you understand better today?','What distracted you, and how can you reduce it tomorrow?','Which question challenged you most?','What will you focus on in your next session?','What small improvement are you proud of today?'];
function save(){localStorage.setItem('focusflowState',JSON.stringify(state));updateUI()}
function todayKey(){return new Date().toISOString().slice(0,10)}
function recordSession(){const day=todayKey();let entry=state.history.find(x=>x.date===day);if(!entry){entry={date:day,minutes:0,sessions:0,subjects:{}};state.history.push(entry)}entry.minutes+=Math.round(initialSeconds/60);entry.sessions++;const subject=$('#subjectInput')?.value||'Other';entry.subjects[subject]=(entry.subjects[subject]||0)+Math.round(initialSeconds/60)}
function updateUI(){
 $('#todayLabel').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
 $('#goalMinutes').textContent=state.goal;$('#goalSlider').value=state.goal;$('#goalProgress').style.width=Math.min(100,state.minutes/state.goal*100)+'%';$('#goalProgressText').textContent=`${state.minutes} / ${state.goal} minutes completed`;
 $('#statMinutes').textContent=state.minutes;$('#statSessions').textContent=state.sessions;$('#statTasks').textContent=taskPercent()+'%';$('#detailMinutes').textContent=state.minutes;$('#detailSessions').textContent=state.sessions;$('#detailTasks').textContent=state.tasks.filter(t=>t.done).length;renderAnalytics();
 renderTasks('#dashboardTasks',state.tasks.slice(0,4));renderTasks('#allTasks',state.tasks);
}
function taskPercent(){return state.tasks.length?Math.round(state.tasks.filter(t=>t.done).length/state.tasks.length*100):0}
function renderTasks(selector,tasks){const el=$(selector);el.innerHTML='';if(!tasks.length){el.innerHTML='<p class="muted">No tasks yet. Add one to begin.</p>';return}tasks.forEach(t=>{const row=document.createElement('div');row.className='task-row';row.innerHTML=`<input type="checkbox" ${t.done?'checked':''} aria-label="Complete task"><div class="task-copy"><div class="task-title ${t.done?'done':''}"></div><div class="task-meta"></div></div><button class="delete-task" aria-label="Delete task">×</button>`;row.querySelector('.task-title').textContent=t.title;row.querySelector('.task-meta').textContent=t.subject;row.querySelector('input').onchange=e=>{t.done=e.target.checked;save()};row.querySelector('.delete-task').onclick=()=>{state.tasks=state.tasks.filter(x=>x.id!==t.id);save()};el.appendChild(row)})}
function formatTime(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function updateTimer(){const text=formatTime(remaining);$('#timerDisplay').textContent=text;$('#focusOverlayTimer').textContent=text;$('#sessionLabel').textContent=sessionLabel;$('#focusOverlayLabel').textContent=sessionLabel;$('#timerSubtext').textContent=running?'Stay focused…':'Ready when you are';$('#startBtn').textContent=running?'Ⅱ Pause':'▶ Start';$('#overlayStartBtn').textContent=running?'Ⅱ Pause':'▶ Start';document.title=`${text} · FocusFlow`}
function stopTimer(){clearInterval(timer);timer=null;running=false;updateTimer()}
function startTimer(){if(running){stopTimer();return}running=true;updateTimer();timer=setInterval(()=>{remaining--;updateTimer();if(remaining<=0){stopTimer();if(sessionLabel==='Focus session'){state.minutes+=Math.round(initialSeconds/60);state.sessions++;recordSession();save()}alert('Session complete! Take a mindful break.')}},1000)}
function resetTimer(){stopTimer();remaining=initialSeconds;updateTimer()}
function chooseMode(btn){$$('.mode-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');initialSeconds=Number(btn.dataset.minutes)*60;remaining=initialSeconds;sessionLabel=btn.dataset.label;resetTimer()}
function showView(id){$$('.view').forEach(v=>v.classList.remove('active-view'));$('#'+id).classList.add('active-view');$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===id));const names={dashboard:'Good study session, Sivaram.',tasks:'Plan your next win.',notes:'Clear your mind, capture your thoughts.',stats:'Progress comes from consistency.'};$('#pageTitle').textContent=names[id]||names.dashboard}
function focusMode(on){$('#focusOverlay').classList.toggle('hidden',!on)}
$('#startBtn').onclick=startTimer;$('#overlayStartBtn').onclick=startTimer;$('#resetBtn').onclick=resetTimer;$('#overlayResetBtn').onclick=resetTimer;$('#exitFocusBtn').onclick=()=>focusMode(false);$('#focusModeBtn').onclick=()=>focusMode(true);
$$('.mode-btn').forEach(b=>b.onclick=()=>chooseMode(b));$$('.nav-item').forEach(b=>b.onclick=()=>showView(b.dataset.view));$$('[data-view-target]').forEach(b=>b.onclick=()=>showView(b.dataset.viewTarget));$('#quickAddBtn').onclick=()=>{showView('tasks');$('#taskInput').focus()};
$('#taskForm').onsubmit=e=>{e.preventDefault();state.tasks.unshift({id:Date.now(),title:$('#taskInput').value.trim(),subject:$('#subjectInput').value,done:false});$('#taskInput').value='';save()};
$('#goalSlider').oninput=e=>$('#goalMinutes').textContent=e.target.value;$('#editGoalBtn').onclick=()=>{state.goal=Number($('#goalSlider').value);save()};
$('#notesInput').value=state.notes;$('#notesInput').oninput=e=>{state.notes=e.target.value;$('#saveStatus').textContent='Saving…';save();$('#saveStatus').textContent='Saved locally in your browser'};$('#clearNotesBtn').onclick=()=>{if(confirm('Clear all notes?')){$('#notesInput').value='';state.notes='';save()}};
$('#themeBtn').onclick=()=>{state.theme=state.theme==='dark'?'light':'dark';document.body.classList.toggle('light',state.theme==='light');save()};$('#newPromptBtn').onclick=()=>$('#reflectionText').textContent=prompts[Math.floor(Math.random()*prompts.length)];
document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select'))return;if(e.code==='Space'){e.preventDefault();startTimer()}if(e.key.toLowerCase()==='r')resetTimer();if(e.key.toLowerCase()==='f')focusMode($('#focusOverlay').classList.contains('hidden'))});
document.body.classList.toggle('light',state.theme==='light');updateUI();updateTimer();

function renderAnalytics(){
  const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d.toISOString().slice(0,10)});
  const data=days.map(date=>state.history.find(x=>x.date===date)||{date,minutes:0,sessions:0,subjects:{}});
  const max=Math.max(60,...data.map(x=>x.minutes));
  $('#weeklyChart').innerHTML=data.map((x,i)=>`<div class="bar-item"><div class="bar-value">${x.minutes}</div><div class="bar" style="height:${Math.max(4,x.minutes/max*100)}%" title="${x.minutes} minutes"></div><span>${new Date(dateToLocal(days[i])).toLocaleDateString(undefined,{weekday:'short'}).slice(0,3)}</span></div>`).join('');
  const subjects={};state.history.forEach(x=>Object.entries(x.subjects||{}).forEach(([k,v])=>subjects[k]=(subjects[k]||0)+v));
  const total=Object.values(subjects).reduce((a,b)=>a+b,0);
  const entries=Object.entries(subjects).sort((a,b)=>b[1]-a[1]);
  $('#subjectChart').innerHTML=entries.length?entries.map(([name,val])=>`<div class="subject-line"><div><span>${name}</span><b>${val}m</b></div><div class="progress-track"><div class="progress-fill" style="width:${total?val/total*100:0}%"></div></div></div>`).join(''):'<p class="muted">Complete focus sessions to see subject analytics.</p>';
  const dates=new Set(state.history.filter(x=>x.sessions>0).map(x=>x.date));let streak=0;const cursor=new Date();
  while(dates.has(cursor.toISOString().slice(0,10))){streak++;cursor.setDate(cursor.getDate()-1)}
  $('#streakValue').textContent=`${streak} day${streak===1?'':'s'} streak`;$('#streakText').textContent=streak?`You have studied for ${streak} consecutive day${streak===1?'':'s'}. Keep going!`:'Complete a focus session to start your streak.';
}
function dateToLocal(s){return s+'T12:00:00'}
$('#resetStatsBtn').onclick=()=>{if(confirm('Reset all study statistics? Tasks and notes will remain.')){state.minutes=0;state.sessions=0;state.history=[];save()}};
