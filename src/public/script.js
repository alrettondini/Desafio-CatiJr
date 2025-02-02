

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

  // Função para criar colunas
  function createColumn(columnName) {
    const columnId = `list-${columnName}`; // Cria um ID único

    // Criar um novo elemento de coluna
    const newColumn = document.createElement("div");
    newColumn.className = "list bg-zinc-800 border m-4 border-zinc-700 sm:min-w-[400px] w-[350px] sm:min-h-[600px] min-h-[400px] rounded-lg flex-shrink-0 self-start";
    newColumn.id = columnId;
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
      <div id="tasks-${columnId}" class="tasks-container"></div>
      <button type="button" class="flex items-center space-x-2 mx-3 mb-3 px-3 py-1 hover:bg-zinc-700 rounded transition-colors addTaskButton">
        <img src="../assets/BsFillPlusCircleFill.svg" alt="" class="w-5 h-5">
        <span class="text-white text-sm font-semibold">Nova Tarefa</span>
      </button>
    `;

    // Adicionar evento para abrir o formulário de criação de tarefas
    newColumn.querySelector(".addTaskButton").addEventListener("click", function () {
      activeColumnId = columnId; // Define a coluna ativa para adicionar a task
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
      const menuWidth = menu.offsetWidth; // Agora o valor está correto

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

    // Adicionar a nova coluna ao board
    board.appendChild(newColumn);
  }

  // Criar 3 listas iniciais ao carregar a página
  const initialColumns = ["A Fazer", "Em Progresso", "Concluído"];
  initialColumns.forEach(createColumn);

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

  function saveRenameColumn (event) {
    event.preventDefault();

    if(!activeColumnElement) return;

    const newColumnName = document.getElementById("columnNameAttInput").value.trim();

    if (newColumnName !== "") {
      activeColumnElement.querySelector("h1").textContent = newColumnName;
      columnFormAtt.classList.add("hidden");
      // Limpa a referência da coluna/lista editada
      activeColumnElement = null;
    } else {
      alert("O nome da coluna não pode estar vazio!");
    }
  }

  // Abrir e fechar o formulário de criação de tarefas
  function openTaskForm(){
    // Limpa os campos do formulário
    taskNameInput.value = "";
    taskDescriptionInput.value = "";
    deadline.value = "";
    taskPriorityInput.value = "PriorityMedium"; // Opcional: Define uma prioridade padrão

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
  confirmColumnButton.addEventListener("click", function () {
    const columnName = columnNameInput.value.trim();

    if (columnName !== "") {
      createColumn(columnName); // Utilize a função existente para criar a coluna

      // Fechar o formulário de criação de coluna após adicionar
      columnForm.classList.add("hidden");
    } else {
      alert("O nome da coluna não pode estar vazio!");
    }
  });

  // Formata a data para mostrar no card da tarefa
  function formatDate(dateInput) {
    if (!dateInput) return "Sem data";

    // Divide a string "YYYY-MM-DD" para evitar problemas de fuso horário
    const [year, month, day] = dateInput.split("-");

    // Cria um objeto Date garantindo que seja no fuso local
    const date = new Date(year, month - 1, day); // `month - 1` porque os meses começam de 0 no JS

    // Usa Intl.DateTimeFormat para formatar corretamente
    const formatter = new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return formatter.format(date).toUpperCase(); // Exemplo: "23 JAN, 2024"
  }

  // Confirma Criação de Task
  confirmTaskButton.addEventListener("click", function(event){
    event.preventDefault(); // Evita o envio do formulário

    const taskName = document.getElementById("taskNameInput").value.trim();
    const taskDescription = document.getElementById("taskDescriptionInput").value.trim();
    const taskPriority = document.getElementById("taskPriorityInput").value;
    const taskDeadline = document.getElementById("deadline").value; // Verifique se está pegando a data correta

    // Formate a data caso tenha sido dada
    const formattedDate = taskDeadline ? formatDate(taskDeadline) : "Sem data";

    // Garante que task sempre terá nome e que está na lista/coluna certa
    if (taskName !== "" && activeColumnId) {
        const tasksContainer = document.getElementById(`tasks-${activeColumnId}`);
        const newTask = document.createElement("section");
        newTask.className = "task border border-zinc-700 bg-zinc-800 mx-2 mb-3 rounded-md"; // Class da task
        newTask.id = `task-${Date.now()}`; // ID único de cada task
        newTask.draggable = true; // Permite Drag & Drop

        // Cria nova task
        newTask.innerHTML = `
            <div class="flex justify-between">
                <img src="../assets/PriorityTags/${taskPriority}.svg" alt="Priority Tag" class="ml-3 mt-3">
                <button type="button" class="flex items-center space-x-2 mr-3 mt-3 px-4 w-fit">
                    <img src="../assets/CheckBorderDots.svg" id="finalize" class="finalize_task">
                    <span class="text-white font-semibold">Finalizar</span>
                </button>
            </div>
            <h2 class="text-lg text-white font-semibold my-2 mx-3">${taskName}</h2>
            <p class="text-white mx-3 mb-3 max-w-[350px] max-h-25 overflow-y-scroll hide-scrollbar ">${taskDescription}</p>
            <section class="flex justify-between mx-3">
              <div id="task-date" class="flex items-center my-3 text-zinc-600 bg-zinc-300 rounded-lg w-fit">
                <img src="../assets/Callendar.svg" alt="Callendar" class="ml-2">
                <p class="date px-2 py-1 font-semibold" data-date="${taskDeadline}">${formattedDate}</p>
              </div>
            </section>
        `;

        // Adiciona nova task ao tasksContainer da lista
        tasksContainer.appendChild(newTask);

        // Adiciona eventos para a nova task (drag & drop, context menu, etc.)
        addTaskEventListeners(newTask);

        // Fecha formulário de criação de tasks
        closeTaskForm();
    } else {
        alert("O nome da tarefa não pode estar vazio!");
    }
  });

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
    // Clona a tarefa existente
    const clonedTask = taskElement.cloneNode(true);
  
    // Gera um novo ID exclusivo para a tarefa duplicada
    clonedTask.id = `task-${Date.now()}`;
  
    // Atualiza o conteúdo de atributos se necessário
    clonedTask.querySelector(".date").setAttribute("data-date", clonedTask.querySelector(".date").getAttribute("data-date"));
  
    // Adiciona event listeners à tarefa clonada
    addTaskEventListeners(clonedTask);
  
    // Adiciona a tarefa clonada na mesma coluna
    const columnTasksContainer = taskElement.parentElement;
    columnTasksContainer.appendChild(clonedTask);
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
    const taskPriority = taskPriorityImg.split('/').pop().split('.')[0]; // Extrai o nome do arquivo
    
    // Obtém a data armazenada no atributo `data-date`
    const taskDateElement = taskElement.querySelector(".date");
    const taskDeadline = taskDateElement ? taskDateElement.getAttribute("data-date") : "";

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
  function saveTaskEdits(event) {
    event.preventDefault(); // Evita o recarregamento da página

    // Se não é a task certa, só cancela
    if (!activeTaskElement) return;

    // Obtém os novos valores do formulário de edição
    const newTaskName = document.getElementById("taskNameAttInput").value.trim();
    const newTaskDescription = document.getElementById("taskDescriptionAttInput").value.trim();
    const newTaskPriority = document.getElementById("taskPriorityAttInput").value;
    const newTaskDeadline = document.getElementById("deadlineAtt").value;

    // Verifica se task tem nome
    if (newTaskName !== "") {
        // Atualiza a tarefa com os novos valores
        activeTaskElement.querySelector("h2").textContent = newTaskName;
        activeTaskElement.querySelector("p").textContent = newTaskDescription;
        activeTaskElement.querySelector("img").src = `../assets/PriorityTags/${newTaskPriority}.svg`;
        
        const dateElement = activeTaskElement.querySelector(".date");
        if (dateElement) {
          dateElement.textContent = formatDate(newTaskDeadline); // Exibe formatado
          dateElement.setAttribute("data-date", newTaskDeadline); // Armazena a versão original
      }

        // Fecha o formulário de atualização
        document.getElementById("taskAttForm").classList.add('translate-x-full');

        // Limpa a referência da tarefa editada
        activeTaskElement = null;
    } else {
        alert("O nome da tarefa não pode estar vazio!");
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
  confirmDeleteTaskButton.addEventListener("click", function () {
    if (taskToDelete) {
      document.getElementById("taskAttForm").classList.add('translate-x-full'); // Fecha o formulário de edição
      taskToDelete.remove(); // Remove a tarefa do DOM
      showDeleteConfirmation("Task"); // Chama confirmação de deleção
    }
    closeDeleteTaskFormFunc(); // Fecha o Form
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
    document.getElementById("deleteListName").textContent = `"${listName}"`;

    deleteListForm.classList.remove("hidden");
  }

  // Confirma deleção de task no form
  confirmDeleteListButton.addEventListener("click", function () {
    if (listToDelete) {
      listToDelete.remove(); // Remove a tarefa do DOM
      showDeleteConfirmation("Lista"); // Chama confirmação de deleção
    }
    closeDeleteListFormFunc(); // Fecha o Form
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
    e.preventDefault(); // Necessário para permitir o drop
    const taskElement = e.target.closest(".task"); // Pega uma tarefa
    const tasksContainer = e.target.closest(".tasks-container"); // Garante que está no task-container certo

    if (tasksContainer && draggedTask && taskElement && taskElement !== draggedTask) {
      // Insere a tarefa arrastada antes ou depois da tarefa sobre a qual estamos
      const bounding = taskElement.getBoundingClientRect();
      const offset = e.clientY - bounding.top; // Posição do mouse relativa ao topo da tarefa

      if (offset > bounding.height / 2) {
        // Solte abaixo da tarefa
        tasksContainer.insertBefore(draggedTask, taskElement.nextSibling);
      } else {
        // Solte acima da tarefa
        tasksContainer.insertBefore(draggedTask, taskElement);
      }
    }
  });

  // Permitir o drop nas listas e entre listas
  board.addEventListener("drop", function (e) {
    e.preventDefault();
    const column = e.target.closest(".bg-zinc-800"); // Identifica uma coluna
    if (column && draggedTask) {
      const tasksContainer = column.querySelector(".tasks-container"); // Encontra o tasks-container
      if (tasksContainer) {
        tasksContainer.appendChild(draggedTask); // Move a tarefa para o tasks-container
      }
    }
  });

   // Função para verificar e destacar tarefas vencidas
   function highlightExpiredTasks() {
    const taskDateElements = document.querySelectorAll('.date[data-date]');

    taskDateElements.forEach(taskDateElement => {
      const taskDateAttribute = taskDateElement.getAttribute('data-date');
      if (taskDateAttribute) {
        // Extrair dia, mês e ano da data no formato YYYY-MM-DD
        const [year, month, day] = taskDateAttribute.split('-');

        const taskDate = new Date(year, month - 1, day); // Mês - 1 porque os meses em JavaScript são baseados em zero
        
        const currentDate = new Date();

        // Comparação apenas por dia, mês e ano
        const currentDay = currentDate.getDate();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const taskDay = taskDate.getDate();
        const taskMonth = taskDate.getMonth();
        const taskYear = taskDate.getFullYear();

        taskDateElement.parentElement.classList.remove('bg-red-500'); // Adiciona remove fundo antigo
        taskDateElement.parentElement.classList.add('bg-zinc-300'); // Adiciona remove fundo antigo

        if ((taskYear < currentYear) || (taskYear === currentYear && taskMonth < currentMonth) || (taskYear === currentYear && taskMonth === currentMonth && taskDay < currentDay)) {
          taskDateElement.parentElement.classList.remove('bg-zinc-300'); // Adiciona remove fundo antigo
          taskDateElement.parentElement.classList.add('bg-red-300'); // Adiciona fundo vermelho
        }
        
        if (taskYear === currentYear && taskMonth === currentMonth && taskDay === currentDay) {
          taskDateElement.parentElement.classList.remove('bg-zinc-300'); // Adiciona remove fundo antigo
          taskDateElement.parentElement.classList.add('bg-orange-300'); // Adiciona fundo vermelho
        }
      }
    });
  }

  // Chamada inicial para verificar tarefas vencidas ao carregar a página
  highlightExpiredTasks();

  // Evento para verificar tarefas vencidas após adicionar ou editar uma tarefa
  confirmTaskButton.addEventListener("click", function(event){
    event.preventDefault(); // Evita o envio do formulário
    highlightExpiredTasks(); // Verifica tarefas vencidas após adicionar nova tarefa
  });

  // Evento para verificar tarefas vencidas após editar uma tarefa
  attTaskButton.addEventListener("click", function(event){
    event.preventDefault(); // Evita o envio do formulário
    highlightExpiredTasks(); // Verifica tarefas vencidas após editar tarefa
  });
});