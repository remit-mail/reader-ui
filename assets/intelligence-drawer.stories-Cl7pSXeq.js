import{j as e,r as w}from"./iframe-fYsS-Mr7.js";import{A as j}from"./avatar-aV0gIO8j.js";import{I as y}from"./intelligence-panel-t5-LqEno.js";import{R as T}from"./refresh-button-dz-qy9Hh.js";import{S as R}from"./shell-top-bar-C7lTWvBK.js";import{g as v,C as k,j as b,n as N}from"./MessageToolbar-Cu2QyZxF.js";import{I as C}from"./info-CITyUvnK.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./category-presentation-4vprz89G.js";import"./badge-CZgi-7XL.js";import"./button-S2h7_ODQ.js";import"./calendar-event-chip-D78Phz7N.js";import"./calendar-color-CqvBY603.js";import"./repeat-DUzgTyc4.js";import"./createLucideIcon-B5J0h_XM.js";import"./mail-CSMuoKF3.js";import"./globe-DMBwvAOE.js";import"./calendar-failure-note-yrQatvg_.js";import"./triangle-alert-C5hLOYcH.js";import"./calendar-invite-card-C_V_bQer.js";import"./attendee-row-CC3KxCPl.js";import"./minus-DMpYC7y2.js";import"./x-sSwTlOFF.js";import"./clock-BU-oGQ2u.js";import"./check-ClpQiEYg.js";import"./calendar-clash-strip-15mhh4pl.js";import"./calendar-parse-badge-QZmVvp_G.js";import"./file-text-ByqS7Kt2.js";import"./map-pin-N9se7Rv0.js";import"./trash-CtpmnHuk.js";import"./bell-off-CiNIWXAg.js";import"./calendar-slot-offers-DHc_VmpG.js";import"./calendar-suggestion-list-1B1pDz5T.js";import"./sparkles-tBYydyJD.js";import"./event-suggestion-card-DoyfbFTH.js";import"./blocked-reason--dVpmaO7.js";import"./plus-BgwexbCS.js";import"./intelligence-section-DXYf8NgO.js";import"./calendar-days-Bsdw_fPO.js";import"./reply-D3av_T3Q.js";import"./enums-CyACTv6m.js";import"./segmented-control-BCWH9RHF.js";import"./star-j_TS7MKt.js";import"./circle-alert-CB51jFZQ.js";import"./circle-check-big-BMVVfRDA.js";import"./refresh-cw-gk6LWOr6.js";import"./app-top-bar-WM7LvCZb.js";import"./attention-dot-idoc_C2L.js";import"./app-shell-types-ghPNSO3w.js";import"./dialog-BR3DSJf0.js";import"./overlay-scope-DZJ3IC5F.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DEMTiskN.js";import"./dialog-backdrop-_RGzPBbS.js";import"./menu-DUwnioRQ.js";import"./search-bar-DqmCamMM.js";import"./search-chip-input-D4XWueM2.js";import"./search-token-chip-Dy8Zk48a.js";import"./search-DRlMz3O5.js";import"./bug-Cw5ZFcYe.js";import"./intelligence-toggle-Cy_o4O4C.js";import"./mail-action-toolbar-ZhPLzQ-I.js";import"./reply-all-CvY-YYIb.js";import"./folder-input-CAj8Id1L.js";import"./keymap-CyS2Ww4t.js";import"./react-query.gen-B1_4DilO.js";import"./ErrorState-DvRHnVcx.js";import"./folder-tree-picker-BV--A7J7.js";import"./folder-tree-ZE9Jqoy_.js";import"./folder-row-D5Tk1_7R.js";import"./chevron-right-Fk7PhnMq.js";import"./folder-D4sEH3xY.js";import"./input-Ejju9bJ0.js";import"./new-folder-action-CVMEqH87.js";import"./new-folder-form-eDB475yn.js";import"./field-label-CxW6NJ7W.js";import"./popover-menu-ehwPF20G.js";import"./index-DbNRduy1.js";import"./index-BNekr84Q.js";import"./useCreateMailbox-CLPAs1tg.js";import"./mailbox-name-CfEfTTjc.js";import"./useMutation-BWoFIWmj.js";import"./useMediaQuery-CbqKfMFy.js";import"./use-match-media-DTwR-V5R.js";const f={data:{suggestions:[],day:[],dayLabel:""},actions:{onAddInvite:()=>{},onDeclineInvite:()=>{},onOfferOtherTimes:()=>{},onToggleSlot:()=>{},onAddSuggestion:()=>{},onDismissSuggestion:()=>{},onSelectEvent:()=>{}}},{expect:s,userEvent:l,within:d}=__STORYBOOK_MODULE_TEST__,mt={title:"Playground/Shipped/Mail/Reading/Intelligence drawer",parameters:{layout:"centered",docs:{description:{component:`The intelligence drawer below the desktop tier (#777, #778).

There is no fourth pane here: the rail is a full-screen drawer over the open
message, so it belongs to the thread it was opened for and to nothing else.
It is modal, so it opens only when the reader asks — a DKIM mismatch shows
the banner and leaves the message alone. A drawer that opened itself would
put a scrim over the message, and the reader's next tap would land on the
scrim rather than on Back.

The rule is the app's own: \`useIntelligenceDrawer\` is the hook the phone and
mid-width panes both run on.`}}}},E=390,O=720,S=1100,I=640,B={sender:{name:"Mondial Relay",email:"delivery.notice.4421@gmail.example",trust:"unknown",firstSeenLabel:"today",inboundCount:1,replyCount:0},category:{value:"automated"},spamAction:"reportSpam"},r=[{id:"msg-parcel",from:"Mondial Relay",subject:"Your parcel could not be delivered",body:"We attempted to deliver your parcel today and nobody was home. Pay the outstanding €2.40 redelivery fee within 24 hours."},{id:"msg-standup",from:"Alex Rivera",subject:"Standup moved to 10:15",body:"Pushing today's standup back fifteen minutes — the room is taken until then."}],u=()=>{const[a,t]=w.useState(r[0]?.id),o=r.find(n=>n.id===a),i=v(o?.id??null);return e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("div",{className:"flex flex-col overflow-hidden rounded-lg border border-line bg-canvas",style:{width:E,height:O,transform:"translateZ(0)"},children:[o?e.jsxs(e.Fragment,{children:[e.jsxs("header",{className:"flex items-center gap-1 border-b border-line px-2 py-2",children:[e.jsx("button",{type:"button","aria-label":"Back",onClick:()=>t(void 0),className:"inline-flex size-11 items-center justify-center rounded-md text-fg hover:bg-surface-raised",children:e.jsx(k,{className:"size-5"})}),e.jsx("h1",{className:"min-w-0 flex-1 truncate text-sm font-semibold text-fg",children:o.subject}),e.jsx("button",{type:"button","aria-label":"Message details",onClick:i.toggle,className:"inline-flex size-11 items-center justify-center rounded-md text-fg hover:bg-surface-raised",children:e.jsx(C,{className:"size-5"})})]}),e.jsxs("div",{className:"min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm text-fg",children:[e.jsx("p",{className:"mb-2 text-2xs text-fg-subtle",children:o.from}),e.jsx("p",{children:o.body})]})]}):e.jsx("ul",{className:"flex flex-col",children:r.map(n=>e.jsx("li",{children:e.jsxs("button",{type:"button",onClick:()=>t(n.id),className:"flex w-full flex-col items-start gap-0.5 border-b border-line px-4 py-3 text-left hover:bg-surface-raised",children:[e.jsx("span",{className:"text-sm font-semibold text-fg",children:n.from}),e.jsx("span",{className:"text-sm text-fg-muted",children:n.subject})]})},n.id))}),e.jsx(b,{isOpen:i.isOpen,onClose:i.close,ariaLabel:"Message details",side:"right",children:e.jsx(y,{data:B,calendar:f,hideCloseButton:!0})})]}),e.jsx("p",{className:"font-mono text-2xs text-fg-subtle",children:`/mail/inbox${o?`/${o.id}`:""}`})]})},x=async a=>{await l.click(d(a).getByLabelText("Message details"))},c={render:()=>e.jsx(u,{}),play:async({canvasElement:a})=>{const t=d(a);await s(t.queryByRole("dialog")).toBeNull(),await s(t.getByLabelText("Back")).toBeVisible()}},m={render:()=>e.jsx(u,{}),play:async({canvasElement:a})=>{await x(a),await s(d(a).getByRole("dialog")).toBeVisible()}},p={render:()=>e.jsx(u,{}),play:async({canvasElement:a})=>{const t=d(a);await x(a),await s(t.getByRole("dialog")).toBeVisible(),await l.click(t.getAllByLabelText("Close menu")[1]),await s(t.queryByRole("dialog")).toBeNull(),await l.click(t.getByLabelText("Back")),await l.click(t.getByText("Standup moved to 10:15")),await s(t.queryByRole("dialog")).toBeNull(),await s(t.getByText("/mail/inbox/msg-standup")).toBeVisible()}},D=()=>{const a=v(r[0]?.id??null),[t,o]=w.useState("");return e.jsxs("div",{className:"flex flex-col overflow-hidden rounded-lg border border-line bg-canvas",style:{width:S,height:I,transform:"translateZ(0)"},children:[e.jsx(R,{search:{value:t,scope:"global",onChange:o,onClear:()=>o(""),onClearQuery:()=>o(""),onRemoveChip:()=>{}},onCompose:()=>{},onReportBug:()=>{},onOpenSettings:()=>{},refreshControl:e.jsx(T,{state:"idle",label:"Refresh all accounts",onRefresh:()=>{}}),account:e.jsx(j,{name:"Reader Example",email:"reader@example.com",size:"sm"})}),e.jsx(N,{hasThread:!0,intelligenceOpen:a.isOpen,canToggleIntelligence:!0,onToggleIntelligence:a.toggle}),e.jsxs("div",{className:"min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm text-fg",children:[e.jsx("h1",{className:"text-lg font-semibold leading-snug",children:r[0]?.subject}),e.jsx("p",{className:"mt-1 text-2xs text-fg-subtle",children:r[0]?.from}),e.jsx("p",{className:"mt-4 max-w-2xl",children:r[0]?.body})]}),e.jsx(b,{isOpen:a.isOpen,onClose:a.close,ariaLabel:"Message details",side:"right",children:e.jsx(y,{data:B,calendar:f,hideCloseButton:!0})})]})},h={render:()=>e.jsx(D,{}),play:async({canvasElement:a})=>{const t=d(a);await l.click(t.getByRole("button",{name:"Show intelligence sidebar"}));const o=t.getByRole("dialog",{name:"Message details"});await s(o).toBeVisible(),await s(o).not.toContainElement(t.getByRole("button",{name:"Hide intelligence sidebar"}));const i=d(o).getAllByLabelText("Close menu")[1];await s(i).toBeVisible(),await l.click(i),await s(t.queryByRole("dialog",{name:"Message details"})).toBeNull(),await s(t.getByRole("button",{name:"Show intelligence sidebar"})).toHaveAttribute("aria-pressed","false")}},g={name:"Open Over Thread (dark)",parameters:{theme:"dark"},render:()=>e.jsx(u,{}),play:async({canvasElement:a})=>{await x(a)}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <PhoneReader />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await expect(canvas.getByLabelText("Back")).toBeVisible();
  }
}`,...c.parameters?.docs?.source},description:{story:`The warned message as it opens: the banner's own wording, and nothing over
it. A mismatch is what the panel explains, never a reason to cover the
message with it — a scrim there takes the reader's next tap, Back included.`,...c.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <PhoneReader />,
  play: async ({
    canvasElement
  }) => {
    await openDetails(canvasElement);
    await expect(within(canvasElement).getByRole("dialog")).toBeVisible();
  }
}`,...m.parameters?.docs?.source},description:{story:"The drawer over the message it was opened for.",...m.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <PhoneReader />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await openDetails(canvasElement);
    await expect(canvas.getByRole("dialog")).toBeVisible();

    // The scrim carries the same name as the header's close button and comes
    // first in the drawer, so the visible control is the second of the two.
    await userEvent.click(canvas.getAllByLabelText("Close menu")[1]);
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await userEvent.click(canvas.getByLabelText("Back"));
    await userEvent.click(canvas.getByText("Standup moved to 10:15"));
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await expect(canvas.getByText("/mail/inbox/msg-standup")).toBeVisible();
  }
}`,...p.parameters?.docs?.source},description:{story:`Dismissed, and gone for the next message too: the drawer is held against the
thread it was opened for, so nothing carries it forward.`,...p.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <MidWidthReader />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Show intelligence sidebar"
    }));
    const drawer = canvas.getByRole("dialog", {
      name: "Message details"
    });
    await expect(drawer).toBeVisible();

    // The toggle stays in the toolbar the drawer covers. Nothing lifts it over
    // the surface it opened, so a press aimed at it reaches the drawer.
    await expect(drawer).not.toContainElement(canvas.getByRole("button", {
      name: "Hide intelligence sidebar"
    }));

    // The header's X, not the scrim that shares its name: the second of the
    // two, and the one a reader can see.
    const close = within(drawer).getAllByLabelText("Close menu")[1];
    await expect(close).toBeVisible();
    await userEvent.click(close);
    await expect(canvas.queryByRole("dialog", {
      name: "Message details"
    })).toBeNull();
    await expect(canvas.getByRole("button", {
      name: "Show intelligence sidebar"
    })).toHaveAttribute("aria-pressed", "false");
  }
}`,...h.parameters?.docs?.source},description:{story:`The toggle the drawer covers. It is the only way into this surface for a
message with no warning on it, so the drawer lands on it — and stays there:
the toggle is the way in and nothing else. Getting back out is the drawer's
own job, and its X sits clear of the toggle to do it (#747).`,...h.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "Open Over Thread (dark)",
  parameters: {
    theme: "dark"
  },
  render: () => <PhoneReader />,
  play: async ({
    canvasElement
  }) => {
    await openDetails(canvasElement);
  }
}`,...g.parameters?.docs?.source},description:{story:"The drawer over the dark theme.",...g.parameters?.docs?.description}}};const pt=["Closed","OpenOverThread","DismissedAndNotCarried","CoveredToggle","OpenOverThreadDark"];export{c as Closed,h as CoveredToggle,p as DismissedAndNotCarried,m as OpenOverThread,g as OpenOverThreadDark,pt as __namedExportsOrder,mt as default};
