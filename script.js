// ================= DATE + GREETING =================
function updateDate(){
document.getElementById("liveDate").innerText=new Date().toDateString();
}
setInterval(updateDate,1000);

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
document.getElementById("dailyQuote").innerText=
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
document.getElementById("stopwatch").innerText=
`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function resetStopwatch(){sw=0;updateSW();clearInterval(swInt);}

// ================= MUSIC =================
function playMusic(){
pauseMusic();
let v=document.getElementById("musicSelect").value;
let el=document.getElementById(v);
el.loop=true;
el.play();
}
function pauseMusic(){
["rain","white","lofi"].forEach(x=>{
let el=document.getElementById(x);
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

// ================= ROTA AUTO SYSTEM =================
const startDate=new Date(localStorage.getItem("startDate")||"2026-04-13");

function getDayIndex(){
let diff=Math.floor((new Date()-startDate)/(1000*60*60*24));
return ((diff%8)+8)%8;
}

function getRotaNumber(){
let diff=Math.floor((new Date()-startDate)/(1000*60*60*24));
return Math.floor(diff/8)+1;
}

function updateRotaUI(){
let cards=document.querySelectorAll(".card");
let today=getDayIndex();

cards.forEach((card,i)=>{
card.classList.remove("active");
let t=card.querySelector(".today");
if(t) t.remove();

if(i===today){
card.classList.add("active");
card.querySelector("h3").innerHTML += " <span class='today'>TODAY</span>";
}
});

document.getElementById("rotaTitle").innerText=
`Rota ${getRotaNumber()} | Day ${today+1}: Active`;
}

updateRotaUI();

// ================= CHECKBOX SAVE + LOAD =================
const checkboxes=document.querySelectorAll("#rotaBox input[type=checkbox]");
let data=JSON.parse(localStorage.getItem("rotaData")||"{}");

checkboxes.forEach((cb,i)=>{
cb.checked=data[i]||false;

cb.addEventListener("change",()=>{
data[i]=cb.checked;
localStorage.setItem("rotaData",JSON.stringify(data));
updateProgress();
});
});

// ================= PROGRESS =================
function updateProgress(){
let total=0;

checkboxes.forEach((cb)=>{
if(cb.checked){
total+=parseFloat(cb.dataset.hours || 0);
}
});

document.getElementById("total").innerText=total;
updateChart(total);
}

updateProgress();

// ================= TARGET CHECKLIST =================
function addTarget(){
let val=document.getElementById("targetInput").value;
if(!val) return;

let arr=JSON.parse(localStorage.getItem("targets")||"[]");
arr.push({text:val,done:false});
localStorage.setItem("targets",JSON.stringify(arr));
renderTargets();
}

function renderTargets(){
let arr=JSON.parse(localStorage.getItem("targets")||"[]");
let html=arr.map((t,i)=>
`<li>
<input type="checkbox" ${t.done?"checked":""} onchange="toggleTarget(${i})">
${t.text}
</li>`).join("");

document.getElementById("targets").innerHTML=html;
}

function toggleTarget(i){
let arr=JSON.parse(localStorage.getItem("targets")||"[]");
arr[i].done=!arr[i].done;
localStorage.setItem("targets",JSON.stringify(arr));
renderTargets();
}

renderTargets();

// ================= CHART =================
let chart=new Chart(document.getElementById("chart"),{
type:"bar",
data:{
labels:["Progress"],
datasets:[{data:[0]}]
}
});

function updateChart(val){
chart.data.datasets[0].data=[val];
chart.update();
}

// ================= EXPORT CSV =================
function exportCSV(){
let csv="Task,Done\n";
checkboxes.forEach((cb,i)=>{
csv+=`Task${i},${cb.checked}\n`;
});

let blob=new Blob([csv]);
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="progress.csv";
a.click();
}

// ================= BACKUP =================
function exportFullData(){
let data=JSON.stringify(localStorage);
let blob=new Blob([data]);
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="backup.json";
a.click();
}

function importData(){
let file=document.getElementById("importFile").files[0];
let reader=new FileReader();
reader.onload=function(){
let data=JSON.parse(reader.result);
for(let key in data){
localStorage.setItem(key,data[key]);
}
location.reload();
};
reader.readAsText(file);
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