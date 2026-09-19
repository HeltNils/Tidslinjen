const events = window.TIMELINE_EVENTS || [];

if (!events.length) {
  console.error("Hendelsesbanken kunne ikke lastes.");
}

const stages=[
  {ratio:0.00,key:"underground",name:"Dypt under bakken",desc:"Reisen starter langt under overflaten."},
  {ratio:0.14,key:"shallow",name:"Nærmere overflaten",desc:"Lys og røtter begynner å dukke opp."},
  {ratio:0.28,key:"surface",name:"Over bakken",desc:"Tidslinjen har nådd landskapet."},
  {ratio:0.43,key:"treetops",name:"Over tretoppene",desc:"Vi stiger gradvis høyere."},
  {ratio:0.57,key:"clouds",name:"I skyene",desc:"Bakgrunnen beveger seg opp gjennom skylaget."},
  {ratio:0.71,key:"highsky",name:"Høyt over skyene",desc:"Jorda ligger stadig lenger under oss."},
  {ratio:0.84,key:"atmosphere",name:"I atmosfæren",desc:"Himmelen blir mørkere og verdensrommet nærmer seg."},
  {ratio:0.96,key:"space",name:"I verdensrommet",desc:"Tidslinjen har nådd helt ut i rommet."}
];

const modeInfo={
  timeline:{
    title:"Bygg tidslinjen",
    text:"Du trenger ikke vite årstallet. Plasser hendelsen før, mellom eller etter kortene som allerede ligger ute.",
    help:"Du trenger ikke vite årstallet – bare hva som kom før og etter."
  },
  exact:{
    title:"Treff årstallet",
    text:"Skriv inn det nøyaktige årstallet du tror hendelsen fant sted.",
    help:"Kun helt riktig årstall gir poeng."
  },
  ten:{
    title:"Hvor nær kommer du?",
    text:"Skriv inn et årstall. Du får riktig hvis du er maksimalt 10 år unna.",
    help:"Et svar fra riktig år −10 til riktig år +10 godkjennes."
  },
  century:{
    title:"Velg riktig århundre",
    text:"Du trenger ikke vite det nøyaktige årstallet. Velg århundret hendelsen tilhører.",
    help:"Eksempel: 1789 = 18. århundre."
  },
  millennium:{
    title:"Velg riktig årtusen",
    text:"Velg hvilket årtusen hendelsen tilhører.",
    help:"Passer godt for svært gamle hendelser."
  }
};

let deck=[],placed=[],current=null,selectedSlot=null,correct=0,wrong=0,resolved=true,mode="timeline";

const $=id=>document.getElementById(id);
const timeline=$("timeline"),currentImage=$("currentImage"),currentTitle=$("currentTitle"),currentYear=$("currentYear"),currentSub=$("currentSub");
const checkBtn=$("checkBtn"),nextBtn=$("nextBtn"),feedback=$("feedback"),choiceGrid=$("choiceGrid"),yearForm=$("yearForm"),yearInput=$("yearInput");
const infoBtn=$("infoBtn"),infoOverlay=$("infoOverlay"),infoTitle=$("infoTitle"),infoText=$("infoText");

function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}

function era(y){return y<0?"f.Kr.":"e.Kr."}
function centuryNumber(y){return Math.floor((Math.abs(y)-1)/100)+1}
function millenniumNumber(y){return Math.floor((Math.abs(y)-1)/1000)+1}
function centuryLabel(y){return `${centuryNumber(y)}. århundre ${era(y)}`}
function millenniumLabel(y){return `${millenniumNumber(y)}. årtusen ${era(y)}`}

function setModeUI(){
  const info=modeInfo[mode];
  $("challengeTitle").textContent=info.title;
  $("challengeText").textContent=info.text;
  $("modeHelp").textContent=info.help;
  $("timelineArea").style.display=mode==="timeline"?"block":"none";
  $("timelineInstruction").classList.toggle("hidden",mode!=="timeline");
  yearForm.classList.toggle("hidden",!(mode==="exact"||mode==="ten"));
  choiceGrid.classList.toggle("hidden",!(mode==="century"||mode==="millennium"));
  checkBtn.style.display=mode==="timeline"?"inline-block":"none";
}

