document.addEventListener("DOMContentLoaded", function () {
  // Selecionando os elementos do DOM
  const taskForm = document.getElementById('taskForm');
  const columnForm = document.getElementById("columnForm");
  const columnNameInput = document.getElementById("columnNameInput");
  const confirmColumnButton = document.getElementById("confirmColumnButton");
  const cancelColumnButton = document.getElementById("cancelColumnButton");
  const board = document.getElementById("Board");
  const confirmTaskButton = document.getElementById("confirmTaskButton");
  const addColumnButton = document.getElementById("addColumnButton");

  const openTaskFormButton = document.querySelector(".openTaskFormButton");
  const closeTaskFormButton = document.querySelector(".closeTaskFormButton");

  openTaskFormButton.addEventListener("click", openTaskForm);
  function openTaskForm(){
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

      let columnCounter = 1;

      if (columnName !== "") {
        const columnId = `list-${columnCounter++}`;

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
          <section id="tasks-${columnName.replace(/\s+/g, '-').toLowerCase()}">
          </section>
          <button type="button" class="flex items-center space-x-2 mx-3 mb-3 px-3 py-1 hover:bg-zinc-700 rounded transition-colors addTaskButton">
            <img src="../assets/BsFillPlusCircleFill.svg" alt="" class="w-5 h-5">
            <span class="text-white text-sm font-semibold">Nova Tarefa</span>
          </button>
        `;

        // Adicionar a nova coluna ao board
        board.appendChild(newColumn);

        // Adicionar evento para criar nova tarefa
        newColumn.querySelector(".addTaskButton").addEventListener("click", function () {
          openTaskForm();
        });

        // Fechar o modal após adicionar a coluna
        columnForm.classList.add("hidden");
      } else {
          alert("O nome da coluna não pode estar vazio!");
      }
  });

  confirmTaskButton.addEventListener("click", function(){


    closeTaskForm();
  });





});
