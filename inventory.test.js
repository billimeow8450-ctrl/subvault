import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCredentials, grossRevenue} from './inventory.js';
import {calculateExpiry,sortAccountsByExpiry,getDaysLeft,localDate} from './dateUtils.js';
test('imports all four delimiters without cutting passwords containing separators',()=>{
 assert.deepEqual(parseCredentials('a@example.test:p:a|s,s\nb@example.test|pipe:pass\nc@example.test,comma|pass\nd@example.test space pass\n# comment\ninvalid'),[
  {email:'a@example.test',password:'p:a|s,s'},{email:'b@example.test',password:'pipe:pass'},{email:'c@example.test',password:'comma|pass'},{email:'d@example.test',password:'space pass'}]);
 assert.equal(parseCredentials(Array.from({length:500},(_,i)=>`user${i}:pass${i}`).join('\n')).length,500);
});
test('expired sales keep revenue; refunds and unsold stock do not count',()=>{
 const sold={status:'sold',soldPrice:19.99,expiryDate:'2020-01-01'};
 assert.equal(grossRevenue([sold,{status:'fresh',soldPrice:100},{status:'listed',soldPrice:100}]),19.99);
 assert.equal(grossRevenue([{...sold,status:'fresh'}]),0);
 assert.equal(grossRevenue([{status:'sold',soldPrice:0.1},{status:'sold',soldPrice:0.2}]),0.3);
});
test('calendar arithmetic crosses leap years, years and DST safely',()=>{
 assert.equal(calculateExpiry('2028-02-28',1),'2028-02-29');
 assert.equal(calculateExpiry('2026-12-31',30),'2027-01-30');
 assert.equal(calculateExpiry('2026-03-07',2),'2026-03-09');
 assert.equal(calculateExpiry('',30),'');assert.equal(calculateExpiry('2026-11-17',''), '');
 assert.equal(getDaysLeft(localDate()).days,0);
});
test('expiry ordering prioritizes expired and soon-to-expire inventory',()=>{
 const input=[{id:'later',expiryDate:'2027-01-01'},{id:'none'},{id:'expired',expiryDate:'2020-01-01'},{id:'soon',expiryDate:'2026-11-20'}];
 assert.deepEqual(sortAccountsByExpiry(input).map(a=>a.id),['expired','soon','later','none']);assert.equal(input[0].id,'later');
});