function startGame(){
  deck=shuffle(events);placed=[];current=null;selectedSlot=null;correct=0;wrong=0;resolved=true;
  feedback.className="feedback";nextBtn.disabled=true;checkBtn.disabled=true;infoBtn.disabled=true;
  updateStats();updateStage();setModeUI();

  if(mode==="timeline"){
    current=deck.pop();
    placed.push(current);
    placed.sort((a,b)=>a.year-b.year);
    correct=1;resolved=true;
    revealCurrent(current,true);
    renderTimeline();
    updateStats();updateStage();
    feedback.className="feedback show ok";
    feedback.textContent=`Startkort: ${current.title} – ${current.displayYear}. Første kort er alltid korrekt.`;
    nextBtn.disabled=false;
  }else{
    drawNext();
  }
}

function drawNext(){
  if(!deck.length){
    current=null;renderEmptyCurrent();
    feedback.className="feedback show ok";
    feedback.textContent="Runden er ferdig!";
    nextBtn.disabled=true;checkBtn.disabled=true;return;
  }
  current=deck.pop();selectedSlot=null;resolved=false;
  showCurrent(current);
  feedback.className="feedback";
  nextBtn.disabled=true;checkBtn.disabled=true;
  yearInput.value="";
  if(mode==="timeline")renderTimeline();
  if(mode==="century"||mode==="millennium")makeChoices();
  updateStats();
}

function showCurrent(e){
  currentTitle.textContent=e.title;currentYear.textContent=e.displayYear;currentYear.classList.add("hidden");
  infoBtn.disabled=false;
  currentSub.textContent="Årstallet er skjult";
  currentImage.innerHTML=e.image?`<img src="${e.image}" alt="">`:(e.emoji||"🕰️");
}
function revealCurrent(e,keepShown=false){
  showCurrent(e);currentYear.classList.remove("hidden");currentSub.textContent=keepShown?"Startkort":"Årstallet er avslørt";
}
function renderEmptyCurrent(){
  currentTitle.textContent="Runden er ferdig";currentImage.textContent="🏁";currentYear.classList.add("hidden");currentSub.textContent="Start på nytt for en ny runde";infoBtn.disabled=true;
}

function renderTimeline(){
  timeline.innerHTML="";
  timeline.appendChild(makeSlot(0));
  placed.forEach((e,i)=>{timeline.appendChild(makePlaced(e));timeline.appendChild(makeSlot(i+1))});
  if(resolved||!current)timeline.querySelectorAll(".slot").forEach(s=>s.classList.add("disabled"));
}
function makePlaced(e){
  const el=document.createElement("div");el.className="placed-card";
  el.innerHTML=`<div class="mini-img">${e.image?`<img src="${e.image}" alt="">`:(e.emoji||"🕰️")}</div>
    <div class="mini-year">${e.displayYear}</div><div class="mini-title">${e.title}</div>`;return el;
}
function makeSlot(i){
  const el=document.createElement("div");el.className="slot";el.dataset.index=i;el.innerHTML=`<div><span class="plus">＋</span>Plasser her</div>`;
  if(!resolved&&current){
    el.addEventListener("click",()=>{
      selectedSlot=i;timeline.querySelectorAll(".slot").forEach(s=>s.classList.remove("selected"));el.classList.add("selected");checkBtn.disabled=false;
    });
  }
  return el;
}

function checkTimeline(){
  if(!current||selectedSlot===null)return;
  revealCurrent(current);
  const left=placed[selectedSlot-1],right=placed[selectedSlot];
  const ok=(!left||current.year>=left.year)&&(!right||current.year<=right.year);
  if(ok){
    placed.splice(selectedSlot,0,current);correct++;
    showFeedback(true,`Riktig! ${current.title} skjedde i ${current.displayYear}.`);
  }else{
    wrong++;
    let i=0;while(i<placed.length&&placed[i].year<current.year)i++;
    const before=placed[i-1]?.displayYear,after=placed[i]?.displayYear;
    const where=before&&after?`mellom ${before} og ${after}`:before?`etter ${before}`:`før ${after}`;
    showFeedback(false,`Ikke riktig plassering. Hendelsen skjedde i ${current.displayYear} og skulle vært ${where}.`);
  }
  resolved=true;renderTimeline();afterAnswer();
}

