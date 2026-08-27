const worker = new Worker('worker.bundle.js');

worker.onmessage = e => {
  const output = document.getElementById('output');
  if (output) {
    output.innerText = JSON.stringify(e.data, null, 2);
  }
  console.log('Worker Message:', e.data);
};

worker.onerror = e => {
  console.error('Worker Error:', e.message);
};
