const fs = require('fs');
const path = 'c:/Users/gubat/Downloads/Its312-softeng/frontend/src/components/AdminApplicants.jsx';
const txt = fs.readFileSync(path, 'utf8');
const open = (txt.match(/<div\b/g) || []).length;
const close = (txt.match(/<\/div>/g) || []).length;
console.log('div open', open, 'close', close);
