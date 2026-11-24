import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const inputDir = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function run(program: Buffer, input: Buffer): [number[], number] {
  const st = new Int32Array(256), mem = new Int32Array(256), calls = new Int32Array(64);
  let sp = 0, cp = 0, pc = 0, ip = 0, steps = 0;
  const out: number[] = [];
  let code = 0;

  run: while (true) {
    if (steps >= 1000000) { code = 10; break; }
    if (pc < 0 || pc >= program.length) { code = 9; break; }
    const start = pc, op = program[pc];
    let ilen = 0;
    if (op === 1) ilen = 1;
    else if (op === 2) ilen = 4;
    else if (op >= 0x30 && op <= 0x33) ilen = 2;
    else if (op !== 0 && op !== 3 && op !== 4 && op !== 5 && op !== 6 && op !== 7 &&
      !(op >= 0x10 && op <= 0x22) && !(op >= 0x34 && op <= 0x34) &&
      !(op >= 0x40 && op <= 0x53)) { code = 5; break; }
    if (start + 1 + ilen > program.length) { code = 9; break; }
    const imm = start + 1, next = start + 1 + ilen;

    let pops = 0, pushes = 0;
    if (op === 3 || op === 0x17 || op === 0x1b || op === 0x40 || op === 0x50 ||
        op === 0x51 || op === 0x53 || op === 0x31 || op === 0x32) pops = 1;
    else if (op === 5 || (op >= 0x10 && op <= 0x16) || (op >= 0x18 && op <= 0x1a) ||
        (op >= 0x1c && op <= 0x1e) || (op >= 0x20 && op <= 0x22) || op === 0x41) pops = 2;
    else if (op === 6) { pops = 2; pushes = 3; }
    else if (op === 7) { pops = 3; pushes = 3; }
    if (op === 4 || op === 1 || op === 2 || op === 0x52) pushes = op === 4 ? 2 : 1;
    if (sp < pops) { code = 2; break; }
    if (sp - pops + pushes > 256) { code = 3; break; }
    steps++;
    pc = next;

    let a: number, b: number, c: number;
    switch (op) {
      case 0: code = 0; break run;
      case 1: st[sp++] = (program[imm] << 24) >> 24; break;
      case 2: st[sp++] = program.readInt32LE(imm); break;
      case 3: --sp; break;
      case 4: st[sp] = st[sp - 1]; sp++; break;
      case 5: a = st[sp - 2]; st[sp - 2] = st[sp - 1]; st[sp - 1] = a; break;
      case 6: a = st[sp - 2]; st[sp++] = a; break;
      case 7: a = st[sp - 3]; st[sp - 3] = st[sp - 2]; st[sp - 2] = st[sp - 1]; st[sp - 1] = a; break;
      case 0x10: b = st[--sp]; a = st[--sp]; st[sp++] = (a + b) | 0; break;
      case 0x11: b = st[--sp]; a = st[--sp]; st[sp++] = (a - b) | 0; break;
      case 0x12: b = st[--sp]; a = st[--sp]; st[sp++] = Math.imul(a, b); break;
      case 0x13:
        b = st[sp - 1]; a = st[sp - 2]; if (b === 0) { code = 4; break run; }
        st[sp - 2] = a === -2147483648 && b === -1 ? -2147483648 : (Math.trunc(a / b) | 0); --sp; break;
      case 0x14:
        b = st[sp - 1]; a = st[sp - 2]; if (b === 0) { code = 4; break run; }
        st[sp - 2] = a % b; --sp; break;
      case 0x15:
        b = st[sp - 1] >>> 0; a = st[sp - 2] >>> 0; if (b === 0) { code = 4; break run; }
        st[sp - 2] = Math.floor(a / b) | 0; --sp; break;
      case 0x16:
        b = st[sp - 1] >>> 0; a = st[sp - 2] >>> 0; if (b === 0) { code = 4; break run; }
        st[sp - 2] = (a % b) | 0; --sp; break;
      case 0x17: st[sp - 1] = -st[sp - 1]; break;
      case 0x18: b = st[--sp]; st[sp - 1] &= b; break;
      case 0x19: b = st[--sp]; st[sp - 1] |= b; break;
      case 0x1a: b = st[--sp]; st[sp - 1] ^= b; break;
      case 0x1b: st[sp - 1] = ~st[sp - 1]; break;
      case 0x1c: b = st[--sp]; st[sp - 1] = st[sp - 1] << (b & 31); break;
      case 0x1d: b = st[--sp]; st[sp - 1] = st[sp - 1] >> (b & 31); break;
      case 0x1e: b = st[--sp]; st[sp - 1] = st[sp - 1] >>> (b & 31); break;
      case 0x20: b = st[--sp]; st[sp - 1] = st[sp - 1] === b ? 1 : 0; break;
      case 0x21: b = st[--sp]; st[sp - 1] = st[sp - 1] < b ? 1 : 0; break;
      case 0x22: b = st[--sp] >>> 0; st[sp - 1] = (st[sp - 1] >>> 0) < b ? 1 : 0; break;
      case 0x30: pc = next + program.readInt16LE(imm); break;
      case 0x31: if (st[--sp] === 0) pc = next + program.readInt16LE(imm); break;
      case 0x32: if (st[--sp] !== 0) pc = next + program.readInt16LE(imm); break;
      case 0x33:
        if (cp >= 64) { code = 7; break run; }
        calls[cp++] = next; pc = program.readUInt16LE(imm); break;
      case 0x34:
        if (!cp) { code = 8; break run; }
        pc = calls[--cp]; break;
      case 0x40:
        a = st[sp - 1]; if (a < 0 || a > 255) { code = 6; break run; }
        st[sp - 1] = mem[a]; break;
      case 0x41:
        a = st[sp - 1]; if (a < 0 || a > 255) { code = 6; break run; }
        b = st[sp - 2]; sp -= 2; mem[a] = b; break;
      case 0x50:
        a = st[sp - 1]; c = String(a).length;
        if (out.length + c > 65536) { code = 11; break run; }
        for (const x of Buffer.from(String(a))) out.push(x);
        --sp; break;
      case 0x51:
        if (out.length === 65536) { code = 11; break run; }
        out.push(st[--sp] & 255); break;
      case 0x52: st[sp++] = ip < input.length ? input[ip++] : -1; break;
      case 0x53: code = st[--sp] & 255; break run;
    }
  }
  return [out, code];
}

for (const id of readdirSync(inputDir).sort()) {
  const dir = join(inputDir, id);
  const [out, code] = run(readFileSync(join(dir, 'program.bin')), readFileSync(join(dir, 'input.bin')));
  const od = join(outputDir, id);
  mkdirSync(od, { recursive: true });
  writeFileSync(join(od, 'stdout.bin'), Buffer.from(out));
  writeFileSync(join(od, 'exit.txt'), code + '\n');
}
