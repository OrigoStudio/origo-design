const fs = require('fs');
const path = require('path');

const base = 'packages/angular-renderer/src/components/primitives';

// 1. Textarea.scss display block
const textareaScss = path.join(base, 'textarea/textarea.component.scss');
let scss = fs.readFileSync(textareaScss, 'utf8');
scss = scss.replace('display: inline-block;', 'display: block;');
fs.writeFileSync(textareaScss, scss);

// 2. Switch.scss literal px
const switchScss = path.join(base, 'switch/switch.component.scss');
let swScss = fs.readFileSync(switchScss, 'utf8');
swScss = swScss.replace(/2px/g, 'var(--origo-border-width-md)');
fs.writeFileSync(switchScss, swScss);

console.log('Done CSS');
