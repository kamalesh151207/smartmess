const { execSync } = require('child_process');
const fs = require('fs');

const script = fs.readFileSync('push_to_supabase.js', 'utf8');
const fixedScript = script.replace("rl.question('Paste your Supabase PostgreSQL connection string (including password):\\n> ', (url) => {", 
"const url = 'postgresql://postgres.daqzspkmzxicejcmfnxn:-_h83qy-AwhLPkY@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres'; {");

fs.writeFileSync('temp_push.js', fixedScript);
execSync('node temp_push.js', { stdio: 'inherit' });
fs.unlinkSync('temp_push.js');
