document.addEventListener("DOMContentLoaded", () => {
    const columnsContainer = document.getElementById("columnsContainer");
    const addColumnButton = document.getElementById("addColumnButton");
    const taskSidebar = document.getElementById("taskSidebar");
    let currentTasksContainer = null;

    // Função para abrir a sidebar
    function openSidebar(tasksContainer) {
        currentTasksContainer = tasksContainer;
        taskSidebar.classList.remove("w-0");
        taskSidebar.classList.add("w-80");
    }

    // Função para fechar a sidebar
    function closeSidebar() {
        taskSidebar.classList.remove("w-80");
        taskSidebar.classList.add("w-0");
    }

    // Adicionar botão de fechar na sidebar
    const closeButton = document.createElement("button");
    closeButton.innerHTML = `<img src="../assets/state=default.svg" alt="Fechar" class="w-6 h-6">`;
    closeButton.className = "absolute top-4 right-4 bg-red-500 p-2 rounded hover:bg-red-600 transition z-50"; // Adicionada classe z-50
    closeButton.addEventListener("click", closeSidebar);
    taskSidebar.appendChild(closeButton);

    // Função para adicionar uma nova task
    function addTask(title, description, priority) {
        if (!currentTasksContainer) return;
        const newTask = document.createElement("div");
        const priorityColor = {
            "Alta": "bg-red-500",
            "Média": "bg-yellow-500",
            "Baixa": "bg-green-500"
        };

        newTask.className = `bg-white p-2 rounded shadow border border-gray-300 flex justify-between items-center`;
        newTask.innerHTML = `
            <div>
                <h4 class="font-bold">${title}</h4>
                <p class="text-sm text-gray-600">${description}</p>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-white text-xs px-2 py-1 rounded ${priorityColor[priority] || 'bg-gray-500'}">${priority}</span>
                <button class="delete-task-button text-red-500 hover:text-red-700">Excluir</button>
            </div>
        `;

        // Adicionar evento para excluir a tarefa
        const deleteButton = newTask.querySelector(".delete-task-button");
        deleteButton.addEventListener("click", () => {
            if (confirm("Tem certeza de que deseja excluir esta tarefa?")) {
                newTask.remove();
            }
        });

        currentTasksContainer.appendChild(newTask);
        closeSidebar();
    }

    // Configuração do formulário da sidebar
    const taskForm = document.getElementById("taskForm");
    taskForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = document.getElementById("taskTitle").value.trim();
        const description = document.getElementById("taskDescription").value.trim();
        const priority = document.getElementById("taskPriority").value;

        if (title) {
            addTask(title, description, priority);
        } else {
            alert("O título da task é obrigatório.");
        }
    });

    // Função para configurar o botão de adicionar tasks e opções
    function setupTaskButtonAndOptions(column) {
        const tasksContainer = column.querySelector(".tasks");
        const addTaskButton = column.querySelector(".add-task-button");
        const optionsButton = column.querySelector(".options-button");
        const optionsMenu = column.querySelector(".options-menu");
        const renameButton = column.querySelector(".rename-column");
        const deleteButton = column.querySelector(".delete-column");
        const columnTitle = column.querySelector(".column-title");

        // Abrir a sidebar para adicionar tasks
        if (tasksContainer && addTaskButton) {
            addTaskButton.addEventListener("click", () => openSidebar(tasksContainer));
        }

        // Abrir/fechar menu de opções
        optionsButton.addEventListener("click", (event) => {
            event.stopPropagation();
            optionsMenu.classList.toggle("hidden");
        });

        // Fechar menu ao clicar fora
        document.addEventListener("click", (event) => {
            if (!column.contains(event.target)) {
                optionsMenu.classList.add("hidden");
            }
        });

        // Renomear coluna
        renameButton.addEventListener("click", () => {
            const newName = prompt("Digite o novo nome da coluna:", columnTitle.textContent);
            if (newName && newName.trim() !== "") {
                columnTitle.textContent = newName.trim();
            } else {
                alert("O nome da coluna não pode estar vazio.");
            }
            optionsMenu.classList.add("hidden");
        });

        // Deletar coluna
        deleteButton.addEventListener("click", () => {
            if (confirm("Tem certeza de que deseja deletar esta coluna?")) {
                column.remove();
            }
        });
    }

    // Função para criar uma nova coluna
    function createNewColumn(columnName) {
        const newColumn = document.createElement("div");
        newColumn.className = "min-w-[300px] bg-gray-100 p-4 rounded shadow flex flex-col gap-4";
        newColumn.style.overflowY = "auto"; // Adiciona scroll vertical
        newColumn.style.maxHeight = "500px"; // Altura máxima para ativar o scroll
        newColumn.style.alignSelf = "flex-start"; // Permite alturas independentes
        newColumn.innerHTML = `
            <div class="flex justify-between items-center relative">
                <h3 class="font-bold column-title">${columnName}</h3>
                <button class="options-button text-xl text-gray-500 hover:text-gray-700">...</button>
                <div class="options-menu hidden absolute right-0 mt-2 bg-white rounded shadow text-sm">
                    <button class="rename-column px-4 py-2 hover:bg-gray-100 w-full text-left">Renomear</button>
                    <button class="delete-column px-4 py-2 hover:bg-gray-100 w-full text-left">Deletar</button>
                </div>
            </div>
            <div class="tasks flex flex-col gap-2"></div>
            <button class="add-task-button bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition">Adicionar Task</button>
        `;

        setupTaskButtonAndOptions(newColumn);
        columnsContainer.appendChild(newColumn);
    }

    // Evento para adicionar uma nova coluna ao clicar no botão
    addColumnButton.addEventListener("click", () => {
        const columnName = prompt("Digite o nome da nova coluna:", "Nova Coluna");
        if (columnName && columnName.trim() !== "") {
            createNewColumn(columnName.trim());
        } else {
            alert("O nome da coluna não pode estar vazio.");
        }
    });

    // Fechar a sidebar ao clicar fora dela
    document.addEventListener("click", (event) => {
        if (!taskSidebar.contains(event.target) && !event.target.closest(".add-task-button")) {
            closeSidebar();
        }
    });
});