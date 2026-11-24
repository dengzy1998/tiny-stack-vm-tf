import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
const z=(x:number)=>x|0;
function run(p:Buffer,input:Buffer):[number[],number]{
 const s:number[]=[],c:number[]=[],m=new Int32Array(256),out:number[]=[];let pc=0,ii=0,n=0,e=-1;
 const has=(x:number)=>s.length>=x, push=(x:number)=>{if(s.length>=256){e=3;return false}s.push(z(x));return true};
 while(e<0){
  if(n>=1000000){e=10;break} if(pc<0||pc>=p.length){e=9;break}
  const op=p[pc];let q=op==1?1:op==2?4:op>=0x30&&op<=0x33?2:0;
  const known=op==0||(op>=1&&op<=7)||(op>=0x10&&op<=0x22)||(op>=0x30&&op<=0x34)||(op>=0x40&&op<=0x41)||(op>=0x50&&op<=0x53);
  if(!known){e=5;break} if(pc+1+q>p.length){e=9;break}
  const nx=pc+1+q,off=q==2?((p[pc+1]|p[pc+2]<<8)<<16)>>16:0;n++;
  switch(op){
   case 0:e=0;break;
   case 1:push((p[pc+1]<<24)>>24);break;
   case 2:push(p[pc+1]|p[pc+2]<<8|p[pc+3]<<16|p[pc+4]<<24);break;
   case 3:if(!has(1))e=2;else s.pop();break;
   case 4:if(!has(1))e=2;else push(s[s.length-1]);break;
   case 5:if(!has(2))e=2;else{const b=s.pop()!,a=s.pop()!;s.push(b,a)}break;
   case 6:if(!has(2))e=2;else push(s[s.length-2]);break;
   case 7:if(!has(3))e=2;else{const d=s.pop()!,b=s.pop()!,a=s.pop()!;s.push(b,d,a)}break;
   case 0x10:case 0x11:case 0x12:case 0x13:case 0x14:case 0x15:case 0x16:case 0x18:case 0x19:case 0x1a:case 0x1c:case 0x1d:case 0x1e:case 0x20:case 0x21:case 0x22:{
    if(!has(2)){e=2;break}const b=s.pop()!,a=s.pop()!;let r=0;
    if(op==0x10)r=a+b;else if(op==0x11)r=a-b;else if(op==0x12)r=Math.imul(a,b);
    else if(op==0x13){if(!b){e=4;break}r=Math.trunc(a/b)}else if(op==0x14){if(!b){e=4;break}r=a%b}
    else if(op==0x15){if(!b){e=4;break}r=Math.trunc((a>>>0)/(b>>>0))}else if(op==0x16){if(!b){e=4;break}r=(a>>>0)%(b>>>0)}
    else if(op==0x18)r=a&b;else if(op==0x19)r=a|b;else if(op==0x1a)r=a^b;else if(op==0x1c)r=a<<(b&31);else if(op==0x1d)r=a>>(b&31);else if(op==0x1e)r=a>>>(b&31);
    else if(op==0x20)r=a==b?1:0;else if(op==0x21)r=a<b?1:0;else r=(a>>>0)<(b>>>0)?1:0;s.push(z(r));break}
   case 0x17:if(!has(1))e=2;else s[s.length-1]=z(-s[s.length-1]);break;
   case 0x1b:if(!has(1))e=2;else s[s.length-1]=~s[s.length-1];break;
   case 0x30:pc=nx+off;break;
   case 0x31:case 0x32:if(!has(1))e=2;else{const v=s.pop()!;pc=nx;if(op==0x31?v==0:v!=0)pc=nx+off}break;
   case 0x33:if(c.length>=64)e=7;else{c.push(nx);pc=p[pc+1]|p[pc+2]<<8}break;
   case 0x34:if(!c.length)e=8;else pc=c.pop()!;break;
   case 0x40:if(!has(1))e=2;else{const a=s.pop()!;if(a<0||a>255)e=6;else s.push(m[a])}break;
   case 0x41:if(!has(2))e=2;else{const a=s.pop()!,v=s.pop()!;if(a<0||a>255)e=6;else m[a]=v}break;
   case 0x50:if(!has(1))e=2;else{const v=s.pop()!,t=String(v);if(out.length+t.length>65536)e=11;else for(let j=0;j<t.length;j++)out.push(t.charCodeAt(j))}break;
   case 0x51:if(!has(1))e=2;else if(out.length>=65536)e=11;else out.push(s.pop()!&255);break;
   case 0x52:push(ii<input.length?input[ii++]:-1);break;
   case 0x53:if(!has(1))e=2;else e=s.pop()!&255;break;
  }
  if(e>=0)break;if(op<0x30||op>0x34)pc=nx;
 }
 return[out,e];
}
for(const id of readdirSync(I).sort()){const d=join(I,id),o=join(O,id);mkdirSync(o,{recursive:true});const r=run(readFileSync(join(d,'program.bin')),readFileSync(join(d,'input.bin')));writeFileSync(join(o,'stdout.bin'),Buffer.from(r[0]));writeFileSync(join(o,'exit.txt'),r[1]+'\n')}
