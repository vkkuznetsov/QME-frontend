<template>
  <v-app class="app-background">
    <v-main>
      <template v-if="route.path === '/login'">
        <router-view />
      </template>
      <template v-else>
        <div class="main-container">
          <user-header v-if="showUserHeader" />
          <admin-header v-else-if="showAdminHeader" />
          <router-view />
        </div>
      </template>
    </v-main>
  </v-app>
</template>

<script>
import UserHeader from './components/UserHeader.vue';
import AdminHeader from './components/AdminHeader.vue';
import { useRoute } from 'vue-router';
import { ref, computed, watch } from 'vue';

export default {
  name: 'App',
  components: {
    UserHeader,
    AdminHeader,
  },
  setup() {
    const route = useRoute();

    const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true');
    const userRole = ref(localStorage.getItem('role'));

    const updateAuthState = () => {
      isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true';
      userRole.value = localStorage.getItem('role');
    };

    watch(route, () => {
      updateAuthState();
    });

    const showUserHeader = computed(() => isAuthenticated.value && userRole.value === 'user' && route.path !== '/login');
    const showAdminHeader = computed(() => isAuthenticated.value && userRole.value === 'admin' && route.path !== '/login');

    return {
      showUserHeader,
      showAdminHeader,
      route,
    };
  },
};
</script>

<style>
.app-background {
  background-color: #f8f8f8;
  min-height: 100vh;
}

.main-container {
  width: 1200px;
  margin: 0 auto;
  margin-top: 30px;
}
</style>