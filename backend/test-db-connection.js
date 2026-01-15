const { Client } = require('pg');

async function testConnection() {
  const configs = [
    {
      name: 'localhost (sem senha)',
      connectionString: 'postgresql://postgres@localhost:5432/shopee_downloader'
    },
    {
      name: 'localhost (com senha)',
      connectionString: 'postgresql://postgres:postgres@localhost:5432/shopee_downloader'
    },
    {
      name: '127.0.0.1 (sem senha)',
      connectionString: 'postgresql://postgres@127.0.0.1:5432/shopee_downloader'
    },
    {
      name: '127.0.0.1 (com senha)',
      connectionString: 'postgresql://postgres:postgres@127.0.0.1:5432/shopee_downloader'
    }
  ];

  for (const config of configs) {
    console.log(`\n🔍 Testando conexão com: ${config.name}`);
    const client = new Client({ connectionString: config.connectionString });
    
    try {
      await client.connect();
      const result = await client.query('SELECT NOW()');
      console.log(`✅ Conexão bem-sucedida! Timestamp: ${result.rows[0].now}`);
      await client.end();
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
  }
}

testConnection();
