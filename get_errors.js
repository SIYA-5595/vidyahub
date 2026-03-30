const { execSync } = require('child_process');
const fs = require('fs');

var output = [];
try {
  execSync('npx eslint app components lib --quiet --format=json', {
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 20 * 1024 * 1024
  });
  output.push('No errors found!');
} catch (e) {
  var results = JSON.parse(e.stdout.toString());
  results.forEach(function(r) {
    if (r.errorCount > 0) {
      r.messages.forEach(function(m) {
        if (m.severity === 2) {
          output.push(r.filePath + ':' + m.line + ':' + m.column + ' [' + m.ruleId + '] ' + m.message);
        }
      });
    }
  });
}

fs.writeFileSync('eslint_errors.json', JSON.stringify(output, null, 2), 'utf8');
console.log('Done. Found ' + output.length + ' errors. Written to eslint_errors.json');
output.forEach(function(line) { console.log(line); });
