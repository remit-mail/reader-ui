import{r as d,j as K}from"./iframe-Dz9ev7_1.js";import{r as V,d as W,C as G,u as q,S as L}from"./use-gesture-react.esm-CxGbg7hY.js";const be=()=>`
/* Zero the UA default body margin and clamp the document to the iframe width so
   wide author markup can't push the body (and the page) past the viewport. */
html, body {
  margin: 0;
  padding: 0;
  max-width: 100%;
}
body {
  overflow-wrap: anywhere;
  word-break: break-word;
}
/* Media never wider than the frame; keep aspect ratio when width is capped. */
img, video, iframe, svg, canvas {
  max-width: 100% !important;
  height: auto;
}
/* Fixed-width author tables (\`<table width="600">\`) collapse to fit. */
table {
  max-width: 100% !important;
  table-layout: auto;
}
/* Cells carry the fixed widths in real newsletters (\`<td width="600">\`);
   cap them too or the table can't actually shrink. */
td, th {
  max-width: 100% !important;
}
/* \`max-width\` alone can't beat an inline \`min-width\`; zeroing the min lets
   flex / grid / table children actually collapse to the clamped width. */
* {
  min-width: 0;
}
/* An author \`nowrap\` assumes a viewport as wide as the line. The frame is the
   pane's width whatever the mail is, so a pinned paragraph turns reading one
   sentence into a sideways drag — and inside an author \`overflow:hidden\` it is
   cut mid-character with nothing left to scroll at all. Flowing text wraps. The
   \`i\` flag is load-bearing: Outlook and older generators emit \`WHITE-SPACE:
   NOWRAP\`, and an attribute value match is case-sensitive without it. */
[nowrap]:not(pre, code, pre *, code *),
[style*="nowrap" i]:not(pre, code, pre *, code *) {
  white-space: normal !important;
}
/* Long unbroken strings (URLs, tokens) wrap instead of forcing a wide line. */
pre, code {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
/* Preformatted text keeps its spacing even where a nowrap is declared — on the
   block or on a span inside it. \`normal\` would collapse the runs of spaces that
   are the entire content of a \`pre\`, and the un-important rule above cannot
   defend an inline style, so this wraps to \`pre-wrap\` instead of unwrapping. */
:is(pre, code, pre *, code *):is([nowrap], [style*="nowrap" i]) {
  white-space: pre-wrap !important;
}
`;function U(e,t){if(typeof e!="object"||e===null)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(typeof r!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function B(e){var t=U(e,"string");return typeof t=="symbol"?t:String(t)}function Z(e,t,n){return t=B(t),t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function C(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable})),n.push.apply(n,r)}return n}function b(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?C(Object(n),!0).forEach(function(r){Z(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):C(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}class X{constructor(t,n,r,a,i){this._target=t,this._gestureKey=a,this._ctrl=new G(n),this._ctrl.applyHandlers(n,i),this._ctrl.applyConfig(b(b({},r),{},{target:t}),a),this._ctrl.effect()}destroy(){this._ctrl.clean()}setConfig(t){this._ctrl.clean(),this._ctrl.applyConfig(b(b({},t),{},{target:this._target}),this._gestureKey),this._ctrl.effect()}}const Y=function(t,n,r){return V(W),new X(t,{drag:n},r||{},"drag")},S="remit:swipe",J=d.createContext(!1),Q=1.01,M=e=>{const{event:t}=e;if("pointerType"in t&&t.pointerType!=="touch"||t.type!=="pointerup")return null;const n=e.swipe[0];return n<0?"left":n>0?"right":null},N=e=>{const t=window.visualViewport;return t?.addEventListener("resize",e),()=>t?.removeEventListener("resize",e)},F=()=>(window.visualViewport?.scale??1)>Q,ye=({onSwipeLeft:e,onSwipeRight:t})=>{const n=d.useRef(null),r=e!==void 0||t!==void 0,a=d.useSyncExternalStore(N,F,()=>!1),i=s=>{s==="left"&&e?.(),s==="right"&&t?.()},m=q(s=>i(M(s)),{...L,axis:"x",enabled:r&&!a});return d.useEffect(()=>{const s=n.current;if(!s||!r||a)return;const u=g=>{if(!(g instanceof CustomEvent))return;const{detail:c}=g;(c==="left"||c==="right")&&i(c)};return s.addEventListener(S,u),()=>s.removeEventListener(S,u)}),{ref:n,bind:m,touchAction:r&&!a?"pan-y pinch-zoom":"auto",enabled:r}},ee='"Geist Variable", "Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',y={light:{fg:"oklch(0.3 0.025 235)",canvas:"oklch(0.96 0.015 90)",accent:"oklch(0.55 0.14 150)"},dark:{fg:"oklch(0.88 0.02 90)",canvas:"oklch(0.22 0.025 220)",accent:"oklch(0.78 0.16 150)"}},te={background:!1,spacing:!1},ne="16px",re=()=>`html{padding:0}body{padding:${ne};box-sizing:border-box}`,oe=()=>"html{overflow:hidden}body{overflow-x:auto}",ae=/prefers-color-scheme\s*:\s*dark|color-scheme\s*:\s*[^;}"']*\bdark\b/i,ie='<meta name="viewport" content="width=device-width, initial-scale=1">',se=e=>{const t=e?y.dark:y.light;return`
/* Plain-email base: UI font-stack + theme-aware colors (#424) */
html, body {
  font-family: ${ee};
  font-size: 14px;
  line-height: 1.6;
  color: ${t.fg};
  background-color: ${t.canvas};
  margin: 0;
  padding: 0;
}
/* Strip author unreadable text colors and element backgrounds, scoped to body
   descendants so the themed html/body surface above survives this reset. */
body * {
  color: inherit !important;
  background-color: transparent !important;
}
a, a:visited {
  color: ${t.accent} !important;
  text-decoration: underline;
}
`},T="invert(0.92) hue-rotate(180deg)",D=`img,picture,video,svg,canvas,[style*='background-image'],[background]{filter:${T}}`,ce=(e,t,n)=>{const r=e?y.dark.canvas:y.light.canvas;return n?e?t?`html,body{margin:0;background-color:${r};color-scheme:dark light}`:`html{margin:0;background-color:#ffffff;filter:${T}}body{margin:0}${D}`:"html,body{margin:0;background-color:#ffffff;color-scheme:light}":e?t?`html,body{margin:0;background-color:${r};color-scheme:dark light}`:`html{margin:0;background-color:${r}}body{margin:0;filter:${T}}${D}`:`html,body{margin:0;background-color:${r};color-scheme:light}`},le=(e,t,n,r=te)=>{const a=t==="plain"?se(n):ce(n,ae.test(e),r.background),i=r.spacing?"":re();return`${ie}<style>${a}</style>${e}<style>${oe()}${i}</style>`},R=5e4,de="allow-same-origin allow-popups allow-popups-to-escape-sandbox",$=(e,t,n)=>Math.min(Math.ceil(Math.max(e,t)),n),_=.5,I=(e,t)=>t>0&&e>t+1?Math.max(t/e,_):1,me=["box-sizing","width","max-width","transform","transform-origin","margin-bottom","overflow-x"],ue=e=>{for(const m of me)e.style.removeProperty(m);const t=e.clientWidth,n=e.scrollWidth;if(I(n,t)===1)return 1;const r=(m,s)=>e.style.setProperty(m,s,"important");r("box-sizing","border-box"),r("max-width","none"),r("width",`${n}px`);const a=Math.max(n,e.scrollWidth),i=I(a,t);return i>_?r("overflow-x","visible"):r("width",`${t/_}px`),r("transform-origin","0 0"),r("transform",`scale(${i})`),r("margin-bottom",`${-e.offsetHeight*(1-i)}px`),i},he=new Set(["Enter","Escape","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Home","End"]),pe=e=>e===" "?!1:e.length===1?!0:he.has(e),k=e=>{if(e.metaKey||e.ctrlKey||e.altKey||!pe(e.key))return;const t=e.currentTarget??e.target,n=t?.defaultView?.parent;!n||n===t?.defaultView||n.dispatchEvent(new KeyboardEvent("keydown",{key:e.key,code:e.code,shiftKey:e.shiftKey,bubbles:!0,cancelable:!0}))},fe=({html:e,variant:t="framed",isDark:n=!1,declares:r,className:a})=>{const i=d.useRef(null),[m,s]=d.useState(0),u=d.useContext(J),g=d.useMemo(()=>le(e,t,n,r),[e,t,n,r]);return d.useEffect(()=>{const c=i.current;if(!c)return;const h=()=>{const o=c.contentDocument;if(!o?.body)return;E();const l=o.documentElement,O=ue(o.body)<1?$(o.body.getBoundingClientRect().height,0,R):$(o.body.scrollHeight,l?.scrollHeight??0,R);s(P=>P===O?P:O)};let v=0;const z=()=>{cancelAnimationFrame(v),v=requestAnimationFrame(h)},j=o=>{const l=o.documentElement;return F()||l.scrollWidth>l.clientWidth+1},E=()=>{const o=c.contentDocument;if(!u||!o?.body)return;const l=j(o)?"auto":"pan-y pinch-zoom";o.documentElement.style.touchAction=l,o.body.style.touchAction=l};let p,f,w;const H=u?N(E):void 0,A=()=>{h(),p?.disconnect(),p=void 0,f?.removeEventListener("keydown",k),f?.removeEventListener("load",h,!0),f=void 0,w?.destroy(),w=void 0;const o=c.contentDocument;o?.body&&(E(),u&&(w=new Y(o.documentElement,l=>{const x=M(l);x&&c.dispatchEvent(new CustomEvent(S,{bubbles:!0,detail:x}))},{...L,axis:"x",window:o.defaultView??void 0})),p=new ResizeObserver(z),p.observe(o.body),o.documentElement&&p.observe(o.documentElement),o.addEventListener("load",h,!0),o.fonts?.ready.then(h),o.addEventListener("keydown",k),f=o)};return c.addEventListener("load",A),()=>{c.removeEventListener("load",A),f?.removeEventListener("keydown",k),f?.removeEventListener("load",h,!0),p?.disconnect(),w?.destroy(),H?.(),cancelAnimationFrame(v)}},[u]),K.jsx("iframe",{ref:i,title:"Email content",sandbox:de,srcDoc:g,className:a,style:{width:"100%",border:"none",display:"block",height:m===0?"1px":`${m}px`,colorScheme:"normal"}})};fe.__docgenInfo={description:`Render untrusted (sanitized) email HTML in a sandboxed iframe that is exactly
as wide as the pane holding it and isolates the email's CSS from the app
chrome.

Presentational: HTML + treatment + theme come in via props; the component owns
the srcDoc assembly and the height. The width is the app's layout and nothing
else — the frame is never widened to fit the mail, so no measurement of the
email can move a box the reader can see. Content that genuinely cannot wrap (a
fixed-width table, an oversized image, a \`pre\` the author pinned) is laid out
at its own width and scaled down inside the document to fit the frame; the
pane and the page never learn about it.

Height is the one axis the frame reads off its content: a seamless inline
frame has to grow to the mail it shows or it would scroll internally against
the page's own scrollbar.`,methods:[],displayName:"IsolatedEmailFrame",props:{html:{required:!0,tsType:{name:"string"},description:`Sanitized email HTML. Must already be DOMPurify'd and carry the
sanitizer's layout-clamp \`<style>\` block; this component only adds the
colour / font / dark-mode canvas and isolates the result in a sandboxed
iframe. Never pass raw, untrusted HTML here.`},variant:{required:!1,tsType:{name:"union",raw:'"plain" | "framed"',elements:[{name:"literal",value:'"plain"'},{name:"literal",value:'"framed"'}]},description:`Render treatment:

- \`"plain"\` — weakly-marked / personal mail. UI sans-serif + theme-aware
  colours are injected so black-text-on-dark is readable.
- \`"framed"\` — designed mail (newsletter / marketing / author background).
  The author's colours are preserved; in dark mode the email is darkened
  via a smart-invert unless it opts into its own dark design.`,defaultValue:{value:'"framed"',computed:!1}},isDark:{required:!1,tsType:{name:"boolean"},description:`Whether the app is in dark mode. The plain branch picks theme-aware
colours; the framed branch decides whether to render as-authored on white
or apply the smart-invert.`,defaultValue:{value:"false",computed:!1}},declares:{required:!1,tsType:{name:"AuthorDeclarations"},description:`What the mail declares about its own presentation, from the sanitizer. A
declared background renders as authored; where the mail declares none the
frame's ground is the reading pane's own colour. A mail that declares no
padding or margin is given breathing room inside that ground.`},className:{required:!1,tsType:{name:"string"},description:""}}};export{fe as I,_ as M,J as S,be as g,ye as u};
