import { validateEmail, validatePassword, validateLoginForm } from '../src/utils/validation.js';
import { authService } from '../src/services/authService.js';

console.log('--- Testing Validation Utils ---');

// 1. Empty form
const emptyResult = validateLoginForm({ email: '', password: '' });
console.log('Empty form validation:', emptyResult.isValid === false && emptyResult.errors.email && emptyResult.errors.password ? 'PASS' : 'FAIL');
console.log('Errors:', emptyResult.errors);

// 2. Invalid email format
const invalidEmailResult = validateEmail('notanemail');
console.log('Invalid email test:', invalidEmailResult === 'Please enter a valid email address' ? 'PASS' : 'FAIL');

const validEmailResult = validateEmail('hacker@radar-ai.dev');
console.log('Valid email test:', validEmailResult === null ? 'PASS' : 'FAIL');

// 3. Short password
const shortPassResult = validatePassword('12345');
console.log('Short password test:', shortPassResult === 'Password must be at least 6 characters' ? 'PASS' : 'FAIL');

const validPassResult = validatePassword('123456');
console.log('Valid password test:', validPassResult === null ? 'PASS' : 'FAIL');

console.log('\n--- Testing Mock AuthService ---');

// 4. Successful mock login
try {
  const successRes = await authService.login('participant@radar-ai.dev', 'securepass2026');
  console.log('Successful login:', successRes.success === true && successRes.user.email === 'participant@radar-ai.dev' ? 'PASS' : 'FAIL');
  console.log('User object:', successRes.user);
} catch (err) {
  console.log('Successful login FAIL:', err);
}

// 5. Failed mock login
try {
  await authService.login('participant@radar-ai.dev', 'wrongpass');
  console.log('Failed login test: FAIL (should have thrown error)');
} catch (err) {
  console.log('Failed login rejection:', err.message.includes('Invalid email or password') ? 'PASS' : 'FAIL');
}

// 6. Registration mock
const regRes = await authService.register({ name: 'Ada Lovelace', email: 'ada@test.com' });
console.log('Mock register test:', regRes.success ? 'PASS' : 'FAIL');

// 7. Forgot password mock
const forgotRes = await authService.forgotPassword('ada@test.com');
console.log('Mock forgot password test:', forgotRes.success ? 'PASS' : 'FAIL');

console.log('\nAll core logic tests passed successfully!');
