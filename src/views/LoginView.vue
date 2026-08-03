<script setup>
import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { authState } from '../store/auth';

const router = useRouter();
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async (e) => {
  e.preventDefault();
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    console.log('Attempting login with:', email.value);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const result = await response.json();
    console.log('Login response:', result);
    console.log('Result.success:', result.success);
    console.log('Result.data:', result.data);
    
    // Check for access_token instead of success field
    if (response.ok && result.access_token && result.data) {
      // Login successful
      console.log('Login successful, updating authState');
      authState.login({
        user: result.data,
        email: result.data.email,
        token: result.access_token
      });
      
      console.log('AuthState after login:', authState);
      
      // Use nextTick to ensure state is updated before navigation
      await nextTick();
      
      console.log('Navigating to dashboard');
      await router.replace('/dashboard');
    } else {
      // Login failed
      console.log('Login failed - response.ok:', response.ok, 'has access_token:', !!result.access_token);
      errorMessage.value = result.message || 'Email atau password salah!';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = 'Terjadi kesalahan saat login. Silakan coba lagi.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-container shadow-lg">
      <div class="login-header text-center mb-4">
        <h1 class="logo mb-2">AJAK!</h1>
        <p class="text-light">Welcome back, get ready for the show.</p>
      </div>

      <form @submit="handleLogin" class="login-form">
        <div v-if="errorMessage" class="error-message mb-3">
          {{ errorMessage }}
        </div>
        
        <div class="form-group mb-3">
          <label class="form-label">Email Address</label>
          <input type="email" v-model="email" class="form-input" placeholder="you@example.com" required :disabled="isLoading" />
        </div>
        
        <div class="form-group mb-4">
          <label class="form-label">Password</label>
          <input type="password" v-model="password" class="form-input" placeholder="••••••••" required :disabled="isLoading" />
        </div>

        <button type="submit" class="btn btn-primary btn-block" style="width: 100%; padding: 14px; font-size: 1.1rem;" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Log In' }}
        </button>
      </form>

      <div class="login-footer text-center mt-4 text-light">
        <p>Don't have an account? <a href="#" class="signup-link">Sign up</a></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 80px); /* minus nav height approx */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 24px 60px;
  background-color: var(--bg-color);
  background-image: radial-gradient(circle at top right, rgba(201, 76, 76, 0.05), transparent 40%),
                    radial-gradient(circle at bottom left, rgba(201, 76, 76, 0.05), transparent 40%);
}

.login-container {
  background: var(--card-bg);
  padding: 48px;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 460px;
}

.logo {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -2px;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-dark);
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 1rem;
  transition: var(--transition);
  background-color: var(--input-bg);
  color: var(--text-dark);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  background-color: var(--card-bg);
  box-shadow: 0 0 0 3px rgba(201, 76, 76, 0.1);
}

.error-message {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border-left: 4px solid #dc3545;
  font-size: 0.9rem;
  font-weight: 600;
}

.signup-link {
  font-weight: 600;
  text-decoration: underline;
}

@media (max-width: 576px) {
  .login-container {
    padding: 32px 24px;
  }
}
</style>
