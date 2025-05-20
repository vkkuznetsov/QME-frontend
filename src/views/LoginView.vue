<template>
  <v-container fluid class="fill-height d-flex align-center justify-center">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="4">
        <v-card color="primary">
          <v-card-title class="justify-center">
            <!-- Логотип вместо текста -->
            <v-img src="@/assets/logo.png" alt="Логотип" max-height="60"></v-img>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field bg-color="white"
                label="Имя пользователя"
                v-model="username"
                prepend-inner-icon="mdi-account"
                required
              ></v-text-field>

              <v-text-field bg-color="white"
                label="Пароль"
                v-model="password"
                type="password"
                prepend-inner-icon="mdi-lock"
                required
              ></v-text-field>

              <v-btn color="secondary" type="submit" class="mt-4" block>Войти</v-btn>

              <v-alert
                v-if="error"
                type="error"
                class="mt-3"
                border="left"
                prominent
              >
                {{ error }}
              </v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref(null)

const router = useRouter()

function login() {
  if (username.value === 'root' && password.value === 'root') {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('role', 'system_admin')
    router.push('/system-admin')
  } else if (username.value === 'admin' && password.value === 'admin') {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('role', 'admin')
    router.push('/admin')
  } else if (username.value === 'user' && password.value === 'user') {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('role', 'user')
    router.push('/profile')
  } else {
    error.value = 'Неверные имя пользователя или пароль'
  }
}
</script>

<style scoped>
  .fill-height {
    height: 100vh;
  }
</style>
