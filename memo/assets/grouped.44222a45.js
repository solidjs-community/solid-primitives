import{o as m,a as b,g as x,e as $,i as d,b as f,S as p,p as S,t as l}from"./index.d0788f7f.js";import{b as g,o as w,d as k,e as E,f as P}from"./index.ff364e71.js";function _(t,n,r,e){return t.addEventListener(n,r,e),w(t.removeEventListener.bind(t,n,r,e))}function h(t,n){const{push:r,execute:e}=g();return[(o,a,u)=>{const c=_(t,o,a,u??n);return r(c),c},m(e)]}function L(t){let n=0,r,e;return()=>(e||b(o=>{r=t(o),e=o}),n++,x()&&m(()=>{n--,queueMicrotask(()=>{n||!e||(e(),e=void 0,r=void 0)})}),r)}var v={passive:!0},M={x:0,y:0,isInside:!1,sourceType:null};function T(t=window,n,r={}){const{touch:e=!0,followTouch:o=!0}=r,[a,u]=h(t,v),c=s=>n({x:s.pageX,y:s.pageY,sourceType:"mouse"});if(a("mousemove",c),a("dragover",c),e){const s=i=>{i.touches.length&&n({x:i.touches[0].clientX,y:i.touches[0].clientY,sourceType:"touch"})};a("touchstart",s),o&&a("touchmove",s)}return u}function I(t=window,n,r={}){const{touch:e=!0}=r,[o,a]=h(t,v);let u=!1,c=!e;function s(i){this==="mouse"?u=i:c=i,n(u||c)}return o("mouseover",s.bind("mouse",!0)),o("mouseout",s.bind("mouse",!1)),o("mousemove",s.bind("mouse",!0),{passive:!0,once:!0}),e&&(o("touchstart",s.bind("touch",!0)),o("touchend",s.bind("touch",!1))),a}function y(t,n={}){const[r,e]=k({...M,...n.initialValue}),o=a=>{T(a,e,n),I(a,e.bind(void 0,"isInside"),n)};return typeof t!="function"?o(t):$(()=>o(t())),r}y.bind(void 0,void 0,void 0);const C=l('<div><div class="ball bg-green-500"></div><p class="font-bold text-green-500 opacity-50">normal</p><p class="font-bold text-yellow-600 opacity-50">debounced</p><p class="font-bold text-cyan-500 opacity-50">throttled</p></div>'),O=l('<div class="ball bg-yellow-600"></div>'),N=l('<div class="ball bg-cyan-500"></div>'),D=()=>{const t=y(),n=E([()=>t.x,()=>t.y],([e,o])=>({x:e,y:o}),200),r=P(()=>({x:t.x,y:t.y}),200);return(()=>{const e=C.cloneNode(!0),o=e.firstChild,a=o.nextSibling;return d(e,f(p,{get when(){return n()},keyed:!0,children:({x:u,y:c})=>(()=>{const s=O.cloneNode(!0);return s.style.setProperty("transform",`translate(${u}px, ${c}px)`),s})()}),a),d(e,f(p,{get when(){return r()},keyed:!0,children:({x:u,y:c})=>(()=>{const s=N.cloneNode(!0);return s.style.setProperty("transform",`translate(${u}px, ${c}px)`),s})()}),a),S(()=>o.style.setProperty("transform",`translate(${t.x}px, ${t.y}px)`)),e})()};export{D as default};