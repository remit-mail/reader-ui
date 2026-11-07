import{j as u}from"./iframe-COEer--I.js";import{N as b}from"./nav-sidebar-kyQ2zkCA.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./roving-focus-fDA2XJgQ.js";import"./account-service-status-AqmQ3-eI.js";import"./badge-Cv_dAAay.js";import"./banner-DRWO0m_W.js";import"./button-BKOwcnJQ.js";import"./x-DcmHvAZb.js";import"./createLucideIcon-BvDEQKSa.js";import"./sparkles-CZWEEfpX.js";import"./calendar-days-BigdGwrU.js";import"./star-B6_Gpkjy.js";import"./chevron-down-CVW2Z1s1.js";import"./chevron-right-Bw-e3CYG.js";import"./bell-off-4qZsVAlS.js";import"./circle-alert-BhIdpm6l.js";import"./send-BfCcONkO.js";import"./folder-DoIwiYln.js";import"./trash-2-CqeeiT_r.js";import"./octagon-alert-B4TzhjMB.js";import"./mails-Dg_46Z0V.js";import"./file-text-BoHC87wH.js";import"./inbox-D3hbrtjN.js";const f=[{id:"acct-personal",label:"Personal",email:"reader@example.com",outboxPending:2,mailboxes:[{id:"personal-inbox",name:"Inbox",role:"inbox",unseen:12},{id:"personal-sent",name:"Sent",role:"sent"},{id:"personal-archive",name:"Archive",role:"archive"},{id:"personal-trash",name:"Trash",role:"trash"},{id:"personal-receipts",name:"Receipts",unseen:3},{id:"personal-travel",name:"Travel"}]},{id:"acct-work",label:"Work",email:"reader@work.example",outboxPending:0,mailboxes:[{id:"work-inbox",name:"Inbox",role:"inbox",unseen:4},{id:"work-sent",name:"Sent",role:"sent"},{id:"work-trash",name:"Trash",role:"trash"}]}],I={id:"acct-archivist",label:"Archivist",email:"archivist@example.com",mailboxes:[{id:"arch-inbox",name:"Inbox",role:"inbox",unseen:1},{id:"arch-sent",name:"Sent",role:"sent"},{id:"arch-trash",name:"Trash",role:"trash"},{id:"arch-clients",name:"Clients"},{id:"arch-invoices",name:"Invoices"},{id:"arch-projects",name:"Projects"},{id:"arch-newsletters",name:"Newsletters"},{id:"arch-receipts",name:"Receipts"},{id:"arch-travel",name:"Travel"},{id:"arch-legal",name:"Legal"},{id:"arch-taxes",name:"Taxes"},{id:"arch-misc",name:"Misc"},{id:"arch-2019",name:"2019"},{id:"arch-2020",name:"2020"}]},G={title:"Playground/Shipped/Mail/NavSidebar",component:b,parameters:{layout:"fullscreen"},args:{accounts:f,briefUnseen:7,onSelectNav:()=>{}},render:p=>u.jsx("div",{className:"h-screen w-64 border-r border-line",children:u.jsx(b,{...p})})},a={args:{selectedNavId:"personal-inbox"}},r={args:{selectedNavId:"brief"}},s={args:{selectedNavId:"flagged"}},n={args:{selectedNavId:"settings"}},o={args:{accounts:[I],selectedNavId:"arch-inbox"}},h={id:"acct-hostnet",label:"Hostnet",email:"hostnet-user@example.com",mailboxes:[{id:"hn-inbox",name:"Inbox",role:"inbox",fullPath:"INBOX",unseen:8},{id:"hn-drafts",name:"Drafts",role:"drafts",fullPath:"INBOX/Drafts"},{id:"hn-sent",name:"Sent",role:"sent",fullPath:"INBOX/Sent"},{id:"hn-archive",name:"Archive",role:"archive",fullPath:"INBOX/Archive"},{id:"hn-spam",name:"Spam",role:"junk",fullPath:"INBOX/Spam",unseen:3},{id:"hn-trash",name:"Trash",role:"trash",fullPath:"INBOX/Deleted Messages"},{id:"hn-news",name:"Nieuwsbrieven",fullPath:"INBOX/Nieuwsbrieven",unseen:2}]},t={args:{accounts:[{...h,mailboxes:[...h.mailboxes,{id:"hn-locked",name:"Locked",fullPath:"INBOX/Locked",failure:"The mail server refused the last change: Permission denied"}]}],selectedNavId:"hn-inbox"}},c={args:{accounts:[h],selectedNavId:"hn-inbox"}},i={args:{selectedNavId:"outbox"}},l={args:{accounts:[],selectedNavId:"brief"}},d={args:{accounts:[{id:"acct-personal",label:"Personal",email:"reader@example.com",status:"loading",mailboxes:[]}],selectedNavId:"brief"}},m={args:{accounts:[{id:"acct-personal",label:"Personal",email:"reader@example.com",status:"error",onRetry:()=>{},mailboxes:[]}],selectedNavId:"brief"}},e={args:{selectedNavId:"personal-inbox",linkComponent:({navId:p,className:g,ariaLabel:x,title:v,children:N})=>u.jsx("a",{href:`#/${p}`,className:g,"aria-label":x,title:v,children:N})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "personal-inbox"
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "brief"
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "flagged"
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "settings"
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [manyFoldersAccount],
    selectedNavId: "arch-inbox"
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [hostnetAccount],
    selectedNavId: "hn-inbox"
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    selectedNavId: "outbox"
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: [],
    selectedNavId: "brief"
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...e.parameters?.docs?.source},description:{story:"Each nav row is a real anchor: the linkComponent renders <a href>.",...e.parameters?.docs?.description}}};const J=["Default","Brief","Flagged","Settings","ManyFolders","RefusedFolderChange","Hostnet","WithOutbox","NoAccounts","Loading","LoadError","AsLinks"];export{e as AsLinks,r as Brief,a as Default,s as Flagged,c as Hostnet,m as LoadError,d as Loading,o as ManyFolders,l as NoAccounts,t as RefusedFolderChange,n as Settings,i as WithOutbox,J as __namedExportsOrder,G as default};
