import{C as a}from"./confirm-dialog-CiVQifnw.js";import{d as i}from"./label-delete-copy-PBEA3Y6d.js";import"./iframe-fYsS-Mr7.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./overlay-scope-DZJ3IC5F.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DEMTiskN.js";import"./dialog-backdrop-_RGzPBbS.js";const b={title:"Playground/Shipped/Settings/Labels/Delete confirmation",component:a,parameters:{layout:"centered",docs:{description:{component:"The cascade-aware label delete confirmation (issue #26, #335) — the generic\n`ConfirmDialog` driven by `deleteLabelConfirmCopy`'s computed title and\ndescription, exactly as `AccountLabels` in the labels settings route wires\nit. No dedicated component exists for this; reusing `ConfirmDialog` is the\napproved surface, not a placeholder for one."}}}},e={args:{isOpen:!0,...i("Receipts",0),confirmLabel:"Delete label",destructive:!0,onConfirm:()=>{},onCancel:()=>{}}},r={args:{isOpen:!0,...i("Receipts",1),confirmLabel:"Delete label",destructive:!0,onConfirm:()=>{},onCancel:()=>{}}},n={args:{isOpen:!0,...i("Receipts",5),confirmLabel:"Delete label",destructive:!0,onConfirm:()=>{},onCancel:()=>{}}},t={name:"Several Filters (dark)",parameters:{theme:"dark"},args:{isOpen:!0,...i("Receipts",5),confirmLabel:"Delete label",destructive:!0,onConfirm:()=>{},onCancel:()=>{}}},o={args:{isOpen:!0,...i("Receipts",5),confirmLabel:"Delete label",destructive:!0,isBusy:!0,onConfirm:()=>{},onCancel:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    ...deleteLabelConfirmCopy("Receipts", 0),
    confirmLabel: "Delete label",
    destructive: true,
    onConfirm: () => undefined,
    onCancel: () => undefined
  }
}`,...e.parameters?.docs?.source},description:{story:"Nothing references the label — no blast-radius line under the title.",...e.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    ...deleteLabelConfirmCopy("Receipts", 1),
    confirmLabel: "Delete label",
    destructive: true,
    onConfirm: () => undefined,
    onCancel: () => undefined
  }
}`,...r.parameters?.docs?.source},description:{story:"Exactly one filter applies the label — singular wording.",...r.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    ...deleteLabelConfirmCopy("Receipts", 5),
    confirmLabel: "Delete label",
    destructive: true,
    onConfirm: () => undefined,
    onCancel: () => undefined
  }
}`,...n.parameters?.docs?.source},description:{story:"Several filters apply the label — the cascade warning names the count.",...n.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "Several Filters (dark)",
  parameters: {
    theme: "dark"
  },
  args: {
    isOpen: true,
    ...deleteLabelConfirmCopy("Receipts", 5),
    confirmLabel: "Delete label",
    destructive: true,
    onConfirm: () => undefined,
    onCancel: () => undefined
  }
}`,...t.parameters?.docs?.source},description:{story:"Several filters, on the dark theme.",...t.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    ...deleteLabelConfirmCopy("Receipts", 5),
    confirmLabel: "Delete label",
    destructive: true,
    isBusy: true,
    onConfirm: () => undefined,
    onCancel: () => undefined
  }
}`,...o.parameters?.docs?.source},description:{story:`The delete is in flight — confirm disables rather than allowing a second
 concurrent delete.`,...o.parameters?.docs?.description}}};const v=["Unused","OneFilter","SeveralFilters","SeveralFiltersDark","Busy"];export{o as Busy,r as OneFilter,n as SeveralFilters,t as SeveralFiltersDark,e as Unused,v as __namedExportsOrder,b as default};
