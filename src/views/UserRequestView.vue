<template>
  <v-container fluid class="requests-container">
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 mb-4 custom-shadow main-request-card">
          <div class="header-section">
            <h2 class="requests-title">Мои заявки на перезапись</h2>
          </div>

          <!-- Индикатор загрузки / Ошибка -->
          <div v-if="loadingRequests" class="text-center my-4">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div v-else-if="requestsError" class="text-center my-4">
            <v-alert type="error" dismissible>{{ requestsError }}</v-alert>
          </div>

          <div v-else>
            <div v-if="userRequests.length === 0" class="no-requests-text">
              <p>У вас нет заявок на перезапись</p>
            </div>

            <div v-else>
              <div v-for="(group, sourceId) in groupsData" :key="sourceId" class="source-section mb-8"
                :class="{ 'locked-group': lockedGroups[sourceId] }">
                <!-- Заголовок группы с фоном -->
                <div class="group-header d-flex align-center mb-3" :style="{ backgroundColor: '#f5f5f5' }">
                  <v-icon color="primary" class="mr-2" size="24">
                    mdi-book-outline
                  </v-icon>
                  <h3 class="source-title">{{ group.name }}</h3>
                </div>

                <div class="drag-hint text-caption grey--text text-center mb-3">
                  Меняйте приоритет перетаскивая заявки
                </div>

                <v-row class="dnd-list interactive-area" dense>
                  <v-col v-for="(req, idx) in group.requests" :key="req.id" cols="16" md="4" lg="3" class="d-flex">
                    <div class="request-card-wrapper flex-grow-1" :class="{
                      'drop-target': idx === dragOverIndex[sourceId],
                      'rejected': req.status === 'rejected',
                    }" :draggable="isDraggable(req, sourceId)" @dragstart="onDragStart($event, sourceId, idx)"
                      @dragover.prevent="onDragOver($event, sourceId, idx)"
                      @dragenter.prevent="onDragEnter($event, sourceId, idx)"
                      @dragleave="onDragLeave($event, sourceId, idx)" @drop="onDrop($event, sourceId, idx)"
                      @dragend="onDragEnd($event, sourceId)">
                      <RequestCard :req="req" @request-canceled="onRequestCanceled" />
                    </div>
                  </v-col>
                </v-row>

                <div class="text-center mt-4">
                  <v-btn outlined rounded :color="lockedGroups[sourceId] ? 'grey darken-1' : 'primary'"
                    @click="toggleLock(sourceId)">
                    {{ lockedGroups[sourceId] ? 'Разблокировать приоритет' : 'Подтвердить приоритет' }}
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axiosInstance from '@/axios/axios';
import RequestCard from '@/components/RequestCard.vue';

const userId = ref(null);
const userRequests = ref([]);
const loadingRequests = ref(false);
const requestsError = ref(null);
const groupsData = reactive({});
const draggedIndex = reactive({});
const dragOverIndex = reactive({});
const lockedGroups = reactive({});

async function loadCurrentUser() {
  try {
    const userEmail =
      localStorage.getItem('userEmail') || 'stud0000295515@study.utmn.ru';
    const resp = await axiosInstance.get('/student_info', { params: { email: userEmail } });
    userId.value = resp.data.id;
  } catch (err) {
    console.error(err);
  }
}

async function fetchRequests() {
  if (!userId.value) return;
  loadingRequests.value = true;
  requestsError.value = null;
  try {
    const resp = await axiosInstance.get('/transfer', {
      params: { student_id: userId.value }
    });
    userRequests.value = resp.data;
    buildGroups();
  } catch (err) {
    console.error(err);
    requestsError.value = 'Не удалось загрузить ваши заявки';
  } finally {
    loadingRequests.value = false;
  }
}

onMounted(async () => {
  await loadCurrentUser();
  if (userId.value) {
    await fetchRequests();
  }
});

function buildGroups() {
  for (const k in groupsData) delete groupsData[k];
  userRequests.value.forEach(req => {
    const id = req.sourceElectiveId;
    if (!groupsData[id]) {
      groupsData[id] = {
        name: req.sourceElectiveName,
        requests: []
      };
    }
    groupsData[id].requests.push(req);
  });
  for (const id in groupsData) {
    const arr = groupsData[id].requests;
    const approved = arr.find(r => r.status === 'approved');
    if (approved) {
      groupsData[id].requests = [approved];
    } else {
      arr.sort((a, b) => {
        if (a.status === 'rejected' && b.status !== 'rejected') return 1;
        if (b.status === 'rejected' && a.status !== 'rejected') return -1;
        return (a.priority || 0) - (b.priority || 0);
      });
    }
  }
  for (const id in groupsData) {
    const statuses = groupsData[id].requests.map(r => r.status);
    lockedGroups[id] = !statuses.includes('draft');
  }
}

