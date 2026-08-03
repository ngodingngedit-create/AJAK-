import { reactive } from 'vue'

// Initialize from localStorage if available
const savedAuth = localStorage.getItem('auth');
const initialState = savedAuth ? JSON.parse(savedAuth) : {
  isLoggedIn: false,
  user: null,
  email: null,
  token: null,
  creator_id: null
};

export const authState = reactive({
  isLoggedIn: initialState.isLoggedIn,
  user: initialState.user,
  email: initialState.email,
  token: initialState.token,
  creator_id: initialState.creator_id,
  
  login(userData) {
    this.isLoggedIn = true;
    this.user = userData.user;
    this.email = userData.email;
    this.token = userData.token;
    // Store creator_id from user.has_creator.id (the creator's ID, e.g. 182)
    this.creator_id = userData.user?.has_creator?.id || userData.user?.creator_id || userData.user?.id || null;
    
    // Persist to localStorage
    localStorage.setItem('auth', JSON.stringify({
      isLoggedIn: true,
      user: userData.user,
      email: userData.email,
      token: userData.token,
      creator_id: this.creator_id
    }));
  },
  
  logout() {
    this.isLoggedIn = false;
    this.user = null;
    this.email = null;
    this.token = null;
    this.creator_id = null;
    localStorage.removeItem('auth');
  }
});
