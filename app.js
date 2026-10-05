const KEY="marioai.characters.v1";
let chars=JSON.parse(localStorage.getItem(KEY)||"[]");
let currentId=null;
let busy=false;

const $=id=>document.getElementById(id);
const save=()=>localStorage.setItem(KEY,JSON.stringify(chars));
const current=()=>chars.find(c=>c.id===currentId);

function defaultChar(){
  return {id:crypto.randomUUID(),name:"Aria",gender:"Female",genre:"Fantasy",
    personality:"Warm, brave, curious, secretly emotional.",backstory:"A wandering mage searching for the lost city.",
    maturity:"Mature",hp:100,maxHp:100,relationship:0,emotion:"Calm",alive:true,memory:[],
    history:[{role:"assistant",content:"Aria looks toward you. “So... you're the one who found me.”"}]};
}

function renderList(){
  $("characterList").innerHTML=chars.map(c=>`
    <div class="characterCard ${c.id===currentId?"active":""}">
      <button onclick="selectChar('${c.id}')">
        <b>${esc(c.name)}</b><div class="mini">${esc(c.genre)} · ${c.alive?"Alive":"Dead"}</div>
      </button>
    </div>`).join("");
}

function selectChar(id){
  currentId=id; render(); renderList();
}

function render(){
  const c=current();
  $("empty").hidden=!!c; $("chatView").hidden=!c;
  if(!c)return;
  $("charName").textContent=c.name;
  $("charDesc").textContent=`${c.genre} · ${c.gender} · ${c.maturity}`;
  $("avatar").textContent=c.name.slice(0,1).toUpperCase();
  $("hpText").textContent=`${c.hp}/${c.maxHp}`;
  $("hpBar").style.width=Math.max(0,c.hp/c.maxHp*100)+"%";
  $("bondText").textContent=`${c.relationship}/100`;
  $("bondBar").style.width=Math.max(0,c.relationship)+"%";
  $("emotion").textContent=c.emotion;
  $("aliveBadge").textContent=c.alive?"ALIVE":"DEAD";
  $("aliveBadge").style.background=c.alive?"#173c2d":"#48202d";
  $("aliveBadge").style.color=c.alive?"#76e4aa":"#ff8ea9";
  $("mode").textContent="AI endpoint / local demo";
  renderMessages();
  $("memoryList").innerHTML=(c.memory.length?c.memory.slice(-20).reverse().map(x=>`<div>🧠 ${esc(x)}</div>`).join(""):`<div>No saved memories yet.</div>`);\n  $("statePanel").innerHTML=`
    <div class="stateRow"><small>Emotion</small><strong>${esc(c.emotion)}</strong></div>
    <div class="stateRow"><small>HP</small><strong>${c.hp} / ${c.maxHp}</strong></div>
    <div class="stateRow"><small>Relationship</small><strong>${c.relationship} / 100</strong></div>
    <div class="stateRow"><small>Memory entries</small><strong>${c.memory.length}</strong></div>
    <div class="stateRow"><small>Status</small><strong>${c.alive?"Alive":"Dead"}</strong></div>`;
}

function renderMessages(){
  const c=current();
  $("messages").innerHTML=(c.history||[]).map(m=>`<div class="msg ${m.role==="user"?"user":m.role==="system"?"system":"ai"}">${esc(m.content)}</div>`).join("");
  $("messages").scrollTop=$("messages").scrollHeight;
}

async function send(text=null){
  const c=current(); if(!c||busy||!c.alive)return;
  const message=(text??$("input").value).trim(); if(!message)return;
  $("input").value=""; updateCounter();
  c.history.push({role:"user",content:message});
  renderMessages(); busy=true; $("sendBtn").disabled=true;
  try{
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({character:c,message,history:c.history,memory:c.memory,state:c,maturity:c.maturity})});
    const data=await r.json();
    if(!r.ok)throw new Error(data.error||"Request failed");
    c.history.push({role:"assistant",content:data.reply});
    inferState(c,message,data.reply);
  }catch(e){
    c.history.push({role:"assistant",content:"Connection error: "+e.message});
  }finally{busy=false;$("sendBtn").disabled=false;save();render();}
}

