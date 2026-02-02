import{s as p,c as I,j as B}from"./assets/supabase-C9qQPl7M.js";const f=e=>new Promise(a=>{chrome.storage.local.set({[e.profileUrl]:e},()=>a())}),h=e=>new Promise(a=>{chrome.storage.local.get(e,s=>{a(s[e]??null)})}),S=async()=>{var s,c;const{data:e,error:a}=await p.auth.getSession();return a?null:((c=(s=e.session)==null?void 0:s.user)==null?void 0:c.id)??null},N=(e,a)=>({user_id:a,profile_url:e.profileUrl,met_at:e.metAt??null,tags:e.tags??[],note:e.note,created_at:new Date(e.createdAt).toISOString(),updated_at:new Date(e.updatedAt).toISOString()}),$=e=>({profileUrl:e.profile_url,metAt:e.met_at??void 0,tags:e.tags??[],note:e.note,createdAt:Date.parse(e.created_at),updatedAt:Date.parse(e.updated_at)}),P=async e=>{const a=await S();if(!a){await f(e);return}const{error:s}=await p.from("notes").upsert(N(e,a),{onConflict:"user_id,profile_url"});s&&await f(e)},A=e=>(async()=>{const a=await S();if(!a)return h(e);const{data:s,error:c}=await p.from("notes").select("profile_url, met_at, tags, note, created_at, updated_at").eq("user_id",a).eq("profile_url",e).maybeSingle();return c||!s?h(e):$(s)})();function T(){return location.pathname.replace(/\/$/,"")}function v(){return location.pathname.startsWith("/in/")}function m(){if(!v()||document.getElementById("recall-root"))return;const e=document.createElement("div");e.id="recall-root",e.style.position="fixed",e.style.top="120px",e.style.right="20px",e.style.zIndex="2147483647",document.body.appendChild(e),I(e).render(B.jsx(j,{}))}function j(){const e=T();let a=null;const s=document.createElement("div");s.className="recall-container";const c=document.createElement("button");c.className="recall-pill",c.textContent="Add note",c.style.display="block",c.onclick=async()=>{if(!v())return;const t=await A(e);t?(a=t,x(t)):y()};const l=document.createElement("div");l.className="recall-panel",l.style.display="none",s.appendChild(c),s.appendChild(l),setTimeout(()=>{const t=document.getElementById("recall-root");t&&t.childElementCount===0&&t.appendChild(s)},0);function n(){l.style.display="none"}function y(t){l.style.display="block",l.classList.remove("recall-mode"),l.classList.add("capture-mode");const i=(t==null?void 0:t.metAt)??"",d=((t==null?void 0:t.tags)??[]).join(", "),u=(t==null?void 0:t.note)??"";l.innerHTML=`
      <div class="recall-header">
        <div class="recall-title">Add a note</div>
        <button class="recall-x" aria-label="Close">×</button>
      </div>

      <div class="recall-sub">Save context for future-you ✨</div>

      <label class="recall-label">Met at</label>
      <input class="recall-input" id="recall-metat" placeholder="e.g. TorontoJS Meetup" value="${o(i)}" />

      <label class="recall-label">Tags</label>
      <input class="recall-input" id="recall-tags" placeholder="e.g. recruiter, conference" value="${o(d)}" />

      <label class="recall-label">Note</label>
      <textarea class="recall-textarea" id="recall-note" placeholder="What did you talk about?">${o(u)}</textarea>

      <button class="recall-primary" id="recall-save">Save note</button>
    `;const r=l.querySelector(".recall-x");r.onclick=n;const C=l.querySelector("#recall-save");C.onclick=async()=>{const E=l.querySelector("#recall-metat"),k=l.querySelector("#recall-tags"),L=l.querySelector("#recall-note"),g=Date.now(),b={profileUrl:e,metAt:E.value.trim()||void 0,tags:k.value.split(",").map(q=>q.trim()).filter(Boolean),note:L.value.trim(),createdAt:(a==null?void 0:a.createdAt)??g,updatedAt:g};await P(b),a=b,n(),c.textContent="View note",c.classList.add("has-note"),c.style.display="block"}}function x(t){var r;l.style.display="block",l.classList.remove("capture-mode"),l.classList.add("recall-mode"),l.innerHTML=`
      <div class="recall-header">
        <div class="recall-title">Note</div>
        <button class="recall-x" aria-label="Close">×</button>
      </div>

      <div class="recall-card">
        <div class="recall-row">
          <span class="recall-k">Met at</span>
          <span class="recall-v">${t.metAt?o(t.metAt):"—"}</span>
        </div>
        <div class="recall-row">
          <span class="recall-k">Tags</span>
          <span class="recall-v">${(r=t.tags)!=null&&r.length?t.tags.map(_).join(""):"—"}</span>
        </div>
        <div class="recall-note">${t.note?o(t.note):"—"}</div>
      </div>

      <div class="recall-actions">
        <button class="recall-secondary" id="recall-edit">Edit note</button>
        <button class="recall-primary" id="recall-close">Close</button>
      </div>
    `;const i=l.querySelector(".recall-x");i.onclick=n;const d=l.querySelector("#recall-close");d.onclick=n;const u=l.querySelector("#recall-edit");u.onclick=()=>y(t)}function _(t){return`<span class="recall-chip">${o(t)}</span>`}function o(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}return(async()=>{const t=await A(e);t?(a=t,c.textContent="View note",c.classList.add("has-note")):(c.textContent="Add note",c.classList.remove("has-note"))})(),null}document.readyState==="complete"||document.readyState==="interactive"?m():window.addEventListener("load",m);let w=location.href;setInterval(()=>{if(location.href!==w){w=location.href;const e=document.getElementById("recall-root");e&&e.remove(),v()&&m()}},700);