function submitYear(e){
  e.preventDefault();
  if(resolved||!current)return;
  const guess=Number(yearInput.value);
  if(!Number.isFinite(guess)||!Number.isInteger(guess)){showFeedback(false,"Skriv inn et helt årstall.");return}
  const tolerance=mode==="ten"?10:0;
  const delta=Math.abs(guess-current.year);
  const ok=delta<=tolerance;
  revealCurrent(current);
  if(ok){
    correct++;
    const msg=mode==="exact"?`Riktig! Året var ${current.displayYear}.`:`Riktig! ${guess} er ${delta} år fra ${current.displayYear}.`;
    showFeedback(true,msg);
  }else{
    wrong++;
    const msg=mode==="exact"?`Ikke helt. Riktig år var ${current.displayYear}.`:`Ikke helt. Du svarte ${guess}; riktig år var ${current.displayYear}.`;
    showFeedback(false,msg);
  }
  resolved=true;afterAnswer();
}

function makeChoices(){
  choiceGrid.innerHTML="";
  const getNum=mode==="century"?centuryNumber:millenniumNumber;
  const getLabel=mode==="century"?centuryLabel:millenniumLabel;
  const correctN=getNum(current.year),currentEra=era(current.year);
  let choices=new Set([getLabel(current.year)]);
  for(let d=1;choices.size<4&&d<8;d++){
    const nums=[Math.max(1,correctN-d),correctN+d];
    for(const n of nums){
      const fakeYear=(current.year<0?-1:1)*((n-1)*(mode==="century"?100:1000)+1);
      choices.add(getLabel(fakeYear));
      if(choices.size>=4)break;
    }
  }
  const arr=shuffle([...choices]).slice(0,4);
  arr.forEach(label=>{
    const b=document.createElement("button");b.type="button";b.className="choice-btn";b.textContent=label;
    b.addEventListener("click",()=>answerChoice(label));choiceGrid.appendChild(b);
  });
}

function answerChoice(label){
  if(resolved||!current)return;
  const correctLabel=mode==="century"?centuryLabel(current.year):millenniumLabel(current.year);
  const ok=label===correctLabel;
  revealCurrent(current);
  if(ok){correct++;showFeedback(true,`Riktig! ${current.displayYear} ligger i ${correctLabel}.`)}
  else{wrong++;showFeedback(false,`Ikke helt. ${current.displayYear} ligger i ${correctLabel}.`)}
  resolved=true;
  choiceGrid.querySelectorAll("button").forEach(b=>{b.disabled=true;if(b.textContent===correctLabel)b.classList.add("selected")});
  afterAnswer();
}

function afterAnswer(){
  updateStats();updateStage();nextBtn.disabled=false;checkBtn.disabled=true;
}

function showFeedback(ok,text){
  feedback.className=`feedback show ${ok?"ok":"no"}`;feedback.textContent=text;
}

function updateStats(){
  $("correct").textContent=correct;$("wrong").textContent=wrong;$("left").textContent=deck.length;
}
function updateStage(){
  const total=events.length;
  const answered=Math.max(0,correct+wrong);
  const ratio=total>0?Math.min(1,answered/total):0;

  let s=stages[0];
  for(const x of stages){
    if(ratio>=x.ratio)s=x;
  }

  document.body.dataset.stage=s.key;
  $("stageName").textContent=s.name;
  $("stageDesc").textContent=s.desc;
  $("stageProgress").style.width=(ratio*100)+"%";
}

$("modeSelect").addEventListener("change",e=>{mode=e.target.value;setModeUI();startGame()});
$("startBtn").addEventListener("click",startGame);
$("nextBtn").addEventListener("click",drawNext);
checkBtn.addEventListener("click",checkTimeline);
yearForm.addEventListener("submit",submitYear);
$("rulesBtn").addEventListener("click",()=>$("rules").classList.toggle("show"));


function openInfo(){
  if(!current)return;
  infoTitle.textContent=current.title;
  infoText.textContent=current.info || "Ingen forklaring er lagt inn ennå.";
  infoOverlay.classList.add("show");
  $("infoClose").focus();
}
function closeInfo(){
  infoOverlay.classList.remove("show");
  infoBtn.focus();
}

infoBtn.addEventListener("click",openInfo);
$("infoClose").addEventListener("click",closeInfo);
infoOverlay.addEventListener("click",e=>{if(e.target===infoOverlay)closeInfo()});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&infoOverlay.classList.contains("show"))closeInfo();
});

setModeUI();
startGame();
