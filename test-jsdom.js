const { JSDOM } = require('jsdom');
const dom = new JSDOM();
console.log('performance exists?', typeof dom.window.performance !== 'undefined');
console.log('mark exists?', typeof dom.window.performance.mark !== 'undefined');
console.log('measure exists?', typeof dom.window.performance.measure !== 'undefined');
