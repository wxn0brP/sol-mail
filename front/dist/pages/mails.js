import{a as t,b as a,c as p,d as l,e as c}from"../chunk-XPMRJSEA.js";import"../chunk-XE75LTDN.js";import{b as n}from"../chunk-6H2JHQVY.js";import{a as i}from"../chunk-P37U34EQ.js";n();var r=qs(".mails-container");async function s(){let e=await fetch("/api/files/mails").then(o=>o.json());if(e.err){r.innerHTML=`<p class="error-message">${e.msg}</p>`;return}if(e.length===0){r.innerHTML='<p class="error-message">No mails found.</p>';return}r.innerHTML="<ul>"+c(e).map(o=>`
            <li>
                <h3>${o.name}</h3>
                ${p(o._id)}
                ${l(o.txt)}
                <button class="show" data-id="${o._id}">View Files</button>
                <div class="files-container" data-id="files-${o._id}"></div>
            </li>
        `).join("")+"</ul>",e.forEach(o=>{t({name:o.name,files:o.files,apiPath:"/api/files",containerId:`files-${o._id}`})}),a(r)}i(s,"main");try{s()}catch(e){console.error("Failed to load mails:",e),r.innerHTML='<p class="error-message">Could not connect to the server.</p>'}
//# sourceMappingURL=mails.js.map
