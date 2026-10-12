import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='/Users/matthieu/Projects/subscription-app';
const BUILD=path.join(ROOT,'presentation/.build');
const SKILL='/Users/matthieu/.codex/plugins/cache/openai-primary-runtime/presentations/26.1009.11318/skills/presentations';
const source=path.join(ROOT,'presentation/output/Subscript-UX-Writing-Final-Workshop-v3.pptx');
const p=await PresentationFile.importPptx(await FileBlob.load(source));
const records=(await fs.readFile(path.join(BUILD,'source-v3.ndjson'),'utf8')).trim().split('\n').map(JSON.parse);
function change(oldText,newText,style,position){const found=records.filter(x=>x.kind==='textbox'&&x.text===oldText);if(found.length!==1)throw new Error(`Expected one text shape for ${oldText}, got ${found.length}`);const s=p.resolve(found[0].id);s.text.replace(oldText,newText);if(style)s.text.style=style;if(position)s.position={...found[0].position,...position};return s;}
function addText(slide,body,x,y,w,h,size,color='#F7F7FA',bold=false){const s=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});s.text=body;s.text.style={typeface:'Geist',fontSize:size,color,bold,insets:0,verticalAlignment:'top',autoFit:'none',wrap:'square'};return s;}
change('Casual and upbeat, precise about money, never judgmental.','Friendly in everyday moments. Clear when money is involved.');
change('Everyday words and natural contractions.\n“Let’s make this feel like you.”','A natural question, a personal welcome.\n“What should we call you?”');
change('Warmth in low-stakes moments.\n“A little heads-up before your next payment.”','“Meet your regulars.” “No accounts? No rush.”\nA little wit, with room to choose.');
change('The interactive demo','The interactive demos');
change('Open Subscript','Both prototypes, one voice',{fontSize:50});
const demoSlide=p.slides.items[3];
addText(demoSlide,'Blue prototype',80,377,850,35,23,'#A6A6AE');
change('Scan the QR code or click the link.','Yellow prototype',{fontSize:23,color:'#A6A6AE'},{top:502,height:36});
const yellowUrl='subscript-yellow-prototype.vercel.app';const link=addText(demoSlide,yellowUrl,80,540,860,54,32,'#91B4FF');link.text.get(yellowUrl).link={uri:'https://'+yellowUrl,isExternal:true};
change('Choose “Explore the demo” to open Home.\nOpen Apple TV to review the renewal and cancellation flow.','Choose “Explore the demo” in either prototype.\nOpen Apple TV to review its renewal and cancellation steps.',undefined,{top:650});
addText(demoSlide,'Scan for the blue prototype',1030,233,480,40,25,'#F7F7FA');
change('A clear promise,\na visible next step','A familiar moment,\na friendly invitation');
change('“All your subscriptions. One place.”','“They renew. You remember.”');
change('The headline explains the product in familiar words.','A short, memorable reminder of what Subscript helps you track.');
change('“Get started” and “Explore the demo”','“Your subscriptions have a way of adding up.”');
change('Two direct paths let people set up or try the sample data.','A knowing smile in the welcome. Clear buttons still explain what happens next.');
change('“Privacy” and “Notification settings”','“Glad you asked” in Help');
change('Concrete labels help people find the control they need.','Questions get a warm welcome. Account and privacy controls keep familiar labels.');
change('Clear words help users understand costs,\njudge renewal estimates and cancel\nwith the right provider.','A friendly voice makes the app approachable.\nPrecise payment and cancellation copy\nhelps people decide what to do.');
change('Compare original and revised copy on comprehension, completion and confidence. Refine and document the voice, estimate and status rules.','Compare both prototypes for clarity and warmth. Test the revised copy, then refine the shared voice guide.');
for(const [index,file] of [[4,'welcome-v4.png'],[5,'home-v4.png'],[6,'profile-v4.png']]){
 const record=records.find(x=>x.kind==='image'&&x.slideIndex===index);const im=p.resolve(record.id);
 const keep={frame:im.frame,crop:im.crop,geometry:im.geometry,borderRadius:im.borderRadius,rotation:im.rotation,flipHorizontal:im.flipHorizontal,flipVertical:im.flipVertical,lockAspectRatio:im.lockAspectRatio};
 const bytes=await fs.readFile(path.join(BUILD,file));im.replace({blob:bytes,contentType:'image/png',alt:`Current live Subscript ${file.split('-')[0]} screen`,fit:im.fit||'contain'});Object.assign(im,keep);
 const notes=p.slides.items[index].speakerNotes;
 notes.text=notes.text.replace(/Screenshot: revised mobile-revolut web build,[\s\S]*?(?=\n|$)/,'Screenshot: live blue prototype at https://subscription-app-alpha-vert.vercel.app, captured on 12 October 2026. Browser viewport 430 × 932 CSS pixels, 1290 × 2796 image pixels. Browser capture in the existing presentation frame; native iOS effects are not demonstrated.');
 notes.text=notes.text.replace('Profile capture refreshed in the browser at 430 × 932 CSS pixels after removing the design-study attribution.','The profile screenshot comes from the current production prototype.');
}
p.slides.items[1].speakerNotes.text+='\nCurrent voice examples from both prototypes and voice-and-tone.md: They renew. You remember.; Meet your regulars.; No accounts? No rush.; Glad you asked. Headlines and supporting copy carry the personality. Amounts, dates, action labels, and cancellation consequences remain explicit.';
demoSlide.speakerNotes.text='Live prototypes: Blue: https://subscription-app-alpha-vert.vercel.app. Yellow: https://subscript-yellow-prototype.vercel.app. The QR opens the blue prototype. Both links are clickable. Choose Explore the demo to open Home. Email demo verification code: 123456. Sample data only; no real bank access, payments, or cancellations. Both prototypes share the revised voice.';
p.slides.items[4].speakerNotes.text+='\nThe yellow prototype uses the same welcome headline and supporting copy. Demo disclosures and action labels remain explicit in both versions.';
await fs.mkdir(path.join(BUILD,'renders-v4'),{recursive:true});
for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(path.join(BUILD,'renders-v4',`slide-${i+1}.png`),new Uint8Array(await(await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
const candidate=path.join(BUILD,'candidate-v4.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);
const {finalizePresentation}=await import(path.join(SKILL,'container_tools/artifact_tool_utils.mjs'));
const result=await finalizePresentation({workspaceDir:ROOT,candidatePath:candidate,finalPath:path.join(ROOT,'presentation/output/Subscript-UX-Writing-Final-Workshop-v4.pptx'),pythonExecutable:'/Users/matthieu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','3'],explicitTotalSlideCount:9,requiredNativeTableOwnerSlides:[3],fontPolicy:{basis:'reference',families:['Geist'],referencePath:source,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(source)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(BUILD,'validation-v4.json')});console.log(JSON.stringify(result));
