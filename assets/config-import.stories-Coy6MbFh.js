import{j as e,r as ye}from"./iframe-4Y_dM_UU.js";import{I as ve,b as le,A as Se,e as a,h as d,c,g as ee,C as oe,d as ne,w as X,s as ae,S as ie,p as me,f as re,a as Re}from"./ConfigExportCard-B50-l2eM.js";import{b as ue,S as de}from"./OnboardingWizard-BrJf2qKd.js";import{S as xe}from"./wizard-f_t1X_lP.js";import"./preload-helper-PPVm8Dsz.js";import"./badge-BALHcx9W.js";import"./cn-IyxL_b2c.js";import"./banner-Dq9rhq1I.js";import"./button-BNcng5Oi.js";import"./x-Cy-ShthB.js";import"./createLucideIcon-DkKJcbI9.js";import"./loader-circle-Bx4Yqfec.js";import"./inbox-CvUF9C2g.js";import"./card-CX8e6OH8.js";import"./download-Q-jXhoWc.js";import"./react-query.gen-C52jVGEN.js";import"./client.gen-84yaupxO.js";import"./account-service-choice-DCxlrFpF.js";import"./checkbox-D2Z4W3-k.js";import"./check-DSdQDF54.js";import"./minus-DGSQI1I1.js";import"./field-label-UzlVOcad.js";import"./input-BVRvisgp.js";import"./kbd-C2eSrNUu.js";import"./security-select-DdTULCBE.js";import"./select-ddVD-RDW.js";import"./chevron-down-qwKh9shH.js";import"./useMutation-DOEmXLBu.js";import"./app-password-hint-BbBJDKaR.js";import"./password-input-Bn6nsU-7.js";import"./eye-off-9T6hOklU.js";import"./mail-1N_4GVps.js";const o="reader-config.example.json",t=(r,s,l,pe)=>({section:r,key:s,verdict:l,reason:pe}),ce=[t("accounts","reader@example.com","created"),t("accounts","m.vanhenten@gemeente-amstelveen.nl","created"),t("accounts","post@vanhenten-advies.nl","updated"),t("accounts","reader@example.net","skipped","An account with this address already exists here and its server settings differ. Remove it first, or edit it by hand — importing will not overwrite a working account."),t("labels","Facturen","created"),t("labels","Raadsstukken","unchanged"),t("filters","Bonnetjes","created"),t("filters","Nieuwsbrieven dempen","created"),t("filters","Waternet","skipped","The folder this rule files into is not here yet. The rule is imported switched off and turns itself on once Projecten/Waternet appears."),t("filters","Raadsstukken markeren","updated"),t("filters","Oude spamregel","rejected","This rule uses an action this version does not have (moveToServerRule). Nothing was imported for it. Rebuild the rule in Settings › Filters."),t("addressFlags","anouk@waternet.nl","created"),t("addressFlags","nieuwsbrief@bol.com","created"),t("addressFlags","no-reply@promo.example","unchanged"),t("settings","Density","updated"),t("settings","Theme","unchanged"),t("settings","PinnedFolders","created"),t("settings","FolderRoleAppointment#Archive","created")],Ce=ce.filter(r=>r.verdict!=="rejected").map(r=>({section:r.section,key:r.key,verdict:"created"})),se=(r,s,l)=>({code:r,message:s,details:l}),he=[se("folder_not_found_yet",'Filter "Waternet" files mail into "Projecten/Waternet", which this account does not hold yet. It is bound once the folder list has been read.',{filter:"Waternet",folderPath:"Projecten/Waternet"}),se("folder_not_found_yet",'Filter "Aangifte bewaren" files mail into "Archief/Belasting 2025", which this account does not hold yet. It is bound once the folder list has been read.',{filter:"Aangifte bewaren",folderPath:"Archief/Belasting 2025"}),se("folder_not_found_yet",'"Raadsstukken" is not a folder this account holds yet. It is bound once the folder list has been read.',{folderPath:"Raadsstukken",accountId:"acct-amstelveen"})],n=r=>({valid:!0,schemaVersion:1,applied:!1,items:ce,errors:[],warnings:[],accountsNeedingCredentials:[],...r}),p=n({warnings:he}),je=n({items:Ce}),Fe={wrongKind:n({valid:!1,schemaVersion:0,items:[],errors:[{code:"WrongKind",message:'Not a reader configuration document: expected kind "reader.config", found "photo-album".'}]}),newerSchema:n({valid:!1,schemaVersion:5,items:[],errors:[{code:"UnsupportedVersion",message:"Document schemaVersion 5 was written by a newer reader; this one reads up to 1. Upgrade before importing."}]}),unknownKey:n({valid:!1,items:[],errors:[{code:"UnknownKeys",message:"Unknown keys at filters[3]: serverSideCopy, retentionDays. A document this reader does not fully understand is refused rather than partly applied."}]}),credentialField:n({valid:!1,items:[],errors:[{code:"CredentialPresent",message:"Credential field at accounts[1]: imapPassword. A configuration document declares which credential an account needs; it never carries one."}]})},Q=n({applied:!0,items:[...ce.filter(r=>r.section==="accounts"||r.section==="labels"),t("filters","Bonnetjes","rejected","the filter store refused the write")],errors:[{code:"import_write_failed",message:"the filter store refused the write The items above it were written and remain; import the same file again with merge to finish.",details:{section:"filters",key:"Bonnetjes"}}],warnings:he}),Z=n({applied:!1,items:[t("accounts","reader@example.com","rejected","the account store refused the write")],errors:[{code:"import_write_failed",message:"the account store refused the write The items above it were written and remain; import the same file again with merge to finish.",details:{section:"accounts",key:"reader@example.com"}}],warnings:[]}),i=[{accountId:"acct-example",address:"reader@example.com",displayName:"Reader Example",connector:"imap",server:"imap.example.com:993",state:"entered"},{accountId:"acct-advies",address:"post@vanhenten-advies.nl",displayName:"Van Henten Advies",connector:"imap",server:"mail.antagonist.nl:993",state:"needed"},{accountId:"acct-amstelveen",address:"m.vanhenten@gemeente-amstelveen.nl",displayName:"M. van Henten (Gemeente Amstelveen)",connector:"microsoft",server:"outlook.office365.com",state:"needed"}],be=i.map(r=>({...r,state:"needed"})),Ne=i.map(r=>({...r,state:"entered"})),ge=i.map(r=>r.accountId==="acct-advies"?{...r,state:"failed",failure:"535 5.7.8 Authentication credentials invalid — Antagonist wants the mailbox password, not your control-panel login."}:r),ir={title:"Playground/Shipped/Import/Config import",parameters:{layout:"fullscreen"}},te=r=>{const s=Re(Fe[r]);if(!s)throw new Error(`fixture ${r} carries no blocking error`);return s},Y=ee(p.items);function Ae(){const[r,s]=ye.useState(0),l=()=>s(we=>Math.max(we-1,0));return[e.jsx(de,{onStart:()=>{},onImportConfig:()=>s(1)},"entry"),e.jsx(d,{file:{name:o,size:18432},ready:!0,onNext:()=>s(2)},"file"),e.jsx(a,{sections:Y,fileName:o,onBack:l,onNext:()=>s(3)},"report"),e.jsx(c,{accounts:i,onNext:()=>s(4)},"credentials"),e.jsx(ie,{folders:me(p),onNext:()=>s(0)},"folders")][r]}const m={render:()=>e.jsx(Ae,{})},u={render:()=>e.jsx(de,{onStart:()=>{},onImportConfig:()=>{}})},h={globals:{viewport:{value:"mobile"}},render:()=>e.jsx(de,{onStart:()=>{},onImportConfig:()=>{}})},g={render:()=>e.jsx(d,{})},f={render:()=>e.jsx(d,{state:"dragging"})},w={render:()=>e.jsx(d,{file:{name:o,size:18432},ready:!0})},y={render:()=>e.jsx(d,{state:"reading",file:{name:o,size:18432}})},v={render:()=>e.jsx(d,{state:"checking",file:{name:o,size:18432},ready:!0})},S={render:()=>e.jsx(d,{file:{name:"vakantiefotos.zip",size:4194304},failure:{title:"That file is not JSON",explanation:"vakantiefotos.zip could not be read as JSON at all, so there is nothing in it to import.",fix:"Pick the .json file written by Settings › Advanced, or by remit config save.",raw:`Unexpected token 'P', "PK..." is not valid JSON`}})},R={render:()=>e.jsx(a,{sections:Y,fileName:o,warnings:p.warnings.map(r=>r.message)})},x={render:()=>e.jsx(a,{sections:ee(je.items),fileName:o})},C={render:()=>e.jsx(a,{sections:Y,fileName:o,applying:!0})},j={render:()=>e.jsx(a,{sections:ee([...p.items,{section:"messageDecisions",key:"3.412 message labels",verdict:"created"}]),fileName:o})},F={globals:{viewport:{value:"mobile"}},render:()=>e.jsx(a,{sections:Y,fileName:o})},b={globals:{viewport:{value:"laptopShort"}},render:()=>e.jsx(a,{sections:ee(Array.from({length:6},()=>p.items).flat()),fileName:o})},N={render:()=>e.jsx(a,{sections:Y,fileName:o,warnings:["This preview merges into the configuration already here. Existing accounts keep their server settings. Nothing changes until you apply."]})},A={render:()=>e.jsx(c,{accounts:i})},I={render:()=>e.jsx(c,{accounts:be})},k={render:()=>e.jsx(c,{accounts:ge})},_={render:()=>e.jsx(c,{accounts:i,busyAccountId:"acct-amstelveen"})},P={render:()=>e.jsx(c,{accounts:Ne})},E={render:()=>e.jsx("div",{className:"min-h-dvh bg-canvas p-6 font-sans",children:e.jsx("div",{className:"max-w-2xl",children:e.jsx(Se,{accounts:ge})})})},fe={steps:ve,activeStep:2,title:"Sign in to post@vanhenten-advies.nl",subtitle:"Account 2 of 3 · mail.antagonist.nl:993",email:"post@vanhenten-advies.nl",username:"post@vanhenten-advies.nl",password:"",continueLabel:"Test and continue",notice:e.jsxs("div",{className:"flex items-center gap-2 text-xs text-fg-muted",children:[e.jsx(xe,{className:"size-3.5"}),"Server settings came from the config file — edit them in Settings if they are wrong."]}),onContinue:()=>{},onBack:()=>{},onChange:()=>{}},O={render:()=>e.jsx(ue,{...fe})},L={render:()=>e.jsx(ue,{...fe,error:"535 5.7.8 Authentication credentials invalid. Antagonist wants the mailbox password, not your control-panel login."})},T={render:()=>e.jsx(le,{account:i[2],position:3,total:3})},D={render:()=>e.jsx(le,{account:i[2],position:3,total:3,error:"Microsoft stopped the sign-in: your organisation requires an administrator to approve Reader. Ask IT to approve it, then reconnect."})},M={render:()=>e.jsx(ie,{folders:me(p)})},W={render:()=>e.jsx(ie,{folders:[]})},z={render:()=>e.jsx(re,{failure:te("wrongKind")})},K={render:()=>e.jsx(re,{failure:te("newerSchema")})},G={render:()=>e.jsx(re,{failure:te("unknownKey")})},U={render:()=>e.jsx(re,{failure:te("credentialField")})},B={render:()=>{const r={...Q,errors:[{code:"import_write_failed",message:"the store refused the write"}]};return e.jsx(ne,{results:ae(r),message:X(r)?.message??"",raw:"import_write_failed: the store refused the write",nothingLanded:!r.applied})}},J={render:()=>e.jsx(ne,{results:ae(Q),message:X(Q)?.message??"",raw:`import_write_failed: ${X(Q)?.message??""}`,nothingLanded:!Q.applied})},V={render:()=>e.jsx(ne,{results:ae(Z),message:X(Z)?.message??"",raw:`import_write_failed: ${X(Z)?.message??""}`,nothingLanded:!Z.applied})},q={render:()=>e.jsx("div",{className:"min-h-dvh bg-canvas p-6 font-sans",children:e.jsx(oe,{fileName:"reader-config.2026-08-28.json"})})},$={render:()=>e.jsx("div",{className:"min-h-dvh bg-canvas p-6 font-sans",children:e.jsx(oe,{fileName:"reader-config.2026-08-28.json",state:"downloading"})})},H={render:()=>e.jsx("div",{className:"min-h-dvh bg-canvas p-6 font-sans",children:e.jsx(oe,{fileName:"reader-config.2026-08-28.json",state:"failed",error:"500 Internal Server Error — GET /config/export: sender store unreadable"})})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <ConfigImportWalkthrough />
}`,...m.parameters?.docs?.source},description:{story:"Full click-through: onboarding entry through to the pending folders.",...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <StepWelcome onStart={() => undefined} onImportConfig={() => undefined} />
}`,...u.parameters?.docs?.source},description:{story:"Onboarding: importing sits beside adding the first account, not under it.",...u.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  globals: {
    viewport: {
      value: "mobile"
    }
  },
  render: () => <StepWelcome onStart={() => undefined} onImportConfig={() => undefined} />
}`,...h.parameters?.docs?.source},description:{story:"Same entry at phone width — both CTAs share one footer row.",...h.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <StepChooseFile />
}`,...g.parameters?.docs?.source},description:{story:"Drop target at rest.",...g.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <StepChooseFile state="dragging" />
}`,...f.parameters?.docs?.source},description:{story:"A file is over the drop target.",...f.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <StepChooseFile file={{
    name: CONFIG_FILE_NAME,
    size: 18_432
  }} ready />
}`,...w.parameters?.docs?.source},description:{story:"A file is chosen and parsed; the check is armed, nothing has been sent.",...w.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <StepChooseFile state="reading" file={{
    name: CONFIG_FILE_NAME,
    size: 18_432
  }} />
}`,...y.parameters?.docs?.source},description:{story:"The browser is still pulling the file off disk — there is nothing to send yet.",...y.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <StepChooseFile state="checking" file={{
    name: CONFIG_FILE_NAME,
    size: 18_432
  }} ready />
}`,...v.parameters?.docs?.source},description:{story:"The dry run is in flight against the server.",...v.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <StepChooseFile file={{
    name: "vakantiefotos.zip",
    size: 4_194_304
  }} failure={{
    title: "That file is not JSON",
    explanation: "vakantiefotos.zip could not be read as JSON at all, so there is nothing in it to import.",
    fix: "Pick the .json file written by Settings › Advanced, or by remit config save.",
    raw: "Unexpected token 'P', \\"PK...\\" is not valid JSON"
  }} />
}`,...S.parameters?.docs?.source},description:{story:"A file that is not JSON at all, refused before anything leaves the browser.",...S.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <StepDryRunReport sections={dryRunSections} fileName={CONFIG_FILE_NAME} warnings={dryRunReport.warnings.map(warning => warning.message)} />
}`,...R.parameters?.docs?.source},description:{story:`The dry run: every section with a per-entry verdict, and a stated reason
under everything that will not land.`,...R.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <StepDryRunReport sections={groupReportSections(cleanRunReport.items)} fileName={CONFIG_FILE_NAME} />
}`,...x.parameters?.docs?.source},description:{story:"A fresh instance — the same file with nothing to skip or reject.",...x.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <StepDryRunReport sections={dryRunSections} fileName={CONFIG_FILE_NAME} applying />
}`,...C.parameters?.docs?.source},description:{story:"The apply is in flight; the control says so rather than going quiet.",...C.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <StepDryRunReport sections={groupReportSections([...dryRunReport.items, {
    section: "messageDecisions",
    key: "3.412 message labels",
    verdict: "created"
  }])} fileName={CONFIG_FILE_NAME} />
}`,...j.parameters?.docs?.source},description:{story:`A file from a newer Reader carrying a section this one does not know. It gets
its own heading rather than being filed under a section we recognise, because
telling someone their settings landed somewhere they did not is the failure
the whole format exists to prevent.`,...j.parameters?.docs?.description}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  globals: {
    viewport: {
      value: "mobile"
    }
  },
  render: () => <StepDryRunReport sections={dryRunSections} fileName={CONFIG_FILE_NAME} />
}`,...F.parameters?.docs?.source},description:{story:"Dry run at phone width — the verdict badges wrap rather than clip.",...F.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  globals: {
    viewport: {
      value: "laptopShort"
    }
  },
  render: () => <StepDryRunReport sections={groupReportSections(Array.from({
    length: 6
  }, () => dryRunReport.items).flat())} fileName={CONFIG_FILE_NAME} />
}`,...b.parameters?.docs?.source},description:{story:`A household's worth of rules and senders, on the 1512×827 laptop where this
report was found running off the bottom of the screen with "Import n changes"
unreachable below it (#1021). The report scrolls inside the card; the
verdict summary at the top and the import button at the bottom both stay put.`,...b.parameters?.docs?.description}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <StepDryRunReport sections={dryRunSections} fileName={CONFIG_FILE_NAME} warnings={["This preview merges into the configuration already here. Existing accounts keep their server settings. Nothing changes until you apply."]} />
}`,...N.parameters?.docs?.source},description:{story:"The warning is part of the preview, alongside every proposed change.",...N.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <StepCredentialsOverview accounts={importedAccounts} />
}`,...A.parameters?.docs?.source},description:{story:"Two of three accounts cannot sync until someone signs in.",...A.parameters?.docs?.description}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <StepCredentialsOverview accounts={accountsAllPending} />
}`,...I.parameters?.docs?.source},description:{story:"Straight after the import: no account has credentials yet.",...I.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <StepCredentialsOverview accounts={accountsOneFailed} />
}`,...k.parameters?.docs?.source},description:{story:"A password was entered and the server refused it — the row says why.",...k.parameters?.docs?.description}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <StepCredentialsOverview accounts={importedAccounts} busyAccountId="acct-amstelveen" />
}`,..._.parameters?.docs?.source},description:{story:"A Microsoft reconnect is in flight; its row is busy, the rest are live.",..._.parameters?.docs?.description}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <StepCredentialsOverview accounts={accountsAllConnected} />
}`,...P.parameters?.docs?.source},description:{story:"Every account connected — the step is finally satisfiable.",...P.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <div className="min-h-dvh bg-canvas p-6 font-sans">
            <div className="max-w-2xl">
                <AccountCredentialsList accounts={accountsOneFailed} />
            </div>
        </div>
}`,...E.parameters?.docs?.source},description:{story:"The same account rows as they read in Settings, outside the wizard.",...E.parameters?.docs?.description}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <CredentialsStep {...passwordStepProps} />
}`,...O.parameters?.docs?.source},description:{story:"Password entry for one imported IMAP account.",...O.parameters?.docs?.description}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <CredentialsStep {...passwordStepProps} error="535 5.7.8 Authentication credentials invalid. Antagonist wants the mailbox password, not your control-panel login." />
}`,...L.parameters?.docs?.source},description:{story:"Retry after a refused password: the server's own words, then the fix.",...L.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <StepAccountReconnectMicrosoft account={importedAccounts[2]} position={3} total={3} />
}`,...T.parameters?.docs?.source},description:{story:"The Microsoft branch: no token travels in a config file.",...T.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <StepAccountReconnectMicrosoft account={importedAccounts[2]} position={3} total={3} error="Microsoft stopped the sign-in: your organisation requires an administrator to approve Reader. Ask IT to approve it, then reconnect." />
}`,...D.parameters?.docs?.source},description:{story:"Microsoft sign-in stopped at the tenant's admin-consent screen.",...D.parameters?.docs?.description}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <StepPendingFolders folders={pendingFolders(dryRunReport)} />
}`,...M.parameters?.docs?.source},description:{story:"Imported settings that name folders discovery has not produced yet.",...M.parameters?.docs?.description}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <StepPendingFolders folders={[]} />
}`,...W.parameters?.docs?.source},description:{story:"Nothing left waiting: every folder the file named already resolved.",...W.parameters?.docs?.description}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <StepFileRejected failure={rejectionFor("wrongKind")} />
}`,...z.parameters?.docs?.source},description:{story:"Not a Reader config file at all.",...z.parameters?.docs?.description}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <StepFileRejected failure={rejectionFor("newerSchema")} />
}`,...K.parameters?.docs?.source},description:{story:"Written by a newer Reader — update before importing.",...K.parameters?.docs?.description}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <StepFileRejected failure={rejectionFor("unknownKey")} />
}`,...G.parameters?.docs?.source},description:{story:"Keys this version does not know: refused rather than silently ignored.",...G.parameters?.docs?.description}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <StepFileRejected failure={rejectionFor("credentialField")} />
}`,...U.parameters?.docs?.source},description:{story:"The file carries a password: rejected outright, never quietly stripped.",...U.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => {
    const report = {
      ...partialImportReport,
      errors: [{
        code: "import_write_failed",
        message: "the store refused the write"
      }]
    };
    return <StepPartialImport results={sectionResults(report)} message={writeFailure(report)?.message ?? ""} raw="import_write_failed: the store refused the write" nothingLanded={!report.applied} />;
  }
}`,...B.parameters?.docs?.source},description:{story:`The same stop, with a server that did not say where. Nothing here may read
"landed": the reader has to go and look, and the screen says so.`,...B.parameters?.docs?.description}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:'{\n  render: () => <StepPartialImport results={sectionResults(partialImportReport)} message={writeFailure(partialImportReport)?.message ?? ""} raw={`import_write_failed: ${writeFailure(partialImportReport)?.message ?? ""}`} nothingLanded={!partialImportReport.applied} />\n}',...J.parameters?.docs?.source},description:{story:"An import that stopped half-way, saying exactly what landed.",...J.parameters?.docs?.description}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:'{\n  render: () => <StepPartialImport results={sectionResults(nothingLandedImportReport)} message={writeFailure(nothingLandedImportReport)?.message ?? ""} raw={`import_write_failed: ${writeFailure(nothingLandedImportReport)?.message ?? ""}`} nothingLanded={!nothingLandedImportReport.applied} />\n}',...V.parameters?.docs?.source},description:{story:`The same stop with no section written — the first write was the one that
failed. No section may carry a
tick, and the screen counts nothing as landed.`,...V.parameters?.docs?.description}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <div className="min-h-dvh bg-canvas p-6 font-sans">
            <ConfigExportCard fileName="reader-config.2026-08-28.json" />
        </div>
}`,...q.parameters?.docs?.source},description:{story:"Settings → Advanced: the export half of the pair.",...q.parameters?.docs?.description}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => <div className="min-h-dvh bg-canvas p-6 font-sans">
            <ConfigExportCard fileName="reader-config.2026-08-28.json" state="downloading" />
        </div>
}`,...$.parameters?.docs?.source},description:{story:"The export is being read; the button says so rather than going quiet.",...$.parameters?.docs?.description}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <div className="min-h-dvh bg-canvas p-6 font-sans">
            <ConfigExportCard fileName="reader-config.2026-08-28.json" state="failed" error="500 Internal Server Error — GET /config/export: sender store unreadable" />
        </div>
}`,...H.parameters?.docs?.source},description:{story:"The export failed — a dead download button would be the worse outcome.",...H.parameters?.docs?.description}}};const dr=["Walkthrough","OnboardingEntry","OnboardingEntryPhone","ChooseFile","ChooseFileDragging","ChooseFileChosen","ChooseFileReading","ChooseFileChecking","ChooseFileNotJson","DryRunReport","DryRunReportCleanInstance","DryRunReportApplying","DryRunReportUnknownSection","DryRunReportPhone","DryRunReportLongShortViewport","AlreadyConfigured","CredentialsOverview","CredentialsOverviewAllPending","CredentialsOverviewSignInFailed","CredentialsOverviewRedirecting","CredentialsOverviewComplete","AccountsNeedingCredentialsInSettings","AccountPassword","AccountPasswordRejected","AccountReconnectMicrosoft","AccountReconnectMicrosoftBlocked","PendingFolders","PendingFoldersNone","RejectedWrongFileKind","RejectedNewerSchema","RejectedUnknownKey","RejectedCredentialField","PartiallyLandedImportUnnamed","PartiallyLandedImport","NothingLandedImport","ExportCard","ExportCardDownloading","ExportCardFailed"];export{O as AccountPassword,L as AccountPasswordRejected,T as AccountReconnectMicrosoft,D as AccountReconnectMicrosoftBlocked,E as AccountsNeedingCredentialsInSettings,N as AlreadyConfigured,g as ChooseFile,v as ChooseFileChecking,w as ChooseFileChosen,f as ChooseFileDragging,S as ChooseFileNotJson,y as ChooseFileReading,A as CredentialsOverview,I as CredentialsOverviewAllPending,P as CredentialsOverviewComplete,_ as CredentialsOverviewRedirecting,k as CredentialsOverviewSignInFailed,R as DryRunReport,C as DryRunReportApplying,x as DryRunReportCleanInstance,b as DryRunReportLongShortViewport,F as DryRunReportPhone,j as DryRunReportUnknownSection,q as ExportCard,$ as ExportCardDownloading,H as ExportCardFailed,V as NothingLandedImport,u as OnboardingEntry,h as OnboardingEntryPhone,J as PartiallyLandedImport,B as PartiallyLandedImportUnnamed,M as PendingFolders,W as PendingFoldersNone,U as RejectedCredentialField,K as RejectedNewerSchema,G as RejectedUnknownKey,z as RejectedWrongFileKind,m as Walkthrough,dr as __namedExportsOrder,ir as default};
