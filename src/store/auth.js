import { reactive } from 'vue'

// Initialize from localStorage if available
const savedAuth = localStorage.getItem('auth');
const initialState = savedAuth ? JSON.parse(savedAuth) : {
  isLoggedIn: false,
  user: null,
  email: null,
  token: null
};

export const authState = reactive({
  isLoggedIn: initialState.isLoggedIn,
  user: initialState.user,
  email: initialState.email,
  token: initialState.token,
  
  login(userData) {
    this.isLoggedIn = true;
    this.user = userData.user;
    this.email = userData.email;
    this.token = userData.token;
    
    // Persist to localStorage
    localStorage.setItem('auth', JSON.stringify({
      isLoggedIn: true,
      user: userData.user,
      email: userData.email,
      token: userData.token
    }));
  },
  
  logout() {
    this.isLoggedIn = false;
    this.user = null;
    this.email = null;
    this.token = null;
    localStorage.removeItem('auth');
  }
});
