// ================= SAFE INIT =================
if(!localStorage.getItem("startDate")){
  localStorage.setItem("startDate", new Date().toISOString());
}

// ================= DATE =================
function updateDate(){
  document.getElementById("liveDate").innerText = new Date().toDateString();
}
setInterval(updateDate,1000);
updateDate();

// ================= GREETING =================
function updateGreeting(){
  let h=new Date().getHours();
  let g="Good Evening";
  if(h<12) g="Good Morning";
  else if(h<17) g="Good Afternoon";
  document.getElementById("greeting").innerText=g+" Pooja 🌸";
}
updateGreeting();

// ================= QUOTES =================
const quotes=[
"Success is the sum of small efforts repeated daily.",
"Stay consistent and unstoppable.",
"Focus builds success.",
"Small steps → Big results."
];
document.getElementById("dailyQuote").innerText =
quotes[new Date().getDate()%quotes.length];

// ================= STOPWATCH =================
let sw=0,swInt=null;
function toggleStopwatch(){
  if(swInt){clearInterval(swInt);swInt=null;return;}
  swInt=setInterval(()=>{sw++;updateSW();},1000);
}
function updateSW(){
  let h=Math.floor(sw/3600),
  m=Math.floor(sw%3600/60),
  s=sw%60;
  document.getElementById("stopwatch").innerText =
  `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function resetStopwatch(){
  sw=0;updateSW();clearInterval(swInt);
}

// ================= MUSIC =================
function playMusic(){
  pauseMusic();
  let v=document.getElementById("musicSelect").value;
  let el=document.getElementById(v);
  if(el){el.loop=true;el.play();}
}
function pauseMusic(){
  ["rain","white","lofi"].forEach(id=>{
    let el=document.getElementById(id);
    if(el){el.pause();el.currentTime=0;}
  });
}

// ================= THEME =================
function toggleTheme(){
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",document.body.classList.contains("dark"));
}
if(localStorage.getItem("theme")==="true"){
  document.body.classList.add("dark");
}

// ================= ALARM =================
let alarmInterval=null;
function setAlarm(){
  clearInterval(alarmInterval);
  let val=document.getElementById("alarmTime").value;
  document.getElementById("alarmDisplay").innerText=val;

  alarmInterval=setInterval(()=>{
    let now=new Date().toTimeString().slice(0,5);
    if(now===val){
      let sound=document.getElementById("alarmSound");
      sound.loop=true;
      sound.play();
    }
  },1000);
}
function stopAlarm(){
  clearInterval(alarmInterval);
  let sound=document.getElementById("alarmSound");
  sound.pause();
  sound.currentTime=0;
  document.getElementById("alarmDisplay").innerText="--:--";
}

// ================= CHECKBOX TRACKING =================
const checks=document.querySelectorAll("input[type=checkbox]");
let data=JSON.parse(localStorage.getItem("data")||"{}");

checks.forEach((c,i)=>{
  c.checked=data[i]||false;

  c.addEventListener("change",()=>{
    data[i]=c.checked;
    localStorage.setItem("data",JSON.stringify(data));
    calc();
  });
});

// ================= PROGRESS =================
function calc(){
  let total=0;
  checks.forEach(c=>{
    if(c.checked) total+=parseFloat(c.dataset.hours||0);
  });
  document.getElementById("total").innerText=total;
  updateChart(total);
}
calc();

// ================= DAILY AUTO TRACKER =================
let todayKey=new Date().toDateString();

if(localStorage.getItem("lastDate")!==todayKey){

  // SAVE HISTORY
  let total=document.getElementById("total")?.innerText || 0;
  let hist=JSON.parse(localStorage.getItem("hist")||"[]");

  if(localStorage.getItem("lastDate")){
    hist.push({
      date: localStorage.getItem("lastDate"),
      total: total
    });
  }

  localStorage.setItem("hist",JSON.stringify(hist));

  // RESET CHECKBOXES
  checks.forEach(c=>c.checked=false);
  localStorage.removeItem("data");

  localStorage.setItem("lastDate",todayKey);
}

// ================= HISTORY VIEW =================
function renderHistory(){
  let hist=JSON.parse(localStorage.getItem("hist")||"[]");
  let el=document.getElementById("history");
  if(!el) return;

  el.innerHTML=hist.map(h=>
    `<li>${h.date} → ${h.total} hrs</li>`
  ).join("");
}
renderHistory();

// ================= TARGET =================
function addTarget(){
  let v=document.getElementById("targetInput").value;
  if(!v) return;

  let arr=JSON.parse(localStorage.getItem("targets")||"[]");
  arr.push({text:v,done:false});
  localStorage.setItem("targets",JSON.stringify(arr));
  renderTargets();
}

function renderTargets(){
  let arr=JSON.parse(localStorage.getItem("targets")||"[]");
  let el=document.getElementById("targets");
  if(!el) return;

  el.innerHTML=arr.map((t,i)=>
  `<li>
  <input type="checkbox" ${t.done?"checked":""} onchange="toggleTarget(${i})">
  ${t.text}
  </li>`).join("");
}

function toggleTarget(i){
  let arr=JSON.parse(localStorage.getItem("targets")||"[]");
  arr[i].done=!arr[i].done;
  localStorage.setItem("targets",JSON.stringify(arr));
  renderTargets();
}
renderTargets();

// ================= CHART =================
let chart;
if(document.getElementById("chart")){
  chart=new Chart(document.getElementById("chart"),{
    type:"bar",
    data:{
      labels:["Today"],
      datasets:[{data:[0]}]
    }
  });
}

function updateChart(val){
  if(chart){
    chart.data.datasets[0].data=[val];
    chart.update();
  }
}

// ================= EXPORT =================
function exportCSV(){
  let csv="Task,Done\n";
  checks.forEach((c,i)=>{
    csv+=`Task${i},${c.checked}\n`;
  });

  let blob=new Blob([csv]);
  let a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="progress.csv";
  a.click();
}

// ================= PWA =================
let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();
  deferredPrompt=e;
});

function installApp(){
  if(deferredPrompt) deferredPrompt.prompt();
}

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("service-worker.js");
}

// ================= FIREBASE =================
const firebaseConfig={
  apiKey:"PASTE",
  authDomain:"PASTE",
  projectId:"PASTE"
};

firebase.initializeApp(firebaseConfig);
const auth=firebase.auth();
const db=firebase.firestore();

function googleLogin(){
  const provider=new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}

function logout(){
  auth.signOut();
}

auth.onAuthStateChanged(user=>{
  document.getElementById("userInfo").innerText=
  user?"Logged in: "+user.email:"Not logged in";
});

// AUTO CLOUD SAVE
setInterval(()=>{
  let user=auth.currentUser;
  if(user){
    db.collection("users").doc(user.uid).set({
      data:JSON.stringify(localStorage)
    });
  }
},10000);
