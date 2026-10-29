import{j as e}from"./iframe-Dz9ev7_1.js";import{B as r}from"./BlockedImagesNotice-DESIqKQu.js";import"./preload-helper-PPVm8Dsz.js";const h={title:"Playground/Shipped/Mail/Reading/Blocked images notice",component:r,parameters:{layout:"padded",docs:{description:{component:`The bar above a message body whose remote images were not loaded.

Two different facts wear the same strip. Images held back for privacy are a
default the reader can lift, so the bar offers both ways out and neither
control ever greys out. A blocked sender is an instruction the reader already
gave — \`BlockedFlag\`: never load images, even on explicit click — so the bar
carries no controls at all and says why instead, because an image-free
message that explains nothing is indistinguishable from a broken one.`}}}},l=()=>{},s={blockedImageCount:3,canAlwaysTrust:!0,isTrustPending:!1,isSenderBlocked:!1,onLoadOnce:l,onAlwaysTrust:l},o=({children:m})=>e.jsx("div",{className:"w-full max-w-2xl",children:m}),a={render:()=>e.jsx(o,{children:e.jsx(r,{...s})})},n={render:()=>e.jsx(o,{children:e.jsx(r,{...s,isTrustPending:!0})})},t={render:()=>e.jsx(o,{children:e.jsx(r,{...s,canAlwaysTrust:!1})})},d={render:()=>e.jsx(o,{children:e.jsx(r,{...s,isSenderBlocked:!0})})},c={render:()=>e.jsx(o,{children:e.jsx(r,{...s,isSenderBlocked:!0,canAlwaysTrust:!0})})},i={render:()=>e.jsx(o,{children:e.jsx(r,{...s,blockedImageCount:1})})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Column>
            <BlockedImagesNotice {...base} />
        </Column>
}`,...a.parameters?.docs?.source},description:{story:"The default: images held back, and two ways to let them in.",...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Column>
            <BlockedImagesNotice {...base} isTrustPending />
        </Column>
}`,...n.parameters?.docs?.source},description:{story:"The trust toggle is in flight. The button stays pressable and says so.",...n.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Column>
            <BlockedImagesNotice {...base} canAlwaysTrust={false} />
        </Column>
}`,...t.parameters?.docs?.source},description:{story:"No parseable From-address, so there is nobody to trust — only Load once.",...t.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Column>
            <BlockedImagesNotice {...base} isSenderBlocked />
        </Column>
}`,...d.parameters?.docs?.source},description:{story:"A blocked sender: no way in, and the reason stated rather than left blank.",...d.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <Column>
            <BlockedImagesNotice {...base} isSenderBlocked canAlwaysTrust />
        </Column>
}`,...c.parameters?.docs?.source},description:{story:"Blocked outranks trusted — a sender carrying both is still blocked.",...c.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Column>
            <BlockedImagesNotice {...base} blockedImageCount={1} />
        </Column>
}`,...i.parameters?.docs?.source},description:{story:"One image, and the copy counts it as one.",...i.parameters?.docs?.description}}};const k=["Privacy","Trusting","NoSenderToTrust","SenderBlocked","SenderBlockedAndTrusted","SingleImage"];export{t as NoSenderToTrust,a as Privacy,d as SenderBlocked,c as SenderBlockedAndTrusted,i as SingleImage,n as Trusting,k as __namedExportsOrder,h as default};
