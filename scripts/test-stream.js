// Script de prueba para ver el formato del stream
const fetch = require('node-fetch');

async function testStream() {
  console.log('Probando stream...\n');

  const response = await fetch('http://localhost:3000/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'session=test' // Reemplazar con tu cookie de sesión real
    },
    body: JSON.stringify({
      message: 'Hola'
    })
  });

  console.log('Status:', response.status);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));
  console.log('\nStream content:\n---');

  const reader = response.body;
  let buffer = '';

  for await (const chunk of reader) {
    const text = chunk.toString();
    buffer += text;
    console.log('CHUNK:', JSON.stringify(text));
  }

  console.log('\n---\nFull buffer:', buffer);
}

testStream().catch(console.error);
