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
          <system-admin-header v-else-if="showSystemAdminHeader" />
          <router-view />
        </div>
      </template>
    </v-main>
    <role-switcher />
  </v-app>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import UserHeader from './components/headers/UserHeader.vue';
import AdminHeader from './components/headers/AdminHeader.vue';
import SystemAdminHeader from './components/headers/SystemAdminHeader.vue';
import RoleSwitcher from './components/RoleSwitcher.vue';

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
const showSystemAdminHeader = computed(() => isAuthenticated.value && userRole.value === 'system_admin' && route.path !== '/login');
</script>



<style>
.app-background {
  background-color: #f8f8f8;
  min-height: 100vh;
}

.main-container {
  width: 90%;
  margin: 0 auto;
  margin-top: 30px;
  padding-bottom: 60px;
}
</style>