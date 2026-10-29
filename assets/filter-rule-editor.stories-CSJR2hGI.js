import{j as a,r as oe}from"./iframe-Dz9ev7_1.js";import{d as c,a as s,b as be,C as le,c as ge,e as ye,f as se,g as ee,h as Ce,i as Fe}from"./filter-clause-chip-BqGUM5m4.js";import{F as me,a as v}from"./filter-rule-editor-Do3fwNAY.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./suggest-list-DoVkY54B.js";import"./button-CLbVgqC1.js";import"./input-Dno_Kr9T.js";import"./select-adBjnrbk.js";import"./chevron-down-COHbBXpp.js";import"./createLucideIcon-RYwrBmYZ.js";import"./x-snW7h3us.js";import"./plus-BjlLK1hC.js";import"./folder-tree-ZE9Jqoy_.js";import"./loader-circle-C6jTFX4E.js";import"./triangle-alert-BzExaAbk.js";import"./folder-tree-picker-Xci-OtZE.js";import"./folder-row-BVjFYu7r.js";import"./chevron-right-BgpxkwQ0.js";import"./check-D-jt1aUx.js";import"./folder-BFMlMtyd.js";import"./circle-alert-CcoNAO8C.js";import"./new-folder-action-CK5s8xfF.js";import"./new-folder-form-DbboqlK-.js";import"./field-label-AfH6c15u.js";import"./search-qhk-8fnj.js";import"./label-chip-BhjI_09Q.js";import"./segmented-control-tDDqEOk4.js";const or={title:"Design System/Filters/FilterRuleEditor",component:me,parameters:{layout:"padded"},decorators:[e=>a.jsx("div",{className:"mx-auto max-w-md rounded-xl border border-line bg-surface",children:a.jsx(e,{})})]},l=(e,r)=>({status:"ready",count:e,stale:r});function n({initialRule:e,labels:r=ee,initialClauseEdit:i,folders:p=c,delimiter:h,onCreateFolder:te,onCreateLabel:fe}){const[K,m]=oe.useState(e),[Z,f]=oe.useState(i),we=oe.useMemo(()=>l(K.clauses.length*23),[K]),ve={onStartAddClause:()=>f({mode:"add",draft:{field:"From",value:""}}),onStartEditClause:o=>{const t=K.clauses.find(d=>d.id===o);t&&f({mode:"edit",clauseId:o,draft:{field:t.field,value:t.value}})},onRemoveClause:o=>{m(t=>({...t,clauses:t.clauses.filter(d=>d.id!==o)}))},onChangeDraftField:o=>f(t=>t&&{...t,draft:{...t.draft,field:o}}),onChangeDraftValue:o=>f(t=>t&&{...t,draft:{...t.draft,value:o}}),onSubmitClause:()=>{f(o=>{o&&m(t=>{if(o.mode==="add"){const d={id:`c-${Date.now()}`,field:o.draft.field,value:o.draft.value};return{...t,clauses:[...t.clauses,d]}}return{...t,clauses:t.clauses.map(d=>d.id===o.clauseId?{...d,field:o.draft.field,value:o.draft.value}:d)}})})},onCancelClause:()=>f(void 0),onChangeMatchOperator:o=>{m(t=>({...t,matchOperator:o}))},onChangeMove:o=>m(t=>({...t,moveMailboxId:o||void 0})),onChangeLabel:o=>m(t=>({...t,labelId:o||void 0})),onChangeScope:o=>m(t=>({...t,scope:o})),onChangeName:o=>m(t=>({...t,name:o})),onChangeUntil:o=>m(t=>({...t,until:o}))};return a.jsx(me,{rule:K,folders:p,delimiter:h,labels:r,preview:we,clauseEdit:Z,clauseSuggestions:Z?Fe(Z.draft.field,Z.draft.value):void 0,onCreateFolder:te,onCreateLabel:fe,onCommit:()=>{},onCancel:()=>{},...ve})}const b={render:()=>a.jsx(n,{initialRule:s})},g={render:()=>a.jsx(n,{initialRule:{...se,clauses:se.clauses.slice(0,1),scope:"once",name:""}})},y={render:()=>a.jsx(n,{initialRule:Ce})},C={render:()=>a.jsx(n,{initialRule:s,initialClauseEdit:{mode:"add",draft:{field:"From",value:""}}})},F={render:()=>a.jsx(n,{initialRule:s,initialClauseEdit:{mode:"add",draft:{field:"FromDomain",value:""}}})},R={render:()=>a.jsx(n,{initialRule:s,initialClauseEdit:{mode:"add",draft:{field:"From",value:"someone@nowhere.test"}}})},E={render:()=>a.jsx(n,{initialRule:s,initialClauseEdit:{mode:"add",draft:{field:"Subject",value:"receipt"}}})},u=()=>new Promise(e=>setTimeout(e,60)),re=(e,r)=>{const i=Array.from(e.querySelectorAll("button")).find(p=>p.textContent?.trim()===r);if(!i)throw new Error(`no button reading "${r}"`);i.click()},ne=(e,r)=>{const i=e.querySelector(`[aria-label="${r}"]`);if(!i)throw new Error(`no control labelled "${r}"`);i.click()},Re=(e,r)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set?.call(e,r),e.dispatchEvent(new Event("input",{bubbles:!0}))},pe=(e,r)=>{const p=Array.from(e.querySelectorAll("label")).find(te=>te.textContent?.trim()==="Folder name")?.getAttribute("for"),h=p?e.querySelector(`input[id="${p}"]`):null;if(!h)throw new Error("the folder name field is not on screen");Re(h,r)},ae=async e=>{re(e,"Choose a folder"),await u()},w=async(e,r)=>{const i=e.querySelector(`[aria-label="Move to ${r}"]`);if(!i)throw new Error(`no control labelled "Move to ${r}"`);i.getAttribute("aria-expanded")!=="true"&&i.click(),await u()};async function z(e,r,i){await ae(e),i?(await w(e,"Inbox"),await w(e,i),ne(e,`New folder inside ${i}`)):ne(e,"New folder"),await u(),pe(e,r),await u(),re(e,"Create folder")}let de=0;const ie=(e,r)=>new Promise(i=>{de+=1,setTimeout(()=>i({id:`mbx-new-${de}`,label:e,path:r?`${r}/${e}`:e}),400)}),S={name:"Destination — browse the folder tree",render:()=>a.jsx(n,{initialRule:s,onCreateFolder:ie}),play:async({canvasElement:e})=>{await ae(e)}},x={name:"Destination — a nested folder and its same-named sibling",render:()=>a.jsx(n,{initialRule:s,onCreateFolder:ie}),play:async({canvasElement:e})=>{await ae(e),await w(e,"Inbox"),await w(e,"Travel")}},Ee=[{id:"mbx-inbox",label:"Inbox",path:"INBOX"},{id:"mbx-archive",label:"Archive",path:"Archive"},{id:"mbx-work",label:"Work",path:"Work"},{id:"mbx-workshop",label:"Workshop",path:"Workshop"}],L={name:"Destination — a flat namespace (server reports no delimiter)",render:()=>a.jsx(n,{initialRule:{...s,moveMailboxId:"mbx-work"},folders:Ee,delimiter:""})},T={name:"New folder — inside the folder you opened",render:()=>a.jsx(n,{initialRule:s,onCreateFolder:ie}),play:async({canvasElement:e})=>{await ae(e),await w(e,"Inbox"),await w(e,"Travel"),ne(e,"New folder inside Travel"),await u(),pe(e,"Car hire")}},ue="The folder was created but the mail server hasn't confirmed it yet, so nothing was attached to it. It's in your folder list — try again in a moment.",Se=()=>new Promise(()=>{}),he=e=>()=>Promise.reject(new Error(e)),xe=()=>{let e=0;return(r,i)=>(e+=1,e===1?Promise.reject(new Error(ue)):Promise.resolve({id:"mbx-created",label:r,path:i?`${i}/${r}`:r}))},Le=(e,r,i)=>new Promise((p,h)=>{i?.addEventListener("abort",()=>h(new DOMException("Aborted","AbortError")))}),j={name:"New folder — creating (waiting for the server)",render:()=>a.jsx(n,{initialRule:s,onCreateFolder:Se}),play:async({canvasElement:e})=>{await z(e,"Receipts")}},k={name:"New folder — create failed (retry / cancel)",render:()=>a.jsx(n,{initialRule:s,onCreateFolder:he("The folder couldn't be created on the mail server. Please try again.")}),play:async({canvasElement:e})=>{await z(e,"Receipts")}},N={name:"New folder — create timed out (retry / cancel)",render:()=>a.jsx(n,{initialRule:s,onCreateFolder:he(ue)}),play:async({canvasElement:e})=>{await z(e,"Receipts")}},D={name:"New folder — retry resumes and succeeds",render:()=>a.jsx(n,{initialRule:s,onCreateFolder:xe()}),play:async({canvasElement:e})=>{await z(e,"Receipts","Travel"),await u(),re(e,"Create folder")}},A={name:"New folder — cancel aborts the wait",render:()=>a.jsx(n,{initialRule:s,onCreateFolder:Le}),play:async({canvasElement:e})=>{await z(e,"Receipts"),await u(),re(e,"Cancel")}},P={render:()=>a.jsx(n,{initialRule:s,labels:[]})},I={render:()=>a.jsx(n,{initialRule:{...s,labelId:"lbl-receipts"}})},M={render:()=>a.jsx(n,{initialRule:s,labels:Array.from({length:20},(e,r)=>({id:`lbl-${r}`,name:`Label ${r+1}`,color:ee[r%ee.length].color}))})},O={render:()=>a.jsx(n,{initialRule:{...s,labelId:"lbl-long"},labels:[{id:"lbl-long",name:"Quarterly compliance filings that need a second look",color:"Purple"},...ee]})};let ce=0;const Te=e=>new Promise(r=>{ce+=1,setTimeout(()=>r({id:`lbl-new-${ce}`,name:e,color:"Default"}),400)}),$={render:()=>a.jsx(n,{initialRule:s,onCreateLabel:Te})},je=()=>new Promise((e,r)=>{setTimeout(()=>r(new Error("That name is already taken.")),400)}),W={render:()=>a.jsx(n,{initialRule:s,onCreateLabel:je})},V={render:()=>a.jsx(n,{initialRule:be})},Y={args:{rule:{clauses:[{id:"c1",field:"Subject",value:"receipt"}],matchOperator:"all",moveMailboxId:"mbx-receipts",scope:"once"},folders:c,preview:l(12)}},_={args:{rule:s,folders:c,preview:l(47)}},q={args:{rule:{...s,scope:"until",until:"2026-09-01",name:"Conference"},folders:c,preview:l(31)}},B={render:()=>a.jsx(n,{initialRule:se})},U={args:{rule:{...s,scope:"until",until:"2027-09-01",name:"Conference"},folders:c,preview:l(31),persisted:!0}},G={args:{rule:{clauses:[],matchOperator:"all",scope:"once"},folders:c,preview:l(0)}},H={args:{rule:s,folders:c,preview:{status:"loading"}}},Q={args:{rule:s,folders:c,preview:l(47,!0)}},J={args:{rule:s,folders:c,preview:{status:"error",reason:"Couldn't reach the server to count."}}},X={render:()=>{const e=["From","Subject","HasWords","ListId","FromDomain"];return a.jsxs("div",{className:"space-y-4 p-4",children:[a.jsx("div",{className:"flex flex-wrap gap-2",children:e.map(r=>a.jsx(le,{clause:{id:r,field:r,value:ge(r)},onEdit:()=>{},onRemove:()=>{}},r))}),a.jsx("div",{className:"flex flex-wrap gap-2",children:a.jsx(le,{clause:{id:"d",field:"From",value:"receipts@stripe.com",derived:!0},onEdit:()=>{},onRemove:()=>{}})}),a.jsx(ye,{draft:{field:"ListId",value:"python-dev.python.org"},mode:"edit",onChangeField:()=>{},onChangeValue:()=>{},onSubmit:()=>{},onCancel:()=>{}}),a.jsxs("div",{className:"space-y-2",children:[a.jsx(v,{preview:{status:"loading"}}),a.jsx(v,{preview:l(0)}),a.jsx(v,{preview:l(412)}),a.jsx(v,{preview:l(47,!0)}),a.jsx(v,{preview:{status:"error",reason:"Couldn't count."}})]})]})}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoRule} />
}`,...b.parameters?.docs?.source},description:{story:"The full editor, interactive — the shape ticket B and the app consume.",...b.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={{
    ...demoSenderFallbackRule,
    clauses: demoSenderFallbackRule.clauses.slice(0, 1),
    scope: "once",
    name: ""
  }} />
}`,...g.parameters?.docs?.source},description:{story:"One sender behind the whole selection — a single `From` chip, editable like any other.",...g.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoSubjectPrefillRule} />
}`,...y.parameters?.docs?.source},description:{story:`When the senders differ, the prefill falls back to the part the selected
subjects share, so the rule still starts somewhere useful.`,...y.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoRule} initialClauseEdit={{
    mode: "add",
    draft: {
      field: "From",
      value: ""
    }
  }} />
}`,...C.parameters?.docs?.source},description:{story:`Adding a \`From\` clause, with the value field offering what it knows: the
senders of the messages that were selected lead the list — marked "selected",
and there before a key is pressed — followed by other known addresses. Typing
narrows it; anything typed still stands, match or no match.`,...C.parameters?.docs?.description}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoRule} initialClauseEdit={{
    mode: "add",
    draft: {
      field: "FromDomain",
      value: ""
    }
  }} />
}`,...F.parameters?.docs?.source},description:{story:"The same field on a `Domain` clause: the addresses collapse to registrable\ndomains, so the value offered is exactly the string the matcher compares.",...F.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoRule} initialClauseEdit={{
    mode: "add",
    draft: {
      field: "From",
      value: "someone@nowhere.test"
    }
  }} />
}`,...R.parameters?.docs?.source},description:{story:`Typing something no known sender matches. The list simply goes away — no
empty panel, no warning, no block on the value. A clause for an address that
has not written yet is a legitimate rule.`,...R.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoRule} initialClauseEdit={{
    mode: "add",
    draft: {
      field: "Subject",
      value: "receipt"
    }
  }} />
}`,...E.parameters?.docs?.source},description:{story:"A free-text field is left alone: `Subject` has nothing to draw suggestions\nfrom, so it stays the plain box it was.",...E.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: "Destination — browse the folder tree",
  render: () => <LiveEditor initialRule={demoRule} onCreateFolder={mockCreateFolder} />,
  play: async ({
    canvasElement
  }) => {
    await openDestinationTree(canvasElement);
  }
}`,...S.parameters?.docs?.source},description:{story:`The destination is chosen from the same browsable tree every other picker
uses: open a folder to see what is inside it, filter to narrow, and make a
new one where you are looking.`,...S.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "Destination — a nested folder and its same-named sibling",
  render: () => <LiveEditor initialRule={demoRule} onCreateFolder={mockCreateFolder} />,
  play: async ({
    canvasElement
  }) => {
    await openDestinationTree(canvasElement);
    await openFolder(canvasElement, "Inbox");
    await openFolder(canvasElement, "Travel");
  }
}`,...x.parameters?.docs?.source},description:{story:`Two folders named Receipts, one at the top level and one inside Travel. The
tree tells them apart by where they sit; a list of leaf names could not.`,...x.parameters?.docs?.description}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: "Destination — a flat namespace (server reports no delimiter)",
  render: () => <LiveEditor initialRule={{
    ...demoRule,
    moveMailboxId: "mbx-work"
  }} folders={flatFolders} delimiter="" />
}`,...L.parameters?.docs?.source},description:{story:"A flat namespace, where the chosen destination reads as its whole path —\n`Work`, not one segment per character.",...L.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: "New folder — inside the folder you opened",
  render: () => <LiveEditor initialRule={demoRule} onCreateFolder={mockCreateFolder} />,
  play: async ({
    canvasElement
  }) => {
    await openDestinationTree(canvasElement);
    await openFolder(canvasElement, "Inbox");
    await openFolder(canvasElement, "Travel");
    clickAriaLabel(canvasElement, "New folder inside Travel");
    await tick();
    typeFolderName(canvasElement, "Car hire");
  }
}`,...T.parameters?.docs?.source},description:{story:"A new folder is made inside the folder the tree is looking at, so a filter can\npoint at `Travel/Car hire` without leaving the editor.",...T.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: "New folder — creating (waiting for the server)",
  render: () => <LiveEditor initialRule={demoRule} onCreateFolder={neverResolvesCreateFolder} />,
  play: async ({
    canvasElement
  }) => {
    await createFolderFromTree(canvasElement, "Receipts");
  }
}`,...j.parameters?.docs?.source},description:{story:`The folder is a dependent write for the filter, so creating it waits for the
mail server to confirm the folder before it can be picked as the destination.
The wait is held in the form, which refuses a second submit while it runs.`,...j.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: "New folder — create failed (retry / cancel)",
  render: () => <LiveEditor initialRule={demoRule} onCreateFolder={rejectingCreateFolder("The folder couldn't be created on the mail server. Please try again.")} />,
  play: async ({
    canvasElement
  }) => {
    await createFolderFromTree(canvasElement, "Receipts");
  }
}`,...k.parameters?.docs?.source},description:{story:`The folder create failed on the mail server. The rule is not committed against
a folder that does not exist: the error is surfaced inline with the create form
still open, so the create can be retried or cancelled.`,...k.parameters?.docs?.description}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: "New folder — create timed out (retry / cancel)",
  render: () => <LiveEditor initialRule={demoRule} onCreateFolder={rejectingCreateFolder(TIMEOUT_MESSAGE)} />,
  play: async ({
    canvasElement
  }) => {
    await createFolderFromTree(canvasElement, "Receipts");
  }
}`,...N.parameters?.docs?.source},description:{story:`The folder create was never confirmed within the wait bound. Distinct from a
hard failure — the message names the timeout — and, like a failure, leaves no
folder selected, so no filter is written against it.`,...N.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: "New folder — retry resumes and succeeds",
  render: () => <LiveEditor initialRule={demoRule} onCreateFolder={failThenSucceedCreateFolder()} />,
  play: async ({
    canvasElement
  }) => {
    await createFolderFromTree(canvasElement, "Receipts", "Travel");
    await tick();
    clickText(canvasElement, "Create folder");
  }
}`,...D.parameters?.docs?.source},description:{story:`Retry is a resume: the first attempt times out (the folder was made but not yet
confirmed), and pressing "Create folder" again with the same name resolves —
the hook re-waits on the folder it already made rather than re-creating it, so
the retry the failure message points at actually works.`,...D.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: "New folder — cancel aborts the wait",
  render: () => <LiveEditor initialRule={demoRule} onCreateFolder={abortAwareCreateFolder} />,
  play: async ({
    canvasElement
  }) => {
    await createFolderFromTree(canvasElement, "Receipts");
    await tick();
    clickText(canvasElement, "Cancel");
  }
}`,...A.parameters?.docs?.source},description:{story:`Cancelling while the create is in flight aborts the wait: the create promise
rejects with an AbortError the form swallows, so no destination binds after
the user backed out — the form just closes.`,...A.parameters?.docs?.description}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoRule} labels={[]} />
}`,...P.parameters?.docs?.source},description:{story:'No labels exist yet in the account — the select offers only "No label".',...P.parameters?.docs?.description}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={{
    ...demoRule,
    labelId: "lbl-receipts"
  }} />
}`,...I.parameters?.docs?.source},description:{story:"A rule that already applies a label — the chip renders next to the select.",...I.parameters?.docs?.description}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoRule} labels={Array.from({
    length: 20
  }, (_, i) => ({
    id: \`lbl-\${i}\`,
    name: \`Label \${i + 1}\`,
    color: demoLabels[i % demoLabels.length].color
  }))} />
}`,...M.parameters?.docs?.source},description:{story:"Many labels in the account — the select scrolls rather than the layout growing.",...M.parameters?.docs?.description}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={{
    ...demoRule,
    labelId: "lbl-long"
  }} labels={[{
    id: "lbl-long",
    name: "Quarterly compliance filings that need a second look",
    color: "Purple"
  }, ...demoLabels]} />
}`,...O.parameters?.docs?.source},description:{story:"A long label name truncates in the chip rather than overflowing the row.",...O.parameters?.docs?.description}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoRule} onCreateLabel={mockCreateLabel} />
}`,...$.parameters?.docs?.source},description:{story:`The label select offers a "＋ New label…" option because \`onCreateLabel\` is
wired (issue #26). Choosing it reveals a name field; on resolve the label is
added to the select and picked as the action. Without the prop the option
never shows — the editor stays data-agnostic.`,...$.parameters?.docs?.description}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoRule} onCreateLabel={mockCreateLabelFailure} />
}`,...W.parameters?.docs?.source},description:{story:"Creating a label from the picker can fail — the field stays open with the reason.",...W.parameters?.docs?.description}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoVocabularyRule} />
}`,...V.parameters?.docs?.source},description:{story:'Literal clauses joined with "or", including the ticket-B ListId and FromDomain fields.',...V.parameters?.docs?.description}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    rule: {
      clauses: [{
        id: "c1",
        field: "Subject",
        value: "receipt"
      }],
      matchOperator: "all",
      moveMailboxId: "mbx-receipts",
      scope: "once"
    },
    folders: demoFolders,
    preview: READY(12)
  }
}`,...Y.parameters?.docs?.source},description:{story:'A one-time rule — no name, the commit reads "Apply now".',...Y.parameters?.docs?.description}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    rule: demoRule,
    folders: demoFolders,
    preview: READY(47)
  }
}`,..._.parameters?.docs?.source},description:{story:'Standing scope — the "keep doing this" rule.',..._.parameters?.docs?.description}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    rule: {
      ...demoRule,
      scope: "until",
      until: "2026-09-01",
      name: "Conference"
    },
    folders: demoFolders,
    preview: READY(31)
  }
}`,...q.parameters?.docs?.source},description:{story:"Timed scope — the name and a date the rule stops on.",...q.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <LiveEditor initialRule={demoSenderFallbackRule} />
}`,...B.parameters?.docs?.source},description:{story:`Clauses derived from the selection (#251) as chips: ordinary visible,
editable chips, not an invisible substitution.`,...B.parameters?.docs?.description}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    rule: {
      ...demoRule,
      scope: "until",
      until: "2027-09-01",
      name: "Conference"
    },
    folders: demoFolders,
    preview: READY(31),
    persisted: true
  }
}`,...U.parameters?.docs?.source},description:{story:`Editing a persisted filter (reader #266): scope and expiry stay live and
editable — a standing filter can move to "until a date" and back, or its date
can change. "Just once" drops out of the scope toggle since no saved filter
can hold it.`,...U.parameters?.docs?.description}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    rule: {
      clauses: [],
      matchOperator: "all",
      scope: "once"
    },
    folders: demoFolders,
    preview: READY(0)
  }
}`,...G.parameters?.docs?.source},description:{story:"Nothing to match yet — the commit says why it is blocked.",...G.parameters?.docs?.description}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    rule: demoRule,
    folders: demoFolders,
    preview: {
      status: "loading"
    }
  }
}`,...H.parameters?.docs?.source},description:{story:"The live count while it recomputes — the commit waits for it to settle.",...H.parameters?.docs?.description}}};Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    rule: demoRule,
    folders: demoFolders,
    preview: READY(47, true)
  }
}`,...Q.parameters?.docs?.source},description:{story:`The previewed set changed under the rule — recounting, never blank, and the
"Save rule" button is held disabled until the count that will be applied is
the count on screen (RFC 038's previewed-set-equals-applied-set contract).`,...Q.parameters?.docs?.description}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    rule: demoRule,
    folders: demoFolders,
    preview: {
      status: "error",
      reason: "Couldn't reach the server to count."
    }
  }
}`,...J.parameters?.docs?.source},description:{story:"The preview failed — the count region raises it, the editor stays usable.",...J.parameters?.docs?.description}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => {
    const fields: ClauseField[] = ["From", "Subject", "HasWords", "ListId", "FromDomain"];
    return <div className="space-y-4 p-4">
                <div className="flex flex-wrap gap-2">
                    {fields.map(field => <ClauseChip key={field} clause={{
          id: field,
          field,
          value: clauseFieldLabel(field)
        }} onEdit={() => {}} onRemove={() => {}} />)}
                </div>
                <div className="flex flex-wrap gap-2">
                    <ClauseChip clause={{
          id: "d",
          field: "From",
          value: "receipts@stripe.com",
          derived: true
        }} onEdit={() => {}} onRemove={() => {}} />
                </div>
                <ClauseEditor draft={{
        field: "ListId",
        value: "python-dev.python.org"
      }} mode="edit" onChangeField={() => {}} onChangeValue={() => {}} onSubmit={() => {}} onCancel={() => {}} />
                <div className="space-y-2">
                    <FilterPreviewCount preview={{
          status: "loading"
        }} />
                    <FilterPreviewCount preview={READY(0)} />
                    <FilterPreviewCount preview={READY(412)} />
                    <FilterPreviewCount preview={READY(47, true)} />
                    <FilterPreviewCount preview={{
          status: "error",
          reason: "Couldn't count."
        }} />
                </div>
            </div>;
  }
}`,...X.parameters?.docs?.source},description:{story:"Every clause chip in isolation, including the edit state.",...X.parameters?.docs?.description}}};const sr=["Interactive","MatchOnSenderProperty","MatchOnSubjectProperty","ClauseValueSuggestions","DomainClauseSuggestions","ClauseValueNoMatches","SubjectClauseStaysFreeText","DestinationTree","DestinationNestedFolders","DestinationFlatNamespace","NewFolderInsideAnother","NewFolderCreating","NewFolderCreateFailed","NewFolderCreateTimedOut","NewFolderCreateRetrySucceeds","NewFolderCreateCancelledMidWait","NoLabels","WithLabelSelected","ManyLabels","LongLabelNames","WithNewLabelOption","LabelCreateError","AnyOfTheseClauses","OneTimeMove","Standing","UntilADate","DerivedSenderChips","Persisted","BlockedEmpty","PreviewLoading","PreviewStale","PreviewError","ChipGallery"];export{V as AnyOfTheseClauses,G as BlockedEmpty,X as ChipGallery,R as ClauseValueNoMatches,C as ClauseValueSuggestions,B as DerivedSenderChips,L as DestinationFlatNamespace,x as DestinationNestedFolders,S as DestinationTree,F as DomainClauseSuggestions,b as Interactive,W as LabelCreateError,O as LongLabelNames,M as ManyLabels,g as MatchOnSenderProperty,y as MatchOnSubjectProperty,A as NewFolderCreateCancelledMidWait,k as NewFolderCreateFailed,D as NewFolderCreateRetrySucceeds,N as NewFolderCreateTimedOut,j as NewFolderCreating,T as NewFolderInsideAnother,P as NoLabels,Y as OneTimeMove,U as Persisted,J as PreviewError,H as PreviewLoading,Q as PreviewStale,_ as Standing,E as SubjectClauseStaysFreeText,q as UntilADate,I as WithLabelSelected,$ as WithNewLabelOption,sr as __namedExportsOrder,or as default};
