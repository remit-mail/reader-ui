import{r as b,j as f}from"./iframe-Dz9ev7_1.js";import{C as w}from"./compose-action-bar-DbY_HrS7.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CLbVgqC1.js";import"./cn-d2XQ1MEC.js";import"./loader-circle-C6jTFX4E.js";import"./createLucideIcon-RYwrBmYZ.js";import"./send-Drm6iBwR.js";import"./trash-2-0YleYOuI.js";import"./paperclip-CCYkVloo.js";const{expect:t,fn:h,userEvent:y,within:v}=__STORYBOOK_MODULE_TEST__,H={title:"Design System/Compose/ComposeActionBar",component:w,parameters:{layout:"padded",docs:{description:{component:`Send, Discard, and what the draft is doing. Send is never greyed out and
never silent: a state that cannot send carries the sentence that says why,
and the press reports it.`}}},args:{send:{status:"ready"},onSend:h(),onBlocked:h(),onDiscard:h(),save:{status:"idle"}}},c={},i={args:{save:{status:"saving"}}},l={args:{save:{status:"saved"}}},p={args:{save:{status:"error"}}},o={name:"Unsaved — the draft has no To address yet",args:{send:{status:"blocked",reason:"Add a To address before sending."},save:{status:"unsaved",reason:"Not saved — add a To address to keep this draft."}},play:async({canvasElement:e})=>{const a=v(e);await t(a.getByRole("status")).toHaveTextContent("Not saved — add a To address to keep this draft.")}},m={name:"Sending — also while the pending draft is written",args:{send:{status:"sending"}}},r={name:"Blocked — nobody to send to",args:{send:{status:"blocked",reason:"Add a To address before sending."}},render:e=>{const[a,n]=b.useState();return f.jsxs("div",{className:"space-y-2",children:[a&&f.jsx("div",{role:"alert","data-testid":"compose-unavailable",className:"rounded-md bg-danger-soft px-3 py-2 text-sm text-danger",children:a}),f.jsx(w,{...e,onBlocked:s=>{e.onBlocked(s),n(s)}})]})},play:async({args:e,canvasElement:a})=>{const n=v(a);await y.click(n.getByRole("button",{name:"Send"})),await t(n.getByTestId("compose-unavailable")).toHaveTextContent("Add a To address before sending."),await t(e.onSend).not.toHaveBeenCalled()}},d={name:"Attach — pick one or more files",args:{onAttach:h()},play:async({args:e,canvasElement:a})=>{const n=v(a);await t(n.getByRole("button",{name:"Attach files"})).toBeInTheDocument();const s=new File(["%PDF-1.4"],"report.pdf",{type:"application/pdf"}),S=new File(["notes"],"notes.txt",{type:"text/plain"});await y.upload(n.getByTestId("compose-attach-input"),[s,S]),await t(e.onAttach).toHaveBeenCalledWith([s,S])}},u={name:"Blocked — the account cannot send",args:{send:{status:"blocked",reason:"This account can't send mail until SMTP is configured."}}},g={name:"Blocked — mail is off for this account",args:{send:{status:"blocked",reason:"Mail is turned off for this account, so it cannot send. Turn Mail back on for this account in Settings to send from it."}},play:async({args:e,canvasElement:a})=>{const n=v(a);await y.click(n.getByRole("button",{name:"Send"})),await t(e.onBlocked).toHaveBeenCalledWith("Mail is turned off for this account, so it cannot send. Turn Mail back on for this account in Settings to send from it."),await t(e.onSend).not.toHaveBeenCalled()}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:"{}",...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    save: {
      status: "saving"
    }
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    save: {
      status: "saved"
    }
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    save: {
      status: "error"
    }
  }
}`,...p.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Unsaved — the draft has no To address yet",
  args: {
    send: {
      status: "blocked",
      reason: "Add a To address before sending."
    },
    save: {
      status: "unsaved",
      reason: "Not saved — add a To address to keep this draft."
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Not saved — add a To address to keep this draft.");
  }
}`,...o.parameters?.docs?.source},description:{story:`Nothing has been written to the server yet and nothing will be until the
draft has a To address to be created against. Silence here was the worst of
both: the text was not being kept, and the composer looked exactly like one
that had nothing to keep. The sentence names To rather than "a recipient",
which a message addressed only in Cc already has.`,...o.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Sending — also while the pending draft is written",
  args: {
    send: {
      status: "sending"
    }
  }
}`,...m.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "Blocked — nobody to send to",
  args: {
    send: {
      status: "blocked",
      reason: "Add a To address before sending."
    }
  },
  render: args => {
    const [reason, setReason] = useState<string>();
    return <div className="space-y-2">
                {reason && <div role="alert" data-testid="compose-unavailable" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                        {reason}
                    </div>}
                <ComposeActionBar {...args} onBlocked={next => {
        args.onBlocked(next);
        setReason(next);
      }} />
            </div>;
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Send"
    }));
    await expect(canvas.getByTestId("compose-unavailable")).toHaveTextContent("Add a To address before sending.");
    await expect(args.onSend).not.toHaveBeenCalled();
  }
}`,...r.parameters?.docs?.source},description:{story:`Send is never greyed out. Pressing it with nobody to send to reports the
reason where the app would raise its banner — a control that swallowed the
press would be the dead button this bar exists to avoid.`,...r.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "Attach — pick one or more files",
  args: {
    onAttach: fn()
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Attach files"
    })).toBeInTheDocument();
    const report = new File(["%PDF-1.4"], "report.pdf", {
      type: "application/pdf"
    });
    const notes = new File(["notes"], "notes.txt", {
      type: "text/plain"
    });
    await userEvent.upload(canvas.getByTestId("compose-attach-input"), [report, notes]);
    await expect(args.onAttach).toHaveBeenCalledWith([report, notes]);
  }
}`,...d.parameters?.docs?.source},description:{story:`The paperclip opens the file picker, and every file picked is handed on in
one call — several files are one gesture, not one each.`,...d.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "Blocked — the account cannot send",
  args: {
    send: {
      status: "blocked",
      reason: "This account can't send mail until SMTP is configured."
    }
  }
}`,...u.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "Blocked — mail is off for this account",
  args: {
    send: {
      status: "blocked",
      reason: "Mail is turned off for this account, so it cannot send. Turn Mail back on for this account in Settings to send from it."
    }
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Send"
    }));
    await expect(args.onBlocked).toHaveBeenCalledWith("Mail is turned off for this account, so it cannot send. Turn Mail back on for this account in Settings to send from it.");
    await expect(args.onSend).not.toHaveBeenCalled();
  }
}`,...g.parameters?.docs?.source}}};const F=["Ready","Saving","Saved","SaveFailed","NotSavedYet","Sending","NoRecipient","AttachFiles","SmtpMissing","MailOff"];export{d as AttachFiles,g as MailOff,r as NoRecipient,o as NotSavedYet,c as Ready,p as SaveFailed,l as Saved,i as Saving,m as Sending,u as SmtpMissing,F as __namedExportsOrder,H as default};
