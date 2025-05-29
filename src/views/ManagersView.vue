<template>
  <div class="managers-page">
    <h1>Управление менеджерами</h1>
    
    <!-- Форма создания менеджера -->
    <div class="create-manager-form">
      <h2>Создать нового менеджера</h2>
      <form @submit.prevent="createManager">
        <div class="form-group">
          <label for="name">Имя:</label>
          <input 
            type="text" 
            id="name" 
            v-model="newManager.name" 
            required
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            v-model="newManager.email" 
            required
            class="form-input"
          >
        </div>
        
        <button type="submit" class="btn-primary">Создать менеджера</button>
      </form>
    </div>

    <!-- Таблица менеджеров -->
    <div class="managers-table">
      <h2>Список менеджеров</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Статус</th>
            <th>Дата создания</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="manager in managers" :key="manager.id">
            <td>{{ manager.id }}</td>
            <td>{{ manager.name }}</td>
            <td>{{ manager.email }}</td>
            <td>
              <span :class="['status-badge', manager.status === 'active' ? 'status-active' : 'status-inactive']">
                {{ manager.status === 'active' ? 'Активный' : 'Неактивный' }}
              </span>
            </td>
            <td>{{ formatDate(manager.created_at) }}</td>
            <td class="actions-cell">
              <button class="btn-edit" @click="editManager(manager)">✎</button>
              <button class="btn-delete" @click="confirmDelete(manager)">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Диалог редактирования -->
    <v-dialog v-model="editDialog" max-width="500px" class="edit-dialog">
      <v-card class="edit-card">
        <v-card-title class="edit-title">
          Редактировать менеджера
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editingManager.name"
            label="Имя"
            variant="outlined"
            density="comfortable"
            class="edit-field"
          ></v-text-field>
          
          <v-text-field
            v-model="editingManager.email"
            label="Email"
            variant="outlined"
            density="comfortable"
            class="edit-field"
          ></v-text-field>
          
          <v-select
            v-model="editingManager.status"
            :items="[
              { title: 'Активный', value: 'active' },
              { title: 'Неактивный', value: 'inactive' }
            ]"
            label="Статус"
            variant="outlined"
            density="comfortable"
            class="edit-field"
          ></v-select>
        </v-card-text>
        <v-card-actions class="edit-actions">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="editDialog = false"
            class="action-btn"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="saveManager"
            class="action-btn"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card class="delete-card">
        <v-card-title class="delete-title">
          Подтверждение удаления
        </v-card-title>
        <v-card-text class="delete-text">
          Вы уверены, что хотите удалить менеджера {{ managerToDelete?.name }}?
        </v-card-text>
        <v-card-actions class="delete-actions">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="deleteDialog = false"
            class="action-btn"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="confirmDeleteAction"
            class="action-btn"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInstance from '@/axios/axios'

const managers = ref([])
const newManager = ref({
  name: '',
  email: ''
})
const editDialog = ref(false)
const deleteDialog = ref(false)
const managerToDelete = ref(null)
const editingManager = ref({
  id: null,
  name: '',
  email: '',
  status: 'active'
})

const loadManagers = async () => {
  try {
    const response = await axiosInstance.get('/manager/all')
    managers.value = response.data
  } catch (error) {
    console.error('Ошибка при загрузке менеджеров:', error)
  }
}

const createManager = async () => {
  try {
    await axiosInstance.post('/manager/create', {
      name: newManager.value.name,
      email: newManager.value.email
    })
    newManager.value.name = ''
    newManager.value.email = ''
    await loadManagers()
  } catch (error) {
    console.error('Ошибка при создании менеджера:', error)
  }
}

const editManager = (manager) => {
  editingManager.value = { ...manager }
  editDialog.value = true
}

const saveManager = async () => {
  try {
    await axiosInstance.put(`/manager/${editingManager.value.id}`, {
      name: editingManager.value.name,
      email: editingManager.value.email,
      status: editingManager.value.status
    })
    editDialog.value = false
    await loadManagers()
  } catch (error) {
    console.error('Ошибка при обновлении менеджера:', error)
  }
}

const confirmDelete = (manager) => {
  managerToDelete.value = manager
  deleteDialog.value = true
}

const confirmDeleteAction = async () => {
  try {
    await axiosInstance.delete(`/manager/${managerToDelete.value.id}`)
    deleteDialog.value = false
    await loadManagers()
  } catch (error) {
    console.error('Ошибка при удалении менеджера:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('ru-RU')
}

onMounted(() => {
  loadManagers()
})
</script>

<style scoped>
.managers-page {
  padding: 20px;
}

.create-manager-form {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  max-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #45a049;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
}

tr:hover {
  background-color: #f9f9f9;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-edit {
  background-color: #2196F3;
  color: white;
}

.btn-delete {
  background-color: #f44336;
  color: white;
}

.btn-edit:hover {
  background-color: #1976D2;
}

.btn-delete:hover {
  background-color: #D32F2F;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-active {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.status-inactive {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}
</style>