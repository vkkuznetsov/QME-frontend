<template>
   <v-app>
    <v-main>
      <user-header v-if="showUserHeader" />
      <admin-header v-else-if="showAdminHeader" />
      <router-view />
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
    };
  },
};
</script>

<style>

</style>