(() => {
      const STORAGE_KEY = "sisops_processes";
      let processes = [], simulation = null, tickTimer = null, draggedProcessId = null, currentPage = 1;
      let validation = { valid:true, message:"", duplicateIds:new Set() };
      const refs = {
        tableBody:document.getElementById("processTableBody"),
        simDesc:document.getElementById("simDesc"), currentTime:document.getElementById("currentTime"), processCount:document.getElementById("processCount"), avgTat:document.getElementById("avgTat"), avgWt:document.getElementById("avgWt"), cpuUtil:document.getElementById("cpuUtil"),
        cpuState:document.getElementById("cpuState"), cpuDetail:document.getElementById("cpuDetail"), activeChip:document.getElementById("activeChip"), readyQueue:document.getElementById("readyQueue"), timelineTrack:document.getElementById("timelineTrack"), timelineAxis:document.getElementById("timelineAxis"), progressList:document.getElementById("progressList"), logBox:document.getElementById("logBox"), editorError:document.getElementById("editorError"), speedRange:document.getElementById("speedRange"), speedValue:document.getElementById("speedValue"), rowsPerPage:document.getElementById("rowsPerPage"), prevPage:document.getElementById("prevPage"), nextPage:document.getElementById("nextPage"), pageIndicator:document.getElementById("pageIndicator")
      };
      function uid(){return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}
      function stopPlayback(){clearInterval(tickTimer);tickTimer=null}
      function getSpeed(){return Number(refs.speedRange.value)||1}
      function getPlaybackDelay(){return Math.round(900/getSpeed())}
      function startPlayback(){if(!validation.valid||!processes.length||simulation?.finished)return;stopPlayback();tickTimer=setInterval(tick,getPlaybackDelay())}
      function renderSpeed(){const speed=getSpeed();refs.speedValue.textContent=`${Number.isInteger(speed)?speed:speed.toFixed(2).replace(/0$/,"")}x`}
      function getPageSize(){return Number(refs.rowsPerPage.value)||10}
      function getTotalPages(){return Math.max(1,Math.ceil(processes.length/getPageSize()))}
      function updatePagination(){const total=getTotalPages();currentPage=Math.min(Math.max(1,currentPage),total);refs.pageIndicator.textContent=`Pagina ${currentPage} de ${total}`;refs.prevPage.disabled=currentPage<=1;refs.nextPage.disabled=currentPage>=total}
      function fallbackColor(key){const palette=["#356dff","#8c6dff","#2bb98d","#ff8f5c","#e55f8c","#1f9bd1","#7a6bff","#30b67d"];let hash=0;for(const char of String(key))hash=(hash+char.charCodeAt(0))%palette.length;return palette[hash]}
      function colorStyle(color,alpha=.18){return `color:${color};background:${hexToRgba(color,alpha)};border-color:${hexToRgba(color,.24)}`}
      function hexToRgba(hex,alpha){const clean=String(hex||"").replace("#","");if(clean.length!==6)return `rgba(53,109,255,${alpha})`;const n=parseInt(clean,16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;return `rgba(${r},${g},${b},${alpha})`}
      function sanitizeProcesses(list){return list.map((p,index)=>({id:uid(),order:index,name:String(p.name||`P${index+1}`).trim()||`P${index+1}`,arrival:Math.max(0,Number(p.arrival)||0),burst:Math.max(1,Number(p.burst)||1),priority:Math.max(0,Number(p.priority)||0),color:p.color||fallbackColor(p.name||p.pid||index)}))}
      function loadCapturedProcesses(){
        try {
          const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
          if (Array.isArray(stored) && stored.length) {
            processes = sanitizeProcesses(stored.map((p) => ({ name:p.pid, arrival:p.arrival, burst:p.burst, priority:p.priority, color:p.color })));
            runCalculation(true);
            return;
          }
        } catch (error) {}
        processes = [];
        runCalculation(true);
        refs.editorError.textContent = "No hay procesos guardados en Captura. Agrega procesos en la pantalla principal y vuelve a esta vista.";
        refs.editorError.classList.add("show");
      }
      function calculateFcfs(input){
        const sorted = input
          .map((p,index)=>({...p,order:index}))
          .sort((a,b)=>a.arrival-b.arrival||a.order-b.order);
        let current=0,busy=0;
        const computed=sorted.map((p)=>{const start=Math.max(current,p.arrival),finish=start+p.burst,tat=finish-p.arrival,wt=tat-p.burst,rt=start-p.arrival;current=finish;busy+=p.burst;return {...p,start,finish,tat,wt,rt,remaining:p.burst,progress:0}});
        const totalTime=computed.length?Math.max(...computed.map(p=>p.finish)):0, avgTat=computed.length?computed.reduce((a,p)=>a+p.tat,0)/computed.length:0, avgWt=computed.length?computed.reduce((a,p)=>a+p.wt,0)/computed.length:0, cpuUtil=totalTime?busy/totalTime*100:0;
        return {computed,totalTime,avgTat,avgWt,cpuUtil};
      }
      function validateProcesses(list){const map=new Map(),dups=new Set();for(const p of list){const key=(p.name||"").trim().toUpperCase();if(!key)continue;map.set(key,(map.get(key)||0)+1)}for(const [key,count] of map.entries())if(count>1)dups.add(key);return dups.size?{valid:false,duplicateIds:dups,message:`No se pueden repetir los PID. Corrige: ${[...dups].join(", ")}.`}:{valid:true,duplicateIds:new Set(),message:""}}
      function syncEditorError(){refs.editorError.textContent=validation.message||"";refs.editorError.classList.toggle("show",!validation.valid&&Boolean(validation.message))}
      function getDynamicMetrics(proc,sim){if(!sim)return{tat:0,wt:0};let tat=0;if(sim.clock>proc.arrival)tat=Math.min(sim.clock-proc.arrival,proc.tat);let wt=Math.max(0,tat-proc.progress);if(proc.remaining===0){tat=proc.tat;wt=proc.wt}return{tat,wt}}
      function renderTable(){
        refs.tableBody.innerHTML="";
        updatePagination();
        if(!processes.length){refs.tableBody.innerHTML='<tr><td colspan="10"><div class="empty">No hay procesos capturados todavia.</div></td></tr>';validation={valid:true,message:"",duplicateIds:new Set()};syncEditorError();return}
        const calc=calculateFcfs(processes),simLookup=simulation?new Map(simulation.computed.map(p=>[p.id,p])):null;
        const pageSize=getPageSize(),start=(currentPage-1)*pageSize,pageItems=processes.slice(start,start+pageSize);
        pageItems.forEach((p)=>{const found=calc.computed.find(c=>c.id===p.id),live=simLookup?.get(p.id),hasStarted=simulation&&simulation.clock>=found.start,hasFinished=simulation&&simulation.clock>=found.finish,metrics=getDynamicMetrics(live||{...found,progress:0,remaining:found.burst},simulation);const tr=document.createElement("tr");tr.dataset.id=p.id;tr.className="drag-row";tr.draggable=true;tr.title="Arrastra esta fila para cambiar el orden";tr.innerHTML=`<td><span class="color-dot" style="background:${p.color}"></span></td><td>${escapeHtml(p.name)}</td><td>${p.arrival}</td><td>${p.burst}</td><td>${p.priority}</td><td>${hasStarted?found.start:"-"}</td><td>${hasFinished?found.finish:"-"}</td><td>${found?metrics.tat:"-"}</td><td>${found?metrics.wt:"-"}</td><td>${found?found.rt:"-"}</td>`;refs.tableBody.appendChild(tr)});
        validation=validateProcesses(processes);syncEditorError();
      }
      function updateTableDynamicData(){const calc=calculateFcfs(processes),simLookup=simulation?new Map(simulation.computed.map(p=>[p.id,p])):null;refs.tableBody.querySelectorAll("tr[data-id]").forEach(tr=>{const id=tr.dataset.id,found=calc.computed.find(c=>c.id===id),live=simLookup?.get(id),metrics=getDynamicMetrics(live||{...found,progress:0,remaining:found.burst},simulation);tr.children[5].textContent=simulation&&simulation.clock>=found.start?found.start:"-";tr.children[6].textContent=simulation&&simulation.clock>=found.finish?found.finish:"-";tr.children[7].textContent=found?metrics.tat:"-";tr.children[8].textContent=found?metrics.wt:"-";tr.children[9].textContent=found?found.rt:"-"})}
      function clearDragState(){refs.tableBody.querySelectorAll(".drag-row").forEach(row=>row.classList.remove("dragging"))}
      function syncOrderFromRows(){const byId=new Map(processes.map(p=>[p.id,p])),orderedPage=[...refs.tableBody.querySelectorAll("tr[data-id]")].map(row=>byId.get(row.dataset.id)).filter(Boolean),pageSize=getPageSize(),start=(currentPage-1)*pageSize;if(orderedPage.length){processes=[...processes.slice(0,start),...orderedPage,...processes.slice(start+orderedPage.length)];runCalculation(true)}}
      function runCalculation(renderTab=true){stopPlayback();const r=calculateFcfs(processes);simulation={...r,finalCpuUtil:r.cpuUtil,clock:0,activeId:null,logs:[],finished:false,busyTicks:0};if(refs.timelineTrack)delete refs.timelineTrack.dataset.built;renderSimulation(renderTab)}
      function renderSimulation(renderTab=true){
        const sim=simulation,totals=sim.computed.reduce((acc,p)=>{const m=getDynamicMetrics(p,sim);acc.tat+=m.tat;acc.wt+=m.wt;return acc},{tat:0,wt:0}),dynamic={tat:totals.tat/(sim.computed.length||1),wt:totals.wt/(sim.computed.length||1),util:sim.clock>0?sim.busyTicks/sim.clock*100:0};
        refs.currentTime.textContent=`${sim.clock} s`;refs.processCount.textContent=String(sim.computed.length);refs.avgTat.textContent=dynamic.tat.toFixed(2);refs.avgWt.textContent=dynamic.wt.toFixed(2);refs.cpuUtil.textContent=`${dynamic.util.toFixed(1)}%`;refs.simDesc.textContent=`FCFS listo: ${sim.computed.length} procesos, tiempo total estimado ${sim.totalTime}s.`;
        const active=sim.computed.find(p=>p.id===sim.activeId);if(active){refs.cpuState.textContent=`Ejecutando ${active.name}`;refs.cpuDetail.textContent=`Le restan ${active.remaining} s. Cambio de contexto al terminar.`;refs.activeChip.textContent=active.name;refs.activeChip.className="chip active";refs.activeChip.style.background=active.color}else{refs.cpuState.textContent=sim.finished?"Terminado":"Idle";refs.cpuDetail.textContent=sim.finished?"Planificacion concluida.":"Esperando proceso listo.";refs.activeChip.textContent=sim.finished?"Done":"Idle";refs.activeChip.className=sim.finished?"chip done":"chip";refs.activeChip.style.background=""}
        const ready=sim.computed.filter(p=>p.arrival<=sim.clock&&p.remaining>0&&p.id!==sim.activeId);refs.readyQueue.innerHTML=ready.length?ready.map(p=>`<span class="chip wait" style="${colorStyle(p.color)}">${escapeHtml(p.name)}</span>`).join(""):'<span class="muted">Vacia</span>';
        renderTimeline();renderProgress();renderLog();if(renderTab)renderTable();else updateTableDynamicData();
      }
      function renderTimeline(){const track=refs.timelineTrack,axis=refs.timelineAxis;if(!simulation||!simulation.computed.length){track.innerHTML="";axis.innerHTML="";return}const total=Math.max(simulation.totalTime,1);if(!track.dataset.built||track.dataset.totalTime!==String(simulation.totalTime)){let html="",axisHtml='<div class="timeline-tick" style="left:0%">0</div>',t=0;[...simulation.computed].sort((a,b)=>a.start-b.start).forEach(p=>{if(p.start>t){html+=`<div class="timeline-segment" style="width:${((p.start-t)/total)*100}%"><div class="segment-fill idle" data-start="${t}" data-end="${p.start}"></div><span class="segment-text">Idle</span></div>`;axisHtml+=`<div class="timeline-tick" style="left:${(p.start/total)*100}%">${p.start}</div>`;t=p.start}html+=`<div class="timeline-segment" style="width:${(p.burst/total)*100}%" title="PID ${escapeHtml(p.name)} | AT ${p.arrival} | BT ${p.burst} | TAT ${p.tat} | WT ${p.wt}"><div class="segment-fill" data-start="${p.start}" data-end="${p.finish}" style="background:${hexToRgba(p.color,.48)}"></div><span class="segment-text">${escapeHtml(p.name)}</span></div>`;axisHtml+=`<div class="timeline-tick" style="left:${(p.finish/total)*100}%">${p.finish}</div>`;t=p.finish});track.innerHTML=html;axis.innerHTML=axisHtml;track.dataset.built="true";track.dataset.totalTime=simulation.totalTime}track.querySelectorAll(".segment-fill").forEach(fill=>{const s=Number(fill.dataset.start),e=Number(fill.dataset.end);let pct=0;if(simulation.clock>=e)pct=100;else if(simulation.clock>s)pct=(simulation.clock-s)/(e-s)*100;fill.style.width=`${pct}%`})}
      function renderProgress(){refs.progressList.innerHTML="";simulation.computed.forEach(p=>{const pct=p.progress/p.burst*100;const color=p.remaining===0?p.color:(p.id===simulation.activeId?p.color:hexToRgba(p.color,.36));const row=document.createElement("div");row.className="proc-line";row.innerHTML=`<div><strong style="color:${p.color}">${escapeHtml(p.name)}</strong></div><div><div class="proc-track"><div class="proc-fill" style="width:${pct}%; background:${color}"></div></div></div><div>${p.progress}/${p.burst} s</div>`;refs.progressList.appendChild(row)})}
      function renderLog(){refs.logBox.innerHTML=simulation.logs.length?simulation.logs.slice().reverse().map(item=>`<div class="log-item">${item}</div>`).join(""):'<div class="empty">Esperando simulacion...</div>'}
      function tick(){if(!simulation||simulation.finished||!validation.valid){stopPlayback();return}if(!simulation.activeId){const next=simulation.computed.find(p=>p.remaining>0&&simulation.clock>=p.start);if(next){simulation.activeId=next.id;simulation.logs.push(`<strong>t=${simulation.clock}s:</strong> ${escapeHtml(next.name)} toma el CPU.`)}}const active=simulation.computed.find(p=>p.id===simulation.activeId&&p.remaining>0);if(active){active.remaining--;active.progress++;simulation.busyTicks++;if(active.remaining===0)simulation.logs.push(`<strong>t=${simulation.clock+1}s:</strong> ${escapeHtml(active.name)} termina y libera CPU.`)}else simulation.logs.push(`<strong>t=${simulation.clock}s:</strong> CPU Idle.`);simulation.clock++;if(active&&active.remaining===0)simulation.activeId=null;simulation.finished=simulation.computed.length>0&&simulation.computed.every(p=>p.remaining===0);renderSimulation(false)}
      function escapeHtml(str){return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}
      document.getElementById("playBtn").onclick=()=>{if(!tickTimer)startPlayback()}
      document.getElementById("pauseBtn").onclick=stopPlayback;
      document.getElementById("stepBtn").onclick=()=>{stopPlayback();tick()};
      document.getElementById("resetBtn").onclick=()=>runCalculation(true);
      refs.tableBody.addEventListener("dragstart",(event)=>{const row=event.target.closest("tr[data-id]");if(!row)return;draggedProcessId=row.dataset.id;row.classList.add("dragging");event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain",draggedProcessId)});
      refs.tableBody.addEventListener("dragover",(event)=>{const row=event.target.closest("tr[data-id]");if(!row||!draggedProcessId||row.dataset.id===draggedProcessId)return;event.preventDefault();const draggingRow=[...refs.tableBody.querySelectorAll("tr[data-id]")].find(item=>item.dataset.id===draggedProcessId);if(!draggingRow)return;const rect=row.getBoundingClientRect(),placeAfter=event.clientY>rect.top+rect.height/2;if(placeAfter)row.after(draggingRow);else row.before(draggingRow)});
      refs.tableBody.addEventListener("drop",(event)=>{if(!draggedProcessId)return;event.preventDefault();syncOrderFromRows();draggedProcessId=null;clearDragState()});
      refs.tableBody.addEventListener("dragend",()=>{if(draggedProcessId)syncOrderFromRows();draggedProcessId=null;clearDragState()});
      refs.rowsPerPage.onchange=()=>{currentPage=1;renderTable()};
      refs.prevPage.onclick=()=>{currentPage=Math.max(1,currentPage-1);renderTable()};
      refs.nextPage.onclick=()=>{currentPage=Math.min(getTotalPages(),currentPage+1);renderTable()};
      refs.speedRange.oninput=()=>{const wasPlaying=Boolean(tickTimer);renderSpeed();if(wasPlaying)startPlayback()};
      renderSpeed();
      loadCapturedProcesses();
    })();
