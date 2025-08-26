async function peek(){
  try{
    const res = await fetch('/api/peek');
    const j = await res.json();
    // update count or other UI if needed
  }catch(e){ console.warn(e) }
}

async function resetConfirm(e){
  e.preventDefault();
  if(!confirm('Yakin reset antrean?')) return false;
  const res = await fetch('/api/reset',{method:'POST'});
  if(res.ok) location.reload();
}

document.addEventListener('DOMContentLoaded', ()=>{
  // If on panggil page, handle auto play of call popup after POST rendered content
  const callForm = document.getElementById('callForm');
  if(callForm){
    callForm.addEventListener('submit', async (ev)=>{
      // let server render new page with ticket; we allow regular POST to do that
    });
  }
});

// Popup control functions (can be used from server-rendered content by small inline script)
function showCallPopup(code,name){
  const el = document.getElementById('callPopup');
  document.getElementById('callCode').textContent = code;
  document.getElementById('callName').textContent = name;
  el.classList.add('show');
  playDing();
  setTimeout(()=>{ el.classList.remove('show'); },6000);
}
function closeCall(){ document.getElementById('callPopup').classList.remove('show'); }

function playDing(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = [880,660,1040];
    freqs.forEach((f,i)=>{
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type='sine'; o.frequency.value = f;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime + i*0.12);
      g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.02 + i*0.12);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12 + i*0.12);
      o.start(ctx.currentTime + i*0.12); o.stop(ctx.currentTime + 0.12 + i*0.12);
    });
  }catch(e){ console.warn('sound fail',e) }
}
