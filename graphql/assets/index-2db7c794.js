(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const x={},xe=(e,n)=>e===n,_e=Symbol("solid-track"),X={equals:xe};let Ce=Ie;const V=1,G=2,Ee={owned:null,cleanups:null,context:null,owner:null},se={};var b=null;let L=null,E=null,S=null,j=null,K=0;function Y(e,n){const t=E,i=b,s=e.length===0,r=s?Ee:{owned:null,cleanups:null,context:null,owner:n===void 0?i:n},l=s?e:()=>e(()=>k(()=>ee(r)));b=r,E=null;try{return P(l,!0)}finally{E=t,b=i}}function B(e,n){n=n?Object.assign({},X,n):X;const t={value:e,observers:null,observerSlots:null,comparator:n.equals||void 0},i=s=>(typeof s=="function"&&(s=s(t.value)),Ne(t,s));return[Te.bind(t),i]}function ue(e,n,t){const i=le(e,n,!0,V);q(i)}function Q(e,n,t){const i=le(e,n,!1,V);q(i)}function W(e,n,t){t=t?Object.assign({},X,t):X;const i=le(e,n,!0,0);return i.observers=null,i.observerSlots=null,i.comparator=t.equals||void 0,q(i),Te.bind(i)}function Ve(e,n,t){let i,s,r;arguments.length===2&&typeof n=="object"||arguments.length===1?(i=!0,s=e,r=n||{}):(i=e,s=n,r=t||{});let l=null,o=se,f=null,u=!1,c="initialValue"in r,h=typeof i=="function"&&W(i);const p=new Set,[m,A]=(r.storage||B)(r.initialValue),[w,C]=B(void 0),[v,D]=B(void 0,{equals:!1}),[y,T]=B(c?"ready":"unresolved");if(x.context){f=`${x.context.id}${x.context.count++}`;let g;r.ssrLoadFrom==="initial"?o=r.initialValue:x.load&&(g=x.load(f))&&(o=g[0])}function O(g,N,I,M){return l===g&&(l=null,c=!0,(g===o||N===o)&&r.onHydrated&&queueMicrotask(()=>r.onHydrated(M,{value:N})),o=se,$(N,I)),N}function $(g,N){P(()=>{N===void 0&&A(()=>g),T(N!==void 0?"errored":"ready"),C(N);for(const I of p.keys())I.decrement();p.clear()},!1)}function U(){const g=Le,N=m(),I=w();if(I!==void 0&&!l)throw I;return E&&!E.user&&g&&ue(()=>{v(),l&&(g.resolved||p.has(g)||(g.increment(),p.add(g)))}),N}function ie(g=!0){if(g!==!1&&u)return;u=!1;const N=h?h():i;if(N==null||N===!1){O(l,k(m));return}const I=o!==se?o:k(()=>s(N,{value:m(),refetching:g}));return typeof I!="object"||!(I&&"then"in I)?(O(l,I,void 0,N),I):(l=I,u=!0,queueMicrotask(()=>u=!1),P(()=>{T(c?"refreshing":"pending"),D()},!1),I.then(M=>O(I,M,void 0,N),M=>O(I,void 0,Se(M),N)))}return Object.defineProperties(U,{state:{get:()=>y()},error:{get:()=>w()},loading:{get(){const g=y();return g==="pending"||g==="refreshing"}},latest:{get(){if(!c)return U();const g=w();if(g&&!l)throw g;return m()}}}),h?ue(()=>ie(!1)):ie(!1),[U,{refetch:ie,mutate:A}]}function k(e){if(E===null)return e();const n=E;E=null;try{return e()}finally{E=n}}function Fe(e){return b===null||(b.cleanups===null?b.cleanups=[e]:b.cleanups.push(e)),e}let Le;function Te(){const e=L;if(this.sources&&(this.state||e))if(this.state===V||e)q(this);else{const n=S;S=null,P(()=>Z(this),!1),S=n}if(E){const n=this.observers?this.observers.length:0;E.sources?(E.sources.push(this),E.sourceSlots.push(n)):(E.sources=[this],E.sourceSlots=[n]),this.observers?(this.observers.push(E),this.observerSlots.push(E.sources.length-1)):(this.observers=[E],this.observerSlots=[E.sources.length-1])}return this.value}function Ne(e,n,t){let i=e.value;return(!e.comparator||!e.comparator(i,n))&&(e.value=n,e.observers&&e.observers.length&&P(()=>{for(let s=0;s<e.observers.length;s+=1){const r=e.observers[s],l=L&&L.running;l&&L.disposed.has(r),(l&&!r.tState||!l&&!r.state)&&(r.pure?S.push(r):j.push(r),r.observers&&be(r)),l||(r.state=V)}if(S.length>1e6)throw S=[],new Error},!1)),n}function q(e){if(!e.fn)return;ee(e);const n=b,t=E,i=K;E=b=e,je(e,e.value,i),E=t,b=n}function je(e,n,t){let i;try{i=e.fn(n)}catch(s){return e.pure&&(e.state=V,e.owned&&e.owned.forEach(ee),e.owned=null),e.updatedAt=t+1,De(s)}(!e.updatedAt||e.updatedAt<=t)&&(e.updatedAt!=null&&"observers"in e?Ne(e,i):e.value=i,e.updatedAt=t)}function le(e,n,t,i=V,s){const r={fn:e,state:i,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:n,owner:b,context:null,pure:t};return b===null||b!==Ee&&(b.owned?b.owned.push(r):b.owned=[r]),r}function ve(e){const n=L;if(e.state===0||n)return;if(e.state===G||n)return Z(e);if(e.suspense&&k(e.suspense.inFallback))return e.suspense.effects.push(e);const t=[e];for(;(e=e.owner)&&(!e.updatedAt||e.updatedAt<K);)(e.state||n)&&t.push(e);for(let i=t.length-1;i>=0;i--)if(e=t[i],e.state===V||n)q(e);else if(e.state===G||n){const s=S;S=null,P(()=>Z(e,t[0]),!1),S=s}}function P(e,n){if(S)return e();let t=!1;n||(S=[]),j?t=!0:j=[],K++;try{const i=e();return ke(t),i}catch(i){t||(j=null),S=null,De(i)}}function ke(e){if(S&&(Ie(S),S=null),e)return;const n=j;j=null,n.length&&P(()=>Ce(n),!1)}function Ie(e){for(let n=0;n<e.length;n++)ve(e[n])}function Z(e,n){const t=L;e.state=0;for(let i=0;i<e.sources.length;i+=1){const s=e.sources[i];s.sources&&(s.state===V||t?s!==n&&(!s.updatedAt||s.updatedAt<K)&&ve(s):(s.state===G||t)&&Z(s,n))}}function be(e){const n=L;for(let t=0;t<e.observers.length;t+=1){const i=e.observers[t];(!i.state||n)&&(i.state=G,i.pure?S.push(i):j.push(i),i.observers&&be(i))}}function ee(e){let n;if(e.sources)for(;e.sources.length;){const t=e.sources.pop(),i=e.sourceSlots.pop(),s=t.observers;if(s&&s.length){const r=s.pop(),l=t.observerSlots.pop();i<s.length&&(r.sourceSlots[l]=i,s[i]=r,t.observerSlots[i]=l)}}if(e.owned){for(n=0;n<e.owned.length;n++)ee(e.owned[n]);e.owned=null}if(e.cleanups){for(n=0;n<e.cleanups.length;n++)e.cleanups[n]();e.cleanups=null}e.state=0,e.context=null}function Se(e){return e instanceof Error||typeof e=="string"?e:new Error("Unknown error")}function De(e){throw e=Se(e),e}const Pe=Symbol("fallback");function ce(e){for(let n=0;n<e.length;n++)e[n]()}function $e(e,n,t={}){let i=[],s=[],r=[],l=0,o=n.length>1?[]:null;return Fe(()=>ce(r)),()=>{let f=e()||[],u,c;return f[_e],k(()=>{let p=f.length,m,A,w,C,v,D,y,T,O;if(p===0)l!==0&&(ce(r),r=[],i=[],s=[],l=0,o&&(o=[])),t.fallback&&(i=[Pe],s[0]=Y($=>(r[0]=$,t.fallback())),l=1);else if(l===0){for(s=new Array(p),c=0;c<p;c++)i[c]=f[c],s[c]=Y(h);l=p}else{for(w=new Array(p),C=new Array(p),o&&(v=new Array(p)),D=0,y=Math.min(l,p);D<y&&i[D]===f[D];D++);for(y=l-1,T=p-1;y>=D&&T>=D&&i[y]===f[T];y--,T--)w[T]=s[y],C[T]=r[y],o&&(v[T]=o[y]);for(m=new Map,A=new Array(T+1),c=T;c>=D;c--)O=f[c],u=m.get(O),A[c]=u===void 0?-1:u,m.set(O,c);for(u=D;u<=y;u++)O=i[u],c=m.get(O),c!==void 0&&c!==-1?(w[c]=s[u],C[c]=r[u],o&&(v[c]=o[u]),c=A[c],m.set(O,c)):r[u]();for(c=D;c<p;c++)c in w?(s[c]=w[c],r[c]=C[c],o&&(o[c]=v[c],o[c](c))):s[c]=Y(h);s=s.slice(0,l=p),i=f.slice(0)}return s});function h(p){if(r[c]=p,o){const[m,A]=B(c);return o[c]=A,n(f[c],m)}return n(f[c])}}}function H(e,n){return k(()=>e(n||{}))}function Ue(e){const n="fallback"in e&&{fallback:()=>e.fallback};return W($e(()=>e.each,e.children,n||void 0))}function ae(e){let n=!1;const t=e.keyed,i=W(()=>e.when,void 0,{equals:(s,r)=>n?s===r:!s==!r});return W(()=>{const s=i();if(s){const r=e.children,l=typeof r=="function"&&r.length>0;return n=t||l,l?k(()=>r(s)):r}return e.fallback},void 0,void 0)}function Re(e,n,t){let i=t.length,s=n.length,r=i,l=0,o=0,f=n[s-1].nextSibling,u=null;for(;l<s||o<r;){if(n[l]===t[o]){l++,o++;continue}for(;n[s-1]===t[r-1];)s--,r--;if(s===l){const c=r<i?o?t[o-1].nextSibling:t[r-o]:f;for(;o<r;)e.insertBefore(t[o++],c)}else if(r===o)for(;l<s;)(!u||!u.has(n[l]))&&n[l].remove(),l++;else if(n[l]===t[r-1]&&t[o]===n[s-1]){const c=n[--s].nextSibling;e.insertBefore(t[o++],n[l++].nextSibling),e.insertBefore(t[--r],c),n[s]=t[r]}else{if(!u){u=new Map;let h=o;for(;h<r;)u.set(t[h],h++)}const c=u.get(n[l]);if(c!=null)if(o<c&&c<r){let h=l,p=1,m;for(;++h<s&&h<r&&!((m=u.get(n[h]))==null||m!==c+p);)p++;if(p>c-o){const A=n[l];for(;o<c;)e.insertBefore(t[o++],A)}else e.replaceChild(t[o++],n[l++])}else l++;else n[l++].remove()}}}const fe="_$DX_DELEGATE";function Be(e,n,t,i={}){let s;return Y(r=>{s=r,n===document?e():F(n,e(),n.firstChild?null:void 0,t)},i.owner),()=>{s(),n.textContent=""}}function ne(e,n,t){const i=document.createElement("template");if(i.innerHTML=e,n&&i.innerHTML.split("<").length-1!==n)throw`The browser resolved template HTML does not match JSX input:
${i.innerHTML}

${e}. Is your HTML properly formed?`;let s=i.content.firstChild;return t&&(s=s.firstChild),s}function Me(e,n=window.document){const t=n[fe]||(n[fe]=new Set);for(let i=0,s=e.length;i<s;i++){const r=e[i];t.has(r)||(t.add(r),n.addEventListener(r,qe))}}function F(e,n,t,i){if(t!==void 0&&!i&&(i=[]),typeof n!="function")return z(e,n,i,t);Q(s=>z(e,n(),s,t),i)}function qe(e){const n=`$$${e.type}`;let t=e.composedPath&&e.composedPath()[0]||e.target;for(e.target!==t&&Object.defineProperty(e,"target",{configurable:!0,value:t}),Object.defineProperty(e,"currentTarget",{configurable:!0,get(){return t||document}}),x.registry&&!x.done&&(x.done=_$HY.done=!0);t;){const i=t[n];if(i&&!t.disabled){const s=t[`${n}Data`];if(s!==void 0?i.call(t,s,e):i.call(t,e),e.cancelBubble)return}t=t._$host||t.parentNode||t.host}}function z(e,n,t,i,s){for(x.context&&!t&&(t=[...e.childNodes]);typeof t=="function";)t=t();if(n===t)return t;const r=typeof n,l=i!==void 0;if(e=l&&t[0]&&t[0].parentNode||e,r==="string"||r==="number"){if(x.context)return t;if(r==="number"&&(n=n.toString()),l){let o=t[0];o&&o.nodeType===3?o.data=n:o=document.createTextNode(n),t=R(e,t,i,o)}else t!==""&&typeof t=="string"?t=e.firstChild.data=n:t=e.textContent=n}else if(n==null||r==="boolean"){if(x.context)return t;t=R(e,t,i)}else{if(r==="function")return Q(()=>{let o=n();for(;typeof o=="function";)o=o();t=z(e,o,t,i)}),()=>t;if(Array.isArray(n)){const o=[],f=t&&Array.isArray(t);if(re(o,n,t,s))return Q(()=>t=z(e,o,t,i,!0)),()=>t;if(x.context){if(!o.length)return t;for(let u=0;u<o.length;u++)if(o[u].parentNode)return t=o}if(o.length===0){if(t=R(e,t,i),l)return t}else f?t.length===0?de(e,o,i):Re(e,t,o):(t&&R(e),de(e,o));t=o}else if(n instanceof Node){if(x.context&&n.parentNode)return t=l?[n]:n;if(Array.isArray(t)){if(l)return t=R(e,t,i,n);R(e,t,null,n)}else t==null||t===""||!e.firstChild?e.appendChild(n):e.replaceChild(n,e.firstChild);t=n}else console.warn("Unrecognized value. Skipped inserting",n)}return t}function re(e,n,t,i){let s=!1;for(let r=0,l=n.length;r<l;r++){let o=n[r],f=t&&t[r];if(o instanceof Node)e.push(o);else if(!(o==null||o===!0||o===!1))if(Array.isArray(o))s=re(e,o,f)||s;else if(typeof o=="function")if(i){for(;typeof o=="function";)o=o();s=re(e,Array.isArray(o)?o:[o],Array.isArray(f)?f:[f])||s}else e.push(o),s=!0;else{const u=String(o);u==="<!>"?f&&f.nodeType===8&&e.push(f):f&&f.nodeType===3&&f.data===u?e.push(f):e.push(document.createTextNode(u))}}return s}function de(e,n,t=null){for(let i=0,s=n.length;i<s;i++)e.insertBefore(n[i],t)}function R(e,n,t,i){if(t===void 0)return e.textContent="";const s=i||document.createTextNode("");if(n.length){let r=!1;for(let l=n.length-1;l>=0;l--){const o=n[l];if(s!==o){const f=o.parentNode===e;!r&&!l?f?e.replaceChild(s,o):e.insertBefore(s,t):f&&o.remove()}else r=!0}}else e.insertBefore(s,t);return[s]}function Ye(e,n){if(!Boolean(e))throw new Error(n)}const Oe={Name:[],Document:["definitions"],OperationDefinition:["name","variableDefinitions","directives","selectionSet"],VariableDefinition:["variable","type","defaultValue","directives"],Variable:["name"],SelectionSet:["selections"],Field:["alias","name","arguments","directives","selectionSet"],Argument:["name","value"],FragmentSpread:["name","directives"],InlineFragment:["typeCondition","directives","selectionSet"],FragmentDefinition:["name","variableDefinitions","typeCondition","directives","selectionSet"],IntValue:[],FloatValue:[],StringValue:[],BooleanValue:[],NullValue:[],EnumValue:[],ListValue:["values"],ObjectValue:["fields"],ObjectField:["name","value"],Directive:["name","arguments"],NamedType:["name"],ListType:["type"],NonNullType:["type"],SchemaDefinition:["description","directives","operationTypes"],OperationTypeDefinition:["type"],ScalarTypeDefinition:["description","name","directives"],ObjectTypeDefinition:["description","name","interfaces","directives","fields"],FieldDefinition:["description","name","arguments","type","directives"],InputValueDefinition:["description","name","type","defaultValue","directives"],InterfaceTypeDefinition:["description","name","interfaces","directives","fields"],UnionTypeDefinition:["description","name","directives","types"],EnumTypeDefinition:["description","name","directives","values"],EnumValueDefinition:["description","name","directives"],InputObjectTypeDefinition:["description","name","directives","fields"],DirectiveDefinition:["description","name","arguments","locations"],SchemaExtension:["directives","operationTypes"],ScalarTypeExtension:["name","directives"],ObjectTypeExtension:["name","interfaces","directives","fields"],InterfaceTypeExtension:["name","interfaces","directives","fields"],UnionTypeExtension:["name","directives","types"],EnumTypeExtension:["name","directives","values"],InputObjectTypeExtension:["name","directives","fields"]},He=new Set(Object.keys(Oe));function pe(e){const n=e?.kind;return typeof n=="string"&&He.has(n)}var he;(function(e){e.QUERY="query",e.MUTATION="mutation",e.SUBSCRIPTION="subscription"})(he||(he={}));var oe;(function(e){e.NAME="Name",e.DOCUMENT="Document",e.OPERATION_DEFINITION="OperationDefinition",e.VARIABLE_DEFINITION="VariableDefinition",e.SELECTION_SET="SelectionSet",e.FIELD="Field",e.ARGUMENT="Argument",e.FRAGMENT_SPREAD="FragmentSpread",e.INLINE_FRAGMENT="InlineFragment",e.FRAGMENT_DEFINITION="FragmentDefinition",e.VARIABLE="Variable",e.INT="IntValue",e.FLOAT="FloatValue",e.STRING="StringValue",e.BOOLEAN="BooleanValue",e.NULL="NullValue",e.ENUM="EnumValue",e.LIST="ListValue",e.OBJECT="ObjectValue",e.OBJECT_FIELD="ObjectField",e.DIRECTIVE="Directive",e.NAMED_TYPE="NamedType",e.LIST_TYPE="ListType",e.NON_NULL_TYPE="NonNullType",e.SCHEMA_DEFINITION="SchemaDefinition",e.OPERATION_TYPE_DEFINITION="OperationTypeDefinition",e.SCALAR_TYPE_DEFINITION="ScalarTypeDefinition",e.OBJECT_TYPE_DEFINITION="ObjectTypeDefinition",e.FIELD_DEFINITION="FieldDefinition",e.INPUT_VALUE_DEFINITION="InputValueDefinition",e.INTERFACE_TYPE_DEFINITION="InterfaceTypeDefinition",e.UNION_TYPE_DEFINITION="UnionTypeDefinition",e.ENUM_TYPE_DEFINITION="EnumTypeDefinition",e.ENUM_VALUE_DEFINITION="EnumValueDefinition",e.INPUT_OBJECT_TYPE_DEFINITION="InputObjectTypeDefinition",e.DIRECTIVE_DEFINITION="DirectiveDefinition",e.SCHEMA_EXTENSION="SchemaExtension",e.SCALAR_TYPE_EXTENSION="ScalarTypeExtension",e.OBJECT_TYPE_EXTENSION="ObjectTypeExtension",e.INTERFACE_TYPE_EXTENSION="InterfaceTypeExtension",e.UNION_TYPE_EXTENSION="UnionTypeExtension",e.ENUM_TYPE_EXTENSION="EnumTypeExtension",e.INPUT_OBJECT_TYPE_EXTENSION="InputObjectTypeExtension"})(oe||(oe={}));function me(e){return e===9||e===32}function Je(e,n){const t=e.replace(/"""/g,'\\"""'),i=t.split(/\r\n|[\n\r]/g),s=i.length===1,r=i.length>1&&i.slice(1).every(m=>m.length===0||me(m.charCodeAt(0))),l=t.endsWith('\\"""'),o=e.endsWith('"')&&!l,f=e.endsWith("\\"),u=o||f,c=!(n!=null&&n.minimize)&&(!s||e.length>70||u||r||l);let h="";const p=s&&me(e.charCodeAt(0));return(c&&!p||r)&&(h+=`
`),h+=t,(c||u)&&(h+=`
`),'"""'+h+'"""'}const Xe=10,Ae=2;function Ge(e){return te(e,[])}function te(e,n){switch(typeof e){case"string":return JSON.stringify(e);case"function":return e.name?`[function ${e.name}]`:"[function]";case"object":return Qe(e,n);default:return String(e)}}function Qe(e,n){if(e===null)return"null";if(n.includes(e))return"[Circular]";const t=[...n,e];if(We(e)){const i=e.toJSON();if(i!==e)return typeof i=="string"?i:te(i,t)}else if(Array.isArray(e))return ze(e,t);return Ze(e,t)}function We(e){return typeof e.toJSON=="function"}function Ze(e,n){const t=Object.entries(e);return t.length===0?"{}":n.length>Ae?"["+Ke(e)+"]":"{ "+t.map(([s,r])=>s+": "+te(r,n)).join(", ")+" }"}function ze(e,n){if(e.length===0)return"[]";if(n.length>Ae)return"[Array]";const t=Math.min(Xe,e.length),i=e.length-t,s=[];for(let r=0;r<t;++r)s.push(te(e[r],n));return i===1?s.push("... 1 more item"):i>1&&s.push(`... ${i} more items`),"["+s.join(", ")+"]"}function Ke(e){const n=Object.prototype.toString.call(e).replace(/^\[object /,"").replace(/]$/,"");if(n==="Object"&&typeof e.constructor=="function"){const t=e.constructor.name;if(typeof t=="string"&&t!=="")return t}return n}function en(e){return`"${e.replace(nn,tn)}"`}const nn=/[\x00-\x1f\x22\x5c\x7f-\x9f]/g;function tn(e){return sn[e.charCodeAt(0)]}const sn=["\\u0000","\\u0001","\\u0002","\\u0003","\\u0004","\\u0005","\\u0006","\\u0007","\\b","\\t","\\n","\\u000B","\\f","\\r","\\u000E","\\u000F","\\u0010","\\u0011","\\u0012","\\u0013","\\u0014","\\u0015","\\u0016","\\u0017","\\u0018","\\u0019","\\u001A","\\u001B","\\u001C","\\u001D","\\u001E","\\u001F","","",'\\"',"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\\\\","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\\u007F","\\u0080","\\u0081","\\u0082","\\u0083","\\u0084","\\u0085","\\u0086","\\u0087","\\u0088","\\u0089","\\u008A","\\u008B","\\u008C","\\u008D","\\u008E","\\u008F","\\u0090","\\u0091","\\u0092","\\u0093","\\u0094","\\u0095","\\u0096","\\u0097","\\u0098","\\u0099","\\u009A","\\u009B","\\u009C","\\u009D","\\u009E","\\u009F"],rn=Object.freeze({});function on(e,n,t=Oe){const i=new Map;for(const v of Object.values(oe))i.set(v,ln(n,v));let s,r=Array.isArray(e),l=[e],o=-1,f=[],u=e,c,h;const p=[],m=[];do{o++;const v=o===l.length,D=v&&f.length!==0;if(v){if(c=m.length===0?void 0:p[p.length-1],u=h,h=m.pop(),D)if(r){u=u.slice();let T=0;for(const[O,$]of f){const U=O-T;$===null?(u.splice(U,1),T++):u[U]=$}}else{u=Object.defineProperties({},Object.getOwnPropertyDescriptors(u));for(const[T,O]of f)u[T]=O}o=s.index,l=s.keys,f=s.edits,r=s.inArray,s=s.prev}else if(h){if(c=r?o:l[o],u=h[c],u==null)continue;p.push(c)}let y;if(!Array.isArray(u)){var A,w;pe(u)||Ye(!1,`Invalid AST Node: ${Ge(u)}.`);const T=v?(A=i.get(u.kind))===null||A===void 0?void 0:A.leave:(w=i.get(u.kind))===null||w===void 0?void 0:w.enter;if(y=T?.call(n,u,c,h,p,m),y===rn)break;if(y===!1){if(!v){p.pop();continue}}else if(y!==void 0&&(f.push([c,y]),!v))if(pe(y))u=y;else{p.pop();continue}}if(y===void 0&&D&&f.push([c,u]),v)p.pop();else{var C;s={inArray:r,index:o,keys:l,edits:f,prev:s},r=Array.isArray(u),l=r?u:(C=t[u.kind])!==null&&C!==void 0?C:[],o=-1,f=[],h&&m.push(h),h=u}}while(s!==void 0);return f.length!==0?f[f.length-1][1]:e}function ln(e,n){const t=e[n];return typeof t=="object"?t:typeof t=="function"?{enter:t,leave:void 0}:{enter:e.enter,leave:e.leave}}function un(e){return on(e,an)}const cn=80,an={Name:{leave:e=>e.value},Variable:{leave:e=>"$"+e.name},Document:{leave:e=>a(e.definitions,`

`)},OperationDefinition:{leave(e){const n=d("(",a(e.variableDefinitions,", "),")"),t=a([e.operation,a([e.name,n]),a(e.directives," ")]," ");return(t==="query"?"":t+" ")+e.selectionSet}},VariableDefinition:{leave:({variable:e,type:n,defaultValue:t,directives:i})=>e+": "+n+d(" = ",t)+d(" ",a(i," "))},SelectionSet:{leave:({selections:e})=>_(e)},Field:{leave({alias:e,name:n,arguments:t,directives:i,selectionSet:s}){const r=d("",e,": ")+n;let l=r+d("(",a(t,", "),")");return l.length>cn&&(l=r+d(`(
`,J(a(t,`
`)),`
)`)),a([l,a(i," "),s]," ")}},Argument:{leave:({name:e,value:n})=>e+": "+n},FragmentSpread:{leave:({name:e,directives:n})=>"..."+e+d(" ",a(n," "))},InlineFragment:{leave:({typeCondition:e,directives:n,selectionSet:t})=>a(["...",d("on ",e),a(n," "),t]," ")},FragmentDefinition:{leave:({name:e,typeCondition:n,variableDefinitions:t,directives:i,selectionSet:s})=>`fragment ${e}${d("(",a(t,", "),")")} on ${n} ${d("",a(i," ")," ")}`+s},IntValue:{leave:({value:e})=>e},FloatValue:{leave:({value:e})=>e},StringValue:{leave:({value:e,block:n})=>n?Je(e):en(e)},BooleanValue:{leave:({value:e})=>e?"true":"false"},NullValue:{leave:()=>"null"},EnumValue:{leave:({value:e})=>e},ListValue:{leave:({values:e})=>"["+a(e,", ")+"]"},ObjectValue:{leave:({fields:e})=>"{"+a(e,", ")+"}"},ObjectField:{leave:({name:e,value:n})=>e+": "+n},Directive:{leave:({name:e,arguments:n})=>"@"+e+d("(",a(n,", "),")")},NamedType:{leave:({name:e})=>e},ListType:{leave:({type:e})=>"["+e+"]"},NonNullType:{leave:({type:e})=>e+"!"},SchemaDefinition:{leave:({description:e,directives:n,operationTypes:t})=>d("",e,`
`)+a(["schema",a(n," "),_(t)]," ")},OperationTypeDefinition:{leave:({operation:e,type:n})=>e+": "+n},ScalarTypeDefinition:{leave:({description:e,name:n,directives:t})=>d("",e,`
`)+a(["scalar",n,a(t," ")]," ")},ObjectTypeDefinition:{leave:({description:e,name:n,interfaces:t,directives:i,fields:s})=>d("",e,`
`)+a(["type",n,d("implements ",a(t," & ")),a(i," "),_(s)]," ")},FieldDefinition:{leave:({description:e,name:n,arguments:t,type:i,directives:s})=>d("",e,`
`)+n+(ye(t)?d(`(
`,J(a(t,`
`)),`
)`):d("(",a(t,", "),")"))+": "+i+d(" ",a(s," "))},InputValueDefinition:{leave:({description:e,name:n,type:t,defaultValue:i,directives:s})=>d("",e,`
`)+a([n+": "+t,d("= ",i),a(s," ")]," ")},InterfaceTypeDefinition:{leave:({description:e,name:n,interfaces:t,directives:i,fields:s})=>d("",e,`
`)+a(["interface",n,d("implements ",a(t," & ")),a(i," "),_(s)]," ")},UnionTypeDefinition:{leave:({description:e,name:n,directives:t,types:i})=>d("",e,`
`)+a(["union",n,a(t," "),d("= ",a(i," | "))]," ")},EnumTypeDefinition:{leave:({description:e,name:n,directives:t,values:i})=>d("",e,`
`)+a(["enum",n,a(t," "),_(i)]," ")},EnumValueDefinition:{leave:({description:e,name:n,directives:t})=>d("",e,`
`)+a([n,a(t," ")]," ")},InputObjectTypeDefinition:{leave:({description:e,name:n,directives:t,fields:i})=>d("",e,`
`)+a(["input",n,a(t," "),_(i)]," ")},DirectiveDefinition:{leave:({description:e,name:n,arguments:t,repeatable:i,locations:s})=>d("",e,`
`)+"directive @"+n+(ye(t)?d(`(
`,J(a(t,`
`)),`
)`):d("(",a(t,", "),")"))+(i?" repeatable":"")+" on "+a(s," | ")},SchemaExtension:{leave:({directives:e,operationTypes:n})=>a(["extend schema",a(e," "),_(n)]," ")},ScalarTypeExtension:{leave:({name:e,directives:n})=>a(["extend scalar",e,a(n," ")]," ")},ObjectTypeExtension:{leave:({name:e,interfaces:n,directives:t,fields:i})=>a(["extend type",e,d("implements ",a(n," & ")),a(t," "),_(i)]," ")},InterfaceTypeExtension:{leave:({name:e,interfaces:n,directives:t,fields:i})=>a(["extend interface",e,d("implements ",a(n," & ")),a(t," "),_(i)]," ")},UnionTypeExtension:{leave:({name:e,directives:n,types:t})=>a(["extend union",e,a(n," "),d("= ",a(t," | "))]," ")},EnumTypeExtension:{leave:({name:e,directives:n,values:t})=>a(["extend enum",e,a(n," "),_(t)]," ")},InputObjectTypeExtension:{leave:({name:e,directives:n,fields:t})=>a(["extend input",e,a(n," "),_(t)]," ")}};function a(e,n=""){var t;return(t=e?.filter(i=>i).join(n))!==null&&t!==void 0?t:""}function _(e){return d(`{
`,J(a(e,`
`)),`
}`)}function d(e,n,t=""){return n!=null&&n!==""?e+n+t:""}function J(e){return d("  ",e.replace(/\n/g,`
  `))}function ye(e){var n;return(n=e?.some(t=>t.includes(`
`)))!==null&&n!==void 0?n:!1}var ge=e=>typeof e=="function"&&!e.length?e():e;const fn=(e,n)=>(t,i={},s)=>Ve(()=>ge(i),r=>{const l=typeof r=="boolean"?{}:r;return dn(ge(e),t,{...n,variables:l})},{initialValue:s});async function dn(e,n,t={}){const{fetcher:i=fetch,variables:s={},headers:r={},method:l="POST"}=t,o=typeof n=="string"?n:un(n);return i(e,{...t,method:l,body:JSON.stringify({query:o,variables:s}),headers:{"content-type":"application/json",...r}}).then(f=>f.json()).then(({data:f,errors:u})=>{if(u)throw u;return f})}const we=(e,...n)=>e.map((t,i)=>`${t}${n[i]??""}`).join("").replace(/#.+\r?\n|\r/g,"").replace(/\r?\n|\r/g,"").replace(/\s{2,}/g," ").trim(),pn={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"CountryQuery"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ID"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"country"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"name"}}]}}]}}]};const hn=ne("<p></p>",2),mn=ne("<ul></ul>",2),yn=ne('<div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white"><h3>Get country by code</h3><input><h4></h4><h3>Countries:</h3></div>',9),gn=ne("<li> - </li>",2);we`
  query CountryQuery($code: ID!) {
    country(code: $code) {
      name
    }
  }
`;const En=()=>{const[e,n]=B("BR"),t=fn("https://countries.trevorblades.com/",{credentials:"same-origin"}),[i]=t(we`
      query CountriesQuery {
        countries {
          name
          code
        }
      }
    `),[s]=t(pn,()=>({code:e()}),{country:{name:"loading..."}});return(()=>{const r=yn.cloneNode(!0),l=r.firstChild,o=l.nextSibling,f=o.nextSibling;return f.nextSibling,o.$$input=u=>n(u.currentTarget.value.toUpperCase()),F(f,H(ae,{get when(){return s()?.country?.name},fallback:"not found",get children(){const u=hn.cloneNode(!0);return F(u,()=>s().country.name),u}})),F(r,H(ae,{get when(){return i()},get children(){const u=mn.cloneNode(!0);return F(u,H(Ue,{get each(){return i().countries},children:c=>(()=>{const h=gn.cloneNode(!0),p=h.firstChild;return F(h,()=>c.code,p),F(h,()=>c.name,null),h})()})),u}}),null),Q(()=>o.value=e()),r})()};Be(()=>H(En,{}),document.getElementById("root"));Me(["input"]);