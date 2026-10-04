/* ===== TraceLens demo investigation: "Orion Procurement Review" (synthetic) ===== */
const DEMO = (() => {
  const docs = [
    { id:'D1', name:'transaction_record.pdf', type:'PDF', pages:6, unit:'Page', size:'412 KB', meta:'Consolidated transfer record, Jan–Apr 2026', date:'2026-04-10' },
    { id:'D2', name:'contract.pdf', type:'PDF', pages:12, unit:'Page', size:'1.1 MB', meta:'Procurement Agreement, Nova Infrastructure and Orion Systems', date:'2026-01-05' },
    { id:'D3', name:'interview_notes.pdf', type:'PDF', pages:10, unit:'Page', size:'236 KB', meta:'Internal review interview, 2 Apr 2026', date:'2026-04-02' },
    { id:'D4', name:'email_archive.pdf', type:'PDF', pages:48, unit:'Message', size:'2.4 MB', meta:'Exported mailbox, 48 messages', date:'2026-04-12' },
    { id:'D5', name:'financial_report.pdf', type:'PDF', pages:18, unit:'Page', size:'1.8 MB', meta:'FY2025-26 financial report, issued 30 Apr 2026', date:'2026-04-30' }
  ];
  const P=(id,name,al)=>({id,name,type:'Person',aliases:al||[name]});
  const O=(id,name,al)=>({id,name,type:'Organization',aliases:al||[name]});
  const M=(id,name,al)=>({id,name,type:'Money',aliases:al||[name]});
  const Dt=(id,name,al)=>({id,name,type:'Date',aliases:al||[name]});
  const entities = [
    P('rajiv','Rajiv Mehta',['Rajiv Mehta','R. Mehta','Mehta']), P('anil','Anil Rao'), P('priya','Priya Nair'), P('dev','Dev Kulkarni'),
    O('nova','Nova Infrastructure',['Nova Infrastructure Ltd','Nova Infrastructure','Nova']),
    O('orion','Orion Systems',['Orion Systems Pvt Ltd','Orion Systems','Orion']),
    O('apex','Apex Consulting',['Apex Consulting','Apex']),
    {id:'hyd',name:'Hyderabad',type:'Location',aliases:['Hyderabad']},
    {id:'equip',name:'Network equipment',type:'Product',aliases:['network equipment']},
    M('m8','₹8,00,000',['₹8,00,000','₹8 lakh']), M('m42','₹42,00,000'), M('m14','₹14,00,000'), M('m120','₹1,20,000'),
    M('m20','₹20,000'), M('m60','₹60,000'), M('m28','₹28,00,000'),
    Dt('d0105','5 Jan 2026',['5 January 2026']), Dt('d0109','9 Jan 2026',['9 January 2026']), Dt('d0115','15 Jan 2026',['15 January 2026']),
    Dt('d0122','22 Jan 2026'), Dt('d0203','3 Feb 2026'), Dt('d0204','4 Feb 2026',['04 Feb 2026']), Dt('d0220','20 Feb 2026'),
    Dt('d0312','12 Mar 2026'), Dt('d0318','18 Mar 2026'), Dt('d0328','28 Mar 2026'),
    Dt('d0402','2 Apr 2026',['02 Apr 2026','2 April 2026']), Dt('d0403','3 Apr 2026',['03 Apr 2026']),
    {id:'trf1',name:'TRF-88231',type:'ID',aliases:['TRF-88231']}, {id:'trf2',name:'TRF-88377',type:'ID',aliases:['TRF-88377']},
    {id:'acct',name:'A/c ending 4417',type:'ID',aliases:['A/c ending 4417']}
  ];
  const ev=(id,doc,page,section,type,text,ents,conf,imp,tags,extra)=>Object.assign({id,doc,page,section,type,text,entities:ents,conf,importance:imp,tags},extra||{});
  const evidence = [
    ev('E-001','D2',1,'Parties and Scope','Contract term','This Procurement Agreement is entered into on 5 January 2026 between Nova Infrastructure Ltd and Orion Systems Pvt Ltd for the supply of network equipment valued at ₹42,00,000.',['nova','orion','equip','m42','d0105'],96,'High',['contract']),
    ev('E-002','D2',7,'Payment Terms','Contract term','Orion Systems shall invoice Nova Infrastructure in three equal milestones of ₹14,00,000. Release of the final milestone requires a delivery confirmation signed by Nova Infrastructure.',['orion','nova','m14'],95,'High',['contract','milestones']),
    ev('E-003','D2',9,'Approvals','Approval','Procurement approval was granted by Rajiv Mehta, Head of Procurement at Nova Infrastructure, on 9 January 2026.',['rajiv','nova','d0109'],93,'Medium',['approval']),
    ev('E-004','D1',3,'Transfers','Transaction','12 Mar 2026 | TRF-88231 | Debit: Rajiv Mehta (A/c ending 4417) | Credit: Orion Systems Pvt Ltd | ₹8,00,000 | Ref: CONSULT-ADV',['rajiv','orion','m8','d0312','trf1','acct'],95,'High',['transaction','personal-account'],{amount:800000,date:'2026-03-12'}),
    ev('E-005','D1',2,'Vendor payments','Transaction','04 Feb 2026 | TRF-88102 | Debit: Nova Infrastructure Ltd | Credit: Orion Systems Pvt Ltd | ₹14,00,000 | Ref: MILESTONE-1',['nova','orion','m14','d0204'],94,'Medium',['transaction','milestones'],{amount:1400000,date:'2026-02-04'}),
    ev('E-006','D1',2,'Vendor payments','Transaction','22 Jan 2026 | Debit: Nova Infrastructure Ltd | Credit: Apex Consulting | ₹20,000 | Ref: ADVISORY-RETAINER',['nova','apex','m20','d0122'],90,'Low',['transaction','retainer'],{amount:20000,date:'2026-01-22'}),
    ev('E-007','D1',3,'Vendor payments','Transaction','20 Feb 2026 | Debit: Nova Infrastructure Ltd | Credit: Apex Consulting | ₹60,000 | Ref: ADVISORY-RETAINER',['nova','apex','m60','d0220'],90,'Low',['transaction','retainer'],{amount:60000,date:'2026-02-20'}),
    ev('E-008','D1',4,'Vendor payments','Transaction','28 Mar 2026 | Debit: Nova Infrastructure Ltd | Credit: Apex Consulting | ₹1,20,000 | Ref: ADVISORY-RETAINER',['nova','apex','m120','d0328'],90,'Low',['transaction','retainer'],{amount:120000,date:'2026-03-28'}),
    ev('E-009','D1',4,'Vendor payments','Transaction','02 Apr 2026 | TRF-88301 | Debit: Nova Infrastructure Ltd | Credit: Orion Systems Pvt Ltd | ₹14,00,000 | Ref: MILESTONE-2',['nova','orion','m14','d0402'],94,'Medium',['transaction','milestones'],{amount:1400000,date:'2026-04-02'}),
    ev('E-010','D1',5,'Vendor payments','Transaction','03 Apr 2026 | TRF-88377 | Debit: Nova Infrastructure Ltd | Credit: Orion Systems Pvt Ltd | ₹14,00,000 | Ref: MILESTONE-2',['nova','orion','m14','d0403','trf2'],94,'High',['transaction','milestones','repeat-reference'],{amount:1400000,date:'2026-04-03'}),
    ev('E-011','D4',42,'Message 42','Communication','From: Rajiv Mehta | To: Anil Rao (Orion Systems) | 18 Mar 2026: Confirming the ₹8,00,000 sent on 12 Mar 2026 has reached you. Please book it as an advisory fee and keep it separate from the main invoice.',['rajiv','anil','orion','m8','d0318','d0312'],91,'High',['email','advisory-fee']),
    ev('E-012','D4',17,'Message 17','Communication','From: Rajiv Mehta | To: Priya Nair (Apex Consulting) | 3 Feb 2026: Please share your advisory proposal for Nova by Friday so we can finalise the retainer.',['rajiv','priya','apex','nova','d0203'],88,'Medium',['email','proposal']),
    ev('E-013','D3',8,'Statement on vendor relationships','Statement','Rajiv Mehta stated that he had no financial relationship with Orion Systems and had never transferred personal funds to any vendor. (Interview conducted by Dev Kulkarni on 2 April 2026.)',['rajiv','orion','dev','d0402'],92,'High',['statement','denial']),
    ev('E-014','D3',5,'Approval timeline','Statement','Mehta recalled that procurement approval was given on 15 January 2026, after the board meeting.',['rajiv','d0115'],86,'Medium',['statement','approval']),
    ev('E-015','D5',14,'Vendor payments','Report figure','Total payments to Orion Systems during FY2025-26 amounted to ₹28,00,000.',['orion','m28'],89,'Medium',['report','totals']),
    ev('E-016','D2',3,'Delivery','Contract term','Equipment shall be delivered to the Nova Infrastructure data centre at Hyderabad.',['nova','hyd'],90,'Low',['contract','delivery'])
  ];
  const R=(id,s,t,type,evs,conf)=>({id,s,t,type,ev:evs,conf});
  const relationships = [
    R('R-01','rajiv','nova','Employed as Head of Procurement',['E-003'],96),
    R('R-02','rajiv','orion','Financial relationship (transfer)',['E-004','E-011'],91),
    R('R-03','nova','orion','Contracting parties',['E-001'],97),
    R('R-04','nova','orion','Milestone payments',['E-005','E-009','E-010'],94),
    R('R-05','nova','apex','Advisory retainer payments',['E-006','E-007','E-008'],90),
    R('R-06','rajiv','apex','Requested proposal from',['E-012'],82),
    R('R-07','anil','orion','Contact at',['E-011'],85),
    R('R-08','rajiv','anil','Corresponded with',['E-011'],88),
    R('R-09','priya','apex','Contact at',['E-012'],80),
    R('R-10','rajiv','priya','Corresponded with',['E-012'],80),
    R('R-11','nova','hyd','Delivery site',['E-016'],84),
    R('R-12','orion','equip','Supplier of',['E-001'],95),
    R('R-13','dev','rajiv','Interviewed',['E-013','E-014'],92),
    R('R-14','rajiv','acct','Holder of account',['E-004'],89),
    R('R-15','trf1','orion','Credited to',['E-004'],90),
    R('R-16','rajiv','trf1','Originated transaction',['E-004'],90),
    R('R-17','trf2','orion','Payment under repeated reference',['E-010'],78),
    R('R-18','trf1','m8','Transfer amount',['E-004'],93)
  ];
  const EVT=(id,date,desc,evs,ents,kind)=>({id,date,desc,ev:evs,entities:ents,kind:kind||'fact'});
  const events = [
    EVT('EV-001','2026-01-05','Procurement agreement dated between Nova Infrastructure and Orion Systems',['E-001'],['nova','orion']),
    EVT('EV-002','2026-01-09','Procurement approval recorded for Rajiv Mehta',['E-003'],['rajiv','nova']),
    EVT('EV-003','2026-01-15','Approval date as recalled by Rajiv Mehta in interview (claimed)',['E-014'],['rajiv'],'claim'),
    EVT('EV-004','2026-01-22','₹20,000 advisory retainer paid to Apex Consulting',['E-006'],['nova','apex']),
    EVT('EV-005','2026-02-03','Rajiv Mehta asks Apex Consulting for an advisory proposal',['E-012'],['rajiv','priya','apex']),
    EVT('EV-006','2026-02-04','Milestone 1: ₹14,00,000 paid to Orion Systems',['E-005'],['nova','orion']),
    EVT('EV-007','2026-02-20','₹60,000 advisory retainer paid to Apex Consulting',['E-007'],['nova','apex']),
    EVT('EV-008','2026-03-12','₹8,00,000 transferred from Rajiv Mehta’s account to Orion Systems',['E-004'],['rajiv','orion']),
    EVT('EV-009','2026-03-18','Email from Rajiv Mehta to Anil Rao referring to the ₹8,00,000 transfer',['E-011'],['rajiv','anil','orion']),
    EVT('EV-010','2026-03-28','₹1,20,000 advisory retainer paid to Apex Consulting',['E-008'],['nova','apex']),
    EVT('EV-011','2026-04-02','Milestone 2: ₹14,00,000 paid to Orion Systems',['E-009'],['nova','orion']),
    EVT('EV-012','2026-04-02','Interview: Rajiv Mehta denies any financial relationship with Orion Systems',['E-013'],['rajiv','orion','dev'],'claim'),
    EVT('EV-013','2026-04-03','Second ₹14,00,000 payment to Orion Systems under the same MILESTONE-2 reference',['E-010'],['nova','orion']),
    EVT('EV-014','2026-04-30','Financial report states ₹28,00,000 paid to Orion Systems in FY2025-26',['E-015'],['orion'],'claim')
  ];
  const contradictions = [
    { id:'C-07', type:'Claim vs evidence', severity:'High', conf:93, a:['E-013'], b:['E-004','E-011'],
      title:'Denied financial relationship vs. transfer evidence',
      conflict:'The interview statement denies any financial relationship with Orion Systems, but a transfer record and an email both refer to a ₹8,00,000 transfer from Rajiv Mehta’s account to Orion Systems on 12 Mar 2026.',
      caution:'This is a potential contradiction. It does not establish intent or wrongdoing and requires human verification, for example confirming account ownership and the purpose of the transfer.',
      next:['Confirm ownership of account ending 4417','Ask Orion Systems how the CONSULT-ADV reference was booked'],
      chain:[['Finding','Potential financial relationship with Orion Systems'],['Claim','Personal funds of ₹8,00,000 were transferred to Orion Systems'],['Evidence','E-004 transfer record and E-011 email'],['Source','transaction_record.pdf, email_archive.pdf'],['Location','Page 3, Message 42']] },
    { id:'C-02', type:'Date conflict', severity:'Medium', conf:88, a:['E-014'], b:['E-003'],
      title:'Approval date differs between interview and contract record',
      conflict:'The contract approvals section records approval on 9 Jan 2026. The interview records approval as recalled on 15 Jan 2026, six days later.',
      caution:'A recalled date can differ from a recorded date for ordinary reasons. Check the approval workflow log.',
      next:['Retrieve the approval workflow log','Obtain the board meeting minutes referenced in the interview'],
      chain:[['Finding','Possible inconsistency in approval date'],['Claim','Approval was given on 15 January 2026'],['Evidence','E-014 against E-003'],['Source','interview_notes.pdf, contract.pdf'],['Location','Page 5, Page 9']] },
    { id:'C-03', type:'Amount conflict', severity:'Medium', conf:84, a:['E-015'], b:['E-005','E-009','E-010'],
      title:'Reported total to Orion Systems vs. recorded payments',
      conflict:'The financial report states ₹28,00,000 was paid to Orion Systems. The transfer record lists three ₹14,00,000 credits from Nova Infrastructure (₹42,00,000). The ₹14,00,000 difference matches the second payment under the MILESTONE-2 reference.',
      caution:'The report may be net of a reversal or timing difference that is not in this document set. Requires human verification.',
      next:['Check for a reversal or refund of TRF-88377','Reconcile the report with the ledger'],
      chain:[['Finding','Possible inconsistency in total paid to Orion Systems'],['Claim','₹28,00,000 paid during FY2025-26'],['Evidence','E-015 against E-005, E-009, E-010'],['Source','financial_report.pdf, transaction_record.pdf'],['Location','Page 14, Pages 2 to 5']] }
  ];
  const nonMilestone = evidence.filter(e=>e.type==='Transaction' && !/MILESTONE/.test(e.text) && e.id!=='E-004').map(e=>e.amount);
  const lo=Math.min(...nonMilestone), hi=Math.max(...nonMilestone);
  const anomalies = [
    { id:'A-03', title:'Transfer well above the typical non-milestone range', observed:800000, lo, hi, ev:['E-004'], conf:87,
      text:'The ₹8,00,000 transfer is significantly higher than the typical non-milestone transaction range observed in this document set.',
      caution:'Unusual size alone is not evidence of wrongdoing. Check the stated purpose (CONSULT-ADV).' },
    { id:'A-05', title:'Same payment reference used on two consecutive days', ev:['E-009','E-010'], conf:82,
      text:'Two ₹14,00,000 payments to Orion Systems carry the reference MILESTONE-2 (TRF-88301 on 2 Apr and TRF-88377 on 3 Apr), while the contract describes only three milestones.',
      caution:'This may be a duplicate posting or a legitimate split. Check bank confirmations.' }
  ];
  const gaps = [
    { id:'G-01', title:'Delivery confirmation not found', severity:'High', ev:['E-002'], expected:'Delivery confirmation signed by Nova Infrastructure',
      text:'The contract references a delivery confirmation before release of the final milestone, but no matching delivery confirmation was found in the uploaded document set.', next:'Search for a delivery receipt or signed confirmation record.' },
    { id:'G-02', title:'Milestone invoices not found', severity:'Medium', ev:['E-002'], expected:'Three milestone invoices from Orion Systems',
      text:'The contract requires milestone invoices. Payments are recorded, but no invoices are present to match them.', next:'Request the invoice register for Orion Systems.' },
    { id:'G-03', title:'Board meeting minutes not found', severity:'Medium', ev:['E-014'], expected:'Minutes of the board meeting before 15 Jan 2026',
      text:'The interview refers to a board meeting preceding approval. No minutes or agenda are in the document set.', next:'Request board minutes for January 2026.' },
    { id:'G-04', title:'Apex Consulting proposal or engagement letter not found', severity:'Low', ev:['E-012','E-006'], expected:'Advisory proposal or engagement letter',
      text:'An email requests an advisory proposal from Apex Consulting and retainers were paid, but no proposal or engagement letter is present.', next:'Search procurement files for the Apex engagement terms.' }
  ];
  return { key:'demo', label:'Orion Procurement Review', synthetic:true, docs, entities, evidence, relationships, events, contradictions, anomalies, gaps };
})();
