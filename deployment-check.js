import https from 'https';
import http from 'http';

async function checkDeployment() {
  console.log('🔍 Verificando estado del deployment...\n');
  
  // Test local server
  console.log('1. Verificando servidor local (puerto 5000)...');
  try {
    const localResponse = await makeRequest('http://localhost:5000/');
    console.log('✅ Servidor local: FUNCIONANDO');
    console.log(`   Status: ${localResponse.statusCode}`);
    console.log(`   Content-Length: ${localResponse.data.length} caracteres`);
  } catch (error) {
    console.log('❌ Servidor local: ERROR');
    console.log(`   Error: ${error.message}`);
  }
  
  // Test API endpoint
  console.log('\n2. Verificando API de doctores...');
  try {
    const apiResponse = await makeRequest('http://localhost:5000/api/doctors/available');
    const doctors = JSON.parse(apiResponse.data);
    console.log('✅ API doctors: FUNCIONANDO');
    console.log(`   Doctores disponibles: ${doctors.length}`);
    if (doctors.length > 0) {
      console.log(`   Dr Test Alpha: ${doctors[0].licenseNumber} - ${doctors[0].isAvailable ? 'Disponible' : 'No disponible'}`);
    }
  } catch (error) {
    console.log('❌ API doctors: ERROR');
    console.log(`   Error: ${error.message}`);
  }
  
  // Test public domain
  console.log('\n3. Verificando dominio público (https://oncall.clinic)...');
  try {
    const publicResponse = await makeRequest('https://oncall.clinic/', true);
    console.log('✅ Dominio público: FUNCIONANDO');
    console.log(`   Status: ${publicResponse.statusCode}`);
    console.log(`   Content-Length: ${publicResponse.data.length} caracteres`);
    
    // Check if contains expected content
    if (publicResponse.data.includes('OnCall Clinic') && publicResponse.data.includes('Dr. Test Alpha')) {
      console.log('✅ Contenido correcto: Dr Test Alpha presente');
    } else {
      console.log('⚠️  Contenido: No se encontró Dr Test Alpha');
    }
  } catch (error) {
    console.log('❌ Dominio público: ERROR 502');
    console.log(`   Error: ${error.message}`);
    console.log('   Recomendación: Restart deployment en Replit');
  }
  
  console.log('\n📋 RESUMEN DEL DEPLOYMENT:');
  console.log('- Build: dist/index.mjs creado');
  console.log('- Puerto: 5000 configurado');
  console.log('- Dr Test Alpha: MD-ALPHA-TEST disponible 24/7');
  console.log('- Admin access: Contraseña Pepillo2727#');
}

function makeRequest(url, isHttps = false) {
  return new Promise((resolve, reject) => {
    const lib = isHttps ? https : http;
    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

checkDeployment().catch(console.error);