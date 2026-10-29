import{r as g,j as f}from"./iframe-Dz9ev7_1.js";import{C as y}from"./compose-attachments-BTL_brLt.js";import"./preload-helper-PPVm8Dsz.js";import"./attachment-file-lxgUGUUR.js";import"./cn-d2XQ1MEC.js";import"./x-snW7h3us.js";import"./createLucideIcon-RYwrBmYZ.js";import"./loader-circle-C6jTFX4E.js";import"./circle-alert-CcoNAO8C.js";import"./paperclip-CCYkVloo.js";const{expect:a,fn:d,userEvent:u,within:c}=__STORYBOOK_MODULE_TEST__,C={title:"Design System/Compose/ComposeAttachments",component:y,parameters:{layout:"padded",docs:{description:{component:`The files on a draft while it is being written (#679). The app owns the
upload and hands back per-file state; a refusal carries the server's own
sentence, which names the file, its size and the cap.`}}},args:{onRemove:d(),onRetry:d()}},m={key:"att-1",filename:"Q3 board pack.pdf",sizeBytes:2411724,state:{status:"attached"}},w={key:"att-2",filename:"site-plan.png",sizeBytes:486120,state:{status:"attached"}},p='"site-survey.mov" is 31.4 MB, over the 25.0 MB a message can carry.',o={name:"Attached — two files ready to send",args:{items:[m,w]},play:async({canvasElement:t})=>{const e=c(t).getAllByTestId("compose-attachment");await a(e).toHaveLength(2),await a(e[0]).toHaveTextContent("Q3 board pack.pdf"),await a(e[0]).toHaveTextContent("2.3 MB")}},r={name:"Uploading — one file still on its way",args:{items:[m,{key:"att-3",filename:"minutes.docx",sizeBytes:88064,state:{status:"uploading"}}]}},s={name:"Refused — the file is over the message limit",args:{items:[m,{key:"refused-1",filename:"site-survey.mov",sizeBytes:32925696,state:{status:"failed",reason:p,retryable:!1}}]},render:t=>{const[n,e]=g.useState(t.items);return f.jsx(y,{...t,items:n,onRemove:l=>{t.onRemove(l),e(v=>v.filter(h=>h.key!==l))}})},play:async({args:t,canvasElement:n})=>{const e=c(n);await a(e.getByRole("alert")).toHaveTextContent(p),await a(e.queryByRole("button",{name:"Try again"})).not.toBeInTheDocument(),await u.click(e.getByRole("button",{name:"Remove site-survey.mov"})),await a(t.onRemove).toHaveBeenCalledWith("refused-1"),await a(e.queryByRole("alert")).not.toBeInTheDocument(),await a(e.getAllByTestId("compose-attachment")).toHaveLength(1)}},i={name:"Failed — the upload dropped, and can be tried again",args:{items:[{key:"att-4",filename:"contract.pdf",sizeBytes:1204224,state:{status:"failed",reason:'"contract.pdf" did not finish uploading: the connection dropped. Try again.',retryable:!0}}]},play:async({args:t,canvasElement:n})=>{const e=c(n);await u.click(e.getByRole("button",{name:"Try again"})),await a(t.onRetry).toHaveBeenCalledWith("att-4")}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Attached — two files ready to send",
  args: {
    items: [boardPack, sitePlan]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByTestId("compose-attachment");
    await expect(rows).toHaveLength(2);
    await expect(rows[0]).toHaveTextContent("Q3 board pack.pdf");
    await expect(rows[0]).toHaveTextContent("2.3 MB");
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "Uploading — one file still on its way",
  args: {
    items: [boardPack, {
      key: "att-3",
      filename: "minutes.docx",
      sizeBytes: 88_064,
      state: {
        status: "uploading"
      }
    }]
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "Refused — the file is over the message limit",
  args: {
    items: [boardPack, {
      key: "refused-1",
      filename: "site-survey.mov",
      sizeBytes: 32_925_696,
      state: {
        status: "failed",
        reason: OVER_LIMIT_REASON,
        retryable: false
      }
    }]
  },
  render: args => {
    const [items, setItems] = useState(args.items);
    return <ComposeAttachments {...args} items={items} onRemove={key => {
      args.onRemove(key);
      setItems(current => current.filter(item => item.key !== key));
    }} />;
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(OVER_LIMIT_REASON);
    await expect(canvas.queryByRole("button", {
      name: "Try again"
    })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", {
      name: "Remove site-survey.mov"
    }));
    await expect(args.onRemove).toHaveBeenCalledWith("refused-1");
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(canvas.getAllByTestId("compose-attachment")).toHaveLength(1);
  }
}`,...s.parameters?.docs?.source},description:{story:`A file over the cap is refused by the server before a byte moves, and the
row stays until it is removed, carrying the refusal. There is no retry: the
same file would be refused the same way.`,...s.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Failed — the upload dropped, and can be tried again",
  args: {
    items: [{
      key: "att-4",
      filename: "contract.pdf",
      sizeBytes: 1_204_224,
      state: {
        status: "failed",
        reason: '"contract.pdf" did not finish uploading: the connection dropped. Try again.',
        retryable: true
      }
    }]
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Try again"
    }));
    await expect(args.onRetry).toHaveBeenCalledWith("att-4");
  }
}`,...i.parameters?.docs?.source}}};const H=["Attached","Uploading","OverLimit","UploadFailed"];export{o as Attached,s as OverLimit,i as UploadFailed,r as Uploading,H as __namedExportsOrder,C as default};
