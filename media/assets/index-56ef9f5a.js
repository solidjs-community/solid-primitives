(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))s(l);new MutationObserver(l=>{for(const r of l)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(l){const r={};return l.integrity&&(r.integrity=l.integrity),l.referrerPolicy&&(r.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?r.credentials="include":l.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(l){if(l.ep)return;l.ep=!0;const r=n(l);fetch(l.href,r)}})();const ne=(e,t)=>e===t,v={equals:ne};let F=J;const y=1,C=2,H={owned:null,cleanups:null,context:null,owner:null};var c=null;let T=null,u=null,a=null,g=null,M=0;function I(e,t){const n=u,s=c,l=e.length===0,r=l?H:{owned:null,cleanups:null,context:null,owner:t===void 0?s:t},o=l?e:()=>e(()=>m(()=>P(r)));c=r,u=null;try{return S(o,!0)}finally{u=n,c=s}}function K(e,t){t=t?Object.assign({},v,t):v;const n={value:e,observers:null,observerSlots:null,comparator:t.equals||void 0},s=l=>(typeof l=="function"&&(l=l(n.value)),G(n,l));return[W.bind(n),s]}function E(e,t,n){const s=_(e,t,!1,y);x(s)}function se(e,t,n){F=ue;const s=_(e,t,!1,y);(!n||!n.render)&&(s.user=!0),g?g.push(s):x(s)}function O(e,t,n){n=n?Object.assign({},v,n):v;const s=_(e,t,!0,0);return s.observers=null,s.observerSlots=null,s.comparator=n.equals||void 0,x(s),W.bind(s)}function re(e){return S(e,!1)}function m(e){if(u===null)return e();const t=u;u=null;try{return e()}finally{u=t}}function k(e){return c===null||(c.cleanups===null?c.cleanups=[e]:c.cleanups.push(e)),e}function le(){return u}function Q(){return c}function ie(e){const t=O(e),n=O(()=>$(t()));return n.toArray=()=>{const s=n();return Array.isArray(s)?s:s!=null?[s]:[]},n}function W(){if(this.sources&&this.state)if(this.state===y)x(this);else{const e=a;a=null,S(()=>N(this),!1),a=e}if(u){const e=this.observers?this.observers.length:0;u.sources?(u.sources.push(this),u.sourceSlots.push(e)):(u.sources=[this],u.sourceSlots=[e]),this.observers?(this.observers.push(u),this.observerSlots.push(u.sources.length-1)):(this.observers=[u],this.observerSlots=[u.sources.length-1])}return this.value}function G(e,t,n){let s=e.value;return(!e.comparator||!e.comparator(s,t))&&(e.value=t,e.observers&&e.observers.length&&S(()=>{for(let l=0;l<e.observers.length;l+=1){const r=e.observers[l],o=T&&T.running;o&&T.disposed.has(r),(o?!r.tState:!r.state)&&(r.pure?a.push(r):g.push(r),r.observers&&X(r)),o||(r.state=y)}if(a.length>1e6)throw a=[],new Error},!1)),t}function x(e){if(!e.fn)return;P(e);const t=c,n=u,s=M;u=c=e,oe(e,e.value,s),u=n,c=t}function oe(e,t,n){let s;try{s=e.fn(t)}catch(l){return e.pure&&(e.state=y,e.owned&&e.owned.forEach(P),e.owned=null),e.updatedAt=n+1,Y(l)}(!e.updatedAt||e.updatedAt<=n)&&(e.updatedAt!=null&&"observers"in e?G(e,s):e.value=s,e.updatedAt=n)}function _(e,t,n,s=y,l){const r={fn:e,state:s,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:t,owner:c,context:null,pure:n};return c===null||c!==H&&(c.owned?c.owned.push(r):c.owned=[r]),r}function L(e){if(e.state===0)return;if(e.state===C)return N(e);if(e.suspense&&m(e.suspense.inFallback))return e.suspense.effects.push(e);const t=[e];for(;(e=e.owner)&&(!e.updatedAt||e.updatedAt<M);)e.state&&t.push(e);for(let n=t.length-1;n>=0;n--)if(e=t[n],e.state===y)x(e);else if(e.state===C){const s=a;a=null,S(()=>N(e,t[0]),!1),a=s}}function S(e,t){if(a)return e();let n=!1;t||(a=[]),g?n=!0:g=[],M++;try{const s=e();return fe(n),s}catch(s){n||(g=null),a=null,Y(s)}}function fe(e){if(a&&(J(a),a=null),e)return;const t=g;g=null,t.length&&S(()=>F(t),!1)}function J(e){for(let t=0;t<e.length;t++)L(e[t])}function ue(e){let t,n=0;for(t=0;t<e.length;t++){const s=e[t];s.user?e[n++]=s:L(s)}for(t=0;t<n;t++)L(e[t])}function N(e,t){e.state=0;for(let n=0;n<e.sources.length;n+=1){const s=e.sources[n];if(s.sources){const l=s.state;l===y?s!==t&&(!s.updatedAt||s.updatedAt<M)&&L(s):l===C&&N(s,t)}}}function X(e){for(let t=0;t<e.observers.length;t+=1){const n=e.observers[t];n.state||(n.state=C,n.pure?a.push(n):g.push(n),n.observers&&X(n))}}function P(e){let t;if(e.sources)for(;e.sources.length;){const n=e.sources.pop(),s=e.sourceSlots.pop(),l=n.observers;if(l&&l.length){const r=l.pop(),o=n.observerSlots.pop();s<l.length&&(r.sourceSlots[o]=s,l[s]=r,n.observerSlots[s]=o)}}if(e.owned){for(t=e.owned.length-1;t>=0;t--)P(e.owned[t]);e.owned=null}if(e.cleanups){for(t=e.cleanups.length-1;t>=0;t--)e.cleanups[t]();e.cleanups=null}e.state=0,e.context=null}function Y(e){throw e}function $(e){if(typeof e=="function"&&!e.length)return $(e());if(Array.isArray(e)){const t=[];for(let n=0;n<e.length;n++){const s=$(e[n]);Array.isArray(s)?t.push.apply(t,s):t.push(s)}return t}return e}function b(e,t){return m(()=>e(t||{}))}const ce=e=>`Stale read from <${e}>.`;function ae(e){let t=!1;const n=(r,o)=>r[0]===o[0]&&(t?r[1]===o[1]:!r[1]==!o[1])&&r[2]===o[2],s=ie(()=>e.children),l=O(()=>{let r=s();Array.isArray(r)||(r=[r]);for(let o=0;o<r.length;o++){const i=r[o].when;if(i)return t=!!r[o].keyed,[o,i,r[o]]}return[-1]},void 0,{equals:n});return O(()=>{const[r,o,i]=l();if(r<0)return e.fallback;const f=i.children;return typeof f=="function"&&f.length>0?m(()=>f(t?o:()=>{if(m(l)[0]!==r)throw ce("Match");return i.when})):f},void 0,void 0)}function A(e){return e}function he(e,t,n){let s=n.length,l=t.length,r=s,o=0,i=0,f=t[l-1].nextSibling,h=null;for(;o<l||i<r;){if(t[o]===n[i]){o++,i++;continue}for(;t[l-1]===n[r-1];)l--,r--;if(l===o){const d=r<s?i?n[i-1].nextSibling:n[r-i]:f;for(;i<r;)e.insertBefore(n[i++],d)}else if(r===i)for(;o<l;)(!h||!h.has(t[o]))&&t[o].remove(),o++;else if(t[o]===n[r-1]&&n[i]===t[l-1]){const d=t[--l].nextSibling;e.insertBefore(n[i++],t[o++].nextSibling),e.insertBefore(n[--r],d),t[l]=n[r]}else{if(!h){h=new Map;let p=i;for(;p<r;)h.set(n[p],p++)}const d=h.get(t[o]);if(d!=null)if(i<d&&d<r){let p=o,B=1,q;for(;++p<l&&p<r&&!((q=h.get(t[p]))==null||q!==d+B);)B++;if(B>d-i){const te=t[o];for(;i<d;)e.insertBefore(n[i++],te)}else e.replaceChild(n[i++],t[o++])}else o++;else t[o++].remove()}}}function de(e,t,n,s={}){let l;return I(r=>{l=r,t===document?e():Z(t,e(),t.firstChild?null:void 0,n)},s.owner),()=>{l(),t.textContent=""}}function pe(e,t,n){let s;const l=()=>{const o=document.createElement("template");return o.innerHTML=e,n?o.content.firstChild.firstChild:o.content.firstChild},r=t?()=>(s||(s=l())).cloneNode(!0):()=>m(()=>document.importNode(s||(s=l()),!0));return r.cloneNode=r,r}function ge(e,t,n={}){const s=Object.keys(t||{}),l=Object.keys(n);let r,o;for(r=0,o=l.length;r<o;r++){const i=l[r];!i||i==="undefined"||t[i]||(R(e,i,!1),delete n[i])}for(r=0,o=s.length;r<o;r++){const i=s[r],f=!!t[i];!i||i==="undefined"||n[i]===f||!f||(R(e,i,!0),n[i]=f)}return n}function Z(e,t,n,s){if(n!==void 0&&!s&&(s=[]),typeof t!="function")return j(e,t,s,n);E(l=>j(e,t(),l,n),s)}function R(e,t,n){const s=t.trim().split(/\s+/);for(let l=0,r=s.length;l<r;l++)e.classList.toggle(s[l],n)}function j(e,t,n,s,l){for(;typeof n=="function";)n=n();if(t===n)return n;const r=typeof t,o=s!==void 0;if(e=o&&n[0]&&n[0].parentNode||e,r==="string"||r==="number")if(r==="number"&&(t=t.toString()),o){let i=n[0];i&&i.nodeType===3?i.data=t:i=document.createTextNode(t),n=w(e,n,s,i)}else n!==""&&typeof n=="string"?n=e.firstChild.data=t:n=e.textContent=t;else if(t==null||r==="boolean")n=w(e,n,s);else{if(r==="function")return E(()=>{let i=t();for(;typeof i=="function";)i=i();n=j(e,i,n,s)}),()=>n;if(Array.isArray(t)){const i=[],f=n&&Array.isArray(n);if(U(i,t,n,l))return E(()=>n=j(e,i,n,s,!0)),()=>n;if(i.length===0){if(n=w(e,n,s),o)return n}else f?n.length===0?V(e,i,s):he(e,n,i):(n&&w(e),V(e,i));n=i}else if(t instanceof Node){if(Array.isArray(n)){if(o)return n=w(e,n,s,t);w(e,n,null,t)}else n==null||n===""||!e.firstChild?e.appendChild(t):e.replaceChild(t,e.firstChild);n=t}else console.warn("Unrecognized value. Skipped inserting",t)}return n}function U(e,t,n,s){let l=!1;for(let r=0,o=t.length;r<o;r++){let i=t[r],f=n&&n[r];if(i instanceof Node)e.push(i);else if(!(i==null||i===!0||i===!1))if(Array.isArray(i))l=U(e,i,f)||l;else if(typeof i=="function")if(s){for(;typeof i=="function";)i=i();l=U(e,Array.isArray(i)?i:[i],Array.isArray(f)?f:[f])||l}else e.push(i),l=!0;else{const h=String(i);f&&f.nodeType===3?(f.data=h,e.push(f)):e.push(document.createTextNode(h))}}return l}function V(e,t,n=null){for(let s=0,l=t.length;s<l;s++)e.insertBefore(t[s],n)}function w(e,t,n,s){if(n===void 0)return e.textContent="";const l=s||document.createTextNode("");if(t.length){let r=!1;for(let o=t.length-1;o>=0;o--){const i=t[o];if(l!==i){const f=i.parentNode===e;!r&&!o?f?e.replaceChild(l,i):e.insertBefore(l,n):f&&i.remove()}else r=!0}}else e.insertBefore(l,n);return[l]}function ye(e){return e!==null&&(typeof e=="object"||typeof e=="function")}function D(e,...t){return typeof e=="function"?e(...t):e}var z=Object.entries,me=k;function we(e,t,n){return K(t(),n)}function ee(e,t,n,s){return e.addEventListener(t,n,s),me(e.removeEventListener.bind(e,t,n,s))}function be(e){const t={...e},n={...e},s={},l=o=>{let i=s[o];if(!i){if(!le())return t[o];s[o]=i=K(t[o],{internal:!0}),delete t[o]}return i[0]()};for(const o in e)Object.defineProperty(n,o,{get:()=>l(o),enumerable:!0});const r=(o,i)=>{const f=s[o];if(f)return f[1](i);o in t&&(t[o]=D(i,[t[o]]))};return[n,(o,i)=>{if(ye(o)){const f=m(()=>Object.entries(D(o,n)));re(()=>{for(const[h,d]of f)r(h,()=>d)})}else r(o,i);return n}]}function Se(e,t){return be(t())}function xe(e,t=Q()){let n=0,s,l;return()=>(n++,k(()=>{n--,queueMicrotask(()=>{!n&&l&&(l(),l=s=void 0)})}),l||I(r=>s=e(l=r),t),s)}function Ae(e){const t=Q(),n=xe(e,t);return()=>n()}function ve(e,t=!1){const n=window.matchMedia(e),[s,l]=we(t,()=>n.matches);return ee(n,"change",()=>l(n.matches)),s}function Ce(e){return ve("(prefers-color-scheme: dark)",e)}Ce.bind(void 0,!1);const Ee=e=>z(e).reduce((t,[n])=>(t[n]=!1,t),{});function Oe(e,t={}){const n=Object.defineProperty(t.fallbackState??Ee(e),"key",{enumerable:!1,get:()=>Object.keys(e).pop()});if(!window.matchMedia)return n;const{mediaFeature:s="min-width",watchChange:l=!0}=t,[r,o]=Se(n,()=>{const i={};return z(e).forEach(([f,h])=>{const d=window.matchMedia(`(${s}: ${h})`);i[f]=d.matches,l&&ee(d,"change",p=>o(f,p.matches))}),i});return Object.defineProperty(r,"key",{enumerable:!1,get:()=>Object.keys(r).findLast(i=>r[i])})}const Le=pe("<div><p></p><p>Other content"),Ne={sm:"640px",lg:"1024px",xl:"1280px"},je=()=>{const e=Oe(Ne);return se(()=>{console.log("sm",e.sm),console.log("lg",e.lg),console.log("xl",e.xl)}),(()=>{const t=Le(),n=t.firstChild;return Z(n,b(ae,{get children(){return[b(A,{get when(){return e.xl},children:"Extra Large"}),b(A,{get when(){return e.lg},children:"Large"}),b(A,{get when(){return e.sm},children:"Small"}),b(A,{get when(){return!e.sm},children:"Smallest"})]}})),E(s=>{const l={"text-tiny flex flex-column":!0,"text-small":e.sm,"text-base flex-row":e.lg,"text-huge":e.xl},r=e.lg?"50px":"10px";return s._v$=ge(t,l,s._v$),r!==s._v$2&&((s._v$2=r)!=null?t.style.setProperty("gap",r):t.style.removeProperty("gap")),s},{_v$:void 0,_v$2:void 0}),t})()};de(()=>b(je,{}),document.getElementById("root"));