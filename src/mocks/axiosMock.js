// src/mocks/axiosMock.js
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import coursesData from '@/views/data/courses_clusters.json'; 
// Предполагается, что тут массив объектов: { id, name, cluster, description... }

// Инициализация мок-адаптера
const mock = new MockAdapter(axios, { delayResponse: 500 });

// Макетные данные для групп
const mockGroups = {
  1: [
    {
      id: 101,
      name: 'Электив1-Л-1',
      capacity: 10,
      type: 'лекция',
      students: [],
    },
    {
      id: 102,
      name: 'Электив1-П-1',
      capacity: 5,
      type: 'практика',
      students: [],
    },
  ],
  2: [
    {
      id: 103,
      name: 'Электив2-Л-1',
      capacity: 2,
      type: 'лекция',
      students: [],
    },
    {
      id: 104,
      name: 'Электив2-П-1',
      capacity: 8,
      type: 'практика',
      students: [],
    },
  ],
};

// Макетные данные для курсов
const mockCourses = coursesData;

// Макетные данные для пользователей
const mockUsers = [
  {
    id: 1,
    name: 'Иван Иванов',
    email: 'stud0000257867@study.utmn.ru',
    direction: 'Информатика',
    admissionYear: 2021,
    groups: [
      {
        id: 1,
        name: 'Группа 1',
        type: 'Лекция',
        capacity: 30,
        elective_id: 1,
        elective: { id: 1, name: 'Электив 1', cluster: 'Веб-разработка' },
      },
    ],
  },
  {
    id: 2,
    name: 'Мария Петрова',
    email: 'stud0000257868@study.utmn.ru',
    direction: 'Экономика',
    admissionYear: 2020,
    groups: [
      {
        id: 1,
        name: 'Группа 1',
        type: 'Лекция',
        capacity: 30,
        elective_id: 1,
        elective: { id: 1, name: 'Электив 1', cluster: 'Веб-разработка' },
      },
      {
        id: 2,
        name: 'Группа 2',
        type: 'Практика',
        capacity: 30,
        elective_id: 1,
        elective: { id: 1, name: 'Электив 1', cluster: 'Веб-разработка' },
      },
      {
        id: 4,
        name: 'Группа 2',
        type: 'Практика',
        capacity: 30,
        elective_id: 2,
        elective: { id: 2, name: 'Электив 2', cluster: 'Базы данных' },
      },
    ],
  },
  {
    id: 3,
    name: 'Мария Петро2ва',
    email: 'stud0000257862@study.utmn.ru',
    direction: 'Экономика',
    admissionYear: 2020,
    groups: [
      {
        id: 1,
        name: 'Группа 1',
        type: 'Лекция',
        capacity: 30,
        elective_id: 1,
        elective: { id: 1, name: 'Электив 1', cluster: 'Веб-разработка' },
      },
      {
        id: 2,
        name: 'Группа 2',
        type: 'Практика',
        capacity: 30,
        elective_id: 1,
        elective: { id: 1, name: 'Электив 1', cluster: 'Веб-разработка' },
      },
      {
        id: 4,
        name: 'Группа 2',
        type: 'Практика',
        capacity: 30,
        elective_id: 2,
        elective: { id: 2, name: 'Электив 2', cluster: 'Базы данных' },
      },
    ],
  },
  {
    id: 4,
    name: 'Мария Петро2ва',
    email: 'stud0000257863@study.utmn.ru',
    direction: 'Экономика',
    admissionYear: 2020,
    groups: [
      {
        id: 1,
        name: 'Группа 1',
        type: 'Лекция',
        capacity: 30,
        elective_id: 3,
        elective: { id: 3, name: 'Электив 3', cluster: 'Веб-ра' },
      },
      {
        id: 2,
        name: 'Группа 2',
        type: 'Практика',
        capacity: 30,
        elective_id: 1,
        elective: { id: 1, name: 'Электив 3', cluster: 'Веб-ра' },
      },
      {
        id: 4,
        name: 'Группа 2',
        type: 'Практика',
        capacity: 30,
        elective_id: 2,
        elective: { id: 2, name: 'Электив 2', cluster: 'Веб-ра' },
      },
      {
        id: 5,
        name: 'Группа 2',
        type: 'Практика',
        capacity: 30,
        elective_id: 4,
        elective: { id: 4, name: 'Электив 2', cluster: 'Веб-ра' },
      },
    ],
  },
];

