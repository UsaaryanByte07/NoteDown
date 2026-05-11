/**
 * apply-patches.js
 *
 * Copies patched files over node_modules files that have known bugs.
 * Run automatically via the "postinstall" npm script so patches survive npm install.
 *
 * Patches applied:
 *   - @adminjs/mongoose/lib/property.js
 *     Fixes: TypeError: Cannot destructure property 'instance' of 'this.mongoosePath.caster'
 *            as it is undefined. (Mongoose v9 + @adminjs/mongoose@4.x incompatibility)
 *     Root cause: Mongoose v9 DocumentArrayPath (arrays like [{ type: ObjectId, ref: 'X' }])
 *                 can have caster === undefined. The package assumed caster always exists.
 */

const fs = require('fs');
const path = require('path');

const PATCHES = [
  {
    src: path.join(__dirname, '../patches/adminjs-mongoose-property.js'),
    dest: path.join(__dirname, '../node_modules/@adminjs/mongoose/lib/property.js'),
  },
];

for (const { src, dest } of PATCHES) {
  if (!fs.existsSync(dest)) {
    console.warn(`[apply-patches] Destination not found, skipping: ${dest}`);
    continue;
  }
  fs.copyFileSync(src, dest);
  console.log(`[apply-patches] Patched: ${dest}`);
}
