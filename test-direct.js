const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:kNLfeRIQRjdRMqMH@db.klruigddjntsrgfsgnen.supabase.co:5432/postgres',
  connectionTimeoutMillis: 10000,
});

client.connect((err) => {
  if (err) {
    console.log('❌ Erro:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Conectado!');
    client.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.log('❌ Query error:', err.message);
      } else {
        console.log('✅ Query OK:', res.rows[0].now);
      }
      client.end();
    });
  }
});