function inferState(c,user,reply){
  const t=(user+" "+reply).toLowerCase();
  if(/love|happy|smile|laugh|thank|glad|excited/.test(t)) c.emotion="Happy";
  else if(/angry|rage|furious|hate/.test(t)) c.emotion="Angry";
  else if(/sad|cry|tears|lonely/.test(t)) c.emotion="Sad";
  else if(/fear|scared|terrified/.test(t)) c.emotion="Scared";
  else if(/jealous/.test(t)) c.emotion="Jealous";
  else c.emotion="Calm";
  if(/thank|help|trust|love|friend/.test(t)) c.relationship=Math.min(100,c.relationship+2);
}

function damage(n=20){
  const c=current();if(!c||!c.alive)return;
  c.hp=Math.max(0,c.hp-n); c.emotion=c.hp===0?"Defeated":"Pain";
  c.history.push({role:"system",content:`⚔ ${c.name} took ${n} damage. HP: ${c.hp}/${c.maxHp}.`});
  if(c.hp===0){c.alive=false;c.history.push({role:"system",content:`☠ ${c.name} died. This death is persistent in this save.`});}
  save();render();
}
function heal(n=20){
  const c=current();if(!c||!c.alive)return;
  c.hp=Math.min(c.maxHp,c.hp+n);c.emotion="Relieved";
  c.history.push({role:"system",content:`💚 ${c.name} recovered ${n} HP. HP: ${c.hp}/${c.maxHp}.`});
  save();render();
}
function addMemory(){
  const c=current();if(!c)return;
  const m=prompt("Memory to permanently save:");
  if(m?.trim()){c.memory.push(m.trim());save();render();}
}
async function image(){
  const c=current();if(!c)return;
  const prompt=`Cinematic scene of ${c.name}, ${c.gender}, ${c.genre}. Personality: ${c.personality}. Emotion: ${c.emotion}. Current HP ${c.hp}/${c.maxHp}. Story context: ${c.backstory}.`;
  try{
    const r=await fetch("/api/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
    const d=await r.json();
    if(d.image){c.history.push({role:"system",content:"🖼 Image generated: "+d.image});}
    else c.history.push({role:"system",content:"🖼 "+(d.message||"Image API not configured.")});
  }catch(e){c.history.push({role:"system",content:"Image error: "+e.message});}
  save();render();
}
function cinematic(){
  send("Create a cinematic story event based on the current situation. Include atmosphere, character emotion, actions, dialogue, and a meaningful consequence. Do not change HP unless the event clearly causes damage or healing.");
}
function updateCounter(){ $("counter").textContent=$("input").value.length+"/10000"; }
function esc(s){return String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));}

$("sendBtn").onclick=()=>send();
$("input").addEventListener("input",updateCounter);
$("input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}});
$("damageBtn").onclick=()=>damage(20);
$("healBtn").onclick=()=>heal(20);
$("memoryBtn").onclick=addMemory;
$("imageBtn").onclick=image;
$("cinematicBtn").onclick=cinematic;
$("createBtn").onclick=()=>openEditor();
$("newBtn").onclick=()=>openEditor();

function openEditor(){
  $("fName").value="";$("fPersonality").value="";$("fBackstory").value="";
  $("fHp").value=100;$("editor").showModal();
}
$("editorForm").addEventListener("submit",e=>{
  e.preventDefault();
  const max=Math.max(1,Number($("fHp").value)||100);
  const c={id:crypto.randomUUID(),name:$("fName").value.trim(),gender:$("fGender").value,genre:$("fGenre").value,
    personality:$("fPersonality").value.trim()||"Kind and curious.",backstory:$("fBackstory").value.trim()||"A mysterious traveler.",
    maxHp:max,hp:max,relationship:0,emotion:"Calm",alive:true,maturity:$("fMaturity").value,memory:[],
    history:[{role:"assistant",content:`${$("fName").value.trim()} arrives. “Our story begins now.”`} ]};
  chars.push(c);currentId=c.id;save();$("editor").close();renderList();render();
});

if(!chars.length){const c=defaultChar();chars.push(c);currentId=c.id;save();}
else currentId=chars[0].id;
renderList();render();
