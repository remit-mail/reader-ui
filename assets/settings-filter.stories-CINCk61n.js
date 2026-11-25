import{j as e,H as m}from"./iframe-4Y_dM_UU.js";import"./client-BpBKSbyE.js";import{B as x}from"./bottom-sheet-C2bTCSS7.js";import{Q as b}from"./queryClient-B-_Q6x1O.js";import{aJ as g}from"./react-query.gen-C52jVGEN.js";import{h as p}from"./index-yPRBoKxh.js";import{F as c,E as y}from"./FilterEditor-C0ka5obB.js";import"./preload-helper-PPVm8Dsz.js";import"./client.gen-84yaupxO.js";import"./request-breadcrumbs-d-JFnrHf.js";import"./api-BX6GFMBA.js";import"./app-info-BsoZZlWQ.js";import"./network-error-tuI5IsFH.js";import"./cn-IyxL_b2c.js";import"./overlay-scope-Cd_Y4Jaa.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DGD_JTED.js";import"./ErrorBanner-BIsjZreP.js";import"./button-BNcng5Oi.js";import"./info-BW9KySQg.js";import"./createLucideIcon-DkKJcbI9.js";import"./triangle-alert-Bnrh-J2F.js";import"./circle-alert-Z6J3DHRJ.js";import"./x-Cy-ShthB.js";import"./bug-report-Ca4X2TPn.js";import"./useTranslation-DNmopoz8.js";import"./filter-rule-CPGV50Cj.js";import"./filter-rule-editor-J-ow7I34.js";import"./folder-tree-lS__Eg2V.js";import"./filter-clause-chip-C2qtLrRK.js";import"./suggest-list-CjdWvGEm.js";import"./input-BVRvisgp.js";import"./select-ddVD-RDW.js";import"./chevron-down-qwKh9shH.js";import"./plus-PRuHRyZn.js";import"./loader-circle-Bx4Yqfec.js";import"./folder-tree-picker-DcJnzJvt.js";import"./folder-row-DwoEVzVA.js";import"./chevron-right-DdPAKdYb.js";import"./check-DSdQDF54.js";import"./folder-C3sBa3fi.js";import"./new-folder-action-CzyiZDAz.js";import"./new-folder-form-COvAljl1.js";import"./field-label-UzlVOcad.js";import"./search-Cl8zJdKp.js";import"./label-chip-BdNnltY-.js";import"./label-color-CbbIIEbk.js";import"./segmented-control-BMMnmHxf.js";import"./useCreateMailbox-a1zE9gx8.js";import"./mailbox-name-CfEfTTjc.js";import"./useMutation-DOEmXLBu.js";import"./enums-Cgr9j7ds.js";import"./list-pages-BCUbyyea.js";import"./organize-model-kmpTaIUf.js";import"./circle-check-BNqdDyMv.js";const{expect:d,userEvent:o,waitFor:S,within:w}=__STORYBOOK_MODULE_TEST__,l="acc-1",u=[{id:"mbx-inbox",label:"Inbox",path:"INBOX"},{id:"mbx-archive",label:"Archive",path:"INBOX/Archive"},{id:"mbx-receipts",label:"Receipts",path:"INBOX/Receipts"},{id:"mbx-travel",label:"Travel",path:"INBOX/Travel"},{id:"mbx-travel-receipts",label:"Receipts",path:"INBOX/Travel/Receipts"},{id:"mbx-trash",label:"Trash",path:"INBOX/Prullenbak"}],h=[{id:"lbl-receipts",name:"Receipts",color:"Blue"},{id:"lbl-travel",name:"Travel",color:"Green"}],f=(a={})=>({filterId:"f-1",accountConfigId:l,name:"Receipts",scope:"Standing",state:"Active",disabledReason:"None",ruleChangedAt:0,actionChangedAt:0,matchOperator:"And",literalClauses:[{field:"From",value:"receipts@stripe.com"},{field:"Subject",value:"invoice"}],actionLabelId:"None",actionMailboxId:"mbx-receipts",createdAt:0,updatedAt:0,priority:0,stop:!1,rule:{version:1,test:{test:"allof",tests:[]}},...a});function E(){return new b({defaultOptions:{queries:{retry:!1},mutations:{retry:!1}}})}function v({children:a}){return e.jsx(g,{client:E(),children:e.jsx(y,{children:e.jsxs("div",{className:"relative mx-auto h-dvh w-full shrink-0 overflow-hidden bg-surface sm:my-6 sm:h-[760px] sm:w-[390px] sm:rounded-[2rem] sm:border sm:border-line sm:shadow-sm",children:[e.jsx("div",{className:"divide-y divide-line opacity-50",children:Array.from({length:8}).map((r,s)=>e.jsxs("div",{className:"flex items-start gap-3 px-row-inset py-2.5",children:[e.jsx("div",{className:"mt-0.5 size-7 shrink-0 rounded-full bg-surface-sunken"}),e.jsxs("div",{className:"min-w-0 flex-1 space-y-1",children:[e.jsx("div",{className:"h-2.5 w-1/3 rounded bg-surface-sunken"}),e.jsx("div",{className:"h-2 w-2/3 rounded bg-surface-sunken"})]})]},s))}),e.jsx(x,{open:!0,onClose:()=>{},label:"Filter rule",children:a})]})})})}const Ae={title:"Playground/Shipped/Settings/Filters",parameters:{layout:"fullscreen"}},t={name:"Edit Standing Rule",render:()=>e.jsx(v,{children:e.jsx(c,{accountId:l,filter:f(),folders:u,labels:h,onClose:()=>{}})})},i={name:"Edit Until A Date",render:()=>e.jsx(v,{children:e.jsx(c,{accountId:l,filter:f({name:"Conference",scope:"Temporary",expiresAt:"2027-09-01T23:59:59+00:00"}),folders:u,labels:h,onClose:()=>{}})})},n={...t,parameters:{msw:{handlers:[p.post("/api/accounts/:accountId/organize/preview",()=>m.json({matchedCount:8,messageIds:[]})),p.patch("/api/accounts/:accountId/filters/:filterId",()=>m.json({message:"A filter with that name already exists."},{status:409}))]}},play:async({canvasElement:a})=>{const r=w(a);await o.clear(r.getByLabelText("Rule name")),await o.type(r.getByLabelText("Rule name"),"Travel");const s=r.getByRole("button",{name:"Save rule"});await S(()=>d(s).toBeEnabled()),await o.click(s),await d(await r.findByText("A filter with that name already exists.")).toBeVisible()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "Edit Standing Rule",
  render: () => <SheetStage>
            <FilterEditor accountId={ACCOUNT_ID} filter={makeFilter()} folders={FOLDERS} labels={LABELS} onClose={() => undefined} />
        </SheetStage>
}`,...t.parameters?.docs?.source},description:{story:"A standing literal filter opened for editing.",...t.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Edit Until A Date",
  render: () => <SheetStage>
            <FilterEditor accountId={ACCOUNT_ID} filter={makeFilter({
      name: "Conference",
      scope: "Temporary",
      expiresAt: "2027-09-01T23:59:59+00:00"
    })} folders={FOLDERS} labels={LABELS} onClose={() => undefined} />
        </SheetStage>
}`,...i.parameters?.docs?.source},description:{story:"A temporary filter — the scope loads as until-a-date with the stored date.",...i.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  ...EditStandingRule,
  parameters: {
    msw: {
      handlers: [http.post("/api/accounts/:accountId/organize/preview", () => HttpResponse.json({
        matchedCount: 8,
        messageIds: []
      })), http.patch("/api/accounts/:accountId/filters/:filterId", () => HttpResponse.json({
        message: "A filter with that name already exists."
      }, {
        status: 409
      }))]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.clear(canvas.getByLabelText("Rule name"));
    await userEvent.type(canvas.getByLabelText("Rule name"), "Travel");
    const save = canvas.getByRole("button", {
      name: "Save rule"
    });
    await waitFor(() => expect(save).toBeEnabled());
    await userEvent.click(save);
    await expect(await canvas.findByText("A filter with that name already exists.")).toBeVisible();
  }
}`,...n.parameters?.docs?.source}}};const Be=["EditStandingRule","EditUntilADate","SaveRefused"];export{t as EditStandingRule,i as EditUntilADate,n as SaveRefused,Be as __namedExportsOrder,Ae as default};
