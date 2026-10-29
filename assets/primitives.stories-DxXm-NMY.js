import{j as e}from"./iframe-Dz9ev7_1.js";import{A as n}from"./avatar-BqhrHOCc.js";import{B as s}from"./badge-Dsqh0My3.js";import{B as a}from"./button-CLbVgqC1.js";import{C as g,a as f,b,c as N,S as v}from"./security-select-DIQfYm0Z.js";import{F as h}from"./field-label-AfH6c15u.js";import{I as r}from"./input-Dno_Kr9T.js";import{P as j}from"./password-input-Bg2_Hgld.js";import{S}from"./select-adBjnrbk.js";import{M as w}from"./mail-lJ4T2vNk.js";import{S as y}from"./search-qhk-8fnj.js";import{L as B}from"./lock-Bft-XLq3.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./eye-off-CU3aUrjl.js";import"./createLucideIcon-RYwrBmYZ.js";import"./chevron-down-COHbBXpp.js";const K={title:"Design System/Primitives/Overview"},t={render:()=>e.jsxs("div",{className:"flex flex-wrap items-center gap-3 p-8",children:[e.jsx(a,{variant:"primary",children:"Primary"}),e.jsx(a,{variant:"secondary",children:"Secondary"}),e.jsx(a,{variant:"ghost",children:"Ghost"}),e.jsx(a,{variant:"danger",children:"Danger"}),e.jsx(a,{variant:"primary",size:"sm",icon:e.jsx(w,{className:"size-3.5"}),children:"Compose"}),e.jsx(a,{variant:"primary",disabled:!0,children:"Disabled"}),e.jsx(a,{variant:"ghost",size:"touch",icon:e.jsx(w,{className:"size-4"}),"aria-label":"Touch-sized icon button"})]})},i={render:()=>e.jsxs("div",{className:"flex flex-wrap items-center gap-3 p-8",children:[e.jsx(s,{tone:"neutral",children:"newsletter"}),e.jsx(s,{tone:"accent",children:"personal"}),e.jsx(s,{tone:"positive",dot:!0,children:"Known sender"}),e.jsx(s,{tone:"warning",children:"social"}),e.jsx(s,{tone:"danger",children:"spam"})]})},o={render:()=>e.jsxs("div",{className:"flex items-center gap-4 p-8",children:[e.jsx(n,{name:"Alice Tan",size:"sm"}),e.jsx(n,{name:"Priya Natarajan",size:"md"}),e.jsx(n,{name:"Marcus Webb",size:"lg"}),e.jsx(n,{name:"Remit CI",email:"ci@remit.example",size:"md"})]})},l={render:()=>e.jsxs("div",{className:"max-w-sm space-y-3 p-8",children:[e.jsx(r,{placeholder:"Plain input"}),e.jsx(r,{icon:e.jsx(y,{className:"size-4"}),placeholder:"Search mail"})]})},d={render:()=>e.jsxs("div",{className:"max-w-sm space-y-3 p-8",children:[e.jsxs("div",{children:[e.jsx(h,{htmlFor:"pw-empty",children:"Password"}),e.jsx(j,{id:"pw-empty",autoComplete:"current-password",placeholder:"Your password"})]}),e.jsxs("div",{children:[e.jsx(h,{htmlFor:"pw-filled",children:"Password or app password"}),e.jsx(j,{id:"pw-filled",autoComplete:"current-password",defaultValue:"hunter2-app-password"})]}),e.jsx("p",{className:"text-xs text-fg-subtle",children:"The toggle starts hidden. Its hit area is 44px square and sits beside the value, never over it."})]})},c={render:()=>e.jsxs("div",{className:"max-w-sm space-y-3 p-8",children:[e.jsx("div",{className:"border-b border-line px-3 py-2",children:e.jsx(r,{variant:"inline",placeholder:"Filter folders"})}),e.jsx("div",{className:"border-b border-line px-3 py-2",children:e.jsx(r,{variant:"inline",icon:e.jsx(y,{className:"size-4"}),placeholder:"Move to…"})})]})},p={render:()=>e.jsxs("div",{className:"max-w-sm space-y-3 p-8",children:[e.jsxs("div",{children:[e.jsx(h,{htmlFor:"host",children:"Host"}),e.jsx(r,{id:"host",placeholder:"imap.example.com"})]}),e.jsxs("div",{children:[e.jsx(h,{htmlFor:"security",children:"Security"}),e.jsx(v,{id:"security",defaultValue:"tls"})]})]})},m={render:()=>e.jsxs("div",{className:"max-w-sm space-y-3 p-8",children:[e.jsx(v,{defaultValue:"tls"}),e.jsx(v,{defaultValue:"starttls"}),e.jsx(v,{defaultValue:"none"})]})},u={render:()=>e.jsxs("div",{className:"max-w-sm space-y-3 p-8",children:[e.jsxs(S,{defaultValue:"tls",children:[e.jsx("option",{value:"tls",children:"TLS/SSL"}),e.jsx("option",{value:"starttls",children:"STARTTLS"}),e.jsx("option",{value:"none",children:"None (insecure)"})]}),e.jsxs(S,{icon:e.jsx(B,{className:"size-4"}),defaultValue:"starttls",children:[e.jsx("option",{value:"tls",children:"TLS/SSL"}),e.jsx("option",{value:"starttls",children:"STARTTLS"}),e.jsx("option",{value:"none",children:"None (insecure)"})]})]})},x={render:()=>e.jsx("div",{className:"max-w-md p-8",children:e.jsxs(g,{raised:!0,children:[e.jsx(f,{children:e.jsx(b,{children:"Card title"})}),e.jsx(N,{children:"Hairline border, minimal shadow. Surfaces and text are fully token-driven so this flips cleanly between light and dark."})]})})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-3 p-8">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" size="sm" icon={<Mail className="size-3.5" />}>
                Compose
            </Button>
            <Button variant="primary" disabled>
                Disabled
            </Button>
            <Button variant="ghost" size="touch" icon={<Mail className="size-4" />} aria-label="Touch-sized icon button" />
        </div>
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-3 p-8">
            <Badge tone="neutral">newsletter</Badge>
            <Badge tone="accent">personal</Badge>
            <Badge tone="positive" dot>
                Known sender
            </Badge>
            <Badge tone="warning">social</Badge>
            <Badge tone="danger">spam</Badge>
        </div>
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4 p-8">
            <Avatar name="Alice Tan" size="sm" />
            <Avatar name="Priya Natarajan" size="md" />
            <Avatar name="Marcus Webb" size="lg" />
            <Avatar name="Remit CI" email="ci@remit.example" size="md" />
        </div>
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-sm space-y-3 p-8">
            <Input placeholder="Plain input" />
            <Input icon={<Search className="size-4" />} placeholder="Search mail" />
        </div>
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-sm space-y-3 p-8">
            <div>
                <FieldLabel htmlFor="pw-empty">Password</FieldLabel>
                <PasswordInput id="pw-empty" autoComplete="current-password" placeholder="Your password" />
            </div>
            <div>
                <FieldLabel htmlFor="pw-filled">Password or app password</FieldLabel>
                <PasswordInput id="pw-filled" autoComplete="current-password" defaultValue="hunter2-app-password" />
            </div>
            <p className="text-xs text-fg-subtle">
                The toggle starts hidden. Its hit area is 44px square and sits beside
                the value, never over it.
            </p>
        </div>
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-sm space-y-3 p-8">
            <div className="border-b border-line px-3 py-2">
                <Input variant="inline" placeholder="Filter folders" />
            </div>
            <div className="border-b border-line px-3 py-2">
                <Input variant="inline" icon={<Search className="size-4" />} placeholder="Move to…" />
            </div>
        </div>
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-sm space-y-3 p-8">
            <div>
                <FieldLabel htmlFor="host">Host</FieldLabel>
                <Input id="host" placeholder="imap.example.com" />
            </div>
            <div>
                <FieldLabel htmlFor="security">Security</FieldLabel>
                <SecuritySelect id="security" defaultValue="tls" />
            </div>
        </div>
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-sm space-y-3 p-8">
            <SecuritySelect defaultValue="tls" />
            <SecuritySelect defaultValue="starttls" />
            <SecuritySelect defaultValue="none" />
        </div>
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-sm space-y-3 p-8">
            <Select defaultValue="tls">
                <option value="tls">TLS/SSL</option>
                <option value="starttls">STARTTLS</option>
                <option value="none">None (insecure)</option>
            </Select>
            <Select icon={<Lock className="size-4" />} defaultValue="starttls">
                <option value="tls">TLS/SSL</option>
                <option value="starttls">STARTTLS</option>
                <option value="none">None (insecure)</option>
            </Select>
        </div>
}`,...u.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-md p-8">
            <Card raised>
                <CardHeader>
                    <CardTitle>Card title</CardTitle>
                </CardHeader>
                <CardBody>
                    Hairline border, minimal shadow. Surfaces and text are fully
                    token-driven so this flips cleanly between light and dark.
                </CardBody>
            </Card>
        </div>
}`,...x.parameters?.docs?.source}}};const O=["Buttons","Badges","Avatars","Inputs","PasswordInputs","InlineInputs","LabeledFields","SecuritySelects","Selects","Cards"];export{o as Avatars,i as Badges,t as Buttons,x as Cards,c as InlineInputs,l as Inputs,p as LabeledFields,d as PasswordInputs,m as SecuritySelects,u as Selects,O as __namedExportsOrder,K as default};
