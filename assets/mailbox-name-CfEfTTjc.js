const r=t=>t.hierarchyDelimiter.length===0?[t.fullPath]:t.fullPath.split(t.hierarchyDelimiter),h=t=>{const e=r(t);return e[e.length-1]||t.fullPath};export{h as m};
