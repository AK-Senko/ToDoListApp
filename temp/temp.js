'use strict';

// Task array and filter state
let tasks = [];
let currentFilter = 'all';

// DOM elements
const form = document.querySelector('form');
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDate');
const tasksList = document.getElementById('tasksList');
const filterBtns = document.querySelectorAll('div > button');
const sortBtn = document.querySelector('div > button:last-child');

// Load tasks and set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    tasks = getTasks();
    if (!tasks.length) {
        fetchInitialTasks();
    } else {
        renderTasks();
    }
    form.addEventListener('submit', handleAddTask);
    tasksList.addEventListener('click', handleTaskClick);
    filterBtns.forEach(btn => btn.addEventListener('click', handleFilter));
    sortBtn.addEventListener('click', handleSort);
});

// Get tasks from localStorage
function getTasks() {
    const data = localStorage.getItem('tasks');
    return data ? JSON.parse(data) : [];
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks to the DOM
function renderTasks() {
    tasksList.innerHTML = '';
    let filtered = filterTasks(tasks, currentFilter);
    filtered.forEach((task, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" data-idx="${idx}" ${task.completed ? 'checked' : ''}>
            <span style="margin:0 8px;${task.completed ? 'text-decoration:line-through;color:#888;' : ''}">
                ${task.text} - ${task.dueDate}
            </span>
            <button data-idx="${idx}" class="delete-btn">🗑️</button>
        `;
        tasksList.appendChild(li);
    });
}

// Add a new task
function handleAddTask(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    if (!text || !dueDate) return;
    tasks.push({ text, dueDate, completed: false });
    saveTasks();
    renderTasks();
    form.reset();
}

// Handle clicks on tasks (complete/delete)
function handleTaskClick(e) {
    const idx = e.target.dataset.idx;
    if (e.target.type === 'checkbox') {
        tasks[idx].completed = !tasks[idx].completed;
        saveTasks();
        renderTasks();
    }
    if (e.target.classList.contains('delete-btn')) {
        tasks.splice(idx, 1);
        saveTasks();
        renderTasks();
    }
}

// Filter tasks by status
function filterTasks(arr, filter) {
    if (filter === 'completed') return arr.filter(t => t.completed);
    if (filter === 'active') return arr.filter(t => !t.completed);
    return arr;
}

// Handle filter button clicks
function handleFilter(e) {
    currentFilter = e.target.textContent.toLowerCase();
    renderTasks();
}

// Sort tasks by due date
function handleSort() {
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    saveTasks();
    renderTasks();
}

// Import tasks from API if localStorage is empty
async function fetchInitialTasks() {
    try {
        const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        tasks = data.map(item => ({
            text: item.title,
            dueDate: new Date().toISOString().split('T')[0],
            completed: item.completed
        }));
        saveTasks();
        renderTasks();
    } catch {
        alert('Could not load tasks from API.');
    }
}