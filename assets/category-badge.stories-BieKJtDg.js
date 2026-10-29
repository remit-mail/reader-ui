import{j as t}from"./iframe-Dz9ev7_1.js";import{C as o}from"./category-badge-BW7csvyg.js";import"./preload-helper-PPVm8Dsz.js";import"./category-presentation-BDbE0cN-.js";import"./cn-d2XQ1MEC.js";const d={title:"Design System/Mail/CategoryBadge",tags:["proposed"],component:o,parameters:{layout:"centered"}},n=["newsletter","marketing","automated","transactional","social"],e={render:()=>t.jsx("div",{className:"flex flex-wrap items-center gap-2",children:n.map(a=>t.jsx(o,{category:a,size:"md"},a))})},r={args:{category:"personal",size:"md"}},s={args:{category:"newsletter",size:"sm"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap items-center gap-2">
            {categories.map(category => <CategoryBadge key={category} category={category} size="md" />)}
        </div>
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    category: "personal",
    size: "md"
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    category: "newsletter",
    size: "sm"
  }
}`,...s.parameters?.docs?.source}}};const l=["AllCategories","PersonalRendersNothing","ListRowSize"];export{e as AllCategories,s as ListRowSize,r as PersonalRendersNothing,l as __namedExportsOrder,d as default};
