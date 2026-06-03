import { reactive } from 'vue'

export const authState = reactive({
  isLoggedIn: false,
  user: null,
  login() {
    this.isLoggedIn = true;
    this.user = { name: 'The Sounds Project', avatar: '' };
  },
  logout() {
    this.isLoggedIn = false;
    this.user = null;
  }
});