function isDraggable(req, sourceId) {
  return req.status === 'draft' && !lockedGroups[sourceId];
}
function onDragStart(e, sourceId, idx) {
  draggedIndex[sourceId] = idx;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
}
function onDragOver(e, sourceId, idx) {
  e.preventDefault();
  dragOverIndex[sourceId] = idx;
}
function onDragEnter(e, sourceId, idx) {
  dragOverIndex[sourceId] = idx;
}
function onDragLeave(e, sourceId, idx) {
  if (dragOverIndex[sourceId] === idx) dragOverIndex[sourceId] = null;
}
function onDrop(e, sourceId, dropIdx) {
  const fromIdx = draggedIndex[sourceId];
  if (fromIdx == null || dropIdx == null) return;
  const arr = groupsData[sourceId].requests;
  if (arr[fromIdx].status === 'rejected' || arr[dropIdx].status === 'rejected') return;
  if (fromIdx !== dropIdx) {
    [arr[fromIdx], arr[dropIdx]] = [arr[dropIdx], arr[fromIdx]];
    updatePriorities(sourceId);
    arr.sort((a, b) => {
      if (a.status === 'rejected' && b.status !== 'rejected') return 1;
      if (b.status === 'rejected' && a.status !== 'rejected') return -1;
      return (a.priority || 0) - (b.priority || 0);
    });
  }
  draggedIndex[sourceId] = dragOverIndex[sourceId] = null;
}
function onDragEnd(_, sourceId) {
  draggedIndex[sourceId] = dragOverIndex[sourceId] = null;
}

function updatePriorities(sourceId) {
  const grp = groupsData[sourceId];
  grp.requests.forEach((r, i) => (r.priority = i + 1));
  const payload = grp.requests.map(r => ({ id: r.id, priority: r.priority }));
  axiosInstance.post('/transfer/reorder', payload).catch(console.error);
}

async function toggleLock(sourceId) {
  const ids = groupsData[sourceId].requests.map(r => r.id);
  const url = lockedGroups[sourceId] ? '/transfer/unlock' : '/transfer/lock';
  try {
    await axiosInstance.post(url, { ids });
    await fetchRequests();
  } catch (err) {
    console.error(err);
  }
}

function onRequestCanceled(id) {
  userRequests.value = userRequests.value.filter(r => r.id !== id);
  buildGroups();
}
</script>

<style scoped>
.requests-container {
  font-family: 'Montserrat', sans-serif;
  margin: 0 auto;
  box-sizing: border-box;
}

.header-section {
  text-align: left;
  margin-bottom: 24px;
}

.requests-title {
  font-size: 37px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: rgba(0, 0, 0, 0.6);
}

.main-request-card {
  border: none;
  background: transparent !important;
  box-shadow: none !important;
}

.source-section {
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.source-section.locked-group .interactive-area {
  pointer-events: none;
  opacity: 0.5;
}

.group-header {
  border-radius: 8px 8px 0 0;
  padding: 12px 16px;
  background-color: transparent !important;
  border-radius: 8px 8px 0 0;
  padding: 12px 16px;
}

.source-title {
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  margin: 0;
}

.drag-hint {
  font-size: 14px;
  color: #616161;
  text-align: center;
  margin-bottom: 8px;
}

.request-card-wrapper {
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  background: transparent !important;
}

.request-card-wrapper:hover {
  transform: translateY(-2px);
}

.drop-target {
  outline: 2px dashed #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
}

.rejected {
  opacity: 0.7;
  filter: grayscale(0.8);
}

.no-requests-text {
  padding: 32px;
  text-align: center;
  color: #757575;
  font-size: 1.1rem;
}

.interactive-area {
  background-color: #fafafa;
  border-radius: 0 0 8px 8px;
  padding: 16px;
  margin-top: -1px;
}

.v-btn[outlined] {
  font-weight: 600;
  text-transform: none;
}

@media (max-width: 600px) {
  .requests-title {
    font-size: 1.5rem;
  }

  .source-title {
    font-size: 1.2rem;
  }
}
</style>
