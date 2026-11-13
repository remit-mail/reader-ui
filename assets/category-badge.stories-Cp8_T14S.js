import{j as n}from"./iframe-fYsS-Mr7.js";import{g as m}from"./category-presentation-4vprz89G.js";import{c}from"./cn-IyxL_b2c.js";import"./preload-helper-PPVm8Dsz.js";const o=({category:e,size:l="sm",className:i})=>{const s=m(e);return s?n.jsx("span",{className:c("inline-flex items-center rounded border border-line bg-surface-sunken/50 font-medium uppercase tracking-wide text-fg-muted shrink-0",l==="sm"&&"px-1.5 py-0 text-2xs leading-4",l==="md"&&"px-2 py-0.5 text-xs",i),"aria-label":`Category: ${s}`,children:s}):null};o.__docgenInfo={description:`Inline category label for non-personal mail. Renders nothing for \`personal\`
or absent values so the existing list-row layout is unaffected for the
common case.

Visual style matches the muted, low-emphasis aesthetic of the surrounding
row chrome — no color tabs, no full-width pill backgrounds.`,methods:[],displayName:"CategoryBadge",props:{category:{required:!0,tsType:{name:"union",raw:"ThreadCategory | undefined",elements:[{name:"union",raw:`| "uncategorized"
| "personal"
| "newsletter"
| "marketing"
| "automated"
| "transactional"
| "social"
| "coldOutreach"`,elements:[{name:"literal",value:'"uncategorized"'},{name:"literal",value:'"personal"'},{name:"literal",value:'"newsletter"'},{name:"literal",value:'"marketing"'},{name:"literal",value:'"automated"'},{name:"literal",value:'"transactional"'},{name:"literal",value:'"social"'},{name:"literal",value:'"coldOutreach"'}]},{name:"undefined"}]},description:""},size:{required:!1,tsType:{name:"union",raw:'"sm" | "md"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'}]},description:"Larger size for the open-message header. List rows use the default.",defaultValue:{value:'"sm"',computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}}};const y={title:"Design System/Mail/CategoryBadge",tags:["proposed"],component:o,parameters:{layout:"centered"}},d=["newsletter","marketing","automated","transactional","social"],a={render:()=>n.jsx("div",{className:"flex flex-wrap items-center gap-2",children:d.map(e=>n.jsx(o,{category:e,size:"md"},e))})},r={args:{category:"personal",size:"md"}},t={args:{category:"newsletter",size:"sm"}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-2">
            {categories.map(category => <CategoryBadge key={category} category={category} size="md" />)}
        </div>
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    category: "personal",
    size: "md"
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    category: "newsletter",
    size: "sm"
  }
}`,...t.parameters?.docs?.source}}};const h=["AllCategories","PersonalRendersNothing","ListRowSize"];export{a as AllCategories,t as ListRowSize,r as PersonalRendersNothing,h as __namedExportsOrder,y as default};
