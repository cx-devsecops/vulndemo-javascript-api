// Run with: node --test test/
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const adminService = require('../services/admin.service');

const run = (command) =>
  new Promise((resolve) =>
    adminService.runCommand({ command }, (err, out) => resolve({ err, out }))
  );

test('allowlisted command runs', async () => {
  const { err, out } = await run('whoami');
  assert.ifError(err);
  assert.ok(out.trim().length > 0);
});

test('shell injection via metacharacters is rejected and not executed', async () => {
  const marker = path.join(os.tmpdir(), `cmdinj-${process.pid}-${Date.now()}`);
  for (const payload of [
    `date; touch ${marker}`,
    `date && touch ${marker}`,
    `date | touch ${marker}`,
    `$(touch ${marker})`,
    `\`touch ${marker}\``,
    `date\ntouch ${marker}`,
  ]) {
    const { err } = await run(payload);
    assert.ok(err, `expected rejection for: ${payload}`);
  }
  assert.strictEqual(fs.existsSync(marker), false);
});

test('arbitrary and non-string commands are rejected', async () => {
  for (const payload of ['rm -rf /', 'cat /etc/passwd', '', undefined, null, 42, {}, ['date'], '__proto__', 'constructor']) {
    const { err } = await run(payload);
    assert.ok(err, `expected rejection for: ${String(payload)}`);
  }
});
