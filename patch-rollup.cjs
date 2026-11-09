const fs = require('fs');
const path = 'node_modules/rollup/dist/native.js';
let content = fs.readFileSync(path, 'utf8');

const target = `const nativeModule = requireWithFriendlyError(
\texistsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`
);`;

const replacement = `let nativeModule;
try {
  nativeModule = requireWithFriendlyError(
    existsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`
  );
} catch (e) {
  nativeModule = require('@rollup/wasm-node/dist/native.js');
}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully patched rollup with wasm fallback!');
} else {
  // Try CRLF matching
  const targetCRLF = target.replace(/\n/g, '\r\n');
  const replacementCRLF = replacement.replace(/\n/g, '\r\n');
  if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, replacementCRLF);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully patched rollup (CRLF) with wasm fallback!');
  } else {
    console.log('Already patched or target not found');
  }
}

