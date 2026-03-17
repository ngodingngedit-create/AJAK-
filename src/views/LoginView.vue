<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authState } from '../store/auth';

const router = useRouter();
const email = ref('');
const password = ref('');

const handleLogin = (e) => {
  e.preventDefault();
  // Simulate login
  authState.login();
  router.push('/');
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
        <div class="form-group mb-3">
          <label class="form-label">Email Address</label>
          <input type="email" v-model="email" class="form-input" placeholder="you@example.com" required />
        </div>
        
        <div class="form-group mb-4">
          <label class="form-label">Password</label>
          <input type="password" v-model="password" class="form-input" placeholder="••••••••" required />
        </div>

        <button type="submit" class="btn btn-primary btn-block" style="width: 100%; padding: 14px; font-size: 1.1rem;">
          Log In
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
  background: var(--white);
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
  border: 1px solid #ddd;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 1rem;
  transition: var(--transition);
  background-color: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  background-color: var(--white);
  box-shadow: 0 0 0 3px rgba(201, 76, 76, 0.1);
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
