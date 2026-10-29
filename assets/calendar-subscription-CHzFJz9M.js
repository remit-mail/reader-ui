const a=e=>URL.canParse(e)?new URL(e).host:"an iCalendar feed",o=e=>`Read-only: from ${a(e)}. Change it where the feed comes from.`;export{a,o as s};
