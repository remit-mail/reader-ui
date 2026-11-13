import{j as e,r as xe}from"./iframe-fYsS-Mr7.js";import{I as Ce,c as ge,A as je,h as ae,j as i,d as c,f as d,g as re,C as ie,e as de,w as Z,s as ce,S as pe,p as fe,i as te,b as be}from"./ConfigExportCard-2vpxImMg.js";import{b as ye,S as le}from"./OnboardingWizard-M2qE-5jk.js";import{S as Ae}from"./wizard-C5YhXmrz.js";import"./preload-helper-PPVm8Dsz.js";import"./badge-CZgi-7XL.js";import"./cn-IyxL_b2c.js";import"./banner-2MU9qEbR.js";import"./button-S2h7_ODQ.js";import"./x-sSwTlOFF.js";import"./createLucideIcon-B5J0h_XM.js";import"./error-classifier-C58Iuok9.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./loader-circle-CNn9G_XI.js";import"./inbox-vF0NtWrK.js";import"./card-D_7pcfRT.js";import"./download-CL3ByUI3.js";import"./react-query.gen-B1_4DilO.js";import"./account-service-choice-DJhrOwR3.js";import"./checkbox-BScpY53m.js";import"./check-ClpQiEYg.js";import"./minus-DMpYC7y2.js";import"./field-label-CxW6NJ7W.js";import"./input-Ejju9bJ0.js";import"./kbd-Ci_wHBAT.js";import"./security-select-DATIil8G.js";import"./select-CcR02dMm.js";import"./chevron-down-Dg-Z7_Bk.js";import"./useMutation-BWoFIWmj.js";import"./app-password-hint-QFy_kikF.js";import"./password-input-Dx6oMj2f.js";import"./eye-off-gih9PFNb.js";import"./mail-CSMuoKF3.js";const o="reader-config.example.json",t=(r,s,l,he)=>({section:r,key:s,verdict:l,reason:he}),me=[t("accounts","reader@example.com","created"),t("accounts","m.vanhenten@gemeente-amstelveen.nl","created"),t("accounts","post@vanhenten-advies.nl","updated"),t("accounts","reader@example.net","skipped","An account with this address already exists here and its server settings differ. Remove it first, or edit it by hand — importing will not overwrite a working account."),t("labels","Facturen","created"),t("labels","Raadsstukken","unchanged"),t("filters","Bonnetjes","created"),t("filters","Nieuwsbrieven dempen","created"),t("filters","Waternet","skipped","The folder this rule files into is not here yet. The rule is imported switched off and turns itself on once Projecten/Waternet appears."),t("filters","Raadsstukken markeren","updated"),t("filters","Oude spamregel","rejected","This rule uses an action this version does not have (moveToServerRule). Nothing was imported for it. Rebuild the rule in Settings › Filters."),t("addressFlags","anouk@waternet.nl","created"),t("addressFlags","nieuwsbrief@bol.com","created"),t("addressFlags","no-reply@promo.example","unchanged"),t("settings","Density","updated"),t("settings","Theme","unchanged"),t("settings","PinnedFolders","created"),t("settings","FolderRoleAppointment#Archive","created")],Fe=me.filter(r=>r.verdict!=="rejected").map(r=>({section:r.section,key:r.key,verdict:"created"})),ne=(r,s,l)=>({code:r,message:s,details:l}),we=[ne("folder_not_found_yet",'Filter "Waternet" files mail into "Projecten/Waternet", which this account does not hold yet. It is bound once the folder list has been read.',{filter:"Waternet",folderPath:"Projecten/Waternet"}),ne("folder_not_found_yet",'Filter "Aangifte bewaren" files mail into "Archief/Belasting 2025", which this account does not hold yet. It is bound once the folder list has been read.',{filter:"Aangifte bewaren",folderPath:"Archief/Belasting 2025"}),ne("folder_not_found_yet",'"Raadsstukken" is not a folder this account holds yet. It is bound once the folder list has been read.',{folderPath:"Raadsstukken",accountId:"acct-amstelveen"})],n=r=>({valid:!0,schemaVersion:1,applied:!1,items:me,errors:[],warnings:[],accountsNeedingCredentials:[],...r}),p=n({warnings:we}),Ne=n({items:Fe}),Ie={wrongKind:n({valid:!1,schemaVersion:0,items:[],errors:[{code:"WrongKind",message:'Not a reader configuration document: expected kind "reader.config", found "photo-album".'}]}),newerSchema:n({valid:!1,schemaVersion:5,items:[],errors:[{code:"UnsupportedVersion",message:"Document schemaVersion 5 was written by a newer reader; this one reads up to 1. Upgrade before importing."}]}),unknownKey:n({valid:!1,items:[],errors:[{code:"UnknownKeys",message:"Unknown keys at filters[3]: serverSideCopy, retentionDays. A document this reader does not fully understand is refused rather than partly applied."}]}),credentialField:n({valid:!1,items:[],errors:[{code:"CredentialPresent",message:"Credential field at accounts[1]: imapPassword. A configuration document declares which credential an account needs; it never carries one."}]})},Y=n({applied:!0,items:[...me.filter(r=>r.section==="accounts"||r.section==="labels"),t("filters","Bonnetjes","rejected","the filter store refused the write")],errors:[{code:"import_write_failed",message:"the filter store refused the write The items above it were written and remain; import the same file again with merge to finish.",details:{section:"filters",key:"Bonnetjes"}}],warnings:we}),ee=n({applied:!1,items:[t("accounts","reader@example.com","rejected","the account store refused the write")],errors:[{code:"import_write_failed",message:"the account store refused the write The items above it were written and remain; import the same file again with merge to finish.",details:{section:"accounts",key:"reader@example.com"}}],warnings:[]}),a=[{accountId:"acct-example",address:"reader@example.com",displayName:"Reader Example",connector:"imap",server:"imap.example.com:993",state:"entered"},{accountId:"acct-advies",address:"post@vanhenten-advies.nl",displayName:"Van Henten Advies",connector:"imap",server:"mail.antagonist.nl:993",state:"needed"},{accountId:"acct-amstelveen",address:"m.vanhenten@gemeente-amstelveen.nl",displayName:"M. van Henten (Gemeente Amstelveen)",connector:"microsoft",server:"outlook.office365.com",state:"needed"}],ke=a.map(r=>({...r,state:"needed"})),_e=a.map(r=>({...r,state:"entered"})),ve=a.map(r=>r.accountId==="acct-advies"?{...r,state:"failed",failure:"535 5.7.8 Authentication credentials invalid — Antagonist wants the mailbox password, not your control-panel login."}:r),mr={title:"Playground/Shipped/Import/Config import",parameters:{layout:"fullscreen"}},se=r=>{const s=be(Ie[r]);if(!s)throw new Error(`fixture ${r} carries no blocking error`);return s},oe=re(p.items);function Pe(){const[r,s]=xe.useState(0),l=()=>s(Re=>Math.max(Re-1,0));return[e.jsx(le,{onStart:()=>{},onImportConfig:()=>s(1)},"entry"),e.jsx(i,{file:{name:o,size:18432},ready:!0,onNext:()=>s(2)},"file"),e.jsx(d,{sections:oe,fileName:o,onBack:l,onNext:()=>s(3)},"report"),e.jsx(c,{accounts:a,onNext:()=>s(4)},"credentials"),e.jsx(pe,{folders:fe(p),onNext:()=>s(0)},"folders")][r]}const m={render:()=>e.jsx(Pe,{})},u={render:()=>e.jsx(le,{onStart:()=>{},onImportConfig:()=>{}})},h={globals:{viewport:{value:"mobile"}},render:()=>e.jsx(le,{onStart:()=>{},onImportConfig:()=>{}})},g={render:()=>e.jsx(i,{})},f={render:()=>e.jsx(i,{state:"dragging"})},y={render:()=>e.jsx(i,{file:{name:o,size:18432},ready:!0})},w={render:()=>e.jsx(i,{state:"reading",file:{name:o,size:18432}})},v={render:()=>e.jsx(i,{state:"checking",file:{name:o,size:18432},ready:!0})},S={render:()=>e.jsx(i,{file:{name:"vakantiefotos.zip",size:4194304},failure:{title:"That file is not JSON",explanation:"vakantiefotos.zip could not be read as JSON at all, so there is nothing in it to import.",fix:"Pick the .json file written by Settings › Advanced, or by remit config save.",raw:`Unexpected token 'P', "PK..." is not valid JSON`}})},R={render:()=>e.jsx(d,{sections:oe,fileName:o,warnings:p.warnings.map(r=>r.message)})},x={render:()=>e.jsx(d,{sections:re(Ne.items),fileName:o})},C={render:()=>e.jsx(d,{sections:oe,fileName:o,applying:!0})},j={render:()=>e.jsx(d,{sections:re([...p.items,{section:"messageDecisions",key:"3.412 message labels",verdict:"created"}]),fileName:o})},b={globals:{viewport:{value:"mobile"}},render:()=>e.jsx(d,{sections:oe,fileName:o})},A={globals:{viewport:{value:"laptopShort"}},render:()=>e.jsx(d,{sections:re(Array.from({length:6},()=>p.items).flat()),fileName:o})},ue="2 accounts, 14 rules and 31 flagged senders are set up here already.",F={render:()=>e.jsx(ae,{held:ue})},N={render:()=>e.jsx(ae,{held:ue,choice:"abort"})},I={render:()=>e.jsx(ae,{held:ue,choice:"merge"})},k={render:()=>e.jsx(c,{accounts:a})},_={render:()=>e.jsx(c,{accounts:ke})},P={render:()=>e.jsx(c,{accounts:ve})},E={render:()=>e.jsx(c,{accounts:a,busyAccountId:"acct-amstelveen"})},O={render:()=>e.jsx(c,{accounts:_e})},L={render:()=>e.jsx("div",{className:"min-h-dvh bg-canvas p-6 font-sans",children:e.jsx("div",{className:"max-w-2xl",children:e.jsx(je,{accounts:ve})})})},Se={steps:Ce,activeStep:2,title:"Sign in to post@vanhenten-advies.nl",subtitle:"Account 2 of 3 · mail.antagonist.nl:993",email:"post@vanhenten-advies.nl",username:"post@vanhenten-advies.nl",password:"",continueLabel:"Test and continue",notice:e.jsxs("div",{className:"flex items-center gap-2 text-xs text-fg-muted",children:[e.jsx(Ae,{className:"size-3.5"}),"Server settings came from the config file — edit them in Settings if they are wrong."]}),onContinue:()=>{},onBack:()=>{},onChange:()=>{}},D={render:()=>e.jsx(ye,{...Se})},T={render:()=>e.jsx(ye,{...Se,error:"535 5.7.8 Authentication credentials invalid. Antagonist wants the mailbox password, not your control-panel login."})},M={render:()=>e.jsx(ge,{account:a[2],position:3,total:3})},W={render:()=>e.jsx(ge,{account:a[2],position:3,total:3,error:"Microsoft stopped the sign-in: your organisation requires an administrator to approve Reader. Ask IT to approve it, then reconnect."})},z={render:()=>e.jsx(pe,{folders:fe(p)})},K={render:()=>e.jsx(pe,{folders:[]})},G={render:()=>e.jsx(te,{failure:se("wrongKind")})},U={render:()=>e.jsx(te,{failure:se("newerSchema")})},B={render:()=>e.jsx(te,{failure:se("unknownKey")})},J={render:()=>e.jsx(te,{failure:se("credentialField")})},V={render:()=>{const r={...Y,errors:[{code:"import_write_failed",message:"the store refused the write"}]};return e.jsx(de,{results:ce(r),message:Z(r)?.message??"",raw:"import_write_failed: the store refused the write",nothingLanded:!r.applied})}},H={render:()=>e.jsx(de,{results:ce(Y),message:Z(Y)?.message??"",raw:`import_write_failed: ${Z(Y)?.message??""}`,nothingLanded:!Y.applied})},q={render:()=>e.jsx(de,{results:ce(ee),message:Z(ee)?.message??"",raw:`import_write_failed: ${Z(ee)?.message??""}`,nothingLanded:!ee.applied})},$={render:()=>e.jsx("div",{className:"min-h-dvh bg-canvas p-6 font-sans",children:e.jsx(ie,{fileName:"reader-config.2026-08-28.json"})})},Q={render:()=>e.jsx("div",{className:"min-h-dvh bg-canvas p-6 font-sans",children:e.jsx(ie,{fileName:"reader-config.2026-08-28.json",state:"downloading"})})},X={render:()=>e.jsx("div",{className:"min-h-dvh bg-canvas p-6 font-sans",children:e.jsx(ie,{fileName:"reader-config.2026-08-28.json",state:"failed",error:"500 Internal Server Error — GET /config/export: sender store unreadable"})})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:"A file is over the drop target.",...f.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <StepChooseFile file={{
    name: CONFIG_FILE_NAME,
    size: 18_432
  }} ready />
}`,...y.parameters?.docs?.source},description:{story:"A file is chosen and parsed; the check is armed, nothing has been sent.",...y.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <StepChooseFile state="reading" file={{
    name: CONFIG_FILE_NAME,
    size: 18_432
  }} />
}`,...w.parameters?.docs?.source},description:{story:"The browser is still pulling the file off disk — there is nothing to send yet.",...w.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
the whole format exists to prevent.`,...j.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  globals: {
    viewport: {
      value: "mobile"
    }
  },
  render: () => <StepDryRunReport sections={dryRunSections} fileName={CONFIG_FILE_NAME} />
}`,...b.parameters?.docs?.source},description:{story:"Dry run at phone width — the verdict badges wrap rather than clip.",...b.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  globals: {
    viewport: {
      value: "laptopShort"
    }
  },
  render: () => <StepDryRunReport sections={groupReportSections(Array.from({
    length: 6
  }, () => dryRunReport.items).flat())} fileName={CONFIG_FILE_NAME} />
}`,...A.parameters?.docs?.source},description:{story:`A household's worth of rules and senders, on the 1512×827 laptop where this
report was found running off the bottom of the screen with "Import n changes"
unreachable below it (#1021). The report scrolls inside the card; the
verdict summary at the top and the import button at the bottom both stay put.`,...A.parameters?.docs?.description}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <StepInstanceAlreadyConfigured held={HELD} />
}`,...F.parameters?.docs?.source},description:{story:"409: the instance is already configured, and neither choice is preselected.",...F.parameters?.docs?.description}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <StepInstanceAlreadyConfigured held={HELD} choice="abort" />
}`,...N.parameters?.docs?.source},description:{story:"Abort chosen: nothing is written.",...N.parameters?.docs?.description}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <StepInstanceAlreadyConfigured held={HELD} choice="merge" />
}`,...I.parameters?.docs?.source},description:{story:"Merge chosen: adds and updates only, existing accounts keep their servers.",...I.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <StepCredentialsOverview accounts={importedAccounts} />
}`,...k.parameters?.docs?.source},description:{story:"Two of three accounts cannot sync until someone signs in.",...k.parameters?.docs?.description}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <StepCredentialsOverview accounts={accountsAllPending} />
}`,..._.parameters?.docs?.source},description:{story:"Straight after the import: no account has credentials yet.",..._.parameters?.docs?.description}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <StepCredentialsOverview accounts={accountsOneFailed} />
}`,...P.parameters?.docs?.source},description:{story:"A password was entered and the server refused it — the row says why.",...P.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <StepCredentialsOverview accounts={importedAccounts} busyAccountId="acct-amstelveen" />
}`,...E.parameters?.docs?.source},description:{story:"A Microsoft reconnect is in flight; its row is busy, the rest are live.",...E.parameters?.docs?.description}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <StepCredentialsOverview accounts={accountsAllConnected} />
}`,...O.parameters?.docs?.source},description:{story:"Every account connected — the step is finally satisfiable.",...O.parameters?.docs?.description}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <div className="min-h-dvh bg-canvas p-6 font-sans">
            <div className="max-w-2xl">
                <AccountCredentialsList accounts={accountsOneFailed} />
            </div>
        </div>
}`,...L.parameters?.docs?.source},description:{story:"The same account rows as they read in Settings, outside the wizard.",...L.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <CredentialsStep {...passwordStepProps} />
}`,...D.parameters?.docs?.source},description:{story:"Password entry for one imported IMAP account.",...D.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <CredentialsStep {...passwordStepProps} error="535 5.7.8 Authentication credentials invalid. Antagonist wants the mailbox password, not your control-panel login." />
}`,...T.parameters?.docs?.source},description:{story:"Retry after a refused password: the server's own words, then the fix.",...T.parameters?.docs?.description}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <StepAccountReconnectMicrosoft account={importedAccounts[2]} position={3} total={3} />
}`,...M.parameters?.docs?.source},description:{story:"The Microsoft branch: no token travels in a config file.",...M.parameters?.docs?.description}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <StepAccountReconnectMicrosoft account={importedAccounts[2]} position={3} total={3} error="Microsoft stopped the sign-in: your organisation requires an administrator to approve Reader. Ask IT to approve it, then reconnect." />
}`,...W.parameters?.docs?.source},description:{story:"Microsoft sign-in stopped at the tenant's admin-consent screen.",...W.parameters?.docs?.description}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <StepPendingFolders folders={pendingFolders(dryRunReport)} />
}`,...z.parameters?.docs?.source},description:{story:"Imported settings that name folders discovery has not produced yet.",...z.parameters?.docs?.description}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <StepPendingFolders folders={[]} />
}`,...K.parameters?.docs?.source},description:{story:"Nothing left waiting: every folder the file named already resolved.",...K.parameters?.docs?.description}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <StepFileRejected failure={rejectionFor("wrongKind")} />
}`,...G.parameters?.docs?.source},description:{story:"Not a Reader config file at all.",...G.parameters?.docs?.description}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <StepFileRejected failure={rejectionFor("newerSchema")} />
}`,...U.parameters?.docs?.source},description:{story:"Written by a newer Reader — update before importing.",...U.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <StepFileRejected failure={rejectionFor("unknownKey")} />
}`,...B.parameters?.docs?.source},description:{story:"Keys this version does not know: refused rather than silently ignored.",...B.parameters?.docs?.description}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <StepFileRejected failure={rejectionFor("credentialField")} />
}`,...J.parameters?.docs?.source},description:{story:"The file carries a password: rejected outright, never quietly stripped.",...J.parameters?.docs?.description}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source},description:{story:`The same stop, with a server that did not say where. Nothing here may read
"landed": the reader has to go and look, and the screen says so.`,...V.parameters?.docs?.description}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:'{\n  render: () => <StepPartialImport results={sectionResults(partialImportReport)} message={writeFailure(partialImportReport)?.message ?? ""} raw={`import_write_failed: ${writeFailure(partialImportReport)?.message ?? ""}`} nothingLanded={!partialImportReport.applied} />\n}',...H.parameters?.docs?.source},description:{story:"An import that stopped half-way, saying exactly what landed.",...H.parameters?.docs?.description}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:'{\n  render: () => <StepPartialImport results={sectionResults(nothingLandedImportReport)} message={writeFailure(nothingLandedImportReport)?.message ?? ""} raw={`import_write_failed: ${writeFailure(nothingLandedImportReport)?.message ?? ""}`} nothingLanded={!nothingLandedImportReport.applied} />\n}',...q.parameters?.docs?.source},description:{story:`The same stop with no section written — the first write was the one that
failed. No section may carry a
tick, and the screen counts nothing as landed.`,...q.parameters?.docs?.description}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => <div className="min-h-dvh bg-canvas p-6 font-sans">
            <ConfigExportCard fileName="reader-config.2026-08-28.json" />
        </div>
}`,...$.parameters?.docs?.source},description:{story:"Settings → Advanced: the export half of the pair.",...$.parameters?.docs?.description}}};Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => <div className="min-h-dvh bg-canvas p-6 font-sans">
            <ConfigExportCard fileName="reader-config.2026-08-28.json" state="downloading" />
        </div>
}`,...Q.parameters?.docs?.source},description:{story:"The export is being read; the button says so rather than going quiet.",...Q.parameters?.docs?.description}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <div className="min-h-dvh bg-canvas p-6 font-sans">
            <ConfigExportCard fileName="reader-config.2026-08-28.json" state="failed" error="500 Internal Server Error — GET /config/export: sender store unreadable" />
        </div>
}`,...X.parameters?.docs?.source},description:{story:"The export failed — a dead download button would be the worse outcome.",...X.parameters?.docs?.description}}};const ur=["Walkthrough","OnboardingEntry","OnboardingEntryPhone","ChooseFile","ChooseFileDragging","ChooseFileChosen","ChooseFileReading","ChooseFileChecking","ChooseFileNotJson","DryRunReport","DryRunReportCleanInstance","DryRunReportApplying","DryRunReportUnknownSection","DryRunReportPhone","DryRunReportLongShortViewport","AlreadyConfigured","AlreadyConfiguredAbort","AlreadyConfiguredMerge","CredentialsOverview","CredentialsOverviewAllPending","CredentialsOverviewSignInFailed","CredentialsOverviewRedirecting","CredentialsOverviewComplete","AccountsNeedingCredentialsInSettings","AccountPassword","AccountPasswordRejected","AccountReconnectMicrosoft","AccountReconnectMicrosoftBlocked","PendingFolders","PendingFoldersNone","RejectedWrongFileKind","RejectedNewerSchema","RejectedUnknownKey","RejectedCredentialField","PartiallyLandedImportUnnamed","PartiallyLandedImport","NothingLandedImport","ExportCard","ExportCardDownloading","ExportCardFailed"];export{D as AccountPassword,T as AccountPasswordRejected,M as AccountReconnectMicrosoft,W as AccountReconnectMicrosoftBlocked,L as AccountsNeedingCredentialsInSettings,F as AlreadyConfigured,N as AlreadyConfiguredAbort,I as AlreadyConfiguredMerge,g as ChooseFile,v as ChooseFileChecking,y as ChooseFileChosen,f as ChooseFileDragging,S as ChooseFileNotJson,w as ChooseFileReading,k as CredentialsOverview,_ as CredentialsOverviewAllPending,O as CredentialsOverviewComplete,E as CredentialsOverviewRedirecting,P as CredentialsOverviewSignInFailed,R as DryRunReport,C as DryRunReportApplying,x as DryRunReportCleanInstance,A as DryRunReportLongShortViewport,b as DryRunReportPhone,j as DryRunReportUnknownSection,$ as ExportCard,Q as ExportCardDownloading,X as ExportCardFailed,q as NothingLandedImport,u as OnboardingEntry,h as OnboardingEntryPhone,H as PartiallyLandedImport,V as PartiallyLandedImportUnnamed,z as PendingFolders,K as PendingFoldersNone,J as RejectedCredentialField,U as RejectedNewerSchema,B as RejectedUnknownKey,G as RejectedWrongFileKind,m as Walkthrough,ur as __namedExportsOrder,mr as default};
