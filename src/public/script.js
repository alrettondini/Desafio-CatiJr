const API_BASE = "http://localhost:3333";
const headers = {
  "Content-Type": "application/json",
};

document.addEventListener("DOMContentLoaded", function () {
  // Selecionando os elementos do DOM
  const taskForm = document.getElementById('taskForm');
  const columnForm = document.getElementById("columnForm");
  const columnNameInput = document.getElementById("columnNameInput");
  const confirmColumnButton = document.getElementById("confirmColumnButton");
  const cancelColumnButton = document.getElementById("cancelColumnButton");
  const board = document.getElementById("Board");
  const closeTaskFormButton = document.getElementById("closeTaskFormButton");
  const confirmTaskButton = document.getElementById("confirmTaskButton");
  const addColumnButton = document.getElementById("addColumnButton");
  const deleteTaskForm = document.getElementById("deleteTaskForm");
  const deleteListForm = document.getElementById("deleteListForm");
  const closeDeleteTaskForm = document.getElementById("closeDeleteTaskForm");
  const closeDeleteListForm = document.getElementById("closeDeleteListForm");
  const confirmDeleteTaskButton = document.getElementById("confirmDeleteTaskButton");
  const confirmDeleteListButton = document.getElementById("confirmDeleteListButton");
  const contextMenuTask = document.getElementById("contextMenuTask");
  const columnFormAtt = document.getElementById("columnFormAtt");

  let draggedTask = null; // Tarefa que está sendo arrastada

  let taskToDelete = null; // Tarefa a ser deletada
  let activeTaskElement = null; // Tarefa selecionada
  let activeColumnId = null; // ID Coluna Selecionada
  let activeColumnElement = null; // Coluna selecionada

  loadColumns();
  loadTasks();

  // Função para criar colunas
  function createColumn(columnName, listId) {
    // Criar um novo elemento de coluna
    const newColumn = document.createElement("div");

    newColumn.dataset.listId = listId;
    newColumn.className = "list bg-zinc-800 border m-4 border-zinc-700 sm:min-w-[400px] w-[350px] sm:min-h-[600px] min-h-[400px] rounded-lg flex-shrink-0 self-start";
    newColumn.id = listId;
    newColumn.setAttribute("ondrop", "drop(event)");
    newColumn.setAttribute("ondragover", "allowDrop(event)");

    // Adicionar o conteúdo da nova coluna
    newColumn.innerHTML = `
      <section class="flex justify-between items-center mx-3 my-4">
        <h1 class="text-xl font-bold text-white">${columnName}</h1>
        <button class="menuButton text-gray-300 text-xl leading-none pb-1 px-2 rounded-lg hover:bg-zinc-700 transition-colors">&hellip;</button>
        <div class="menu hidden absolute bg-zinc-800 text-white rounded border border-zinc-600 shadow-lg z-50">
          <ul>
            <li class="renameListOption px-2 py-2 flex items-center space-x-2 hover:bg-zinc-700 cursor-pointer">
              <img src="../assets/EditPencil.svg" class="">
              <p>Renomear</p>
            </li>
            <li class="deleteListOption text-danger px-2 py-2 flex items-center space-x-2 hover:bg-zinc-700 cursor-pointer">
              <img src="../assets/Bin.svg" class="">
              <p>Deletar</p>
            </li>
          </ul>
        </div>
      </section>
      <div id="tasks-${newColumn.id}" class="tasks-container"></div>
      <button type="button" class="flex items-center space-x-2 mx-3 mb-3 px-3 py-1 hover:bg-zinc-700 rounded transition-colors addTaskButton">
        <img src="../assets/BsFillPlusCircleFill.svg" alt="" class="w-5 h-5">
        <span class="text-white text-sm font-semibold">Nova Tarefa</span>
      </button>
    `;

    // Adicionar evento para abrir o formulário de criação de tarefas
    newColumn.querySelector(".addTaskButton").addEventListener("click", function () {
      activeColumnId = newColumn.id; // Define a coluna ativa para adicionar a task
      // console.log("activeColumnId definida:", activeColumnId); // Debug
      openTaskForm();
    });

    const menuButton = newColumn.querySelector(".menuButton");
    const menu = newColumn.querySelector(".menu");

    // Abre context menu das listas
    menuButton.addEventListener("click", function (e) {
      e.stopPropagation(); // Previne que o clique feche o menu
      // Temporariamente exibe o menu para pegar a largura real
      menu.classList.remove("hidden");

      // Obtém a posição do botão e a largura do menu
      const rect = menuButton.getBoundingClientRect();
      const menuWidth = menu.offsetWidth;

      menu.style.top = `${rect.bottom + window.scrollY}px`;
      menu.style.left = `${rect.right - menuWidth + window.scrollX}px`;
      
    });

    // Fechar context menu das listas ao clicar fora
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !menuButton.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });

    // Adicionar evento para renomear a lista
    const renameOption = newColumn.querySelector(".renameListOption");
    renameOption.addEventListener("click", function () {
      menu.classList.add("hidden");
      renameColumn(newColumn);
    });

    // Adicionar evento para deletar a lista
    const deleteOption = newColumn.querySelector(".deleteListOption");
    deleteOption.addEventListener("click", function () {
      if(newColumn.id == "A Fazer"){
      }

      openDeleteListForm(newColumn);
    });

    // Adiciona a nova coluna ao board
    board.appendChild(newColumn);
  }

  async function loadColumns() {
    try {
      const response = await fetch(`${API_BASE}/lists`);
      const lists = await response.json();
      lists.forEach(list => createColumn(list.title, list.id)); // Passa o ID da lista
    } catch (error) {
      console.error("Erro ao carregar colunas:", error);
    }
  }
  
  async function loadTasks() {
    try {
      const response = await fetch(`${API_BASE}/tasks`);
      const tasks = await response.json();
      tasks.forEach(task => createTaskElement(task));
      highlightExpiredTasks(); // Chama logo após renderizar as tasks
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    }
  }

  // Botão para renomear lista
  document.getElementById("confirmColumnAttButton").addEventListener("click", saveRenameColumn);

  // Fecha o form ao clicar no botão "Cancelar"
  document.getElementById("cancelColumnAttButton").addEventListener("click", function () {
    columnFormAtt.classList.add("hidden");
  });

  // Função para renomear a lista
  function renameColumn(columnElement) {
    const columnTitle = columnElement.querySelector("h1").textContent;

    document.getElementById("columnNameAttInput").value = columnTitle;

    // Atualiza a referência da tarefa que será editada
    activeColumnElement = columnElement;

    columnFormAtt.classList.remove("hidden");
  }

  async function saveRenameColumn(event) {
    event.preventDefault();
  
    if (!activeColumnElement) return;
  
    const newTitle = document.getElementById("columnNameAttInput").value.trim();
    const listId = activeColumnElement.dataset.listId; // Adiciona um data-attribute no elemento
  
    if (newTitle) {
      try {
        const response = await fetch(`${API_BASE}/lists/${listId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ title: newTitle }),
        });
  
        const updatedList = await response.json();
        activeColumnElement.querySelector("h1").textContent = updatedList.title;
        columnFormAtt.classList.add("hidden");
  
      } catch (error) {
        console.error("Erro ao atualizar lista:", error);
      }
    }
  }

  // Abrir e fechar o formulário de criação de tarefas
  function openTaskForm(){
    // Limpa os campos do formulário
    taskNameInput.value = "";
    taskDescriptionInput.value = "";
    deadline.value = "";
    taskPriorityInput.value = "PriorityMedium"; // Prioridade padrão é "Média"

    // Verifica se há uma coluna ativa definida
    if (activeColumnId) {
      const columnElement = document.getElementById(activeColumnId);
      const columnName = columnElement.querySelector("h1").textContent;
      document.getElementById("currentColumnName").textContent = columnName;
    } else {
      document.getElementById("currentColumnName").textContent = "Sem Coluna Selecionada";
    }

    // Exibe o formulário de criação de tarefas
    taskForm.classList.remove('translate-x-full');
  }

  closeTaskFormButton.addEventListener("click", closeTaskForm);
  function closeTaskForm(){
    taskForm.classList.add('translate-x-full');
  }

  document.addEventListener("click", function (event) {
    // Verifica se o clique foi fora do taskForm e se ele está visível
    if (!taskForm.contains(event.target) && !event.target.closest("#taskForm") && !event.target.closest(".addTaskButton")) {
      closeTaskForm();
    }
  });

  // Abre o form ao clicar no botão "Adicionar Coluna"
  addColumnButton.addEventListener("click", function () {
    columnForm.classList.remove("hidden");
    columnNameInput.value = ""; // Limpa o campo de input
    columnNameInput.focus(); // Coloca o cursor no input
  });

  // Fecha o form ao clicar no botão "Cancelar"
  cancelColumnButton.addEventListener("click", function () {
    columnForm.classList.add("hidden");
  });

  // Confirma a criação da coluna
  confirmColumnButton.addEventListener("click", async function () {
    const title = columnNameInput.value.trim();
  
    if (title) {
      try {
        const response = await fetch(`${API_BASE}/lists`, {
          method: "POST",
          headers,
          body: JSON.stringify({ title }),
        });
  
        const newList = await response.json();
        createColumn(newList.title, newList.id); // Passa o ID da API
        columnForm.classList.add("hidden");
  
      } catch (error) {
        console.error("Erro ao criar lista:", error);
        alert("Falha ao criar lista!");
      }
    } else {
      alert("O nome da lista não pode ser vazio!");
    }
  });

  // Formata a data para mostrar no card da tarefa
  function formatDate(dateInput) {
    if (!dateInput) return "Sem data";
  
    // Garante que é uma string e remove possíveis timezones
    const dateString = String(dateInput).split('T')[0]; 
    const [year, month, day] = dateString.split("-");
  
    // Verifica se todos os componentes da data são válidos
    if (!year || !month || !day) return "Sem data";
  
    // Cria a data no fuso horário local
    const date = new Date(year, month - 1, day);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return "Sem data";
  
    const formatter = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  
    return formatter.format(date).toUpperCase();
  }

  // Confirma Criação de Task
  confirmTaskButton.addEventListener("click", async function(event) {
    event.preventDefault();
  
    // Captura e prepara os dados do formulário
    const title = document.getElementById("taskNameInput").value.trim();
    const description = document.getElementById("taskDescriptionInput").value.trim();
    const priority = document.getElementById("taskPriorityInput").value;
    const deadlineInput = document.getElementById("deadline").value;
    const listId = activeColumnId;

    // Verifica se o campo de data foi preenchido
    if (deadlineInput == "") {
      alert("Por favor, insira a data de conclusão da tarefa.");
      return; // Interrompe o envio caso a data não seja informada
    }

    
    
    // Cria o objeto taskData
    const taskData = { title, description, priority, listId };
    taskData.finishAt = new Date(deadlineInput).toISOString();

    // console.log("Dados da task:", taskData); // Debug para verificar o objeto

    if (taskData.title && taskData.listId) {
      try {
        const response = await fetch(`${API_BASE}/tasks`, {
          method: "POST",
          headers,
          body: 
            JSON.stringify(taskData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro na criação da task:", errorData);
          throw new Error("Erro na criação da task");
        }
  
        const newTask = await response.json();
        createTaskElement(newTask); // Função modificada para usar dados da API
        closeTaskForm();
  
      } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        alert("Falha ao criar tarefa!");
      }
    }
  });

  // Criação de Task
  function createTaskElement(taskData) {    
    const taskPriority = taskData.priority;
  
    const formattedDate = formatDate(taskData.finishAt);

    // Garante que task sempre terá nome e que está na lista/coluna certa
    if (taskData.title !== "" && taskData.listId) {
      const newTask = document.createElement("section");
      newTask.className = "task border border-zinc-700 bg-zinc-800 mx-2 mb-3 rounded-md";
      newTask.id = `task-${taskData.id}`;
      newTask.draggable = true;
      newTask.dataset.taskId = taskData.id; // Para referência nas requisições

      newTask.dataset.listId = taskData.listId;

      // Cria nova task
      newTask.innerHTML = `
        <div class="flex justify-between">
          <img src="../assets/PriorityTags/${taskPriority}.svg" alt="Priority Tag" class="ml-3 mt-3">
          <button type="button" class="finalize_task flex items-center space-x-2 mr-3 mt-3 px-4 w-fit">
            <img src="../assets/CheckBorderDots.svg" class="">
            <span class="text-white font-semibold">Finalizar</span>
          </button>
        </div>
        <h2 class="text-lg text-white font-semibold my-2 mx-3">${taskData.title}</h2>
        <p class="text-white mx-3 mb-3 max-w-[350px] max-h-25 overflow-y-scroll hide-scrollbar">${taskData.description}</p>
        <section class="flex justify-between mx-3">
          <div id="task-date" class="flex items-center my-3 text-zinc-600 bg-zinc-300 rounded-lg w-fit">
            <img src="../assets/Callendar.svg" alt="Callendar" class="ml-2">
            <p class="date px-2 py-1 font-semibold" data-date="${taskData.finishAt}">${formattedDate}</p>
          </div>
        </section>
      `;

      if(taskData.isFinished){
        finalizeTask(newTask); // Por algum motivo não funciona :(
      }

      // Adicionar eventos
      addTaskEventListeners(newTask);

      // Insere a nova task no container de tasks da coluna correspondente
      const tasksContainer = document.getElementById(`tasks-${taskData.listId}`);

      if (tasksContainer) {
        tasksContainer.appendChild(newTask);
      } else {
        console.error("Container de tasks não encontrado para a listId:", taskData.listId);
      }
    } else {
      alert("O nome da tarefa não pode estar vazio!");
    }
  };

  // Função para adicionar event listeners a uma task
  function addTaskEventListeners(taskElement) {
    // Drag & Drop
    taskElement.addEventListener("dragstart", function (e) {
      if (e.target.classList.contains("task")) {
        draggedTask = e.target; // Define a tarefa arrastada
        setTimeout(() => {
          e.target.style.opacity = "0.5"; // Reduz a opacidade para indicar que está sendo arrastada
        }, 0);
      }
    });

    taskElement.addEventListener("dragend", function (e) {
      if (draggedTask) {
        draggedTask.style.opacity = "1"; // Restaura a opacidade
        draggedTask = null; // Reseta a referência
      }
    });

    // Context Menu
    taskElement.addEventListener("contextmenu", function (e) {
      e.preventDefault(); // Impede o menu de contexto padrão do navegador

      // Define a tarefa ativa para garantir edição na task correta
      activeTaskElement = taskElement;

      // Posiciona o menu de contexto na posição do clique
      const contextMenu = document.getElementById("contextMenuTask");
      contextMenu.style.top = `${e.clientY}px`;
      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.display = "block";

      // Exibe o menu de contexto
      setTimeout(() => {
        contextMenu.classList.remove("hidden");
      });
    });

    const finalizeButton = taskElement.querySelector(".finalize_task");
    if (finalizeButton) {
      finalizeButton.addEventListener("click", function (e) {
        // Evita que o clique dispare outros eventos
        e.stopPropagation();

        // Atualiza a aparência da task no front-end
        finalizeTask(taskElement);
        
        // Extrai os dados atuais da task e atualiza o isFinished
        const updatedTaskData = getTaskDataFromElement(taskElement);
        updatedTaskData.isFinished = true; // Atualiza para finalizar a task

        const taskId = taskElement.dataset.taskId;

        // Envia o objeto completo para o backend via PUT
        fetch(`${API_BASE}/tasks/${taskId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(updatedTaskData)
        })
          .then(async response => {
            if (!response.ok) {
              const errorData = await response.json();
              console.error("Erro ao atualizar a task no backend:", errorData);
              throw new Error("Erro na atualização da task");
            }
            return response.json();
          })
          .then(updatedTask => {
            console.log("Task finalizada e atualizada com sucesso:", updatedTask);
          })
          .catch(error => {
            console.error("Erro ao finalizar a task:", error);
          });
      });
    }
  }

  // Exibe o menu de contexto para tarefas (editar/duplicar/excluir)
  board.addEventListener("contextmenu", function (e) {
    // Verifica se o clique foi dentro de uma tarefa (class="task")
    const taskElement = e.target.closest(".task");
    if (taskElement) {
      e.preventDefault(); // Impede o menu de contexto padrão do navegador

      // Define a tarefa ativa para garantir edição na task correta
      activeTaskElement = taskElement;

      // Posiciona o menu de contexto na posição do clique
      const contextMenu = document.getElementById("contextMenuTask");
      contextMenu.style.top = `${e.clientY}px`;
      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.display = "block";

      // Exibe o menu de contexto
      setTimeout(() => {
        contextMenu.classList.remove("hidden");
      });
    }
  });

  // Fecha menu de contexto quando clica fora
  document.addEventListener("click", function () {
    const contextMenu = document.getElementById("contextMenuTask");
    contextMenu.style.display = "none";
    contextMenu.classList.add("hidden");
  });

  // Chama função de duplicar task
  document.getElementById("duplicateTaskOption").addEventListener("click", function () {
    // Verifica se é a task correta
    if (activeTaskElement) {
      duplicateTask(activeTaskElement); // Chama a função de duplicação
    }
  
    // Esconde o menu de contexto
    contextMenuTask.style.display = "none";
    contextMenuTask.classList.add("hidden");
  });
  
  // Função para duplicar uma tarefa
  function duplicateTask(taskElement) {
    // Extrai os dados da tarefa original a partir do elemento
    const title = taskElement.querySelector("h2").textContent;
    const description = taskElement.querySelector("p").textContent;
    
    // Obtém o valor da data (finishAt) que está armazenada no atributo data-date
    const finishAt = taskElement.querySelector(".date").getAttribute("data-date") || null;
    
    // Para a prioridade, extrai o nome do arquivo
    const imgSrc = taskElement.querySelector("img").src;
    const priority = imgSrc.split('/').pop().split('.')[0];
    
    // Obtém o listId da task a partir do data attribute
    const listId = taskElement.dataset.listId;
  
    // Cria um objeto com os dados da tarefa duplicada
    const duplicatedTaskData = {
      title,
      description,
      priority,
      finishAt,
      listId,
      isFinished: false
    };
  
    // Envia a requisição para o backend para criar uma nova task duplicada
    fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify(duplicatedTaskData)
    })
      .then(async response => {
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao duplicar tarefa:", errorData);
          throw new Error("Erro ao duplicar tarefa");
        }
        return response.json();
      })
      .then(newTask => {
        console.log("Task duplicada com sucesso:", newTask);
        // Cria o novo elemento no DOM usando os dados retornados pela API
        createTaskElement(newTask);
      })
      .catch(error => {
        console.error("Erro ao duplicar tarefa:", error);
      });
  }
  
  
  // Chama form de editar tarefa
  document.getElementById("editTaskOption").addEventListener("click", function () {
    if (activeTaskElement) {
      openTaskAttForm(activeTaskElement); // Abre o formulário de edição
    }

    // Esconde o menu de contexto
    contextMenuTask.style.display = "none";
    contextMenuTask.classList.add("hidden");
  });

  // Abre o formulário de edição de tarefas e edita os campos 
  function openTaskAttForm(taskElement) {
    // Pega os valores da tarefa selecionada
    const taskName = taskElement.querySelector("h2").textContent;
    const taskDescription = taskElement.querySelector("p").textContent;
    const taskPriorityImg = taskElement.querySelector("img").src;

    // Extrai o nome da prioridade (por exemplo, "PriorityMedium")
    const taskPriority = taskPriorityImg.split('/').pop().split('.')[0];

    // Obtém a data armazenada no atributo `data-date`
    const taskDateElement = taskElement.querySelector(".date");
    let taskDeadline = taskDateElement.getAttribute("data-date");
    
    // Converte o valor ISO para "yyyy-MM-dd"
    if (taskDeadline) {
      taskDeadline = taskDeadline.split("T")[0];
    }
    
    // Preenche os campos do formulário de edição
    document.getElementById("taskNameAttInput").value = taskName;
    document.getElementById("taskDescriptionAttInput").value = taskDescription;
    document.getElementById("taskPriorityAttInput").value = taskPriority;
    document.getElementById("deadlineAtt").value = taskDeadline;

    // Atualiza a referência da tarefa que será editada
    activeTaskElement = taskElement;
  
    // Abre o formulário de atualização
    document.getElementById("taskAttForm").classList.remove('translate-x-full');
  }
  

  // Salva edições na task e fecha form de edição
  async function saveTaskEdits(event) {
    event.preventDefault();
  
    if (!activeTaskElement) return;
  
    const taskId = activeTaskElement.dataset.taskId;
    const listId = activeTaskElement.dataset.listId;
  
    const deadlineInputAtt = document.getElementById("deadlineAtt").value;
    // Verifica se o campo de data foi preenchido
    if (deadlineInputAtt == "") {
      alert("Por favor, insira a data de conclusão para a tarefa.");
      return; // Interrompe o envio caso a data não seja informada
    }

    const taskDataAtt = {
      title: document.getElementById("taskNameAttInput").value.trim(),
      description: document.getElementById("taskDescriptionAttInput").value.trim(),
      priority: document.getElementById("taskPriorityAttInput").value,
      // Converte o valor "yyyy-MM-dd" para um ISO string
      finishAt: new Date(deadlineInputAtt).toISOString(),
      listId: listId,
      isFinished: false
    };
  
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(taskDataAtt),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro na atualização da task:", errorData);
        throw new Error("Erro na atualização da task");
      }
  
      const updatedTask = await response.json();
      closeTaskForm();
  
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      alert("Falha ao atualizar tarefa!");
    }
  }
  

  // Botão para atualizar tarefa
  document.getElementById("attTaskButton").addEventListener("click", saveTaskEdits);

  // Botão para fechar o formulário de atualização (cancela atualização)
  document.getElementById("closeTaskAttFormButton").addEventListener("click", function () {
      document.getElementById("taskAttForm").classList.add('translate-x-full');
  });

  // Chama form de deletar task pelo botão no form de edição
  document.getElementById("deleteTaskButton").addEventListener("click", function () {
    if (activeTaskElement) {
        openDeleteTaskForm(activeTaskElement);
    }
  });

  // Chama form de deletar task pelo context menu
  document.getElementById("deleteTaskOption").addEventListener("click", function() {
    if (activeTaskElement) {
      openDeleteTaskForm(activeTaskElement);
    }
  });

  // Form de deleção de task (apenas confirmação)
  function openDeleteTaskForm(taskElement) {
    taskToDelete = taskElement; // Define a tarefa a ser deletada

    // Pega o nome da tarefa e exibe no form
    const taskName = taskElement.querySelector("h2").textContent;
    document.getElementById("deleteTask").textContent += `"${taskName}"?`;

    deleteTaskForm.classList.remove("hidden");
  }

  // Confirma deleção de task no form
  confirmDeleteTaskButton.addEventListener("click", async function () {
    if (taskToDelete) {
      const taskId = taskToDelete.dataset.taskId;
  
      try {
        await fetch(`${API_BASE}/tasks/${taskId}`, {
          method: "DELETE",
        });
  
        taskToDelete.remove();
        showDeleteConfirmation("Task");
      } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
      }
  
      closeDeleteTaskFormFunc();
    }
  });

  // Fecha caixinha de confirmação de delete de elemento (cancela deleção)
  closeDeleteTaskForm.addEventListener("click", closeDeleteTaskFormFunc);
  function closeDeleteTaskFormFunc() {
    taskToDelete = null; // Limpa a referência da tarefa
    deleteTaskForm.classList.add("hidden");
  }

  // Form de deleção de lista (apenas confirmação)
  function openDeleteListForm(listElement) {
    listToDelete = listElement; // Define a tarefa a ser deletada

    // Pega o nome da tarefa e exibe no form
    const listName = listElement.querySelector("h1").textContent;
    document.getElementById("deleteList").textContent += `"${listName}"`;

    deleteListForm.classList.remove("hidden");
  }

  // Confirma deleção de task no form
  confirmDeleteListButton.addEventListener("click", async function () {
    if (listToDelete) {
      const listId = listToDelete.dataset.listId;
  
      try {
        await fetch(`${API_BASE}/lists/${listId}`, {
          method: "DELETE",
        });
  
        listToDelete.remove();
        showDeleteConfirmation("Lista");
      } catch (error) {
        console.error("Erro ao deletar lista:", error);
      }
  
      closeDeleteListFormFunc();
    }
  });

  // Fecha caixinha de confirmação de delete de elemento (cancela deleção)
  closeDeleteListForm.addEventListener("click", closeDeleteListFormFunc);
  function closeDeleteListFormFunc() {
    listToDelete = null; // Limpa a referência da lista
    deleteListForm.classList.add("hidden");
  }

  // Confirmação de exclusão de elemento (tanto task quanto lista)
  function showDeleteConfirmation(itemToDelete) {
    const notification = document.getElementById("deleteConfirmation");
    notification.classList.add("show");
    notification.classList.remove("hidden");
  
    document.getElementById("itemDeleted").textContent = `${itemToDelete}`;
    
    // Esconde automaticamente após 3 segundos
    setTimeout(() => {
      hideDeleteConfirmation();
    }, 3000);
  }

  // Fecha notificação de exclusão
  document.getElementById("closeNotification").addEventListener("click", hideDeleteConfirmation);
  function hideDeleteConfirmation() {
    const notification = document.getElementById("deleteConfirmation");
    notification.classList.remove("show");
    notification.classList.add("hidden");
  }

  function getTaskDataFromElement(taskElement) {
    // Extrai o título e descrição
    const title = taskElement.querySelector("h2").textContent;
    const description = taskElement.querySelector("p").textContent;
    
    // Extrai a prioridade a partir da imagem
    const imgSrc = taskElement.querySelector("img").src;
    const priority = imgSrc.split('/').pop().split('.')[0];
    
    // Pega data armazenada no atributo data-date
    const finishAt = taskElement.querySelector(".date").getAttribute("data-date") || null;
    
    // Pega o listId atual da task
    const listId = taskElement.dataset.listId;
    
    // Extrai status de conclusão
    const isFinished = taskElement.classList.contains("finished");
    
    return { title, description, priority, finishAt, listId, isFinished };
  }
  
  // Função que finaliza a task no front-end
  function finalizeTask(taskElement) {
    // Reduz a opacidade para indicar que a task está concluída
    taskElement.style.opacity = "0.3";
    
    // Adiciona uma classe via CSS para fundo verde
    taskElement.classList.add("finished");
  }

  
  // Drag & Drop
  // Evento para iniciar o drag
  board.addEventListener("dragstart", function (e) {
    if (e.target.classList.contains("task")) {
      draggedTask = e.target; // Define a tarefa arrastada
      setTimeout(() => {
        e.target.style.opacity = "0.5"; // Reduz a opacidade para indicar que está sendo arrastada
      }, 0);
    }
  });

  // Evento para cancelar o estilo ao finalizar o drag
  board.addEventListener("dragend", function (e) {
    if (draggedTask) {
      draggedTask.style.opacity = "1"; // Restaura a opacidade
      draggedTask = null; // Reseta a referência
    }
  });

  // Evento para gerenciar o drag dentro de um container
  board.addEventListener("dragover", function (e) {
    e.preventDefault();
    const taskElement = e.target.closest(".task"); // Pega uma tarefa
    const tasksContainer = e.target.closest(".tasks-container"); // Garante que está no task-container certo

    if (tasksContainer && draggedTask && taskElement && taskElement !== draggedTask) {
      // Insere a tarefa arrastada antes ou depois da tarefa sobre a qual está em cima
      const bounding = taskElement.getBoundingClientRect();
      const offset = e.clientY - bounding.top; // Posição do mouse relativa ao topo da tarefa

      if (offset > bounding.height / 2) {
        // Solta abaixo da tarefa
        tasksContainer.insertBefore(draggedTask, taskElement.nextSibling);
      } else {
        // Solta acima da tarefa
        tasksContainer.insertBefore(draggedTask, taskElement);
      }
    }
  });

  // Permitir o drop nas listas e entre listas
  board.addEventListener("drop", function (e) {
    e.preventDefault();
    
    const column = e.target.closest(".bg-zinc-800"); // Coluna de destino (gambiarra pra pegar a coluna)
    if (column && draggedTask) {
      const tasksContainer = column.querySelector(".tasks-container");
      if (tasksContainer) {
        tasksContainer.appendChild(draggedTask); // Move a task para o novo container
        
        // Obtém o novo listId da coluna de destino
        const newListId = column.dataset.listId;
        
        // Atualiza o dataset da task para refletir o novo listId
        draggedTask.dataset.listId = newListId;
        
        // Extrai todos os dados atuais da task e atualiza o listId
        const updatedTaskData = getTaskDataFromElement(draggedTask);
        
        // Envia o objeto completo para o backend via PUT
        const taskId = draggedTask.dataset.taskId;
        fetch(`${API_BASE}/tasks/${taskId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(updatedTaskData),
        })
        .then(async response => {
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro na atualização da task:", errorData);
            throw new Error("Erro na atualização da task");
          }
          return response.json();
        })
        .then(updatedTask => {
          console.log("Task atualizada com sucesso:", updatedTask);
        })
        .catch(error => {
          console.error("Erro ao atualizar task após o drop:", error);
        });
      }
    }
  });  

   // Função para verificar e destacar tarefas vencidas
   function highlightExpiredTasks() {
    const taskDateElements = document.querySelectorAll('.date[data-date]');
  
    taskDateElements.forEach(taskDateElement => {
      let taskDateAttribute = taskDateElement.getAttribute('data-date');
      if (taskDateAttribute) {
        // Extrai apenas a parte da data (yyyy-MM-dd)
        if (taskDateAttribute.includes("T")) {
          taskDateAttribute = taskDateAttribute.split("T")[0];
        }
        // Cria um objeto Date a partir da data extraída
        const [year, month, day] = taskDateAttribute.split('-');
        const taskDate = new Date(year, month - 1, day);
  
        // Obtem a data atual e zera as horas para comparar somente a data
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);
  
        // Remove classes de destaque antigas
        taskDateElement.parentElement.classList.remove('bg-red-400', 'bg-orange-300', 'bg-zinc-300');
  
        // Se a tarefa estiver atrasada, destaca em vermelho
        if (taskDate < currentDate) {
          taskDateElement.parentElement.classList.add('bg-red-400');
        }
        // Se for exatamente hoje, destaca em laranja
        else if (taskDate.getTime() === currentDate.getTime()) {
          taskDateElement.parentElement.classList.add('bg-orange-300');
        }
        // Caso contrário, mantenha o fundo normal
        else {
          taskDateElement.parentElement.classList.add('bg-zinc-300');
        }
      }
    });
  }  

  // Chamada inicial para verificar tarefas vencidas ao carregar a página
  highlightExpiredTasks();

  // Evento para verificar tarefas vencidas após adicionar ou editar uma tarefa
  confirmTaskButton.addEventListener("click", function(event){
    event.preventDefault();
    highlightExpiredTasks(); // Verifica tarefas vencidas após adicionar nova tarefa
  });

  // Evento para verificar tarefas vencidas após editar uma tarefa
  attTaskButton.addEventListener("click", function(event){
    event.preventDefault();
    highlightExpiredTasks(); // Verifica tarefas vencidas após editar tarefa
  });
});