<template>
    <v-dialog v-model="visible" max-width="1200px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ elective?.name || 'Редактирование электива' }}</span>
          <v-btn icon @click="$emit('close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
  
        <v-card-text>
          <v-tabs v-model="tab" background-color="primary" dark>
            <v-tab>Основное</v-tab>
            <v-tab>Описание</v-tab>
            <v-tab>Вопросы</v-tab>
            <v-tab>Цели и компетенции</v-tab>
            <v-tab>Группы и студенты</v-tab>
          </v-tabs>
  
          <div class="mt-4">
            <!-- Основное -->
            <div v-if="tab === 0">
              <v-text-field v-model="form.name" label="Название электива" />
              <v-text-field v-model="form.cluster" label="Кластер" />
              <v-text-field v-model="form.modeus_link" label="Ссылка на Modeus" />
            </div>
  
            <!-- Описание -->
            <div v-if="tab === 1">
              <v-textarea v-model="form.description" label="Описание" rows="12" />
            </div>
  
            <!-- Вопросы -->
            <div v-if="tab === 2">
              <v-textarea v-model="form.questions" label="Контрольные вопросы / Зачет" rows="12" />
            </div>
  
            <!-- Цели и компетенции -->
            <div v-if="tab === 3">
              <v-textarea v-model="form.text" label="Цели, знания, умения, компетенции" rows="12" />
            </div>
  
            <!-- Группы и студенты -->
            <div v-if="tab === 4">
              <v-data-table
                :headers="groupHeaders"
                :items="form.groups"
                item-key="id"
                dense
                class="mt-2"
              >
                <template #item.students="{ item }">
                  <v-expansion-panels>
                    <v-expansion-panel>
                      <v-expansion-panel-title>Студенты ({{ item.students.length }})</v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <ul>
                          <li v-for="s in item.students" :key="s.id">
                            {{ s.fio }} — {{ s.sp_code }} / {{ s.email }}
                          </li>
                        </ul>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </template>
              </v-data-table>
            </div>
          </div>
        </v-card-text>
  
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="save">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import axiosInstance from '@/axios/axios'
  
  const props = defineProps({
    elective: Object,
  })
  const emit = defineEmits(['close'])
  
  const visible = ref(true)
  const tab = ref(0)
  const form = ref({})
  
  const groupHeaders = [
    { title: 'Название группы', value: 'name' },
    { title: 'Тип', value: 'type' },
    { title: 'Вместимость', value: 'capacity' },
    { title: 'Свободно', value: 'free_spots' },
    { title: 'Студенты', value: 'students' },
  ]
  
  watch(() => props.elective, async (newVal) => {
    if (newVal?.id) {
      const { data } = await axiosInstance.get(`/elective/${newVal.id}`)
      form.value = JSON.parse(JSON.stringify(data)) // глубокая копия
    }
  }, { immediate: true })
  
  const save = async () => {
    try {
      await axiosInstance.put(`/elective/${form.value.id}`, form.value)
      alert('Сохранено успешно!')
      emit('close')
    } catch (e) {
      alert('Ошибка при сохранении.')
      console.error(e)
    }
  }
  </script>
  