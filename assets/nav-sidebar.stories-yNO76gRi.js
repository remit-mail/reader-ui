import{j as y}from"./iframe-DUn0T08W.js";import{N as w}from"./nav-sidebar-DW2WN5qv.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./folder-tree-lS__Eg2V.js";import"./label-color-CbbIIEbk.js";import"./roving-focus-D9D6kD4K.js";import"./account-service-status-CJJ8FzcR.js";import"./badge-DVSnq8Ns.js";import"./banner-CekMrGzb.js";import"./button-BgYe3szE.js";import"./x-D26GNrGg.js";import"./createLucideIcon-BO9sjSGA.js";import"./sparkles-BtLTmjcv.js";import"./calendar-days-EGloaown.js";import"./star-Cbz_ngPP.js";import"./chevron-down-Cg1fb-Gx.js";import"./chevron-right-D5PcmHU6.js";import"./bell-off-C5CqTBDo.js";import"./circle-alert-Dup3Hpj3.js";import"./send-DHkdV7Sh.js";import"./folder-DUyc8VCE.js";import"./lock-DR18NCnB.js";import"./trash-TQGHNCuP.js";import"./octagon-alert-Dmmw3E67.js";import"./mails-DhngMbOi.js";import"./file-text-a4VOwwvH.js";import"./inbox-CjrXUxPh.js";const{expect:s,userEvent:T,within:B}=__STORYBOOK_MODULE_TEST__,S=[{id:"acct-personal",label:"Personal",email:"reader@example.com",hierarchyDelimiter:"/",outboxPending:2,mailboxes:[{id:"personal-inbox",name:"Inbox",role:"inbox",unseen:12},{id:"personal-sent",name:"Sent",role:"sent"},{id:"personal-archive",name:"Archive",role:"archive"},{id:"personal-trash",name:"Trash",role:"trash"},{id:"personal-receipts",name:"Receipts",unseen:3},{id:"personal-travel",name:"Travel"}]},{id:"acct-work",label:"Work",email:"reader@work.example",hierarchyDelimiter:"/",outboxPending:0,mailboxes:[{id:"work-inbox",name:"Inbox",role:"inbox",unseen:4},{id:"work-sent",name:"Sent",role:"sent"},{id:"work-trash",name:"Trash",role:"trash"}]}],R={id:"acct-archivist",label:"Archivist",email:"archivist@example.com",hierarchyDelimiter:"/",mailboxes:[{id:"arch-inbox",name:"Inbox",role:"inbox",unseen:1},{id:"arch-sent",name:"Sent",role:"sent"},{id:"arch-trash",name:"Trash",role:"trash"},{id:"arch-clients",name:"Clients"},{id:"arch-invoices",name:"Invoices"},{id:"arch-projects",name:"Projects"},{id:"arch-newsletters",name:"Newsletters"},{id:"arch-receipts",name:"Receipts"},{id:"arch-travel",name:"Travel"},{id:"arch-legal",name:"Legal"},{id:"arch-taxes",name:"Taxes"},{id:"arch-misc",name:"Misc"},{id:"arch-2019",name:"2019"},{id:"arch-2020",name:"2020"}]},re={title:"Playground/Shipped/Mail/NavSidebar",component:w,parameters:{layout:"fullscreen"},args:{accounts:S,briefUnseen:7,onSelectNav:()=>{}},render:a=>y.jsx("div",{className:"h-screen w-64 border-r border-line",children:y.jsx(w,{...a})})},t={args:{selectedNavId:"personal-inbox"}},o={args:{selectedNavId:"brief"}},i={args:{selectedNavId:"flagged"}},c={args:{selectedNavId:"settings"}},l={args:{selectedNavId:"label:priority",labels:[{id:"label:priority",name:"Priority",color:"Red"},{id:"label:promoties",name:"Promoties",color:"Orange"},{id:"label:notifications",name:"Notifications",color:"Default"}]},play:async({canvasElement:a})=>{const f=B(a).getAllByRole("button").map(I=>I.textContent);await s(f.slice(0,4)).toEqual(["Daily brief7","Priority","Promoties","Notifications"])}},d={args:{selectedNavId:"personal-inbox",labels:[{id:"label:priority",name:"Priority",color:"Red",unseen:4},{id:"label:promoties",name:"Promoties",color:"Orange",unseen:27},{id:"label:notifications",name:"Notifications",color:"Default"}]}},m={args:{accounts:[R],selectedNavId:"arch-inbox"}},n={id:"acct-hostnet",label:"Hostnet",email:"hostnet-user@example.com",hierarchyDelimiter:"/",mailboxes:[{id:"hn-inbox",name:"Inbox",role:"inbox",fullPath:"INBOX",unseen:8},{id:"hn-drafts",name:"Drafts",role:"drafts",fullPath:"INBOX/Drafts"},{id:"hn-sent",name:"Sent",role:"sent",fullPath:"INBOX/Sent"},{id:"hn-archive",name:"Archive",role:"archive",fullPath:"INBOX/Archive"},{id:"hn-spam",name:"Spam",role:"junk",fullPath:"INBOX/Spam",unseen:3},{id:"hn-trash",name:"Trash",role:"trash",fullPath:"INBOX/Deleted Messages"},{id:"hn-news",name:"Nieuwsbrieven",fullPath:"INBOX/Nieuwsbrieven",unseen:2}]},u={args:{accounts:[{...n,mailboxes:[...n.mailboxes,{id:"hn-locked",name:"Locked",fullPath:"INBOX/Locked",note:{kind:"failure",text:"The mail server refused the last change: Permission denied"}}]}],selectedNavId:"hn-inbox"}},p={args:{accounts:[{...n,mailboxes:[...n.mailboxes,{id:"hn-shared",name:"Team",fullPath:"Shared/Team",note:{kind:"unavailable",text:"The mail server refuses to open this folder. Check its permissions on the server, or unsubscribe from it."}}]}],selectedNavId:"hn-inbox"}},h={args:{accounts:[n],selectedNavId:"hn-inbox"}},b={args:{accounts:[{...n,mailboxes:[...n.mailboxes,{id:"hn-news-tech",name:"Tech",fullPath:"INBOX/Nieuwsbrieven/Tech",unseen:5},{id:"hn-news-tech-rust",name:"Rust",fullPath:"INBOX/Nieuwsbrieven/Tech/Rust"},{id:"hn-receipts",name:"Receipts",fullPath:"INBOX/Receipts"}]}],selectedNavId:"hn-news-tech"},play:async({canvasElement:a})=>{const e=B(a);await s(e.getByText("Rust")).toBeInTheDocument(),await T.click(e.getByRole("button",{name:"Collapse Nieuwsbrieven"})),await s(e.queryByText("Tech")).not.toBeInTheDocument(),await s(e.queryByText("Rust")).not.toBeInTheDocument(),await T.click(e.getByRole("button",{name:"Expand Nieuwsbrieven"})),await s(e.getByText("Rust")).toBeInTheDocument()}},v={args:{selectedNavId:"outbox"}},x={args:{accounts:[],selectedNavId:"brief"}},g={args:{accounts:[{id:"acct-personal",label:"Personal",email:"reader@example.com",hierarchyDelimiter:"/",status:"loading",mailboxes:[]}],selectedNavId:"brief"}},N={args:{accounts:[{id:"acct-personal",label:"Personal",email:"reader@example.com",hierarchyDelimiter:"/",status:"error",onRetry:()=>{},mailboxes:[]}],selectedNavId:"brief"}},r={args:{selectedNavId:"personal-inbox",linkComponent:({navId:a,className:e,ariaLabel:f,title:I,children:P})=>y.jsx("a",{href:`#/${a}`,className:e,"aria-label":f,title:I,children:P})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "personal-inbox"
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "brief"
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "flagged"
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "settings"
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "label:priority",
    labels: [{
      id: "label:priority",
      name: "Priority",
      color: "Red"
    }, {
      id: "label:promoties",
      name: "Promoties",
      color: "Orange"
    }, {
      id: "label:notifications",
      name: "Notifications",
      color: "Default"
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const entries = canvas.getAllByRole("button").map(button => button.textContent);
    await expect(entries.slice(0, 4)).toEqual(["Daily brief7", "Priority", "Promoties", "Notifications"]);
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "personal-inbox",
    labels: [{
      id: "label:priority",
      name: "Priority",
      color: "Red",
      unseen: 4
    }, {
      id: "label:promoties",
      name: "Promoties",
      color: "Orange",
      unseen: 27
    }, {
      id: "label:notifications",
      name: "Notifications",
      color: "Default"
    }]
  }
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [manyFoldersAccount],
    selectedNavId: "arch-inbox"
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [{
      ...hostnetAccount,
      mailboxes: [...hostnetAccount.mailboxes, {
        id: "hn-locked",
        name: "Locked",
        fullPath: "INBOX/Locked",
        note: {
          kind: "failure",
          text: "The mail server refused the last change: Permission denied"
        }
      }]
    }],
    selectedNavId: "hn-inbox"
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [{
      ...hostnetAccount,
      mailboxes: [...hostnetAccount.mailboxes, {
        id: "hn-shared",
        name: "Team",
        fullPath: "Shared/Team",
        note: {
          kind: "unavailable",
          text: "The mail server refuses to open this folder. Check its permissions on the server, or unsubscribe from it."
        }
      }]
    }],
    selectedNavId: "hn-inbox"
  }
}`,...p.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [hostnetAccount],
    selectedNavId: "hn-inbox"
  }
}`,...h.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [{
      ...hostnetAccount,
      mailboxes: [...hostnetAccount.mailboxes, {
        id: "hn-news-tech",
        name: "Tech",
        fullPath: "INBOX/Nieuwsbrieven/Tech",
        unseen: 5
      }, {
        id: "hn-news-tech-rust",
        name: "Rust",
        fullPath: "INBOX/Nieuwsbrieven/Tech/Rust"
      }, {
        id: "hn-receipts",
        name: "Receipts",
        fullPath: "INBOX/Receipts"
      }]
    }],
    selectedNavId: "hn-news-tech"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Rust")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", {
      name: "Collapse Nieuwsbrieven"
    }));
    await expect(canvas.queryByText("Tech")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Rust")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", {
      name: "Expand Nieuwsbrieven"
    }));
    await expect(canvas.getByText("Rust")).toBeInTheDocument();
  }
}`,...b.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "outbox"
  }
}`,...v.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [],
    selectedNavId: "brief"
  }
}`,...x.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [{
      id: "acct-personal",
      label: "Personal",
      email: "reader@example.com",
      hierarchyDelimiter: "/",
      status: "loading",
      mailboxes: []
    }],
    selectedNavId: "brief"
  }
}`,...g.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [{
      id: "acct-personal",
      label: "Personal",
      email: "reader@example.com",
      hierarchyDelimiter: "/",
      status: "error",
      onRetry: () => undefined,
      mailboxes: []
    }],
    selectedNavId: "brief"
  }
}`,...N.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "personal-inbox",
    linkComponent: ({
      navId,
      className,
      ariaLabel,
      title,
      children
    }) => <a href={\`#/\${navId}\`} className={className} aria-label={ariaLabel} title={title}>
                {children}
            </a>
  }
}`,...r.parameters?.docs?.source},description:{story:"Each nav row is a real anchor: the linkComponent renders <a href>.",...r.parameters?.docs?.description}}};const se=["Default","Brief","Flagged","Settings","WithLabels","LabelUnreadCounts","ManyFolders","RefusedFolderChange","UnavailableSharedFolder","Hostnet","NestedFolders","WithOutbox","NoAccounts","Loading","LoadError","AsLinks"];export{r as AsLinks,o as Brief,t as Default,i as Flagged,h as Hostnet,d as LabelUnreadCounts,N as LoadError,g as Loading,m as ManyFolders,b as NestedFolders,x as NoAccounts,u as RefusedFolderChange,c as Settings,p as UnavailableSharedFolder,l as WithLabels,v as WithOutbox,se as __namedExportsOrder,re as default};
