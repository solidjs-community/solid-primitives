import{h as M,j as H,r as T,k as W,c as N,a as f,d as O,o as A,i as y,f as S,S as E,l as j,F as q,g as K,t as g,b as U}from"./index.b80416e6.js";var D=(e,t)=>e instanceof t||e&&e.constructor===t,I=e=>typeof e=="function"&&!e.length?e():e,R=e=>Array.isArray(e)?e:[e],V=()=>{let e=[];const t=()=>e=[];return{push:(...n)=>e.push(...n),execute(n,l,c,u){e.forEach(m=>m(n,l,c,u)),t()},clear:t}},z=e=>e.slice(),B=(e,t)=>{const n=z(e);return t(n),n},F=(e,t,n=0,...l)=>B(e,c=>c.splice(t,n,...l)),G=(e,t,...n)=>{const l=e.indexOf(t);return F(e,l,1,...n)},J=(e,...t)=>{const n=[];for(let l=0;l<e.length;l++){const c=e[l],u=t.indexOf(c);u!==-1?t.splice(u,1):n.push(c)}return n},P=(e,...t)=>t.length===1?e.filter(n=>D(n,t[0])):e.filter(n=>n&&t.some(l=>D(n,l)));function Q(e,...t){return t.length===0&&(t=[M()]),H(n=>(R(I(t)).forEach(l=>l&&T(l,W.bind(void 0,n))),e(n)),t[0]||void 0)}const X=(e,t)=>{const n=e.indexOf(t);e.splice(n,1)};function Y(e,...t){return N(()=>P(R(e()),...t.length?t:[Element]))}const Z=(e,t)=>{W(()=>t()(e))};function ee(e,t){let n=[];const l=new Set,c=t.length>1?new Map:void 0,u=M(),[m,v]=f([]);O(A(e,w=>{const{length:k}=n,a=R(w).slice();if(!k)return v(n=a);for(let d=0,r=0;d<k;){const o=n[d];if(a.includes(o))d++,r++;else if(l.has(o)){const s=n.indexOf(a[r]);s!==-1&&s<=d?r++:(a.splice(r,0,o),c?.get(o)?.(r),d++)}else C(a,o,d),d++}v(n=a)}));let b=[];const x=()=>{!b.length||(v(w=>J(w,...b)),b=[])};function C(w,k,a){Q(d=>{let r,o;if(c){const[i,p]=f(a),$=t(k,i),_=I($);if(!_)return d();c.set(_,p),r=$,o=_}else{const i=t(k),p=I(i);if(!p)return d();r=i,o=p}l.add(o),w.splice(a,0,o);let s=o;O(A(r,i=>{if(l.delete(s),c){const p=c.get(s);if(c.delete(s),i)p&&c.set(i,p);else{const $=m();for(a=$.indexOf(s);a<$.length;a++)c.get($[a])?.(_=>--_)}}if(!i)return X(n,s),b.push(s),queueMicrotask(x),d();l.add(i),v(p=>G(p,s,i)),s=i},{defer:!0}))},u)}return m}const te=g('<div class="absolute bg-black"></div>'),ne=g("<p>Elements count: </p>"),le=g('<div class="wrapper-h flex-wrap"><button class="btn">+ 1</button><button class="btn">- 1</button><button class="btn">toggle 0</button><button class="btn">toggle 1</button><button class="btn">toggle 2 & 3</button><button class="btn">toggle wrapper</button><button class="btn">clear</button></div>'),oe=g("<p>Hello</p>"),se=g('<div class="node">ID 1</div>'),re=g('<div class="node">ID 2</div>'),ce=g('<div class="node">ID 3</div>'),ie=g('<div class="wrapper-h flex-wrap"></div>'),ae=g('<div class="node">ID 0</div>'),ue=g('<div class="node bg-yellow-600">.</div>'),de=e=>{const t=U(()=>e.children),n=Y(t,HTMLElement),l=V();return e.getClear?.(l.execute),ee(n,(u,m)=>{const[v,b]=f(u);return console.log("REMOVED",m()),l.push(()=>b(void 0)),u.style.filter="grayscale(100%)",u.style.position="relative",u.appendChild((()=>{const x=te.cloneNode(!0);return y(x,m),x})()),u.addEventListener("click",()=>b(void 0)),v})},he=()=>{const[e,t]=f(!1),[n,l]=f(!1),[c,u]=f(!0),[m,v]=f(!0),[b,x]=f(5),[C,w]=f([]),[k,a]=f(0);setInterval(()=>a(r=>++r),1e3);let d;return[(()=>{const r=ne.cloneNode(!0);return r.firstChild,y(r,()=>C().length,null),r})(),(()=>{const r=le.cloneNode(!0),o=r.firstChild,s=o.nextSibling,i=s.nextSibling,p=i.nextSibling,$=p.nextSibling,_=$.nextSibling,L=_.nextSibling;return o.$$click=()=>x(h=>++h),s.$$click=()=>x(h=>--h),i.$$click=()=>t(h=>!h),p.$$click=()=>l(h=>!h),$.$$click=()=>u(h=>!h),_.$$click=()=>v(h=>!h),L.$$click=()=>d(),r})(),(()=>{const r=ie.cloneNode(!0);return y(r,S(de,{getClear:o=>d=o,get children(){return S(E,{get when(){return m()},get children(){return[oe.cloneNode(!0),"World",N(()=>N(()=>!!e())()&&ae.cloneNode(!0)),S(E,{get when(){return n()},get children(){return se.cloneNode(!0)}}),S(E,{get when(){return c()},get children(){return[(()=>{const o=re.cloneNode(!0);return j(Z,o,()=>s=>console.log("Unmounted",s)),o})(),ce.cloneNode(!0)]}}),S(q,{get each(){return Array.from({length:b()},(o,s)=>s)},children:o=>(()=>{const s=ue.cloneNode(!0),i=s.firstChild;return y(s,o+1,i),s})()})]}})}})),r})()]};K(["click"]);export{he as default};