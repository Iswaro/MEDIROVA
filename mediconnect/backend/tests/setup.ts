// Set environment variables for test suite before anything else loads
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_jwt_access_secret_which_is_at_least_32_characters_long!';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_which_is_at_least_32_characters_long!';
process.env.COOKIE_SECRET = 'test_cookie_secret_16chars!';
process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.DB_PORT = process.env.TEST_DB_PORT || '3306';
process.env.DB_USER = process.env.TEST_DB_USER || 'mediconnect';
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'mediconnect_dev_password';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'mediconnect_db';
process.env.PAYMENT_PROVIDER = 'mock';

export default async function globalSetup() {
  console.log('Jest global setup loaded. Testing against DB:', process.env.DB_NAME);
}
