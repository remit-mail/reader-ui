import{j as o}from"./iframe-Dz9ev7_1.js";import{C as n}from"./CalendarViewPlaceholder-B6Fe6wEd.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-RYwrBmYZ.js";const{expect:a,within:s}=__STORYBOOK_MODULE_TEST__,h={title:"Playground/Shipped/Calendar/Not built yet",component:n,parameters:{layout:"fullscreen",docs:{description:{component:`A zoom the ladder offers and does not draw yet.

The route is addressable at all five zooms, so one of them lands on this. What
it has to do is say which of the two things it is: a view that rendered
nothing would be indistinguishable from a month with nothing booked in it,
and the reader would plan around an empty screen.`}}},render:()=>o.jsx("div",{className:"h-dvh bg-canvas",children:o.jsx(n,{})})},e={play:async({canvasElement:r})=>{const t=s(r);await a(t.getByTestId("calendar-placeholder-year")).toHaveTextContent("The year grid arrives with the rest of the zoom ladder."),await a(t.getByText("Not built yet")).toBeVisible(),await a(t.getByText(/Month, Week, Day and Agenda work now\./)).toBeVisible()}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("calendar-placeholder-year")).toHaveTextContent("The year grid arrives with the rest of the zoom ladder.");
    await expect(canvas.getByText("Not built yet")).toBeVisible();
    await expect(canvas.getByText(/Month, Week, Day and Agenda work now\\./)).toBeVisible();
  }
}`,...e.parameters?.docs?.source},description:{story:"It names the zoom it is waiting on, and the four that work today.",...e.parameters?.docs?.description}}};const m=["Year"];export{e as Year,m as __namedExportsOrder,h as default};
