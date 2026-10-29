import{j as r,r as x}from"./iframe-Dz9ev7_1.js";import{C as i}from"./calendar-list-BUyx44dP.js";import"./preload-helper-PPVm8Dsz.js";import"./calendar-color-CqvBY603.js";import"./cn-d2XQ1MEC.js";import"./account-service-status-B8MISXtN.js";import"./badge-Dsqh0My3.js";import"./banner-CcGBhVUA.js";import"./button-CLbVgqC1.js";import"./x-snW7h3us.js";import"./createLucideIcon-RYwrBmYZ.js";import"./chevron-down-COHbBXpp.js";import"./chevron-right-BgpxkwQ0.js";import"./check-D-jt1aUx.js";import"./triangle-alert-BzExaAbk.js";const{expect:s,userEvent:b,within:v}=__STORYBOOK_MODULE_TEST__,j={title:"Design System/Calendar/Calendar list",tags:["proposed"],component:i,parameters:{layout:"padded",docs:{description:{component:`The legend and the filter are the same control, and it never leaves the
screen. Hiding it in a popover would mean reading a coloured grid with the
key in another room.`}}},decorators:[n=>r.jsx("div",{className:"max-w-60 rounded-lg border border-line bg-surface py-2",children:r.jsx(n,{})})]},t=[{id:"c1",accountId:"a1",accountLabel:"Work",name:"Northwind",color:"cal-1"},{id:"c2",accountId:"a1",accountLabel:"Work",name:"On-call",color:"cal-4"},{id:"c3",accountId:"a2",accountLabel:"Personal",name:"Personal",color:"cal-2"},{id:"c4",accountId:"a2",accountLabel:"Personal",name:"Family",color:"cal-3"},{id:"c5",accountId:"a2",accountLabel:"Personal",name:"Travel",color:"cal-6"},{id:"c6",accountId:"a3",accountLabel:"Synthwave Forum",name:"Synth meetups",color:"cal-5"}],l={render:()=>{const[n,e]=x.useState(new Set(t.map(a=>a.id).filter(a=>a!=="c2")));return r.jsx(i,{calendars:t,visible:n,onToggle:a=>e(c=>{const o=new Set(c);return o.delete(a)||o.add(a),o}),onToggleAccount:(a,c)=>e(o=>{const d=new Set(o);for(const y of t)y.accountId===a&&(c?d.add(y.id):d.delete(y.id));return d})})}},p={render:()=>r.jsx(i,{calendars:t,visible:new Set(t.map(n=>n.id)),onToggle:()=>{},onToggleAccount:()=>{},closedAccountIds:["a2"]})},u={render:()=>r.jsx(i,{calendars:t,visible:new Set,onToggle:()=>{}}),play:async({canvasElement:n})=>{const e=v(n);for(const a of e.getAllByRole("checkbox"))await s(a).not.toBeChecked();await s(e.getByText("Travel")).toBeVisible()}},m={render:()=>{const n=t.slice(0,1),[e,a]=x.useState(new Set([n[0].id]));return r.jsx(i,{calendars:n,visible:e,onToggle:c=>a(o=>{const d=new Set(o);return d.delete(c)||d.add(c),d})})},play:async({canvasElement:n})=>{const e=v(n),a=e.getByRole("checkbox",{name:"Northwind"});await s(a).toBeChecked(),await b.click(e.getByText("Northwind")),await s(a).not.toBeChecked()}},h={render:()=>{const n=t.map(e=>e.id==="c1"?{...e,sync:"paused"}:e);return r.jsx(i,{calendars:n,visible:new Set(t.map(e=>e.id)),onToggle:()=>{},onToggleAccount:()=>{}})},play:async({canvasElement:n})=>{const e=v(n);await s(e.getByRole("checkbox",{name:"Northwind"})).toBeChecked(),await s(e.getByText("Northwind: calendar sync off")).toBeInTheDocument()}},g={render:()=>{const[n,e]=x.useState(new Set(t.map(a=>a.id)));return r.jsx(i,{calendars:t,layout:"strip",touch:!0,visible:n,onToggle:a=>e(c=>{const o=new Set(c);return o.delete(a)||o.add(a),o})})},play:async({canvasElement:n})=>{const e=v(n);await s(e.getAllByRole("checkbox")).toHaveLength(t.length);const a=e.getByRole("checkbox",{name:"On-call"});await b.click(e.getByText("On-call")),await s(a).not.toBeChecked(),await s(e.getByRole("checkbox",{name:"Northwind"})).toBeChecked()}},w={render:()=>{const n=t.map(e=>e.id==="c5"?{...e,name:"Harbour rota",readOnly:!0,syncError:"the feed answered HTTP 404"}:e);return r.jsx(i,{calendars:n,visible:new Set(t.map(e=>e.id)),onToggle:()=>{},onToggleAccount:()=>{}})},play:async({canvasElement:n})=>{const e=v(n);await s(e.getByRole("checkbox",{name:"Harbour rota"})).toBeChecked(),await s(e.getByText("Not refreshed: the feed answered HTTP 404")).toBeVisible()}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [visible, setVisible] = useState(new Set(calendars.map(c => c.id).filter(id => id !== "c2")));
    return <CalendarList calendars={calendars} visible={visible} onToggle={id => setVisible(prev => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    })} onToggleAccount={(accountId, nextVisible) => setVisible(prev => {
      const next = new Set(prev);
      for (const calendar of calendars) {
        if (calendar.accountId !== accountId) continue;
        if (nextVisible) next.add(calendar.id);else next.delete(calendar.id);
      }
      return next;
    })} />;
  }
}`,...l.parameters?.docs?.source},description:{story:"Ticking a calendar off is a first-class move, so it takes one click.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <CalendarList calendars={calendars} visible={new Set(calendars.map(c => c.id))} onToggle={() => {}} onToggleAccount={() => {}} closedAccountIds={["a2"]} />
}`,...p.parameters?.docs?.source},description:{story:`An account folded shut. Its calendars are still on the grid — the caret hides
rows, the tick hides events, and the two are not the same thing.`,...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <CalendarList calendars={calendars} visible={new Set()} onToggle={() => {}} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    for (const box of canvas.getAllByRole("checkbox")) {
      await expect(box).not.toBeChecked();
    }
    await expect(canvas.getByText("Travel")).toBeVisible();
  }
}`,...u.parameters?.docs?.source},description:{story:"Everything off: an unticked calendar keeps its swatch outline, so the key survives.",...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const only = calendars.slice(0, 1);
    const [visible, setVisible] = useState(new Set([only[0].id]));
    return <CalendarList calendars={only} visible={visible} onToggle={id => setVisible(prev => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    })} />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const northwind = canvas.getByRole("checkbox", {
      name: "Northwind"
    });
    await expect(northwind).toBeChecked();
    await userEvent.click(canvas.getByText("Northwind"));
    await expect(northwind).not.toBeChecked();
  }
}`,...m.parameters?.docs?.source},description:{story:`One account with one calendar in it, which is what a new install looks like.
The control is still the legend, so it stays on screen: a grid whose single
colour is unexplained is no more readable than one with six.`,...m.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const paused = calendars.map(calendar => calendar.id === "c1" ? {
      ...calendar,
      sync: "paused" as const
    } : calendar);
    return <CalendarList calendars={paused} visible={new Set(calendars.map(c => c.id))} onToggle={() => {}} onToggleAccount={() => {}} />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox", {
      name: "Northwind"
    })).toBeChecked();
    await expect(canvas.getByText("Northwind: calendar sync off")).toBeInTheDocument();
  }
}`,...h.parameters?.docs?.source},description:{story:`A paused provider calendar. Sync stopped; the calendar is still listed, still
coloured and still tickable, so the pause icon is decoration and the words
that carry it sit beside the row rather than inside the tick's name.`,...h.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [visible, setVisible] = useState(new Set(calendars.map(c => c.id)));
    return <CalendarList calendars={calendars} layout="strip" touch visible={visible} onToggle={id => setVisible(prev => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    })} />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("checkbox")).toHaveLength(calendars.length);
    const onCall = canvas.getByRole("checkbox", {
      name: "On-call"
    });
    await userEvent.click(canvas.getByText("On-call"));
    await expect(onCall).not.toBeChecked();
    await expect(canvas.getByRole("checkbox", {
      name: "Northwind"
    })).toBeChecked();
  }
}`,...g.parameters?.docs?.source},description:{story:`The same control on a surface with no room for a rail: a scrolling row of
chips at thumb size. It is laid out differently and it is not a popover —
turning a calendar off stays one press away from the grid.`,...g.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const failing = calendars.map(calendar => calendar.id === "c5" ? {
      ...calendar,
      name: "Harbour rota",
      readOnly: true,
      syncError: "the feed answered HTTP 404"
    } : calendar);
    return <CalendarList calendars={failing} visible={new Set(calendars.map(c => c.id))} onToggle={() => {}} onToggleAccount={() => {}} />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox", {
      name: "Harbour rota"
    })).toBeChecked();
    await expect(canvas.getByText("Not refreshed: the feed answered HTTP 404")).toBeVisible();
  }
}`,...w.parameters?.docs?.source},description:{story:`A subscribed calendar whose feed stopped answering. Its stored events stay
on the grid, and the reason sits under the row in words, because an icon
alone reads as decoration.`,...w.parameters?.docs?.description}}};const P=["Interactive","AccountFolded","AllHidden","SingleCalendar","Paused","AsAStrip","SubscriptionFailed"];export{p as AccountFolded,u as AllHidden,g as AsAStrip,l as Interactive,h as Paused,m as SingleCalendar,w as SubscriptionFailed,P as __namedExportsOrder,j as default};
