<template>
  <v-footer app color="grey-lighten-1" class="role-switcher-footer">
    <v-row justify="center" no-gutters>
      <v-btn-group class="gap-2">
        <v-btn
          :ripple="false"
          :class="{ 'active-role': currentRole === 'user' }"
          @click="switchRole('user')"
          variant="tonal"
          class="me-4 role-btn"
        >
          Режим студента
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :ripple="false"
          :class="{ 'active-role': currentRole === 'admin' }"
          @click="switchRole('admin')"
          variant="tonal"
          class="ms-4 role-btn"
        >
          Режим менеджера
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :ripple="false"
          :class="{ 'active-role': currentRole === 'system_admin' }"
          @click="switchRole('system_admin')"
          variant="tonal"
          class="ms-4 role-btn"
        >
          Режим системного администратора
        </v-btn>
      </v-btn-group>
    </v-row>
  </v-footer>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentRole = ref(localStorage.getItem('role') || 'user');

const switchRole = (role) => {
  localStorage.setItem('role', role);
  currentRole.value = role;
  
  // Устанавливаем данные авторизации
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userEmail', 'stud0000310064@study.utmn.ru');
  
  if (role === 'admin') {
    router.push('/admin');
  } else if (role === 'system_admin') {
    router.push('/system-admin');
  } else {
    router.push('/');
  }
};
</script>

<style scoped>
.role-switcher-footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 8px;
  z-index: 999;
}

.v-btn-group {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.role-btn {
  min-width: 200px;
  background-color: #f5f5f5;
  color: #666;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.role-btn:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}

.active-role {
  background-color: #1976d2 !important;
  color: white !important;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
}

.active-role:hover {
  background-color: #1565c0 !important;
}
</style> 