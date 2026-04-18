const processForm = document.getElementById("processForm");
    const processFile = document.getElementById("processFile");
    const rawInput = document.getElementById("rawInput");
    const parseTextButton = document.getElementById("parseText");
    const appendSampleButton = document.getElementById("appendSample");
    const cancelEditButton = document.getElementById("cancelEdit");
    const clearAllButton = document.getElementById("clearAll");
    const sortMode = document.getElementById("sortMode");
    const rowsPerPage = document.getElementById("rowsPerPage");
    const prevPageButton = document.getElementById("prevPage");
    const nextPageButton = document.getElementById("nextPage");
    const pageIndicator = document.getElementById("pageIndicator");
    const editingBanner = document.getElementById("editingBanner");
    const generateProcessesButton = document.getElementById("generateProcesses");
    const toast = document.getElementById("toast");
    const tableBody = document.getElementById("processTableBody");
    const stateContainers = {
      New: document.getElementById("stateNew"),
      Ready: document.getElementById("stateReady"),
      Running: document.getElementById("stateRunning"),
      Waiting: document.getElementById("stateWaiting"),
      Terminated: document.getElementById("stateTerminated"),
    };

    const totalProcesses = document.getElementById("totalProcesses");
    const minArrival = document.getElementById("minArrival");
    const totalBurst = document.getElementById("totalBurst");
    const totalPages = document.getElementById("totalPages");
    const genCount = document.getElementById("genCount");
    const genArrivalMax = document.getElementById("genArrivalMax");
    const genBurstMin = document.getElementById("genBurstMin");
    const genBurstMax = document.getElementById("genBurstMax");
    const genPriorityMax = document.getElementById("genPriorityMax");
    const genPagesMin = document.getElementById("genPagesMin");
    const genPagesMax = document.getElementById("genPagesMax");

    const STORAGE_KEY = "sisops_processes";
    const processes = [];
    const sampleText = `PID,Arrival,Burst,Priority,Pages
1,0,5,2,4
2,1,3,1,3
3,2,7,3,5`;
    let toastTimer = null;
    let editingPid = null;
    let importPreview = { valid: [], invalid: [] };
    let currentPage = 1;
    const processPalette = [
      "#356dff",
      "#8c6dff",
      "#2bb98d",
      "#ff8f5c",
      "#e55f8c",
      "#1f9bd1",
      "#7a6bff",
      "#30b67d",
    ];

    function setStatus(message, kind = "") {
      toast.textContent = message;
      toast.className = kind ? `toast show ${kind}` : "toast show";
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.className = "toast";
      }, 2600);
    }

    function normalizeProcess(process) {
      return {
        pid: String(process.pid).trim(),
        arrival: Number(process.arrival),
        burst: Number(process.burst),
        priority: Number(process.priority),
        pages: Number(process.pages),
        state: normalizeState(process.state),
        color: process.color || getProcessColor(String(process.pid).trim()),
      };
    }

    function normalizeState(state) {
      const value = String(state || "New").trim().toLowerCase();
      const map = {
        new: "New",
        ready: "Ready",
        running: "Running",
        waiting: "Waiting",
        terminated: "Terminated",
      };
      return map[value] || "New";
    }

    function validateProcess(process) {
      if (!process.pid) {
        return "El PID es obligatorio.";
      }
      if (!/^\d+$/.test(process.pid)) {
        return "El PID debe contener solo numeros.";
      }
      if (
        processes.some(
          (existing) =>
            existing.pid.toLowerCase() === process.pid.toLowerCase() &&
            existing.pid.toLowerCase() !== String(editingPid || "").toLowerCase()
        )
      ) {
        return `Ya existe un proceso con PID ${process.pid}.`;
      }
      if ([process.arrival, process.burst, process.priority, process.pages].some((value) => Number.isNaN(value))) {
        return "Todos los valores numericos deben ser validos.";
      }
      if (process.arrival < 0) {
        return "Arrival Time no puede ser negativo.";
      }
      if (process.burst <= 0) {
        return "Burst Time debe ser mayor que 0.";
      }
      if (process.priority < 0) {
        return "Priority no puede ser negativo.";
      }
      if (process.pages <= 0) {
        return "El numero de paginas debe ser mayor que 0.";
      }
      return "";
    }

    function getProcessColor(pid) {
      let hash = 0;
      for (const char of pid) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
      }
      return processPalette[hash % processPalette.length];
    }

    function getSortedProcesses() {
      const items = [...processes];
      switch (sortMode.value) {
        case "pid-asc":
          return items.sort((a, b) => String(a.pid).localeCompare(String(b.pid), undefined, { numeric: true }));
        case "pid-desc":
          return items.sort((a, b) => String(b.pid).localeCompare(String(a.pid), undefined, { numeric: true }));
        case "priority-desc":
          return items.sort((a, b) => b.priority - a.priority || a.arrival - b.arrival);
        case "priority-asc":
          return items.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);
        case "arrival-asc":
          return items.sort((a, b) => a.arrival - b.arrival || a.priority - b.priority);
        case "burst-desc":
          return items.sort((a, b) => b.burst - a.burst || a.arrival - b.arrival);
        default:
          return items;
      }
    }

    function getPageSize() {
      return Number(rowsPerPage.value) || 10;
    }

    function saveProcesses() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processes));
    }

    function renderStates() {
      const groups = {
        New: [],
        Ready: [],
        Running: [],
        Waiting: [],
        Terminated: [],
      };

      processes.forEach((process) => {
        const state = groups[process.state] ? process.state : "New";
        groups[state].push(process);
      });

      Object.entries(stateContainers).forEach(([state, container]) => {
        const items = groups[state];
        if (!items.length) {
          container.innerHTML = '<span class="state-empty"></span>';
          return;
        }

        const stateClass = state.toLowerCase();
        container.innerHTML = items
          .map((process) => `<span class="state-chip ${stateClass}">${process.pid}</span>`)
          .join("");
      });
    }

    function renderTable() {
      const sorted = getSortedProcesses();
      const pageSize = getPageSize();
      const totalPagesCount = Math.max(1, Math.ceil(sorted.length / pageSize));
      currentPage = Math.min(currentPage, totalPagesCount);
      const start = (currentPage - 1) * pageSize;
      const pageItems = sorted.slice(start, start + pageSize);

      if (!processes.length) {
        tableBody.innerHTML = '<tr><td class="empty" colspan="8">No hay procesos cargados todavia.</td></tr>';
      } else {
        tableBody.innerHTML = pageItems
          .map((process) => `
            <tr>
              <td><span class="color-dot" style="background:${process.color}"></span></td>
              <td>${process.pid}</td>
              <td>${process.arrival}</td>
              <td>${process.burst}</td>
              <td>${process.priority}</td>
              <td>${process.pages}</td>
              <td>${process.state}</td>
              <td>
                <div class="row-actions">
                  <button class="row-btn edit" type="button" data-action="edit" data-pid="${process.pid}">Editar</button>
                  <button class="row-btn delete" type="button" data-action="delete" data-pid="${process.pid}">Borrar</button>
                </div>
              </td>
            </tr>
          `)
          .join("");
      }

      pageIndicator.textContent = `Pagina ${currentPage} de ${totalPagesCount}`;
      prevPageButton.disabled = currentPage <= 1;
      nextPageButton.disabled = currentPage >= totalPagesCount;

      totalProcesses.textContent = String(processes.length);
      totalBurst.textContent = String(processes.reduce((sum, process) => sum + process.burst, 0));
      totalPages.textContent = String(processes.reduce((sum, process) => sum + process.pages, 0));
      minArrival.textContent = processes.length
        ? String(Math.min(...processes.map((process) => process.arrival)))
        : "-";

      renderStates();
      saveProcesses();
    }

    function resetFormMode() {
      editingPid = null;
      processForm.reset();
      document.getElementById("pid").value = "";
      processForm.querySelector('button[type="submit"]').textContent = "Agregar proceso";
      cancelEditButton.style.display = "none";
      editingBanner.style.display = "none";
    }

    function addProcess(process) {
      const normalized = normalizeProcess(process);
      const error = validateProcess(normalized);

      if (error) {
        setStatus(error, "error");
        return false;
      }

      if (editingPid) {
        const index = processes.findIndex(
          (existing) => existing.pid.toLowerCase() === String(editingPid).toLowerCase()
        );
        if (index >= 0) {
          processes[index] = normalized;
        }
      } else {
        processes.push(normalized);
        currentPage = Math.max(1, Math.ceil(processes.length / getPageSize()));
      }
      renderTable();
      setStatus(
        editingPid
          ? `Proceso ${normalized.pid} actualizado correctamente.`
          : `Proceso ${normalized.pid} agregado correctamente.`,
        "success"
      );
      resetFormMode();
      return true;
    }

    function validateImportedProcess(process) {
      if (!process.pid) {
        return "El PID es obligatorio.";
      }
      if (!/^\d+$/.test(process.pid)) {
        return "El PID debe contener solo numeros.";
      }
      if ([process.arrival, process.burst, process.priority, process.pages].some((value) => Number.isNaN(value))) {
        return "Todos los valores numericos deben ser validos.";
      }
      if (process.arrival < 0) {
        return "Arrival Time no puede ser negativo.";
      }
      if (process.burst <= 0) {
        return "Burst Time debe ser mayor que 0.";
      }
      if (process.priority < 0) {
        return "Priority no puede ser negativo.";
      }
      if (process.pages <= 0) {
        return "El numero de paginas debe ser mayor que 0.";
      }
      return "";
    }

    function analyzeProcessLines(text, replaceExisting = false) {
      const lines = text
        .split(/\r?\n/)
        .map((line, index) => ({ row: line.trim(), lineNumber: index + 1 }))
        .filter((item) => item.row);

      if (!lines.length) {
        return { valid: [], invalid: [{ row: "", lineNumber: 1, error: "No se encontro contenido para importar." }] };
      }

      const looksLikeHeader = /^pid\s*,\s*arrival\s*,\s*burst\s*,\s*priority\s*,\s*pages$/i.test(lines[0].row);
      const rows = looksLikeHeader ? lines.slice(1) : lines;

      if (!rows.length) {
        return { valid: [], invalid: [{ row: "", lineNumber: lines[0].lineNumber, error: "El archivo solo contiene encabezados." }] };
      }

      const parsed = [];
      const invalid = [];
      const seen = new Set();
      const existingIds = new Set(
        (replaceExisting ? [] : processes).map((process) => process.pid.toLowerCase())
      );

      for (const item of rows) {
        const row = item.row;
        const parts = row.split(",").map((part) => part.trim());
        if (parts.length !== 5) {
          invalid.push({ row, lineNumber: item.lineNumber, error: "Debe tener 5 columnas." });
          continue;
        }

        const candidate = normalizeProcess({
          pid: parts[0],
          arrival: parts[1],
          burst: parts[2],
          priority: parts[3],
          pages: parts[4],
        });

        if (seen.has(candidate.pid.toLowerCase()) || existingIds.has(candidate.pid.toLowerCase())) {
          invalid.push({ row, lineNumber: item.lineNumber, error: `PID duplicado detectado: ${candidate.pid}.` });
          continue;
        }

        const error = replaceExisting ? validateImportedProcess(candidate) : validateProcess(candidate);
        if (error) {
          invalid.push({ row, lineNumber: item.lineNumber, error });
          continue;
        }

        seen.add(candidate.pid.toLowerCase());
        parsed.push(candidate);
      }

      return { valid: parsed, invalid };
    }

    function parseProcessLines(text, replaceExisting = false) {
      const preview = analyzeProcessLines(text, replaceExisting);
      importPreview = preview;

      if (!preview.valid.length && preview.invalid.length) {
        setStatus("No hay filas validas para importar.", "error");
        return;
      }

      if (replaceExisting) {
        processes.length = 0;
        currentPage = 1;
      }

      processes.push(...preview.valid);
      renderTable();
      if (preview.invalid.length) {
        setStatus(`Se cargaron ${preview.valid.length} filas validas. ${preview.invalid.length} lineas invalidas se omitieron.`, "error");
      } else {
        setStatus(`Se importaron ${preview.valid.length} procesos correctamente.`, "success");
      }
    }

    function loadStoredProcesses() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          renderTable();
          return;
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
          renderTable();
          return;
        }

        processes.length = 0;
        parsed.forEach((process) => {
          processes.push(normalizeProcess(process));
        });
        renderTable();
        setStatus("Procesos recuperados desde almacenamiento local.", "success");
      } catch (error) {
        renderTable();
        setStatus("No se pudieron recuperar los procesos guardados.", "error");
      }
    }

    processForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(processForm);

      const added = addProcess({
        pid: formData.get("pid"),
        arrival: formData.get("arrival"),
        burst: formData.get("burst"),
        priority: formData.get("priority"),
        pages: formData.get("pages"),
      });

      if (!added) {
        return;
      }
    });

    cancelEditButton.addEventListener("click", () => {
      resetFormMode();
      setStatus("Edicion cancelada.", "success");
    });

    parseTextButton.addEventListener("click", () => {
      parseProcessLines(rawInput.value, true);
    });

    appendSampleButton.addEventListener("click", () => {
      parseProcessLines(sampleText, false);
    });

    clearAllButton.addEventListener("click", () => {
      processes.length = 0;
      renderTable();
      resetFormMode();
      setStatus("La tabla de procesos se limpio.", "success");
    });

    tableBody.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) {
        return;
      }

      const { action, pid } = button.dataset;
      const process = processes.find((item) => item.pid === pid);
      if (!process) {
        return;
      }

      if (action === "delete") {
        const index = processes.findIndex((item) => item.pid === pid);
        if (index >= 0) {
          processes.splice(index, 1);
          renderTable();
          if (editingPid && editingPid.toLowerCase() === pid.toLowerCase()) {
            resetFormMode();
          }
          setStatus(`Proceso ${pid} eliminado.`, "success");
        }
        return;
      }

      if (action === "edit") {
        editingPid = process.pid;
        document.getElementById("pid").value = process.pid;
        document.getElementById("arrival").value = process.arrival;
        document.getElementById("burst").value = process.burst;
        document.getElementById("priority").value = process.priority;
        document.getElementById("pages").value = process.pages;
      processForm.querySelector('button[type="submit"]').textContent = "Guardar cambios";
      cancelEditButton.style.display = "inline-flex";
      editingBanner.style.display = "block";
      editingBanner.textContent = `Editando proceso ${pid}. Guarda cambios o cancela la edicion.`;
      setStatus(`Editando proceso ${pid}.`, "success");
    }
    });

    processFile.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        const content = await file.text();
        rawInput.value = content;
        parseProcessLines(content, true);
      } catch (error) {
        setStatus("No se pudo leer el archivo seleccionado.", "error");
      }
    });

    sortMode.addEventListener("change", () => {
      renderTable();
      setStatus("Orden actualizado.", "success");
    });

    document.querySelectorAll("[data-template]").forEach((button) => {
      button.addEventListener("click", () => {
        const presets = {
          basic: `PID,Arrival,Burst,Priority,Pages\n1,0,4,1,2\n2,1,3,2,3\n3,2,5,1,2`,
          mixed: `PID,Arrival,Burst,Priority,Pages\n11,0,8,3,5\n12,2,2,1,2\n13,3,6,4,4\n14,5,3,2,3`,
          heavy: `PID,Arrival,Burst,Priority,Pages\n21,0,10,5,6\n22,1,9,4,5\n23,2,7,3,4\n24,3,8,5,6\n25,4,6,2,5`,
        };
        const content = presets[button.dataset.template] || sampleText;
        parseProcessLines(content, true);
      });
    });

    function nextGeneratedPid() {
      const used = new Set(processes.map((process) => process.pid.toLowerCase()));
      let index = 1;
      while (used.has(String(index))) {
        index += 1;
      }
      return String(index);
    }

    function randInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateProcessesButton.addEventListener("click", () => {
      const count = Number(genCount.value);
      const arrivalMax = Number(genArrivalMax.value);
      const burstMin = Number(genBurstMin.value);
      const burstMax = Number(genBurstMax.value);
      const priorityMax = Number(genPriorityMax.value);
      const pagesMin = Number(genPagesMin.value);
      const pagesMax = Number(genPagesMax.value);

      if ([count, arrivalMax, burstMin, burstMax, priorityMax, pagesMin, pagesMax].some(Number.isNaN)) {
        setStatus("Completa correctamente los parametros del generador.", "error");
        return;
      }
      if (count <= 0 || burstMin <= 0 || burstMax < burstMin || pagesMin <= 0 || pagesMax < pagesMin || arrivalMax < 0 || priorityMax < 0) {
        setStatus("Los rangos del generador no son validos.", "error");
        return;
      }

      const generated = [];
      for (let i = 0; i < count; i += 1) {
        const pid = nextGeneratedPid();
        const process = normalizeProcess({
          pid,
          arrival: randInt(0, arrivalMax),
          burst: randInt(burstMin, burstMax),
          priority: randInt(0, priorityMax),
          pages: randInt(pagesMin, pagesMax),
          state: "New",
        });
        processes.push(process);
        generated.push(process);
      }
      currentPage = Math.max(1, Math.ceil(processes.length / getPageSize()));
      renderTable();
      setStatus(`Se generaron ${generated.length} procesos automaticamente.`, "success");
    });

    rowsPerPage.addEventListener("change", () => {
      currentPage = 1;
      renderTable();
      setStatus("Cantidad de procesos por pagina actualizada.", "success");
    });

    prevPageButton.addEventListener("click", () => {
      currentPage = Math.max(1, currentPage - 1);
      renderTable();
    });

    nextPageButton.addEventListener("click", () => {
      const totalPagesCount = Math.max(1, Math.ceil(processes.length / getPageSize()));
      currentPage = Math.min(totalPagesCount, currentPage + 1);
      renderTable();
    });

    cancelEditButton.style.display = "none";
    loadStoredProcesses();
