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

  let activeColumnId = null;

  // Função para criar colunas iniciais
  function createColumn(columnName) {
    const columnId = `list-${columnName}`; // Cria um ID único

    // Criar um novo elemento de coluna
    const newColumn = document.createElement("div");
    newColumn.className = "bg-zinc-800 border-3 m-4 border-zinc-700 w-[500px] min-h-[600px] rounded-lg flex-shrink-0 self-start";
    newColumn.id = columnId;
    newColumn.setAttribute("ondrop", "drop(event)");
    newColumn.setAttribute("ondragover", "allowDrop(event)");

    // Adicionar o conteúdo da nova coluna
    newColumn.innerHTML = `
      <section class="flex justify-between items-center mx-3 my-4">
        <h1 class="text-xl font-bold text-white">${columnName}</h1>
        <button class="text-gray-300 text-xl leading-none pb-1 px-2 rounded-lg hover:bg-zinc-700 transition-colors">&hellip;</button>
      </section>
      <div id="tasks-${columnId}" class="tasks-container" ondrop="drop(event)" ondragover="allowDrop(event)"></div>
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

    // Adicionar a nova coluna ao board
    board.appendChild(newColumn);
  }

  // Criar 3 listas iniciais ao carregar a página
  const initialColumns = ["A Fazer", "Em Progresso", "Concluído"];
  initialColumns.forEach(createColumn);

  // Abrir e fechar o formulário de criação de tarefas
  function openTaskForm(){
    taskNameInput.value = "";
    taskDescriptionInput.value = "";
    deadline.value = "";
    taskForm.classList.remove('translate-x-full');
  }

  closeTaskFormButton.addEventListener("click", closeTaskForm);
  function closeTaskForm(){
    taskForm.classList.add('translate-x-full');
  }

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
      const columnId = `list-${columnName}`;

      // Criar um novo elemento de coluna
      const newColumn = document.createElement("div");
      newColumn.className = "bg-zinc-800 border-3 m-4 border-zinc-700 w-[500px] min-h-[600px] rounded-lg flex-shrink-0 self-start";
      newColumn.id = columnId;
      newColumn.setAttribute("ondrop", "drop(event)");
      newColumn.setAttribute("ondragover", "allowDrop(event)");

      // Adicionar o conteúdo da nova coluna
      newColumn.innerHTML = `
        <section class="flex justify-between items-center mx-3 my-4">
          <h1 class="text-xl font-bold text-white">${columnName}</h1>
          <button class="text-gray-300 text-xl leading-none pb-1 px-2 rounded-lg hover:bg-zinc-700 transition-colors">&hellip;</button>
        </section>
        <div id="tasks-${columnId}"></div>
        <button type="button" class="flex items-center space-x-2 mx-3 mb-3 px-3 py-1 hover:bg-zinc-700 rounded transition-colors addTaskButton">
          <img src="../assets/BsFillPlusCircleFill.svg" alt="" class="w-5 h-5">
          <span class="text-white text-sm font-semibold">Nova Tarefa</span>
        </button>
      `;

      // Adicionar a nova coluna ao board
      board.appendChild(newColumn);

      // Adicionar evento para criar nova tarefa
      newColumn.querySelector(".addTaskButton").addEventListener("click", function () {
        activeColumnId = columnId;
        openTaskForm();
      });

      // Fechar o modal após adicionar a coluna
      columnForm.classList.add("hidden");
    } else {
      alert("O nome da coluna não pode estar vazio!");
    }
  });

  function formatDate(dateInput) {
    // Converta a string da data para um objeto Date
    const date = new Date(dateInput);
  
    // Use Intl.DateTimeFormat para formatar no estilo desejado
    const formatter = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  
    return formatter.format(date).toUpperCase(); // Retorna "23 JAN, 2024"
  }

  confirmTaskButton.addEventListener("click", function(){
    const taskName = document.getElementById("taskNameInput").value.trim();
    const taskDescription = document.getElementById("taskDescriptionInput").value.trim();
    const taskPriority = document.getElementById("taskPriorityInput").value;
    const taskDeadline = document.getElementById("deadline").value; // Verifique se está pegando a data correta
    
    // Formate a data no formato desejado
    const formattedDate = taskDeadline ? formatDate(taskDeadline) : "Sem data";

    if (taskName !== "" && activeColumnId) {
        const tasksContainer = document.getElementById(`tasks-${activeColumnId}`);
        const newTask = document.createElement("section");
        newTask.className = "border border-zinc-700 bg-zinc-800 mx-2 mb-3 rounded-md";
        newTask.id = `task-${Date.now()}`;
        newTask.draggable = true;

        newTask.innerHTML = `
            <div class="flex justify-between">
                <img src="../assets/PriorityTags/${taskPriority}.svg" alt="Priority Tag" class="ml-3 mt-3">
                <button onclick="document.getElementById('finalize').src='../assets/Checked-Clicked.svg'" type="button" class="flex items-center space-x-2 mr-3 mt-3 px-4 w-fit">
                    <img src="../assets/Frame 55.svg" id="finalize" class="finalize_task">
                    <span class="text-white font-semibold">Finalizar</span>
                </button>
            </div>
            <h2 class="text-lg text-white font-semibold my-2 mx-3">${taskName}</h2>
            <p class="text-white mx-3 mb-3 max-h-20 overflow-y-auto hide-scrollbar">${taskDescription}</p>
            <section class="flex justify-between mx-3">
              <div class="flex items-center my-3 text-zinc-600 bg-zinc-300 border border-zinc-700 rounded-lg w-fit">
                <img src="../assets/Callendar.svg" alt="Callendar", class="ml-2">
                <p class="date px-2 py-1  font-semibold">${formattedDate}</p>
              </div>
              <button type="button" class="editTaskButton">
                  <img src="../assets/EditPencil.svg" alt="Editar">
                </button>
            </section>
        `;

        tasksContainer.appendChild(newTask);

        const editButton = newTask.querySelector(".editTaskButton");

        editButton.addEventListener("click", function () {
          openTaskEditForm(newTask);
        });

        closeTaskForm();
    } else {
        alert("O nome da tarefa não pode estar vazio!");
    }
  });


});
