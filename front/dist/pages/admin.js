import{a as h,b as L,c as y,d as b,e as w}from"../chunk-XPMRJSEA.js";import"../chunk-XE75LTDN.js";import{b as M}from"../chunk-6H2JHQVY.js";import{a as $}from"../chunk-P37U34EQ.js";var l=qi("#search");function d(){let a=new Set;document.querySelectorAll(".user[open]").forEach(t=>{a.add(t)});let e=l.value.toLowerCase().trim(),s={user:[],name:[],file:[],text:[]};e.split(/\s+/).filter(Boolean).forEach(t=>{let r=t.indexOf(":");if(r>0&&r<t.length-1){let p=t.substring(0,r),o=t.substring(r+1);switch(p){case"user":s.user.push(o);break;case"name":s.name.push(o);break;case"file":s.file.push(o);break;default:s.text.push(t);break}}else s.text.push(t)}),document.querySelectorAll(".user").forEach(t=>{let r=t.querySelector("summary")?.textContent?.toLowerCase()||"",p=t.querySelectorAll(".mails-container > ul > li"),o=!1;p.forEach(m=>{let g=m.querySelector("h3")?.textContent?.toLowerCase()||"",k=m.querySelectorAll(".files-container a"),v=Array.from(k).map(i=>i.dataset.filename?.toLowerCase()||""),E=s.user.length===0||s.user.some(i=>r.includes(i)),C=s.name.length===0||s.name.some(i=>g.includes(i)),T=s.file.length===0||s.file.some(i=>v.some(f=>f.includes(i))),q=[r,g,...v],H=s.text.length===0||s.text.every(i=>q.some(f=>f.includes(i)));E&&C&&T&&H?(m.style.display="",o=!0):m.style.display="none"}),o?(t.style.display="",(a.has(t)||e)&&t.setAttribute("open","")):(t.style.display="none",t.removeAttribute("open"))})}$(d,"search");l.addEventListener("input",()=>d());M();var u=qs("#app"),S=qs("#notifications"),x=await fetch("/api/admin/user-data").then(a=>a.json());x?(u.innerHTML=x.sort((a,e)=>e.name.localeCompare(a.name)).map(a=>{let e=w(a.mails).map(n=>`
                <li>
                    <h3>${n.name}</h3>
                    ${y(n._id)}
                    ${b(n.txt)}
                    <button class="show" data-id="${n._id}">View Files</button>
                    <div class="files-container" data-id="files-${n._id}"></div>
                </li>
            `).join("");return`
            <details class="user" data-id="user-details-${a.name}">
                <summary>${a.name}</summary>
                <div class="mails-container">
                    <ul>
                        ${e}
                    </ul>
                </div>
            </details>
        `}).join(""),x.forEach(a=>{a.mails.forEach(e=>{h({name:e.name,files:e.files,apiPath:"/api/admin/files",user:a.name,containerId:`files-${e._id}`})})}),L(u),setTimeout(()=>{l.value&&d()},10)):u.innerHTML='<p class="error-message">Could not connect to the server.</p>';var A=new EventSource("/api/admin/sse");A.onmessage=a=>{let e=JSON.parse(a.data),s=document.createElement("li");s.style.backgroundColor="#444",s.innerHTML=`
        <h3 style="text-decoration: underline;" title="New mail">${e.name}</h3>
        ${y(e._id)}
        ${b(e.txt)}
        <button class="show" data-id="${e._id}">View Files</button>
        <div class="files-container" data-id="files-${e._id}"></div>
    `;let n=qs(`user-details-${e.user}`,1).qs("ul");if(!n){let t=document.createElement("details");t.innerHTML=`
            <summary style="text-decoration: underline;" title="New user">${e.user}</summary>
            <div class="mails-container"><ul></ul></div>
        `,t.dataset.id=`user-details-${e.user}`,t.style.backgroundColor="#333",u.appendChild(t),n=qs(`user-details-${e.user}`,1).qs("ul"),t.addEventListener("click",()=>{t.style.backgroundColor="",t.qs("summary").style.textDecoration=""},{once:!0})}n.addUp(s),s.addEventListener("click",()=>{s.style.backgroundColor="",s.qs("h3").style.textDecoration=""},{once:!0}),h({name:e.name,files:e.files,apiPath:"/api/admin/files",user:e.user,containerId:`files-${e._id}`}),l.value&&d();let c=document.createElement("li");c.innerHTML=`<b>${e.user}</b> - <b>${e.name}</b>`,S.appendChild(c),c.addEventListener("click",()=>{c.remove(),l.v(`user:${e.user} name:${e.name}`),d()},{once:!0})};
//# sourceMappingURL=admin.js.map
