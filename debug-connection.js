#!/usr/bin/env node
// Debug script to test Supabase connection

require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verificando configuração de ambiente...\n');

// Check DATABASE_URL
if (!databaseUrl) {
  console.log('❌ DATABASE_URL não está configurada');
} else {
  console.log('✅ DATABASE_URL encontrada');
  // Redact password
  const redacted = databaseUrl.replace(/:(.*?)@/, ':****@');
  console.log(`   ${redacted}\n`);
}

// Check NEXT_PUBLIC_SUPABASE_URL
if (!supabaseUrl) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL não está configurada');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL encontrada');
  console.log(`   ${supabaseUrl}\n`);
}

// Check NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não está configurada');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY encontrada');
  console.log(`   ${supabaseKey.substring(0, 20)}...\n`);
}

// Try to connect with pg library
console.log('📡 Testando conexão com banco de dados...\n');

try {
  const { Client } = require('pg');

  const client = new Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
  });

  client.connect(async (err) => {
    if (err) {
      console.log('❌ Erro ao conectar:');
      console.log(`   ${err.message}\n`);
      process.exit(1);
    } else {
      console.log('✅ Conectado ao banco de dados!\n');

      try {
        const result = await client.query('SELECT NOW()');
        console.log('✅ Query executada com sucesso');
        console.log(`   Hora do servidor: ${result.rows[0].now}\n`);
      } catch (queryErr) {
        console.log('❌ Erro ao executar query:');
        console.log(`   ${queryErr.message}\n`);
      }

      await client.end();
      process.exit(0);
    }
  });
} catch (err) {
  console.log('ℹ️  Biblioteca pg não instalada. Execute:');
  console.log('   npm install pg\n');
  process.exit(1);
}
