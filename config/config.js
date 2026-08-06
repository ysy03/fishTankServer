require('dotenv').config(); // .env 파일에서 환경 변수 로드

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',  // 계정명(기본적으로 root로 설정되어 있다.)
    password: process.env.DB_PASSWORD || null, // 데이터베이스 비밀번호
    database: process.env.DB_DATABSENAME || 'database_name', // 데이터베이스 이름(Mysql에서 생성한 데이터베이스 이름)
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    timezone:'+09:00',
  },
  test: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_TEST_NAME || 'database_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    timezone:'+09:00',
  },
  production: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_PRODUCTION_NAME || 'database_production',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    timezone:'+09:00'
  }
};