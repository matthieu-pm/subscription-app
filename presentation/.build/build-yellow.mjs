import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const require=createRequire(import.meta.url);
const {FontLibrary,Canvas}=require('/Users/matthieu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/node_modules/skia-canvas');
const QRCode=require('../../mobile-revolut/node_modules/qrcode');
const ROOT='/Users/matthieu/Projects/subscription-app',BUILD=path.join(ROOT,'presentation/.build');
const C={paper:'#F8F6F0',ink:'#1E1F20',muted:'#686862',yellow:'#F7CE46',white:'#FFFFFF',line:'#D9D8D0'};
FontLibrary.use('Barlow Condensed',path.join(ROOT,'node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2'));
FontLibrary.use('DM Sans',path.join(ROOT,'node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2'));
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(ROOT,'presentation/output/Subscript-UX-Writing-Final-Workshop-v4.pptx')));
const records=(await fs.readFile(path.join(BUILD,'source-v4.ndjson'),'utf8')).trim().split('\n').map(JSON.parse);
const find=t=>{const r=records.filter(r=>r.kind==='textbox'&&r.text===t);if(r.length!==1)throw new Error('Text match '+r.length+': '+t);return r[0]};
function change(oldText,newText,style={},position={}){let r=find(oldText),s=p.resolve(r.id);s.text.replace(s.text.toString(),newText);s.text.style=style;s.position={...r.position,...position};return s;}
function add(slide,t,x,y,w,h,size=30,bold=false,font='DM Sans',fill='none') {const s=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}});s.text=t;s.text.style={typeface:font,fontSize:size,color:C.ink,bold,insets:0,wrap:'square',autoFit:'none',verticalAlignment:'top'};return s;}
const ctx=new Canvas(1600,900).getContext('2d');
function width(t,size,font='Barlow Condensed',bold=true){ctx.font=`${bold?'bold':'normal'} ${size}px "${font}"`;return Math.ceil(ctx.measureText(t).width);}
function marker(oldText,lines,{size=68,x,y,w=900}={}){const r=find(oldText),s=p.resolve(r.id),slide=p.slides.items[r.slideIndex];x??=r.position.left;y??=r.position.top;const step=size*1.08;s.text=lines[0].toUpperCase();s.text.style={typeface:'Barlow Condensed',fontSize:size,color:C.ink,bold:true};s.position={left:x,top:y,width:w,height:step};for(let i=1;i<lines.length;i++){const t=lines[i].toUpperCase(),hi=i===lines.length-1;const a=add(slide,t,x,y+step*i,hi?Math.min(w,width(t,size)+24):w,step,size,true,'Barlow Condensed',hi?C.yellow:'none');if(hi)a.text.style={insets:{left:10,right:10,top:0,bottom:0}};}}
for(let i=0;i<p.slides.items.length;i++){
 const slide=p.slides.items[i];slide.background.fill=[3,8].includes(i)?C.yellow:C.paper;
 slide.speakerNotes.text=slide.speakerNotes.text.replace(/Design: mobile-revolut[^\n]*\n/,'Design: yellow prototype src/styles.css, src/flows.css and src/main.tsx. Barlow Condensed bold uppercase headings, DM Sans body text, warm paper #F8F6F0, charcoal #1E1F20 and yellow #F7CE46.\n');
 slide.speakerNotes.text+='\nYellow edition: same nine-slide workshop narrative as the blue v4 presentation. Screen-label quotations are aligned with the yellow interface. Typography files are taken directly from the yellow application dependencies.';
}
for(const r of records.filter(r=>r.kind==='textbox')){
 const s=p.resolve(r.id),isHeading=r.style.bold&&r.style.fontSize>=38;
 s.text.style={typeface:isHeading?'Barlow Condensed':'DM Sans',color:r.style.color==='#A6A6AE'?C.muted:C.ink,bold:!!r.style.bold};
 if(isHeading){s.text=r.text.toUpperCase();s.text.style={fontSize:r.style.fontSize*1.15};}
 if(r.position.top===125&&isHeading){s.text.style={fontSize:76};s.position={...r.position,height:90};}
 if(r.position.top===135&&isHeading){s.text.style={fontSize:76};s.position={...r.position,height:96};}
 if(r.text==='Subscript'){s.text='subscript.';s.text.style={fontSize:30,bold:true};}
 if(r.text.startsWith('r/'))s.text.style={bold:true,color:'#476341'};
}
marker('Clear costs.\nConfident renewal\ndecisions.',['Clear costs.','Confident renewal','decisions.'],{size:104,y:154,w:840});
change('Review a subscription renewal,\nthen keep, edit or cancel.','Review a subscription renewal,\nthen keep, edit or cancel.',{fontSize:32},{top:530,width:790,height:100});
change('ONE RENEWAL JOURNEY','ONE RENEWAL JOURNEY',{fontSize:25,bold:true,typeface:'Barlow Condensed'},{top:627,height:40});
change('1   See subscriptions and billing frequency\n2   Review Apple TV’s €120 yearly renewal\n3   Keep, correct, or cancel with Apple','1   See subscriptions and billing frequency\n2   Review Apple TV’s €120 yearly renewal\n3   Keep, correct, or cancel with Apple',{fontSize:24},{top:680,height:145,width:550});
marker('A clever, knowledgeable friend',['A clever, knowledgeable friend'],{size:58,y:247,w:1400});
// Keep persona and voice examples comfortably separated.
for(const [title,bodyY,titleY] of [['Conversational',491,447],['Knowledgeable',630,586],['Lightly playful',769,725]]){let r=find(title);p.resolve(r.id).position={...r.position,top:titleY,height:40};const b=records.find(x=>x.kind==='textbox'&&x.slideIndex===1&&x.position.left===850&&x.position.top===({Conversational:498,Knowledgeable:628,'Lightly playful':758}[title]));p.resolve(b.id).position={...b.position,top:bodyY,height:83};p.resolve(b.id).text.style={fontSize:25};}
change('Explain costs and how we calculate them.\n“Monthly average” / “Yearly plans divided by 12.”','Explain costs and how we calculate them.\n“Monthly equivalent” / “Annual plans spread across 12 months.”',{fontSize:24},{top:630,height:88});
change('Wants one clear overview of costs and renewals.\nWorries about forgotten renewals, averages that look like bills, and whether cancellation stopped payments.','Wants one clear overview of costs and renewals.\nWorries about forgotten renewals, averages that look like bills, and whether cancellation stopped payments.',{fontSize:25},{top:675,height:145});
for(const table of p.slides.items[2].tables.items){table.borders.assign({fill:C.line,width:1,style:'solid'});for(let r=0;r<5;r++)for(let c=0;c<2;c++){const cell=table.getCell(r,c);cell.fill=r===0?C.yellow:(c===1?C.white:'#EEECE5');cell.text.style={typeface:'DM Sans',fontSize:r===0?24:25,color:C.ink,bold:r===0,insets:18};}}
change('Scan for the blue prototype','Scan for the yellow prototype',{fontSize:25,bold:true});
change('Both prototypes, one voice','BOTH PROTOTYPES, ONE VOICE',{fontSize:59,typeface:'Barlow Condensed',bold:true},{top:289,height:78});
for(const url of ['subscription-app-alpha-vert.vercel.app','subscript-yellow-prototype.vercel.app']){p.resolve(find(url).id).text.style={color:C.ink,fontSize:31,underline:true};}
marker('A familiar moment,\na friendly invitation',['A familiar moment,','a friendly invitation'],{size:66,y:272,w:885});
marker('One overview of\ncosts and renewals',['One overview of','costs and renewals'],{size:66,y:270,w:865});
marker('Account information\nand controls together',['Account information','and controls together'],{size:66,y:270,w:885});
change('“Monthly average” with the calculation','“Monthly equivalent” with the calculation',{fontSize:29});
change('“Yearly plans divided by 12” explains what the €39 represents.','“Annual plans spread across 12 months” explains what the €39 represents.',{fontSize:27});
change('“Estimated next payments”','“Your subscriptions” and estimated renewals',{fontSize:29});
change('“Linked accounts” and “Your subscriptions”','“Connected accounts” and “Active subscriptions”',{fontSize:28});
change('A friendly voice makes the app approachable.\nPrecise payment and cancellation copy\nhelps people decide what to do.','A FRIENDLY VOICE MAKES THE APP APPROACHABLE.\nPRECISE PAYMENT AND CANCELLATION COPY\nHELPS PEOPLE DECIDE WHAT TO DO.',{fontSize:62,typeface:'Barlow Condensed',bold:true},{top:260,height:221});
for(const r of records.filter(r=>r.kind==='shape'&&[4,5,6].includes(r.slideIndex))){const s=p.resolve(r.id);if(r.position.width>300){s.fill=C.ink;s.line={fill:C.ink,width:2};}else if(r.position.width===108){s.fill=C.ink;s.line={fill:C.ink,width:0};}}
async function replaceImage(index,file,position){const r=records.find(r=>r.kind==='image'&&r.slideIndex===index),im=p.resolve(r.id);const keep={frame:im.frame,crop:im.crop,geometry:im.geometry,borderRadius:im.borderRadius,rotation:im.rotation,flipHorizontal:im.flipHorizontal,flipVertical:im.flipVertical,lockAspectRatio:im.lockAspectRatio};im.replace({blob:await fs.readFile(path.join(BUILD,file)),contentType:'image/png',alt:`Yellow Subscript ${file}`,fit:'contain'});Object.assign(im,keep);if(position)im.position=position;}
await replaceImage(0,'yellow-art.png',{left:925,top:210,width:600,height:385});
await QRCode.toFile(path.join(BUILD,'yellow-qr.png'),'https://subscript-yellow-prototype.vercel.app',{width:1000,margin:4,errorCorrectionLevel:'H',color:{dark:C.ink,light:C.paper}});
await replaceImage(3,'yellow-qr.png');
for(const [index,file] of [[4,'yellow-welcome.png'],[5,'yellow-home.png'],[6,'yellow-profile.png']]){
 await replaceImage(index,file);
 const notes=p.slides.items[index].speakerNotes;notes.text=notes.text.replace(/Screenshot: live blue prototype[^\n]*/,'Screenshot: live yellow prototype at https://subscript-yellow-prototype.vercel.app, captured on 12 October 2026. Browser viewport 430 × 932 CSS pixels, 1290 × 2796 image pixels. Browser capture shown in the existing presentation phone frame.').replace('The profile screenshot comes from the current production prototype.','The profile screenshot comes from the yellow production prototype.');
}
p.slides.items[0].speakerNotes.text=p.slides.items[0].speakerNotes.text.replace(/Artwork: existing prototype asset[^\n]*/,'Artwork: existing yellow prototype welcome screen receipt illustration, captured from the live browser.');
p.slides.items[3].speakerNotes.text=p.slides.items[3].speakerNotes.text.replace('The QR opens the blue prototype.','The QR opens the yellow prototype.');
p.slides.items[5].speakerNotes.text+='\nYellow UI wording: Monthly equivalent; Annual plans spread across 12 months; Your subscriptions; Est. renewal. The underlying cost-comprehension lesson and amounts are unchanged.';
await fs.mkdir(path.join(BUILD,'renders-yellow'),{recursive:true});
for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(path.join(BUILD,'renders-yellow',`slide-${i+1}.png`),new Uint8Array(await(await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
await(await PresentationFile.exportPptx(p)).save(path.join(BUILD,'candidate-yellow.pptx'));
await fs.writeFile(path.join(BUILD,'yellow-inspect.ndjson'),(await p.inspect({kind:'slide,textbox,shape,image,table',maxChars:140000})).ndjson);
console.log('Yellow candidate exported; nine slides rendered.');
