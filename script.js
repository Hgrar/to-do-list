const STORAGE_KEY = "todo-list.tasks";

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const taskTemplate = document.querySelector("#taskTemplate");
const taskCount = document.querySelector("#taskCount");
const emptyState = document.querySelector("#emptyState");
const clearCompleted = document.querySelector("#clearCompleted");
const filterButtons = document.querySelectorAll(".filter-button");
const weekday = document.querySelector("#weekday");
const dateText = document.querySelector("#dateText");
const examDays = document.querySelector("#examDays");
const examStatus = document.querySelector("#examStatus");

const EXAM_DATE = new Date(2026, 11, 26);
const DAY_IN_MS = 24 * 60 * 60 * 1000;

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(title) {
  return {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: Date.now(),
  };
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = getVisibleTasks();

  visibleTasks.forEach((task) => {
    const taskNode = taskTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = taskNode.querySelector("input");
    const title = taskNode.querySelector(".task-title");
    const deleteButton = taskNode.querySelector(".delete-button");

    taskNode.dataset.id = task.id;
    taskNode.classList.toggle("completed", task.completed);
    checkbox.checked = task.completed;
    title.textContent = task.title;

    checkbox.addEventListener("change", () => toggleTask(task.id));
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    taskList.append(taskNode);
  });

  const activeCount = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${activeCount} 项待办`;
  emptyState.classList.toggle("visible", visibleTasks.length === 0);
  clearCompleted.disabled = !tasks.some((task) => task.completed);
}

function addTask(title) {
  tasks = [createTask(title), ...tasks];
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });
  renderTasks();
}

function renderDate() {
  const now = new Date();
  weekday.textContent = new Intl.DateTimeFormat("zh-CN", {
    weekday: "long",
  }).format(now);
  dateText.textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
  }).format(now);
}

function renderExamCountdown() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysLeft = Math.ceil((EXAM_DATE - startOfToday) / DAY_IN_MS);

  if (daysLeft > 0) {
    examDays.textContent = daysLeft;
    examStatus.textContent = "天后开考";
    return;
  }

  if (daysLeft === 0) {
    examDays.textContent = "今天";
    examStatus.textContent = "保持节奏，稳住";
    return;
  }

  examDays.textContent = Math.abs(daysLeft);
  examStatus.textContent = "天前已开考";
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();

  if (!title) {
    taskInput.focus();
    return;
  }

  addTask(title);
  taskInput.value = "";
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderDate();
renderExamCountdown();
renderTasks();
