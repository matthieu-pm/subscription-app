import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import QRCode from 'qrcode';
import { networkInterfaces } from 'node:os';
const interfaces=networkInterfaces();
const lanIp=process.env.REACT_NATIVE_PACKAGER_HOSTNAME ?? [...(interfaces.en0??[]),...Object.values(interfaces).flat()].find(x=>x && x.family==='IPv4'&&!x.internal)?.address;
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const expo=spawn(process.execPath,[resolve(root,'node_modules/expo/bin/cli'),'start',process.argv.includes('--tunnel')?'--tunnel':'--lan','--port','8081'],{cwd:root,stdio:'inherit'});
let stopped=false;
expo.on('exit',code=>{stopped=true;process.exitCode=code??0});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopped=true;expo.kill(signal)});
for(let attempt=0;attempt<60&&!stopped;attempt++){
  await new Promise(r=>setTimeout(r,2000));
  try{
    const response=await fetch('http://localhost:8081',{headers:{'expo-platform':'ios',accept:'application/expo+json'}});
    const manifest=await response.json();const host=process.argv.includes('--tunnel')?manifest.extra?.expoClient?.hostUri:(lanIp?`${lanIp}:8081`:undefined);
    if(!host)continue;
    await mkdir(resolve(root,'artifacts'),{recursive:true});
    await QRCode.toFile(resolve(root,'artifacts/iphone-qr.png'),`exp://${host}`,{width:420,margin:3});
    console.log(`\nSubscript iPhone QR refreshed: ${resolve(root,'artifacts/iphone-qr.png')}\n`);break;
  }catch{}
}
