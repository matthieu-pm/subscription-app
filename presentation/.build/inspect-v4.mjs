import fs from 'node:fs/promises';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('presentation/output/Subscript-UX-Writing-Final-Workshop-v3.pptx'));
const inspection=await p.inspect({kind:'slide,textbox,image,table,layout',maxChars:60000});await fs.writeFile('presentation/.build/source-v3.ndjson',inspection.ndjson);console.log(inspection.ndjson);
await fs.mkdir('presentation/.build/source-v3-renders',{recursive:true});
for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(`presentation/.build/source-v3-renders/slide-${i+1}.png`,new Uint8Array(await(await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
