<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card color="primary">
          <v-card-title class="justify-center">
            <v-img src="@/assets/logo.png" alt="Логотип" max-height="60"></v-img>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="requestVerificationCode">
              <v-text-field bg-color="white" label="Студенческая почта" v-model="email" prepend-inner-icon="mdi-email"
                required></v-text-field>
              <v-btn color="secondary" type="submit" class="mt-4" block>Получить код</v-btn>
              <v-alert v-if="error" type="error" class="mt-3" border="left" prominent>
                {{ error }}
              </v-alert>
            </v-form>
            <v-form v-if="codeSent" @submit.prevent="verifyCode">
              <v-text-field bg-color="white" label="Код подтверждения" v-model="verificationCode"
                prepend-inner-icon="mdi-key" required></v-text-field>
              <v-btn color="secondary" type="submit" class="mt-4" block>Войти</v-btn>
            </v-form>
            <div class="text-right mt-4">
              <span class="admin-link" @click="$router.push('/login-admin')">Вход для администратора</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/axios/axios'

const router = useRouter()
const email = ref('')
const verificationCode = ref('')
const codeSent = ref(false)
const error = ref(null)

async function requestVerificationCode() {
  try {
    // Добавляем проверку формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      error.value = 'Пожалуйста, введите корректный email адрес'
      return
    }

    const response = await axiosInstance.post('/auth/send-otp', email.value)

    // Проверяем только статус ответа, так как при 200 код успешно отправлен
    if (response.status === 200) {
      codeSent.value = true
      error.value = null
    } else {
      error.value = 'Не удалось отправить код. Пожалуйста, попробуйте снова.'
    }
  } catch (err) {
    console.error('Ошибка при отправке кода:', err)
    error.value = err.response?.data?.message || 'Ошибка при отправке запроса. Пожалуйста, попробуйте снова.'
  }
}

async function verifyCode() {
  try {
    const response = await axiosInstance.post('/auth/verify-otp', {
      email: email.value,
      otp: verificationCode.value
    });

    if (response.status === 200) {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('role', response.data.role)
      router.push(response.data.redirectUrl)
    } else {
      error.value = 'Неверный код подтверждения. Пожалуйста, попробуйте снова.'
    }
  } catch (err) {
    console.error('Ошибка при проверке кода:', err)
    error.value = err.response?.data?.message || 'Ошибка при проверке кода. Пожалуйста, попробуйте снова.'
  }
}
</script>

<style scoped>
.admin-link {
  color: white;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
}
</style>