// Макетные данные для заявок
// Теперь ДАЕМ поле sourceElectiveName
let mockRequests = [
  {
    id: 1,
    userId: 2,
    electiveId: 2,
    sourceElectiveId: 11,
    sourceElectiveName: 'Электив 1',
    electiveName: 'Электив 3',
    selectedGroups: [
      { id: 103, type: 'лекция', name: 'Электив2-Л-1' },
      { id: 104, type: 'практика', name: 'Электив2-П-1' },
    ],
    status: 'Ожидается',
    priority: 1,
  },
  {
    id: 2,
    userId: 2,
    electiveId: 1,
    sourceElectiveId: 12,
    sourceElectiveName: 'Электив 3',
    electiveName: 'Электив 1',
    selectedGroups: [
      { id: 101, type: 'лекция', name: 'Электив1-Л-1' },
      { id: 102, type: 'практика', name: 'Электив1-П-1' },
    ],
    status: 'Одобрено',
    priority: 2,
  },
  {
    id: 3,
    userId: 2,
    electiveId: 2,
    sourceElectiveId: 11,
    sourceElectiveName: 'Электив 1',
    electiveName: 'Электив 2',
    selectedGroups: [
      { id: 103, type: 'лекция', name: 'Электив2-Л-1' },
      { id: 104, type: 'практика', name: 'Электив2-П-1' },
    ],
    status: 'Отклонено',
    priority: 3,
  },
  {
    id: 4,
    userId: 2,
    electiveId: 2,
    sourceElectiveId: 11,
    sourceElectiveName: 'Электив 1',
    electiveName: 'Электив 2',
    selectedGroups: [
      { id: 104, type: 'практика', name: 'Электив2-П-1' },
    ],
    status: 'Ожидается',
    priority: 4,
  },
];

// ======================== MOCK ENDPOINTS =======================

// GET /api/users?email=...
mock.onGet('/api/users').reply((config) => {
  const { email } = config.params;
  if (!email) {
    return [400, { message: 'Email параметр не предоставлен' }];
  }
  const user = mockUsers.find((u) => u.email === email);
  if (user) {
    return [200, user];
  } else {
    return [404, { message: 'Пользователь не найден' }];
  }
});

// GET /api/students
mock.onGet('/api/students').reply(() => {
  return [200, mockUsers];
});

// GET /api/courses/:id
mock.onGet(/\/api\/courses\/\d+$/).reply((config) => {
  const match = config.url.match(/\/api\/courses\/(\d+)$/);
  const requestedCourseId = match ? parseInt(match[1]) : null;
  const course = mockCourses.find((c) => c.id === requestedCourseId);
  if (course) {
    return [200, course];
  } else {
    return [404, { message: 'Курс не найден' }];
  }
});

// GET /api/courses/:id/groups
mock.onGet(/\/api\/courses\/\d+\/groups/).reply((config) => {
  const match = config.url.match(/\/api\/courses\/(\d+)\/groups/);
  const requestedCourseId = match ? parseInt(match[1]) : null;
  if (requestedCourseId && mockGroups[requestedCourseId]) {
    return [200, mockGroups[requestedCourseId]];
  } else {
    return [404, { message: 'Группы для этого курса не найдены' }];
  }
});

// GET /api/courses — вернуть все курсы
mock.onGet('/api/courses').reply(() => {
  return [200, mockCourses];
});

// GET /api/requests?userId=...
mock.onGet('/api/requests').reply((config) => {
  const { userId } = config.params;
  // Фильтруем заявки конкретного пользователя
  const filtered = mockRequests.filter((r) => r.userId == userId);
  // Отсортируем их по priority
  filtered.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  return [200, filtered];
});

// POST /api/requests (создание новой заявки)
mock.onPost('/api/requests').reply((config) => {
  try {
    const data = JSON.parse(config.data);
    const newReq = {
      id: mockRequests.length + 1,
      userId: data.userId,
      electiveId: data.electiveId,
      sourceElectiveName: data.sourceElectiveName || 'Неизвестный электив',
      electiveName:
        mockCourses.find((c) => c.id === data.electiveId)?.name || 'Неизвестно',
      selectedGroups: data.selectedGroups || [],
      status: 'Ожидается',
      priority: mockRequests.length + 1,
    };
    mockRequests.push(newReq);
    return [200, newReq];
  } catch (error) {
    return [400, { message: 'Некорректный запрос' }];
  }
});

// POST /api/requests/reorder (обновление порядка)
mock.onPost('/api/requests/reorder').reply((config) => {
  try {
    const data = JSON.parse(config.data);
    // data.items => [{ id, priority }, ...]
    data.items.forEach(({ id, priority }) => {
      const found = mockRequests.find((r) => r.id === id);
      if (found) {
        found.priority = priority; // обновляем приоритет
      }
    });
    // Можем сортировать весь mockRequests, если хотим поддерживать порядок
    mockRequests.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    return [200, { success: true, newOrder: mockRequests }];
  } catch (err) {
    return [400, { message: 'Некорректный запрос reorder' }];
  }
});

export default mock;