class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.editingId = null;
        this.pendingDeletions = new Map(); // Для отслеживания задач на удаление
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        document.getElementById('addForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAll();
        });
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (text) {
            // Показываем индикатор загрузки на кнопке
            const addBtn = document.querySelector('.add-button');
            const originalText = addBtn.innerHTML;
            addBtn.innerHTML = '⏳';
            addBtn.style.opacity = '0.7';
            
            // Добавляем задержку при добавлении задачи
            setTimeout(() => {
                const newTodo = {
                    id: Date.now(),
                    text: text,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                
                this.todos.push(newTodo);
                this.saveTodos();
                this.render();
                input.value = '';
                
                // Восстанавливаем кнопку
                addBtn.innerHTML = originalText;
                addBtn.style.opacity = '1';
            }, 1000); // 1000ms задержка
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const wasCompleted = todo.completed;
        
        // Показываем индикатор загрузки на чекбоксе
        const checkbox = document.querySelector(`[onclick="app.toggleTodo(${id})"]`);
        if (checkbox) {
            const originalText = checkbox.innerHTML;
            checkbox.innerHTML = '⏳';
            checkbox.style.opacity = '0.7';
            
            // Добавляем задержку при переключении состояния
            setTimeout(() => {
                this.todos = this.todos.map(todo =>
                    todo.id === id ? { ...todo, completed: !todo.completed } : todo
                );
                this.saveTodos();
                this.render();

                // Если задача была отмечена как выполненная, запускаем таймер удаления
                if (!wasCompleted && !todo.completed) {
                    this.scheduleDeletion(id);
                } else if (wasCompleted && todo.completed) {
                    // Если задача была отменена (снята галочка), убираем из очереди удаления
                    this.cancelDeletion(id);
                }
            }, 700); // 700ms задержка
        } else {
            this.todos = this.todos.map(todo =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            );
            this.saveTodos();
            this.render();

            // Если задача была отмечена как выполненная, запускаем таймер удаления
            if (!wasCompleted && !todo.completed) {
                this.scheduleDeletion(id);
            } else if (wasCompleted && todo.completed) {
                // Если задача была отменена (снята галочка), убираем из очереди удаления
                this.cancelDeletion(id);
            }
        }
    }

    deleteTodo(id) {
        // Показываем индикатор загрузки
        const deleteBtn = document.querySelector(`[onclick="app.deleteTodo(${id})"]`);
        if (deleteBtn) {
            const originalText = deleteBtn.innerHTML;
            deleteBtn.innerHTML = '⏳';
            deleteBtn.style.opacity = '0.7';
            
            // Добавляем задержку при удалении
            setTimeout(() => {
                this.todos = this.todos.filter(todo => todo.id !== id);
                this.saveTodos();
                this.render();
            }, 800); // 800ms задержка
        } else {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.render();
        }
    }

    startEdit(todoId) {
        // Добавляем задержку при начале редактирования
        setTimeout(() => {
            this.editingId = todoId;
            this.render();
        }, 800); // 800ms задержка
    }

    saveEdit(id) {
        const editInput = document.querySelector('.edit-input');
        const text = editInput.value.trim();
        
        if (text) {
            // Показываем индикатор загрузки
            const saveBtn = document.getElementById(`saveBtn${id}`);
            if (saveBtn) {
                saveBtn.innerHTML = '⏳';
                saveBtn.style.opacity = '0.7';
            }
            
            // Добавляем задержку для лучшего UX
            setTimeout(() => {
                this.todos = this.todos.map(todo =>
                    todo.id === id ? { ...todo, text: text } : todo
                );
                this.saveTodos();
                this.editingId = null;
                this.render();
            }, 1200); // 1200ms задержка
        } else {
            // Если текст пустой, отменяем редактирование
            this.cancelEdit();
        }
    }

    cancelEdit() {
        // Добавляем небольшую задержку при отмене
        setTimeout(() => {
            this.editingId = null;
            this.render();
        }, 600); // 600ms задержка
    }

    clearAll() {
        // Показываем индикатор загрузки
        const clearBtn = document.getElementById('clearAllBtn');
        const originalText = clearBtn.innerHTML;
        clearBtn.innerHTML = '⏳ Очистка...';
        clearBtn.style.opacity = '0.7';
        
        // Добавляем задержку при очистке всех задач
        setTimeout(() => {
            this.todos = [];
            this.saveTodos();
            this.render();
            
            // Восстанавливаем кнопку
            clearBtn.innerHTML = originalText;
            clearBtn.style.opacity = '1';
        }, 1500); // 1500ms задержка
    }

    scheduleDeletion(id) {
        // Отменяем предыдущий таймер, если он есть
        this.cancelDeletion(id);
        
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        let countdown = 5;
        const notification = this.showUndoNotification(todo.text, countdown);
        
        const timer = setInterval(() => {
            countdown--;
            this.updateCountdown(notification, countdown);
            
            if (countdown <= 0) {
                clearInterval(timer);
                this.pendingDeletions.delete(id);
                this.deleteTodo(id);
                this.hideUndoNotification(notification);
            }
        }, 1000);

        this.pendingDeletions.set(id, { timer, notification });
    }

    cancelDeletion(id) {
        const deletion = this.pendingDeletions.get(id);
        if (deletion) {
            clearInterval(deletion.timer);
            this.hideUndoNotification(deletion.notification);
            this.pendingDeletions.delete(id);
            
            // Восстанавливаем состояние задачи как невыполненной
            const todo = this.todos.find(t => t.id === id);
            if (todo && todo.completed) {
                this.todos = this.todos.map(todo =>
                    todo.id === id ? { ...todo, completed: false } : todo
                );
                this.saveTodos();
            }
            
            // Обновляем отображение после отмены удаления
            this.render();
        }
    }

    showUndoNotification(text, countdown) {
        const notification = document.createElement('div');
        notification.className = 'undo-notification';
        notification.innerHTML = `
            <span>Задача "${text}" будет выполнена через</span>
            <span class="countdown">${countdown}</span>
            <span>сек</span>
            <button class="undo-button" onclick="app.undoDeletion()">Отменить</button>
        `;
        
        document.body.appendChild(notification);
        return notification;
    }

    updateCountdown(notification, countdown) {
        const countdownElement = notification.querySelector('.countdown');
        if (countdownElement) {
            countdownElement.textContent = countdown;
        }
    }

    hideUndoNotification(notification) {
        if (notification && notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }

    undoDeletion() {
        // Отменяем все активные удаления
        for (const [id, deletion] of this.pendingDeletions) {
            clearInterval(deletion.timer);
            this.hideUndoNotification(deletion.notification);
            
            // Восстанавливаем состояние задачи как невыполненной
            const todo = this.todos.find(t => t.id === id);
            if (todo && todo.completed) {
                this.todos = this.todos.map(todo =>
                    todo.id === id ? { ...todo, completed: false } : todo
                );
            }
        }
        this.pendingDeletions.clear();
        
        // Сохраняем изменения и обновляем отображение
        this.saveTodos();
        this.render();
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    render() {
        const todosList = document.getElementById('todosList');
        const completedCount = this.todos.filter(todo => todo.completed).length;
        const totalCount = this.todos.length;

        // Обновляем статистику
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('totalCount').textContent = totalCount;

        const progressBar = document.getElementById('progressBar');
        const progressFill = document.getElementById('progressFill');
        const footer = document.getElementById('footer');

        if (totalCount > 0) {
            progressBar.style.display = 'block';
            progressFill.style.width = `${(completedCount / totalCount) * 100}%`;
            footer.style.display = 'block';
        } else {
            progressBar.style.display = 'none';
            footer.style.display = 'none';
        }

        if (this.todos.length === 0) {
            todosList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>Нет задач</p>
                    <span>Добавьте свою первую задачу выше</span>
                </div>
            `;
        } else {
            todosList.innerHTML = this.todos.map(todo => {
                if (this.editingId === todo.id) {
                    return `
                        <div class="todo-item">
                            <div class="edit-mode">
                                <input
                                    type="text"
                                    value="${todo.text}"
                                    class="edit-input"
                                    onkeydown="if(event.key === 'Enter') app.saveEdit(${todo.id}); if(event.key === 'Escape') app.cancelEdit()"
                                    onblur="app.saveEdit(${todo.id})"
                                    autofocus
                                />
                                <div class="edit-actions">
                                    <button class="save-button" onclick="app.saveEdit(${todo.id})" id="saveBtn${todo.id}">
                                        ✓
                                    </button>
                                    <button class="cancel-button" onclick="app.cancelEdit()">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="todo-item ${todo.completed ? 'completed' : ''}">
                            <div class="todo-content">
                                <button
                                    onclick="app.toggleTodo(${todo.id})"
                                    class="checkbox ${todo.completed ? 'checked' : ''}"
                                >
                                    ${todo.completed ? '✓' : ''}
                                </button>
                                <span class="todo-text">${todo.text}</span>
                            </div>
                            <div class="todo-actions">
                                <button
                                    onclick="app.startEdit(${todo.id})"
                                    class="edit-button"
                                    title="Редактировать задачу"
                                >
                                    ✏️ Редактировать
                                </button>
                                <button
                                    onclick="app.deleteTodo(${todo.id})"
                                    class="delete-button"
                                    title="Удалить задачу"
                                >
                                    🗑️ Удалить
                                </button>
                            </div>
                        </div>
                    `;
                }
            }).join('');
        }
    }
}

// Инициализация приложения
const app = new TodoApp(); 