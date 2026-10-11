import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { Presentation, PresentationFile } from '@oai/artifact-tool';
const require = createRequire(import.meta.url);
const QRCode = require('../../mobile-revolut/node_modules/qrcode');
const ROOT = '/Users/matthieu/Projects/subscription-app';
const BUILD = path.join(ROOT,'presentation/.build');
const SKILL = '/Users/matthieu/.codex/plugins/cache/openai-primary-runtime/presentations/26.1009.11318/skills/presentations';
const DEMO='https://subscription-app-alpha-vert.vercel.app';
const WORKSHOP='https://skema-immerse-learn.lovable.app/workshop/final-workshop?room=e4460260-b740-460c-91d8-c3aa16c3ff76';
const sources=[
'https://www.reddit.com/r/Windscribe/comments/1gttu9i/denied_refund_after_my_subscription_autorenewed/',
'https://www.reddit.com/r/appletv/comments/wxle7w/why_is_it_nearly_impossible_to_cancel_my_apple_tv/',
'https://www.reddit.com/r/budgetingforbeginners/comments/1vbvho6/how_do_you_keep_track_of_all_your_subscriptions/',
'https://www.reddit.com/r/Millennials/comments/1qv9rbe/are_forgotten_subscriptions_that_big_of_a_problem/'
];
await QRCode.toFile(path.join(BUILD,'demo-qr.png'),DEMO,{width:1000,margin:4,errorCorrectionLevel:'H',color:{dark:'#101014',light:'#FFFFFF'}});
const p=Presentation.create({slideSize:{width:1600,height:900}});
const C={text:'#F7F7FA',muted:'#A6A6AE',accent:'#91B4FF',bg:'#000000',surface:'#19191F'};
function text(s,body,x,y,w,h,size=30,color=C.text,bold=false){
 const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0,style:'solid'}});
 a.text=body; a.text.style={typeface:'Geist',fontSize:size,color,bold,insets:0,verticalAlignment:'top',autoFit:'none',wrap:'square'}; return a;
}
function block(s,title,body,x,y,w=650){text(s,title,x,y,w,44,30,C.text,true);text(s,body,x,y+53,w,105,27,C.muted);}
function slide(n,title,kind='dark'){
 const s=p.slides.add();s.background.fill=kind==='blue'?'linear(120deg, #233AFA 0%, #0B1034 65%, #000000 100%)':'linear(120deg, #0B1034 0%, #000000 58%, #000000 100%)';
 text(s,'Subscript',80,43,500,38,28,C.text,true);text(s,String(n).padStart(2,'0'),1450,47,70,30,22,C.muted);
 if(title)text(s,title,80,125,1400,140,60,C.text,true);
 s.speakerNotes.text=`UX Writing Final Workshop. Authors: Matthieu Duchatellier and Alexandru Oprea. Source: saved final workshop content read in Aside on 11 October 2026. ${WORKSHOP}\nDesign: mobile-revolut/src/theme.ts and mobile-revolut/App.tsx. Geist typography, navy and black backgrounds, blue gradients.\n`;
 return s;
}
async function image(s,file,x,y,w,h,extra={}){let b=await fs.readFile(file);return s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',alt:path.basename(file),position:{left:x,top:y,width:w,height:h},fit:'contain',...extra});}
function round(s,x,y,w,h,fill,r=40,stroke='#42424C',sw=2){return s.shapes.add({geometry:'roundRect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width:sw},borderRadius:r});}
async function phone(s,file){
 // An explicitly requested iPhone-style frame. The screen pixels remain the browser capture.
 const x=1085,y=87,w=345,h=w*932/430;
 round(s,x-13,y-23,w+26,h+45,'#111115',50,'#62626D',3);
 await image(s,path.join(BUILD,file),x,y,w,h,{geometry:'roundRect',borderRadius:37});
 round(s,x+w/2-43,y+7,86,17,'#000000',9,'#000000',0);
 round(s,x+w/2-54,y+h+9,108,4,'#F7F7FA',2,'#F7F7FA',0);
 s.speakerNotes.text+=`\nScreenshot: revised mobile-revolut web build, captured from localhost:8087 in Aside on 11 October 2026. Demo destination: ${DEMO}. 430 × 932 CSS pixels, 1290 × 2796 image pixels. iPhone 14 Pro Max browser preset in a generic iPhone-style presentation frame, approved by the user instead of a physical iPhone 18 Pro capture. It does not demonstrate native iOS Liquid Glass or haptics.`;
}

// 1 Scope and project
{
const s=slide(1,null);s.background.fill='#000000';text(s,'Clear costs.\nConfident renewal\ndecisions.',80,158,920,290,82,C.text,true);
text(s,'Review a subscription renewal,\nthen keep, edit or cancel.',84,485,850,95,35,C.accent);
text(s,'Matthieu Duchatellier and Alexandru Oprea\nUX Writing Final Workshop',84,750,850,80,25,C.muted);
await image(s,path.join(ROOT,'mobile-revolut/assets/welcome-hero.png'),965,125,550,550);
text(s,'ONE RENEWAL JOURNEY',970,652,540,40,20,C.accent,true);
text(s,'1   See subscriptions and billing frequency\n2   Review Apple TV’s €120 yearly renewal\n3   Keep, correct, or cancel with Apple',970,706,550,125,24,C.text);
s.speakerNotes.text+='\nScope starts after account sync: see subscriptions and billing frequency. Review Apple TV’s estimated €120 yearly renewal and the observed payment history. Keep it, correct details, or cancel with Apple before updating Subscript’s record. Users must distinguish averaged costs, renewal estimates, and cancellation with the provider. Artwork: existing prototype asset mobile-revolut/assets/welcome-hero.png, generated for this prototype.';
}
// 2 Persona and voice
{
const s=slide(2,'Voice & persona');
text(s,'A clever, knowledgeable friend',80,254,1400,62,44,C.accent,true);
text(s,'Casual and upbeat, precise about money, never judgmental.',80,324,1400,52,30);
text(s,'Alex',80,445,650,65,51,C.text,true);text(s,'Working persona',80,519,650,32,22,C.accent);
text(s,'A busy young professional with several monthly services and one yearly streaming plan.',80,565,650,100,28);
text(s,'Wants one clear overview of costs and renewals.\nWorries about forgotten renewals, averages that look like bills, and whether cancellation stopped payments.',80,680,650,140,27,C.muted);
block(s,'Conversational','Everyday words and natural contractions.\n“Let’s make this feel like you.”',850,445,650);
block(s,'Knowledgeable','Explain costs and how we calculate them.\n“Monthly average” / “Yearly plans divided by 12.”',850,575,650);
block(s,'Lightly playful','Warmth in low-stakes moments.\n“A little heads-up before your next payment.”',850,705,650);
s.speakerNotes.text+='\nThe app uses Recorded payment for historical entries and Estimated next payment for future dates. Verification now says Enter the demo code and explains that no email was sent. Cancellation stays calm and explicit about the provider action.';
}
// 3 Semantic research, full source quotes in notes as well as visible source links
{
const s=slide(3,'Semantic research');
text(s,'Public desk research. These are forum posts, not interviews.',80,222,1400,40,25,C.muted);
const quotes=[
['“I did not expect it to auto-renew.”','r/Windscribe'],
['“I’ve been trying to cancel my subscription for almost an hour now and it’s driving me mental.”','r/appletv'],
['“I want to find an easy way to keep track of everything and review it from time to time.”','r/budgetingforbeginners'],
['“Yes, I’ve forgotten about subscriptions. I forgot to cancel my ancestry subscription last month.”','r/Millennials']
];
quotes.forEach(([q,src],i)=>{let y=294+i*137;text(s,q,80,y,660,95,25);let a=text(s,src,80,y+96,660,28,20,C.accent);a.text.get(src).link={uri:sources[i],isExternal:true};});
text(s,'Words we reuse',810,293,700,46,33,C.accent,true);
const data=[['Company wording','User wording'],['Predicted renewal','Estimated next payment'],['Ongoing subscription portfolio','Your subscriptions'],['Normalized annual expenditure','Yearly plans divided by 12'],['Provider handoff / cancellation status update','Cancel with Apple, then update Subscript']];
const t=s.tables.add({rows:5,columns:2,left:810,top:357,width:710,height:449,columnWidths:[330,380],values:data});
t.borders.assign({fill:'#37373C',width:1,style:'solid'});
for(let r=0;r<5;r++)for(let c=0;c<2;c++){let cell=t.getCell(r,c);cell.fill=r===0?'#232E83':C.surface;cell.text.style={typeface:'Geist',fontSize:r===0?24:25,bold:r===0,color:c===1?C.text:C.muted,insets:18};}
s.speakerNotes.text+='\nResearch quotes retained from the saved workshop and verified against public Reddit pages on 11 October 2026. Qualitative signals, not prevalence estimates.\n'+quotes.map(([q,src],i)=>`${q}\n${src}: ${sources[i]}`).join('\n\n');
}
// 4 Demo link and QR
{
const s=slide(4,'The interactive demo','blue');
text(s,'Open Subscript',80,300,840,90,66,C.text,true);
const a=text(s,'subscription-app-alpha-vert.vercel.app',80,410,865,62,32,C.accent);a.text.get('subscription-app-alpha-vert.vercel.app').link={uri:DEMO,isExternal:true};
text(s,'Scan the QR code or click the link.',80,497,850,55,30);
text(s,'Choose “Explore the demo” to open Home.\nOpen Apple TV to review the renewal and cancellation flow.',80,606,835,135,29);
text(s,'Sample data only. No real bank connection or payment.',80,805,1300,36,23,C.muted);
await image(s,path.join(BUILD,'demo-qr.png'),1030,280,480,480);
s.speakerNotes.text+=`\nDemo URL: ${DEMO}. Vercel project subscription-app serves mobile-revolut. Verified welcome, Home and Profile through the public alias. QR encodes this exact URL. Browser data is stored locally. Explore the demo bypasses onboarding. Email demo verification code, if needed: 123456.`;
}
// 5,6,7 Screen studies replacing before/after
{
const s=slide(5,null);text(s,'The first screen',80,135,935,100,64,C.text,true);
text(s,'A clear promise,\na visible next step',80,276,885,155,53,C.accent,true);
block(s,'“All your subscriptions. One place.”','The headline explains the product in familiar words.',80,479,840);
block(s,'“Get started” and “Explore the demo”','Two direct paths let people set up or try the sample data.',80,645,840);
await phone(s,'welcome-v2.png');
}
{
const s=slide(6,null);text(s,'Home',80,135,935,100,64,C.text,true);
text(s,'One overview of\ncosts and renewals',80,270,865,155,53,C.accent,true);
block(s,'“Monthly average” with the calculation','“Yearly plans divided by 12” explains what the €39 represents.',80,457,850);
block(s,'“Estimated next payments”','Apple TV still shows €120, billed yearly. Its €10 monthly average helps compare costs without changing the bill.',80,618,850);
text(s,'Demo snapshot: November 2026',80,812,850,35,23,C.muted);
await phone(s,'home-v2.png');
s.speakerNotes.text+='\nAmounts are fictional prototype data. The initial four subscriptions have a €39 monthly average or €468 yearly estimate. Apple TV costs €120/year and contributes €10 to the monthly average. Upcoming dates are estimates. The revised UI names the average and explains yearly plans divided by 12 immediately below it. User testing should still check comprehension.';
}
{
const s=slide(7,null);text(s,'Profile',80,135,935,100,64,C.text,true);
text(s,'Account information\nand controls together',80,270,865,155,53,C.accent,true);
block(s,'“Linked accounts” and “Your subscriptions”','Visible counts make the current account state easy to read.',80,455,850);
block(s,'“Privacy” and “Notification settings”','Concrete labels help people find the control they need.',80,615,850);
text(s,'Alex Morgan is the fictional demo profile.',80,812,850,35,23,C.muted);
await phone(s,'profile-v2.png');
}
// 8 Conclusion
{
const s=slide(8,'Conclusion');
text(s,'Clear words help users understand costs,\njudge renewal estimates and cancel\nwith the right provider.',80,256,1430,215,54,C.accent,true);
const cols=[['Cost comprehension','Fewer questions about the €39 monthly average and the €120 yearly payment.','Measure whether users explain the difference.'],['Cancellation clarity','Fewer mistaken cancellation reports and billing-support requests.','Test whether users identify Apple as the canceller.'],['Decision confidence','More confident keep, edit or cancel decisions.','Measure completion and perceived clarity.']];
cols.forEach(([h,b,m],i)=>{let x=80+i*497;text(s,h,x,541,450,70,32,C.text,true);text(s,b,x,625,450,122,27,C.muted);text(s,m,x,755,450,85,25,C.accent);});
text(s,'Expected impacts to test, not measured results or verified savings.',80,853,1410,29,21,C.muted);
}
// 9 Going further
{
const s=slide(9,'Going further','blue');
const items=[
['01','Five moderated tests','Ask users to explain €39 versus €120, identify the estimated date, and show where billing is stopped.'],
['02','Verified cancellation guidance','Check Apple’s current route. Add guidance for each platform, then test reporting, correcting and undoing a status.'],
['03','Copy comparison and voice rules','Compare original and revised copy on comprehension, completion and confidence. Refine and document the voice, estimate and status rules.']
];
items.forEach(([n,h,b],i)=>{let y=295+i*183;text(s,n,80,y,100,85,60,C.accent,true);text(s,h,240,y,1250,58,38,C.text,true);text(s,b,240,y+68,1200,99,30,C.text);});
}
await fs.mkdir(path.join(BUILD,'renders-v2'),{recursive:true});
for(let i=0;i<p.slides.items.length;i++){
const s=p.slides.items[i];await fs.writeFile(path.join(BUILD,'renders-v2',`slide-${i+1}.png`),new Uint8Array(await (await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));
}
const candidate=path.join(BUILD,'candidate-v2.pptx');await (await PresentationFile.exportPptx(p)).save(candidate);
const {finalizePresentation}=await import(path.join(SKILL,'container_tools/artifact_tool_utils.mjs'));
const result=await finalizePresentation({workspaceDir:ROOT,candidatePath:candidate,finalPath:path.join(ROOT,'presentation/output/Subscript-UX-Writing-Final-Workshop-v2.pptx'),pythonExecutable:'/Users/matthieu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','3'],explicitTotalSlideCount:9,requiredNativeTableOwnerSlides:[3],fontPolicy:{basis:'design',families:['Geist']},verifyArtifactToolImport:true,receiptPath:path.join(BUILD,'validation-v2.json')});
console.log(JSON.stringify(result));
