import{j as e}from"./iframe-Dz9ev7_1.js";import{S as a}from"./shield-alert-D0TTzBU-.js";function i({authenticity:s,onOpenIntelligence:n}){return s.dkimMismatch?e.jsxs("div",{className:"flex items-start gap-2 rounded-none border-b border-danger/20 bg-danger-soft px-5 py-2.5 text-sm",children:[e.jsx(a,{className:"mt-0.5 size-4 shrink-0 text-danger"}),e.jsxs("p",{className:"flex-1 leading-snug text-fg",children:["This message claims to be from"," ",e.jsx("span",{className:"font-semibold",children:s.fromDomain})," but was sent",s.dkimDomain?` via ${s.dkimDomain}`:" from a different domain","."," ",n&&e.jsx("button",{type:"button",onClick:n,className:"font-medium text-danger hover:underline",children:"Why?"})]})]}):null}i.__docgenInfo={description:`Danger banner rendered above the thread body when DKIM mismatch is detected.
Design spec (03-reading-and-intelligence.md): "a danger banner renders above
the body: 'This message claims to be a company but was sent from a personal
mailbox.' with a 'Why?' link that opens/highlights this section."

The link sits in the sentence at the sentence's own size. Set apart as
smaller, right-floated chrome it read as a label rather than the way in.`,methods:[],displayName:"AuthenticityBanner",props:{authenticity:{required:!0,tsType:{name:"signature",type:"object",raw:`{
    /**
     * Domain of the From header address
     */
    fromDomain: string;
    /**
     * DKIM signing domain (d=) that was compared, when a signature is present
     */
    dkimDomain?: string;
    /**
     * True when DKIM signing domain(s) are present and none aligns with the From domain
     */
    dkimMismatch: boolean;
    /**
     * How the From display name relates to the From domain. Present only for a message the provider's own filter already classified as spam, and only when the sender is not bulk-shaped (no List-Unsubscribe) — absence means the comparison was never made, never that it found nothing.
     */
    displayNameCorrespondence?: RemitImapDisplayNameCorrespondence;
    /**
     * Registrable domains (eTLD+1) the body's links point at, excluding the From address's own registrable domain. Present only for a message the provider's own filter already classified as spam; an empty array means every link stayed on the sender's domain, absence means the comparison was never made.
     */
    offDomainLinkDomains?: Array<string>;
    /**
     * Registrable domain of the first verified DKIM \`header.d\` in trusted Authentication-Results order, or the reserved literal \`unverified\` when no identity could be established. Unlike \`dkimDomain\`, which is the unverified \`d=\` claim the sender wrote, this is only set from a signature the trusted Authentication-Results reported as passing. Absent for messages classified before the field existed.
     */
    signerDomain?: string;
    /**
     * SPF-checked envelope-from domain (\`smtp.mailfrom\`, falling back to \`smtp.helo\`) from the trusted Authentication-Results. Absent when the trusted header carried no SPF clause, or for messages classified before the field existed.
     */
    envelopeDomain?: string;
    /**
     * Messages this account had already seen for the sender's standing key when this message arrived. A snapshot frozen at derivation time, deliberately not a live read — a message classified when the key stood at 340 always reads 340. Absent for messages classified before the field existed.
     */
    signerMessageCount?: number;
    /**
     * Epoch milliseconds this account first saw the sender's standing key, snapshotted at derivation time alongside \`signerMessageCount\`. Absent for messages classified before the field existed.
     */
    signerFirstSeenAt?: number;
}`,signature:{properties:[{key:"fromDomain",value:{name:"string",required:!0},description:"Domain of the From header address"},{key:"dkimDomain",value:{name:"string",required:!1},description:"DKIM signing domain (d=) that was compared, when a signature is present"},{key:"dkimMismatch",value:{name:"boolean",required:!0},description:"True when DKIM signing domain(s) are present and none aligns with the From domain"},{key:"displayNameCorrespondence",value:{name:"union",raw:"'Corresponds' | 'Lookalike' | 'ForeignAddress' | 'Unrelated' | 'NoClaim'",elements:[{name:"literal",value:"'Corresponds'"},{name:"literal",value:"'Lookalike'"},{name:"literal",value:"'ForeignAddress'"},{name:"literal",value:"'Unrelated'"},{name:"literal",value:"'NoClaim'"}],required:!1},description:"How the From display name relates to the From domain. Present only for a message the provider's own filter already classified as spam, and only when the sender is not bulk-shaped (no List-Unsubscribe) — absence means the comparison was never made, never that it found nothing."},{key:"offDomainLinkDomains",value:{name:"Array",elements:[{name:"string"}],raw:"Array<string>",required:!1},description:"Registrable domains (eTLD+1) the body's links point at, excluding the From address's own registrable domain. Present only for a message the provider's own filter already classified as spam; an empty array means every link stayed on the sender's domain, absence means the comparison was never made."},{key:"signerDomain",value:{name:"string",required:!1},description:"Registrable domain of the first verified DKIM `header.d` in trusted Authentication-Results order, or the reserved literal `unverified` when no identity could be established. Unlike `dkimDomain`, which is the unverified `d=` claim the sender wrote, this is only set from a signature the trusted Authentication-Results reported as passing. Absent for messages classified before the field existed."},{key:"envelopeDomain",value:{name:"string",required:!1},description:"SPF-checked envelope-from domain (`smtp.mailfrom`, falling back to `smtp.helo`) from the trusted Authentication-Results. Absent when the trusted header carried no SPF clause, or for messages classified before the field existed."},{key:"signerMessageCount",value:{name:"number",required:!1},description:"Messages this account had already seen for the sender's standing key when this message arrived. A snapshot frozen at derivation time, deliberately not a live read — a message classified when the key stood at 340 always reads 340. Absent for messages classified before the field existed."},{key:"signerFirstSeenAt",value:{name:"number",required:!1},description:"Epoch milliseconds this account first saw the sender's standing key, snapshotted at derivation time alongside `signerMessageCount`. Absent for messages classified before the field existed."}]}},description:""},onOpenIntelligence:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};export{i as A};
