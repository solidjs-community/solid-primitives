import{c as _,o as q,a as x,b as w,d as B,u as M,e as R,i as $,f as b,g as S,t as F}from"./index-5ca7fe09.js";function j(e){const s=typeof e.on=="function"||Array.isArray(e.on)?e.on:()=>e.on;return _(q(s,(c,a)=>{const i=e.children;return typeof i=="function"&&i.length>0?i(c,a):i}))}function k(e){requestAnimationFrame(()=>{requestAnimationFrame(e)})}const z=e=>{let s,c=!0;const[a,i]=x(),[L,E]=x(),N=w(()=>e.children),{onBeforeEnter:h,onEnter:f,onAfterEnter:A,onBeforeExit:T,onExit:C,onAfterExit:v}=e,r=_(()=>{const t=e.name||"s";return{enterActiveClass:e.enterActiveClass||t+"-enter-active",enterClass:e.enterClass||t+"-enter",enterToClass:e.enterToClass||t+"-enter-to",exitActiveClass:e.exitActiveClass||t+"-exit-active",exitClass:e.exitClass||t+"-exit",exitToClass:e.exitToClass||t+"-exit-to"}});function g(t,n){if(!c||e.appear){let o=function(m){t&&(!m||m.target===t)&&(t.removeEventListener("transitionend",o),t.removeEventListener("animationend",o),t.classList.remove(...l),t.classList.remove(...u),R(()=>{a()!==t&&i(t),L()===t&&E(void 0)}),A&&A(t),e.mode==="inout"&&y(t,n))};const d=r().enterClass.split(" "),l=r().enterActiveClass.split(" "),u=r().enterToClass.split(" ");h&&h(t),t.classList.add(...d),t.classList.add(...l),k(()=>{t.classList.remove(...d),t.classList.add(...u),f&&f(t,()=>o()),(!f||f.length<2)&&(t.addEventListener("transitionend",o),t.addEventListener("animationend",o))})}n&&!e.mode?E(t):i(t)}function y(t,n){const d=r().exitClass.split(" "),l=r().exitActiveClass.split(" "),u=r().exitToClass.split(" ");if(!n.parentNode)return o();T&&T(n),n.classList.add(...d),n.classList.add(...l),k(()=>{n.classList.remove(...d),n.classList.add(...u)}),C&&C(n,()=>o()),(!C||C.length<2)&&(n.addEventListener("transitionend",o),n.addEventListener("animationend",o));function o(m){(!m||m.target===n)&&(n.removeEventListener("transitionend",o),n.removeEventListener("animationend",o),n.classList.remove(...l),n.classList.remove(...u),a()===n&&i(void 0),v&&v(n),e.mode==="outin"&&g(t,n))}}return B(t=>{for(s=N();typeof s=="function";)s=s();return M(()=>(s&&s!==t&&(e.mode!=="outin"?g(s,t):c&&i(s)),t&&t!==s&&e.mode!=="inout"&&y(s,t),c=!1,s))}),[a,L]},D=F('<button class="btn"></button>',2),G=F('<div class="wrapper-h"></div>',2),I=()=>{const[e,s]=x(0);return(()=>{const c=G.cloneNode(!0);return $(c,b(z,{onEnter:(a,i)=>{a.animate([{opacity:0},{opacity:1}],{duration:600}).finished.then(i)},onExit:(a,i)=>{a.animate([{opacity:1},{opacity:0}],{duration:600}).finished.then(i)},mode:"outin",get children(){return b(j,{on:e,get children(){const a=D.cloneNode(!0);return a.$$click=()=>s(i=>++i),$(a,e),a}})}})),c})()};S(["click"]);export{I as default};