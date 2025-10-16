#!/usr/bin/env node
import { promises as fs } from 'fs';
import { Cell } from 'ton-core';

function hexToBuffer(hex) {
  return Buffer.from(hex.replace(/\s+/g, ''), 'hex');
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/parse_boc.mjs <hex-or-base64>');
    process.exit(2);
  }

  let buf;
  // detect base64 (contains non-hex chars) or hex
  if (/^[0-9a-fA-F]+$/.test(arg.replace(/\s+/g, ''))) {
    buf = hexToBuffer(arg);
  } else {
    // try base64
    try {
      buf = Buffer.from(arg, 'base64');
    } catch (e) {
      console.error('Input not hex or valid base64');
      process.exit(3);
    }
  }

  try {
    console.log('Buffer length:', buf.length);
    console.log('Header (first 16 bytes):', buf.slice(0, 16).toString('hex'));
    // try Cell.fromBoc first
    let cells;
    try {
      cells = Cell.fromBoc(buf);
      console.log('Parsed cells via Cell.fromBoc:', cells.length);
    } catch (e) {
      console.warn('Cell.fromBoc failed:', e && e.message ? e.message : e);
      // try alternative exports from ton-core
      const ton = await import('ton-core');
      const avail = Object.keys(ton).join(', ');
      console.log('ton-core exports:', avail);
      if (typeof ton.deserializeBoc === 'function') {
        try {
          cells = ton.deserializeBoc(buf);
          console.log('Parsed cells via deserializeBoc:', cells.length);
        } catch (e2) {
          console.warn('deserializeBoc failed:', e2 && e2.message ? e2.message : e2);
        }
      }
      if (!cells && typeof ton.fromBoc === 'function') {
        try {
          cells = ton.fromBoc(buf);
          console.log('Parsed cells via fromBoc:', cells.length);
        } catch (e3) {
          console.warn('fromBoc failed:', e3 && e3.message ? e3.message : e3);
        }
      }
      if (!cells) throw new Error('All BOC parse attempts failed');
    }

    const slice = cells[0].beginParse();
    // read common jetton transfer fields
    const op = slice.loadUint(32);
    const queryId = slice.loadUint(64);
    const amount = slice.loadCoins();
    const dest = slice.loadAddress();
    const responseTo = slice.loadAddress();
    const forward = slice.loadCoins();

    console.log('op:', '0x' + op.toString(16));
    console.log('queryId:', queryId.toString());
    console.log('amount (nano units):', amount.toString());
    console.log('destination address:', dest ? dest.toString() : null);
    console.log('response_to address:', responseTo ? responseTo.toString() : null);
    console.log('forward TON (nanoton):', forward.toString());
    process.exit(0);
  } catch (e) {
    console.error('BOC parse failed:', e && e.message ? e.message : e);
    process.exit(4);
  }
}

main();
