import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// 전시회 ID 30001 (ai-art-2025)에 exhibitionId가 null인 작가 모두 연결
const [result] = await conn.execute(
  'UPDATE artists SET exhibitionId = 30001 WHERE exhibitionId IS NULL'
);
console.log('Updated artists:', result.affectedRows);

// 확인
const [artists] = await conn.execute('SELECT id, name, exhibitionId FROM artists');
console.log('Artists after update:', JSON.stringify(artists));

await conn.end();
