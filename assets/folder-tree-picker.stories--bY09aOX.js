import{j as t,r as i}from"./iframe-4Y_dM_UU.js";import{F as A}from"./folder-tree-picker-DcJnzJvt.js";import{W as H,F as K,a as _}from"./selection-wizard-BCujZtpz.js";import"./preload-helper-PPVm8Dsz.js";import"./folder-tree-lS__Eg2V.js";import"./folder-row-DwoEVzVA.js";import"./cn-IyxL_b2c.js";import"./chevron-right-DdPAKdYb.js";import"./createLucideIcon-DkKJcbI9.js";import"./check-DSdQDF54.js";import"./folder-C3sBa3fi.js";import"./circle-alert-Z6J3DHRJ.js";import"./input-BVRvisgp.js";import"./new-folder-action-CzyiZDAz.js";import"./new-folder-form-COvAljl1.js";import"./button-BNcng5Oi.js";import"./field-label-UzlVOcad.js";import"./search-Cl8zJdKp.js";import"./wizard-steps-M1TSt1Tg.js";import"./filter-rule-CPGV50Cj.js";import"./badge-BALHcx9W.js";import"./blocked-reason-THUdDQwz.js";import"./filter-clause-chip-C2qtLrRK.js";import"./suggest-list-CjdWvGEm.js";import"./select-ddVD-RDW.js";import"./chevron-down-qwKh9shH.js";import"./x-Cy-ShthB.js";import"./plus-PRuHRyZn.js";import"./use-modal-focus-DGD_JTED.js";import"./overlay-scope-Cd_Y4Jaa.js";import"./keymap-dispatch-DTaqnLKC.js";import"./arrow-left-BNIPL2_q.js";import"./progress-bar-BQ_ueebZ.js";import"./search-conversion-notice-C_tMjLmQ.js";import"./search-conversion-CKvDqwbt.js";import"./folder-input-DFYsKLGy.js";import"./info-BW9KySQg.js";import"./segmented-control-BMMnmHxf.js";import"./arrow-right-DOTg9lLA.js";import"./triangle-alert-Bnrh-J2F.js";import"./loader-circle-Bx4Yqfec.js";const S=[{id:"mbx-inbox",label:"Inbox",path:"INBOX",isCurrent:!0},{id:"mbx-archive",label:"Archive",path:"Archive"},{id:"mbx-sent",label:"Sent",path:"Sent Items"},{id:"mbx-spam",label:"Spam",path:"Junk"},{id:"mbx-trash",label:"Trash",path:"Deleted Messages"},{id:"mbx-travel",label:"Travel",path:"Travel"},{id:"mbx-travel-flights",label:"Flights",path:"Travel/Flights"},{id:"mbx-travel-hotels",label:"Hotels",path:"Travel/Hotels"},{id:"mbx-travel-hotels-receipts",label:"Receipts",path:"Travel/Hotels/Receipts"},{id:"mbx-travel-trains",label:"Trains",path:"Travel/Trains"},{id:"mbx-finance",label:"Finance",path:"Finance"},{id:"mbx-finance-invoices",label:"Invoices",path:"Finance/Invoices"},{id:"mbx-finance-invoices-2025",label:"2025",path:"Finance/Invoices/2025"},{id:"mbx-finance-invoices-2026",label:"2026",path:"Finance/Invoices/2026"},{id:"mbx-finance-tax",label:"Tax",path:"Finance/Tax"},{id:"mbx-family",label:"Family",path:"Family"},{id:"mbx-news",label:"Newsletters",path:"Newsletters"},{id:"mbx-news-tech",label:"Tech",path:"Newsletters/Tech"},{id:"mbx-news-design",label:"Design",path:"Newsletters/Design"},{id:"mbx-work",label:"Work",path:"Work"},{id:"mbx-work-projects",label:"Projects",path:"Work/Projects"},{id:"mbx-work-apollo",label:"Apollo",path:"Work/Projects/Apollo"},{id:"mbx-work-borealis",label:"Borealis",path:"Work/Projects/Borealis"},{id:"mbx-work-recruiting",label:"Recruiting",path:"Work/Recruiting"}],X=[{id:"mbx-inbox",label:"Inbox",path:"INBOX",isCurrent:!0},{id:"mbx-archive",label:"Archive",path:"Archive"},{id:"mbx-work",label:"Work",path:"Work"},{id:"mbx-workshop",label:"Workshop",path:"Workshop"},{id:"mbx-sent",label:"Sent",path:"Sent Items"},{id:"mbx-trash",label:"Trash",path:"Deleted Messages"}],J=[...S,...Array.from({length:36},(e,r)=>({id:`mbx-client-${r}`,label:`Client ${String(r+1).padStart(2,"0")}`,path:`Work/Projects/Client ${String(r+1).padStart(2,"0")}`}))],$e={title:"Design System/Folders/FolderTreePicker",component:A,parameters:{layout:"centered"}};function I({children:e}){return t.jsx("div",{className:"flex h-[560px] w-[360px] flex-col overflow-hidden rounded-lg border border-line bg-surface font-sans text-fg shadow-lg",children:e})}let D=0;const O=(e,r)=>new Promise(a=>{D+=1,setTimeout(()=>a({id:`mbx-created-${D}`,label:e,path:r?`${r}/${e}`:e}),400)}),V=()=>new Promise(()=>{}),z=e=>()=>Promise.reject(new Error(e));function n({options:e=S,onCreateFolder:r=O,delimiter:a}){const[d,p]=i.useState(),[m,L]=i.useState(e);return t.jsx(I,{children:t.jsx(A,{folders:m,selectedId:d,delimiter:a,onSelect:p,onCreateFolder:(C,W,B)=>r(C,W,B).then(R=>(L(q=>[...q,R]),R))})})}const h={name:"Default (collapsed to top level)",render:()=>t.jsx(n,{})},j={name:"No create affordance",render:()=>{const e=()=>{const[r,a]=i.useState();return t.jsx(I,{children:t.jsx(A,{folders:S,selectedId:r,onSelect:a})})};return t.jsx(e,{})}},N={name:"Long list (scrolls)",render:()=>t.jsx(n,{options:J})},u={name:"Flat namespace (server reports no delimiter)",render:()=>t.jsx(n,{options:X,delimiter:""})},f={name:"No folders",render:()=>t.jsx(n,{options:[]})},$=(e,r)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set?.call(e,r),e.dispatchEvent(new Event("input",{bubbles:!0}))},G=(e,r)=>{const a=e.querySelector('input[type="search"]');a&&$(a,r)},l=(e,r)=>{e.querySelector(`button[aria-label="${r}"]`)?.click()},M=(e,r)=>{Array.from(e.querySelectorAll("button")).find(a=>a.textContent?.trim()===r)?.click()},c=(e,r)=>{const a=e.querySelector('input:not([type="search"])');a&&$(a,r)},o=()=>new Promise(e=>setTimeout(e,60)),s=async(e,...r)=>{for(const a of r)l(e,`Move to ${a}`),await o()},v={name:"A folder opened (children and its New folder)",render:()=>t.jsx(n,{}),play:async({canvasElement:e})=>{await s(e,"Travel")}},w={name:"Opened three levels deep",render:()=>t.jsx(n,{}),play:async({canvasElement:e})=>{await s(e,"Travel","Hotels","Receipts")}},b={name:"Filtered (ancestors opened for context)",render:()=>t.jsx(n,{}),play:async({canvasElement:e})=>{G(e,"rec")}},E={name:"Create a top-level folder",render:()=>t.jsx(n,{}),play:async({canvasElement:e})=>{l(e,"New folder"),await o(),c(e,"Insurance")}},y={name:"Create a folder inside an opened one",render:()=>t.jsx(n,{}),play:async({canvasElement:e})=>{await s(e,"Travel"),l(e,"New folder inside Travel"),await o(),c(e,"Car hire")}},x={name:"Create — waiting for the server",render:()=>t.jsx(n,{onCreateFolder:V}),play:async({canvasElement:e})=>{await s(e,"Finance"),l(e,"New folder inside Finance"),await o(),c(e,"Mortgage"),await o(),M(e,"Create folder")}},k={name:"Create — failed (retry in place)",render:()=>t.jsx(n,{onCreateFolder:z("The mail server refused the folder name. Try another one.")}),play:async({canvasElement:e})=>{await s(e,"Finance"),l(e,"New folder inside Finance"),await o(),c(e,"Mortgage"),await o(),M(e,"Create folder")}},F={name:"Create — kept while the list moves",render:()=>t.jsx(n,{}),play:async({canvasElement:e})=>{await s(e,"Travel"),l(e,"New folder inside Travel"),await o(),c(e,"Car hire"),await o(),await s(e,"Finance")}},g={name:"Create — failed after the list moved",render:()=>t.jsx(n,{onCreateFolder:z("The mail server refused the folder name. Try another one.")}),play:async({canvasElement:e})=>{await s(e,"Travel"),l(e,"New folder inside Travel"),await o(),c(e,"Car hire"),await o(),M(e,"Create folder"),await o(),await s(e,"Finance")}},Q=["match","folder","rule","review"];function U(){const[e,r]=i.useState(),[a,d]=i.useState(S),p=a.find(m=>m.id===e);return t.jsx(H,{title:"Move to",subtitle:"Pick a destination",steps:Q,step:"folder",onBack:()=>{},onExit:()=>{},footer:t.jsx(_,{onBack:()=>{},nextLabel:"Continue",onNext:()=>{},blockedReason:p?void 0:"Pick a folder to move into."}),children:t.jsx(K,{folders:a,mailboxId:e,onSelect:r,onCreateFolder:(m,L)=>O(m,L).then(C=>(d(W=>[...W,C]),C))})})}const T={name:"Phone — wizard folder step",parameters:{layout:"fullscreen"},globals:{viewport:{value:"mobile"}},render:()=>t.jsx(U,{}),play:async({canvasElement:e})=>{await s(e,"Travel")}};function Y(){const[e,r]=i.useState([]),[a,d]=i.useState("mbx-travel-hotels-receipts");return i.useEffect(()=>{const p=setTimeout(()=>r(S),500);return()=>clearTimeout(p)},[]),t.jsx(I,{children:t.jsx(A,{folders:e,selectedId:a,onSelect:d})})}const P={name:"Selected folder arrives after mount",render:()=>t.jsx(Y,{})};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "Default (collapsed to top level)",
  render: () => <Picker />
}`,...h.parameters?.docs?.source},description:{story:`The list at rest: top level only, one tap deep into anything, with the pinned
"New folder" carrying the kit's dashed add affordance.`,...h.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: "No create affordance",
  render: () => {
    const ReadOnly = () => {
      const [selected, setSelected] = useState<string>();
      return <Frame>
                    <FolderTreePicker folders={folders} selectedId={selected} onSelect={setSelected} />
                </Frame>;
    };
    return <ReadOnly />;
  }
}`,...j.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: "Long list (scrolls)",
  render: () => <Picker options={longFolders} />
}`,...N.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "Flat namespace (server reports no delimiter)",
  render: () => <Picker options={flatFolders} delimiter="" />
}`,...u.parameters?.docs?.source},description:{story:`A flat namespace: every folder sits at the top level and none of them opens,
so a new folder can only be made at the top.`,...u.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "No folders",
  render: () => <Picker options={[]} />
}`,...f.parameters?.docs?.source},description:{story:"An account with nothing to list: the message states that, not a filter.",...f.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: "A folder opened (children and its New folder)",
  render: () => <Picker />,
  play: async ({
    canvasElement
  }) => {
    await expand(canvasElement, "Travel");
  }
}`,...v.parameters?.docs?.source},description:{story:`One tap picks the destination and opens it. The children arrive indented,
with a quieter "New folder" at the end of them — the same action as the
pinned one, subordinate to the folder it sits in.`,...v.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: "Opened three levels deep",
  render: () => <Picker />,
  play: async ({
    canvasElement
  }) => {
    await expand(canvasElement, "Travel", "Hotels", "Receipts");
  }
}`,...w.parameters?.docs?.source},description:{story:`One open branch, three levels deep: the ancestors stay open because the
folder you opened lives inside them.`,...w.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: "Filtered (ancestors opened for context)",
  render: () => <Picker />,
  play: async ({
    canvasElement
  }) => {
    typeFilter(canvasElement, "rec");
  }
}`,...b.parameters?.docs?.source},description:{story:`"rec" matches two nested folders. Their parents open to put them on screen
and read as the branches they are, not as an answer to what was typed.`,...b.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: "Create a top-level folder",
  render: () => <Picker />,
  play: async ({
    canvasElement
  }) => {
    clickAriaLabel(canvasElement, "New folder");
    await tick();
    typeFolderName(canvasElement, "Insurance");
  }
}`,...E.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: "Create a folder inside an opened one",
  render: () => <Picker />,
  play: async ({
    canvasElement
  }) => {
    await expand(canvasElement, "Travel");
    clickAriaLabel(canvasElement, "New folder inside Travel");
    await tick();
    typeFolderName(canvasElement, "Car hire");
  }
}`,...y.parameters?.docs?.source},description:{story:`The folder you opened is the answer to "inside where": the form takes the
place of the action it came from, among that folder's children, and states
the parent as text — so there is no second choice to make.`,...y.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "Create — waiting for the server",
  render: () => <Picker onCreateFolder={neverResolves} />,
  play: async ({
    canvasElement
  }) => {
    await expand(canvasElement, "Finance");
    clickAriaLabel(canvasElement, "New folder inside Finance");
    await tick();
    typeFolderName(canvasElement, "Mortgage");
    await tick();
    clickText(canvasElement, "Create folder");
  }
}`,...x.parameters?.docs?.source},description:{story:`Creating a folder is an IMAP mutation: the form holds until the mail server
confirms the folder, and refuses a second submit while it waits.`,...x.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: "Create — failed (retry in place)",
  render: () => <Picker onCreateFolder={rejects("The mail server refused the folder name. Try another one.")} />,
  play: async ({
    canvasElement
  }) => {
    await expand(canvasElement, "Finance");
    clickAriaLabel(canvasElement, "New folder inside Finance");
    await tick();
    typeFolderName(canvasElement, "Mortgage");
    await tick();
    clickText(canvasElement, "Create folder");
  }
}`,...k.parameters?.docs?.source},description:{story:"The failure is stated where it happened; the form stays open to retry.",...k.parameters?.docs?.description}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: "Create — kept while the list moves",
  render: () => <Picker />,
  play: async ({
    canvasElement
  }) => {
    await expand(canvasElement, "Travel");
    clickAriaLabel(canvasElement, "New folder inside Travel");
    await tick();
    typeFolderName(canvasElement, "Car hire");
    await tick();
    await expand(canvasElement, "Finance");
  }
}`,...F.parameters?.docs?.source},description:{story:`Looking somewhere else does not throw the draft away: opening another folder
closes the branch the form was in, and the form is pinned above the tree with
the typed name and the folder it will be made in.`,...F.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "Create — failed after the list moved",
  render: () => <Picker onCreateFolder={rejects("The mail server refused the folder name. Try another one.")} />,
  play: async ({
    canvasElement
  }) => {
    await expand(canvasElement, "Travel");
    clickAriaLabel(canvasElement, "New folder inside Travel");
    await tick();
    typeFolderName(canvasElement, "Car hire");
    await tick();
    clickText(canvasElement, "Create folder");
    await tick();
    await expand(canvasElement, "Finance");
  }
}`,...g.parameters?.docs?.source},description:{story:"A failure is stated where the user is looking, whatever the list has done.",...g.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: "Phone — wizard folder step",
  parameters: {
    layout: "fullscreen"
  },
  globals: {
    viewport: {
      value: "mobile"
    }
  },
  render: () => <WizardFolderStep />,
  play: async ({
    canvasElement
  }) => {
    await expand(canvasElement, "Travel");
  }
}`,...T.parameters?.docs?.source},description:{story:`The pattern at the size it is used: the wizard's folder step on a phone, with
a folder open so both create actions are on screen at once.`,...T.parameters?.docs?.description}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: "Selected folder arrives after mount",
  render: () => <LateFolders />
}`,...P.parameters?.docs?.source}}};const Be=["Default","WithoutCreate","LongList","FlatNamespace","Empty","Expanded","DeepExpansion","Filtered","CreateTopLevel","CreateSubfolder","CreatePending","CreateFailed","CreateWhileTheListMoves","CreateFailedAfterTheListMoved","PhoneWizardStep","SelectedFolderArrivesAfterMount"];export{k as CreateFailed,g as CreateFailedAfterTheListMoved,x as CreatePending,y as CreateSubfolder,E as CreateTopLevel,F as CreateWhileTheListMoves,w as DeepExpansion,h as Default,f as Empty,v as Expanded,b as Filtered,u as FlatNamespace,N as LongList,T as PhoneWizardStep,P as SelectedFolderArrivesAfterMount,j as WithoutCreate,Be as __namedExportsOrder,$e as default};
