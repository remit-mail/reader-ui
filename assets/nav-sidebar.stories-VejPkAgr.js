import{j as g}from"./iframe-fYsS-Mr7.js";import{N as f}from"./nav-sidebar-DIqLaT0x.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./label-color-CbbIIEbk.js";import"./roving-focus-CpImUO0P.js";import"./account-service-status-i8tZqwzf.js";import"./badge-CZgi-7XL.js";import"./banner-2MU9qEbR.js";import"./button-S2h7_ODQ.js";import"./x-sSwTlOFF.js";import"./createLucideIcon-B5J0h_XM.js";import"./sparkles-tBYydyJD.js";import"./calendar-days-Bsdw_fPO.js";import"./star-j_TS7MKt.js";import"./chevron-down-Dg-Z7_Bk.js";import"./chevron-right-Fk7PhnMq.js";import"./bell-off-CiNIWXAg.js";import"./circle-alert-CB51jFZQ.js";import"./send-C4SeWUwb.js";import"./folder-D4sEH3xY.js";import"./trash-CtpmnHuk.js";import"./octagon-alert-DwiO4oVu.js";import"./mails-hVcCx1jX.js";import"./file-text-ByqS7Kt2.js";import"./inbox-vF0NtWrK.js";const{expect:I,within:P}=__STORYBOOK_MODULE_TEST__,S=[{id:"acct-personal",label:"Personal",email:"reader@example.com",outboxPending:2,mailboxes:[{id:"personal-inbox",name:"Inbox",role:"inbox",unseen:12},{id:"personal-sent",name:"Sent",role:"sent"},{id:"personal-archive",name:"Archive",role:"archive"},{id:"personal-trash",name:"Trash",role:"trash"},{id:"personal-receipts",name:"Receipts",unseen:3},{id:"personal-travel",name:"Travel"}]},{id:"acct-work",label:"Work",email:"reader@work.example",outboxPending:0,mailboxes:[{id:"work-inbox",name:"Inbox",role:"inbox",unseen:4},{id:"work-sent",name:"Sent",role:"sent"},{id:"work-trash",name:"Trash",role:"trash"}]}],y={id:"acct-archivist",label:"Archivist",email:"archivist@example.com",mailboxes:[{id:"arch-inbox",name:"Inbox",role:"inbox",unseen:1},{id:"arch-sent",name:"Sent",role:"sent"},{id:"arch-trash",name:"Trash",role:"trash"},{id:"arch-clients",name:"Clients"},{id:"arch-invoices",name:"Invoices"},{id:"arch-projects",name:"Projects"},{id:"arch-newsletters",name:"Newsletters"},{id:"arch-receipts",name:"Receipts"},{id:"arch-travel",name:"Travel"},{id:"arch-legal",name:"Legal"},{id:"arch-taxes",name:"Taxes"},{id:"arch-misc",name:"Misc"},{id:"arch-2019",name:"2019"},{id:"arch-2020",name:"2020"}]},Q={title:"Playground/Shipped/Mail/NavSidebar",component:f,parameters:{layout:"fullscreen"},args:{accounts:S,briefUnseen:7,onSelectNav:()=>{}},render:e=>g.jsx("div",{className:"h-screen w-64 border-r border-line",children:g.jsx(f,{...e})})},r={args:{selectedNavId:"personal-inbox"}},s={args:{selectedNavId:"brief"}},n={args:{selectedNavId:"flagged"}},o={args:{selectedNavId:"settings"}},t={args:{selectedNavId:"label:priority",labels:[{id:"label:priority",name:"Priority",color:"Red"},{id:"label:promoties",name:"Promoties",color:"Orange"},{id:"label:notifications",name:"Notifications",color:"Default"}]},play:async({canvasElement:e})=>{const h=P(e).getAllByRole("button").map(b=>b.textContent);await I(h.slice(0,4)).toEqual(["Daily brief7","Priority","Promoties","Notifications"])}},i={args:{accounts:[y],selectedNavId:"arch-inbox"}},v={id:"acct-hostnet",label:"Hostnet",email:"hostnet-user@example.com",mailboxes:[{id:"hn-inbox",name:"Inbox",role:"inbox",fullPath:"INBOX",unseen:8},{id:"hn-drafts",name:"Drafts",role:"drafts",fullPath:"INBOX/Drafts"},{id:"hn-sent",name:"Sent",role:"sent",fullPath:"INBOX/Sent"},{id:"hn-archive",name:"Archive",role:"archive",fullPath:"INBOX/Archive"},{id:"hn-spam",name:"Spam",role:"junk",fullPath:"INBOX/Spam",unseen:3},{id:"hn-trash",name:"Trash",role:"trash",fullPath:"INBOX/Deleted Messages"},{id:"hn-news",name:"Nieuwsbrieven",fullPath:"INBOX/Nieuwsbrieven",unseen:2}]},c={args:{accounts:[{...v,mailboxes:[...v.mailboxes,{id:"hn-locked",name:"Locked",fullPath:"INBOX/Locked",failure:"The mail server refused the last change: Permission denied"}]}],selectedNavId:"hn-inbox"}},l={args:{accounts:[v],selectedNavId:"hn-inbox"}},d={args:{selectedNavId:"outbox"}},m={args:{accounts:[],selectedNavId:"brief"}},p={args:{accounts:[{id:"acct-personal",label:"Personal",email:"reader@example.com",status:"loading",mailboxes:[]}],selectedNavId:"brief"}},u={args:{accounts:[{id:"acct-personal",label:"Personal",email:"reader@example.com",status:"error",onRetry:()=>{},mailboxes:[]}],selectedNavId:"brief"}},a={args:{selectedNavId:"personal-inbox",linkComponent:({navId:e,className:x,ariaLabel:h,title:b,children:N})=>g.jsx("a",{href:`#/${e}`,className:x,"aria-label":h,title:b,children:N})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "personal-inbox"
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "brief"
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "flagged"
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "settings"
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [manyFoldersAccount],
    selectedNavId: "arch-inbox"
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [{
      ...hostnetAccount,
      mailboxes: [...hostnetAccount.mailboxes, {
        id: "hn-locked",
        name: "Locked",
        fullPath: "INBOX/Locked",
        failure: "The mail server refused the last change: Permission denied"
      }]
    }],
    selectedNavId: "hn-inbox"
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [hostnetAccount],
    selectedNavId: "hn-inbox"
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "outbox"
  }
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [],
    selectedNavId: "brief"
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [{
      id: "acct-personal",
      label: "Personal",
      email: "reader@example.com",
      status: "loading",
      mailboxes: []
    }],
    selectedNavId: "brief"
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [{
      id: "acct-personal",
      label: "Personal",
      email: "reader@example.com",
      status: "error",
      onRetry: () => undefined,
      mailboxes: []
    }],
    selectedNavId: "brief"
  }
}`,...u.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source},description:{story:"Each nav row is a real anchor: the linkComponent renders <a href>.",...a.parameters?.docs?.description}}};const V=["Default","Brief","Flagged","Settings","WithLabels","ManyFolders","RefusedFolderChange","Hostnet","WithOutbox","NoAccounts","Loading","LoadError","AsLinks"];export{a as AsLinks,s as Brief,r as Default,n as Flagged,l as Hostnet,u as LoadError,p as Loading,i as ManyFolders,m as NoAccounts,c as RefusedFolderChange,o as Settings,t as WithLabels,d as WithOutbox,V as __namedExportsOrder,Q as default};
