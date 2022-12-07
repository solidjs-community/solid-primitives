(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const r of l.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerpolicy&&(l.referrerPolicy=i.referrerpolicy),i.crossorigin==="use-credentials"?l.credentials="include":i.crossorigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function s(i){if(i.ep)return;i.ep=!0;const l=n(i);fetch(i.href,l)}})();const m={};function oe(e){m.context=e}const re=(e,t)=>e===t,F={equals:re};let Q=Y;const y=1,T=2,W={owned:null,cleanups:null,context:null,owner:null};var h=null;let v=null,d=null,p=null,x=null,H=0;function ce(e,t){const n=d,s=h,i=e.length===0,l=i?W:{owned:null,cleanups:null,context:null,owner:t||s},r=i?e:()=>e(()=>M(()=>U(l)));h=l,d=null;try{return A(r,!0)}finally{d=n,h=s}}function E(e,t){t=t?Object.assign({},F,t):F;const n={value:e,observers:null,observerSlots:null,comparator:t.equals||void 0},s=i=>(typeof i=="function"&&(i=i(n.value)),X(n,i));return[fe.bind(n),s]}function O(e,t,n){const s=J(e,t,!1,y);P(s)}function R(e,t,n){Q=he;const s=J(e,t,!1,y);s.user=!0,x?x.push(s):P(s)}function M(e){let t,n=d;return d=null,t=e(),d=n,t}function ue(e){return h===null||(h.cleanups===null?h.cleanups=[e]:h.cleanups.push(e)),e}function fe(){const e=v;if(this.sources&&(this.state||e))if(this.state===y||e)P(this);else{const t=p;p=null,A(()=>L(this),!1),p=t}if(d){const t=this.observers?this.observers.length:0;d.sources?(d.sources.push(this),d.sourceSlots.push(t)):(d.sources=[this],d.sourceSlots=[t]),this.observers?(this.observers.push(d),this.observerSlots.push(d.sources.length-1)):(this.observers=[d],this.observerSlots=[d.sources.length-1])}return this.value}function X(e,t,n){let s=e.value;return(!e.comparator||!e.comparator(s,t))&&(e.value=t,e.observers&&e.observers.length&&A(()=>{for(let i=0;i<e.observers.length;i+=1){const l=e.observers[i],r=v&&v.running;r&&v.disposed.has(l),(r&&!l.tState||!r&&!l.state)&&(l.pure?p.push(l):x.push(l),l.observers&&Z(l)),r||(l.state=y)}if(p.length>1e6)throw p=[],new Error},!1)),t}function P(e){if(!e.fn)return;U(e);const t=h,n=d,s=H;d=h=e,ae(e,e.value,s),d=n,h=t}function ae(e,t,n){let s;try{s=e.fn(t)}catch(i){e.pure&&(e.state=y),z(i)}(!e.updatedAt||e.updatedAt<=n)&&(e.updatedAt!=null&&"observers"in e?X(e,s):e.value=s,e.updatedAt=n)}function J(e,t,n,s=y,i){const l={fn:e,state:s,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:t,owner:h,context:null,pure:n};return h===null||h!==W&&(h.owned?h.owned.push(l):h.owned=[l]),l}function $(e){const t=v;if(e.state===0||t)return;if(e.state===T||t)return L(e);if(e.suspense&&M(e.suspense.inFallback))return e.suspense.effects.push(e);const n=[e];for(;(e=e.owner)&&(!e.updatedAt||e.updatedAt<H);)(e.state||t)&&n.push(e);for(let s=n.length-1;s>=0;s--)if(e=n[s],e.state===y||t)P(e);else if(e.state===T||t){const i=p;p=null,A(()=>L(e,n[0]),!1),p=i}}function A(e,t){if(p)return e();let n=!1;t||(p=[]),x?n=!0:x=[],H++;try{const s=e();return de(n),s}catch(s){p||(x=null),z(s)}}function de(e){if(p&&(Y(p),p=null),e)return;const t=x;x=null,t.length&&A(()=>Q(t),!1)}function Y(e){for(let t=0;t<e.length;t++)$(e[t])}function he(e){let t,n=0;for(t=0;t<e.length;t++){const s=e[t];s.user?e[n++]=s:$(s)}for(m.context&&oe(),t=0;t<n;t++)$(e[t])}function L(e,t){const n=v;e.state=0;for(let s=0;s<e.sources.length;s+=1){const i=e.sources[s];i.sources&&(i.state===y||n?i!==t&&$(i):(i.state===T||n)&&L(i,t))}}function Z(e){const t=v;for(let n=0;n<e.observers.length;n+=1){const s=e.observers[n];(!s.state||t)&&(s.state=T,s.pure?p.push(s):x.push(s),s.observers&&Z(s))}}function U(e){let t;if(e.sources)for(;e.sources.length;){const n=e.sources.pop(),s=e.sourceSlots.pop(),i=n.observers;if(i&&i.length){const l=i.pop(),r=n.observerSlots.pop();s<i.length&&(l.sourceSlots[r]=s,i[s]=l,n.observerSlots[s]=r)}}if(e.owned){for(t=0;t<e.owned.length;t++)U(e.owned[t]);e.owned=null}if(e.cleanups){for(t=0;t<e.cleanups.length;t++)e.cleanups[t]();e.cleanups=null}e.state=0,e.context=null}function pe(e){return e instanceof Error||typeof e=="string"?e:new Error("Unknown error")}function z(e){throw e=pe(e),e}function ge(e,t){return M(()=>e(t||{}))}function me(e,t,n){let s=n.length,i=t.length,l=s,r=0,o=0,u=t[i-1].nextSibling,c=null;for(;r<i||o<l;){if(t[r]===n[o]){r++,o++;continue}for(;t[i-1]===n[l-1];)i--,l--;if(i===r){const f=l<s?o?n[o-1].nextSibling:n[l-o]:u;for(;o<l;)e.insertBefore(n[o++],f)}else if(l===o)for(;r<i;)(!c||!c.has(t[r]))&&t[r].remove(),r++;else if(t[r]===n[l-1]&&n[o]===t[i-1]){const f=t[--i].nextSibling;e.insertBefore(n[o++],t[r++].nextSibling),e.insertBefore(n[--l],f),t[i]=n[l]}else{if(!c){c=new Map;let a=o;for(;a<l;)c.set(n[a],a++)}const f=c.get(t[r]);if(f!=null)if(o<f&&f<l){let a=r,b=1,g;for(;++a<i&&a<l&&!((g=c.get(t[a]))==null||g!==f+b);)b++;if(b>f-o){const S=t[r];for(;o<f;)e.insertBefore(n[o++],S)}else e.replaceChild(n[o++],t[r++])}else r++;else t[r++].remove()}}}const q="_$DX_DELEGATE";function be(e,t,n,s={}){let i;return ce(l=>{i=l,t===document?e():C(t,e(),t.firstChild?null:void 0,n)},s.owner),()=>{i(),t.textContent=""}}function xe(e,t,n){const s=document.createElement("template");s.innerHTML=e;let i=s.content.firstChild;return n&&(i=i.firstChild),i}function ye(e,t=window.document){const n=t[q]||(t[q]=new Set);for(let s=0,i=e.length;s<i;s++){const l=e[s];n.has(l)||(n.add(l),t.addEventListener(l,Se))}}function C(e,t,n,s){if(n!==void 0&&!s&&(s=[]),typeof t!="function")return _(e,t,s,n);O(i=>_(e,t(),i,n),s)}function Se(e){const t=`$$${e.type}`;let n=e.composedPath&&e.composedPath()[0]||e.target;for(e.target!==n&&Object.defineProperty(e,"target",{configurable:!0,value:n}),Object.defineProperty(e,"currentTarget",{configurable:!0,get(){return n||document}}),m.registry&&!m.done&&(m.done=!0,document.querySelectorAll("[id^=pl-]").forEach(s=>s.remove()));n!==null;){const s=n[t];if(s&&!n.disabled){const i=n[`${t}Data`];if(i!==void 0?s.call(n,i,e):s.call(n,e),e.cancelBubble)return}n=n.host&&n.host!==n&&n.host instanceof Node?n.host:n.parentNode}}function _(e,t,n,s,i){for(m.context&&!n&&(n=[...e.childNodes]);typeof n=="function";)n=n();if(t===n)return n;const l=typeof t,r=s!==void 0;if(e=r&&n[0]&&n[0].parentNode||e,l==="string"||l==="number"){if(m.context)return n;if(l==="number"&&(t=t.toString()),r){let o=n[0];o&&o.nodeType===3?o.data=t:o=document.createTextNode(t),n=N(e,n,s,o)}else n!==""&&typeof n=="string"?n=e.firstChild.data=t:n=e.textContent=t}else if(t==null||l==="boolean"){if(m.context)return n;n=N(e,n,s)}else{if(l==="function")return O(()=>{let o=t();for(;typeof o=="function";)o=o();n=_(e,o,n,s)}),()=>n;if(Array.isArray(t)){const o=[],u=n&&Array.isArray(n);if(B(o,t,n,i))return O(()=>n=_(e,o,n,s,!0)),()=>n;if(m.context){if(!o.length)return n;for(let c=0;c<o.length;c++)if(o[c].parentNode)return n=o}if(o.length===0){if(n=N(e,n,s),r)return n}else u?n.length===0?k(e,o,s):me(e,n,o):(n&&N(e),k(e,o));n=o}else if(t instanceof Node){if(m.context&&t.parentNode)return n=r?[t]:t;if(Array.isArray(n)){if(r)return n=N(e,n,s,t);N(e,n,null,t)}else n==null||n===""||!e.firstChild?e.appendChild(t):e.replaceChild(t,e.firstChild);n=t}}return n}function B(e,t,n,s){let i=!1;for(let l=0,r=t.length;l<r;l++){let o=t[l],u=n&&n[l];if(o instanceof Node)e.push(o);else if(!(o==null||o===!0||o===!1))if(Array.isArray(o))i=B(e,o,u)||i;else if(typeof o=="function")if(s){for(;typeof o=="function";)o=o();i=B(e,Array.isArray(o)?o:[o],Array.isArray(u)?u:[u])||i}else e.push(o),i=!0;else{const c=String(o);u&&u.nodeType===3&&u.data===c?e.push(u):e.push(document.createTextNode(c))}}return i}function k(e,t,n=null){for(let s=0,i=t.length;s<i;s++)e.insertBefore(t[s],n)}function N(e,t,n,s){if(n===void 0)return e.textContent="";const i=s||document.createTextNode("");if(t.length){let l=!1;for(let r=t.length-1;r>=0;r--){const o=t[r];if(i!==o){const u=o.parentNode===e;!l&&!r?u?e.replaceChild(i,o):e.insertBefore(i,n):u&&o.remove()}else l=!0}}else e.insertBefore(i,n);return[i]}const G=e=>{const t=[],n=s=>{s instanceof Text&&t.push(s),s.firstChild&&n(s.firstChild),s.nextSibling&&n(s.nextSibling)};return n(e),t},ve=(e,t)=>e+t.data.length,V=(e,t,n)=>{const s=n.indexOf(e);return s===-1?NaN:n.slice(0,s).reduce(ve,0)+t},ee=e=>e===null||e?.contentEditable==="true"?e:ee(e.parentNode||null),K=(e,t)=>t.reduce(([n,s],i)=>n?[n,s]:s<=i.data.length?[i,s]:[null,s-i.data.length],[null,e]),Ne=()=>{const[e,t]=E([null,NaN,NaN]),[n,s]=E([null,NaN,NaN]),i=()=>{const l=document.activeElement;if(l instanceof HTMLInputElement||l instanceof HTMLTextAreaElement)return t([l,l.selectionStart??NaN,l.selectionEnd??NaN]);const r=window.getSelection();if(!r?.rangeCount)return t([null,NaN,NaN]);const o=r.getRangeAt(0),u=ee(o.commonAncestorContainer);if(!u)return t([null,NaN,NaN]);const c=G(u),f=V(o.startContainer,o.startOffset,c),a=o.collapsed?f:V(o.endContainer,o.endOffset,c);t([u,f,a])};return i(),R(()=>{document.addEventListener("selectionchange",i),document.addEventListener("click",i),document.addEventListener("keyup",i),ue(()=>{document.removeEventListener("selectionchange",i),document.removeEventListener("click",i),document.removeEventListener("keyup",i)})}),R(()=>{const[l,r,o]=n(),u=window.getSelection();if(l===null)u?.rangeCount&&u.removeAllRanges();else if(l instanceof HTMLInputElement||l instanceof HTMLTextAreaElement)document.activeElement!==l&&l.focus(),l.setSelectionRange(r,o);else{u?.removeAllRanges();const c=document.createRange(),f=G(l),[a,b]=K(r,f),[g,S]=r===o?[a,b]:K(o,f);a&&g&&b!==-1&&S!==-1&&(c.setStart(a,b),c.setEnd(g,S),u?.addRange(c))}}),[e,s]};const we=xe('<div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white"><div class="wrapper-v items-start"><h4>Selection</h4><input type="text" value="test"><br><textarea>test</textarea><div contenteditable>t<b>e</b><i>s</i>t</div></div><div><h5>Selected:</h5><span> <!>-</span></div><div><h5>Manipulate selection</h5><select><option value="null">no element</option><option value="input[type=text]">text input</option><option value="textarea">text area</option><option value="div[contenteditable]">contentEditable div</option></select> <input type="number" min="-1" max="4" value="-1">-<input type="number" min="-1" max="4" value="-1"> </div></div>'),Ee=()=>{const[e,t]=Ne(),[n,s]=E("null"),[i,l]=E(-1),[r,o]=E(-1),u=c=>c===null?"null":c instanceof Text?`[Text: "${c.data}"]`:`<${c.nodeName.toLowerCase()}${Array.from(c.attributes).map(f=>" "+f.name+(f.value===""?"":'="'+f.value+'"')).join("")}>`;return R(()=>{const c=document.querySelector(n()),f=i(),a=r();(f<0||f>4||a<0||a>4)&&t([c,NaN,NaN]),t([c,f,a])}),(()=>{const c=we.cloneNode(!0),f=c.firstChild,a=f.nextSibling,b=a.firstChild,g=b.nextSibling,S=g.firstChild,D=S.nextSibling;D.nextSibling;const te=a.nextSibling,ne=te.firstChild,I=ne.nextSibling,se=I.nextSibling,j=se.nextSibling,ie=j.nextSibling,le=ie.nextSibling;return C(g,()=>u(e()[0]),S),C(g,()=>e()[1],D),C(g,()=>e()[2],null),I.addEventListener("change",w=>{s(w.currentTarget.value)}),j.$$input=w=>l(w.currentTarget.valueAsNumber),le.$$input=w=>o(w.currentTarget.valueAsNumber),c})()};be(()=>ge(Ee,{}),document.getElementById("root"));ye(["input"]);