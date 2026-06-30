import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// 테이블 컬럼 확인
const [artistCols] = await conn.execute('DESCRIBE artists');
console.log('Artists columns:', artistCols.map(c => c.Field));

const [artworkCols] = await conn.execute('DESCRIBE artworks');
console.log('Artworks columns:', artworkCols.map(c => c.Field));

const [exhibitionCols] = await conn.execute('DESCRIBE exhibitions');
console.log('Exhibitions columns:', exhibitionCols.map(c => c.Field));

// 실제 데이터 확인
const [artists] = await conn.execute('SELECT * FROM artists LIMIT 5');
console.log('Artists data:', JSON.stringify(artists));

const [artworks] = await conn.execute('SELECT * FROM artworks LIMIT 5');
console.log('Artworks data:', JSON.stringify(artworks));

const [exhibitions] = await conn.execute('SELECT * FROM exhibitions LIMIT 5');
console.log('Exhibitions data:', JSON.stringify(exhibitions));

await conn.end();
