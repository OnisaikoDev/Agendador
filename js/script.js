const STORAGE_KEYS = {
    // aqui eu guardo os nomes das chaves que uso no localStorage
    user: "manicure-user",
    loggedIn: "manicure-logged-in",
    remember: "manicure-remember",
    events: "manicure-events",
    clients: "manicure-clients",
    professionals: "manicure-professionals",
    services: "manicure-services"
};

const defaultProfessionals = [
    // funcionarias padrao que aparecem no calendario
    { id: "1", title: "Maria" },
    { id: "2", title: "Ana" },
    { id: "3", title: "Joana" },
    { id: "4", title: "Carla" }
];

// servicos iniciais do sistema
const defaultServices = ["Manicure", "Pedicure", "Unha em gel", "Spa dos pes"];

const defaultEvents = [
    // agendamentos de exemplo para o calendario nao ficar vazio
    {
        title: "Manicure - Paula",
        start: "2026-03-25T09:00:00",
        end: "2026-03-25T10:00:00",
        resourceId: "1",
        backgroundColor: "#E94B6A"
    },
    {
        title: "Pedicure - Bianca",
        start: "2026-03-25T10:30:00",
        end: "2026-03-25T11:30:00",
        resourceId: "2",
        backgroundColor: "#a20ee7"
    },
    {
        title: "Unha em gel - Fernanda",
        start: "2026-03-25T14:00:00",
        end: "2026-03-25T15:00:00",
        resourceId: "3",
        backgroundColor: "#ffb347"
    }
];

function getJSON(key, fallbackValue) {
    // essa funcao pega um valor salvo no localStorage
    // se nao existir ainda, ela cria com o valor padrao
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
        localStorage.setItem(key, JSON.stringify(fallbackValue));
        return Array.isArray(fallbackValue) ? [...fallbackValue] : fallbackValue;
    }

    return JSON.parse(rawValue);
}

function setJSON(key, value) {
    // aqui eu salvo qualquer lista ou objeto no localStorage
    localStorage.setItem(key, JSON.stringify(value));
}

function getStoredUser() {
    const savedUser = localStorage.getItem(STORAGE_KEYS.user);
    return savedUser ? JSON.parse(savedUser) : null;
}

function saveUser(user) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function getStoredEvents() {
    return getJSON(STORAGE_KEYS.events, defaultEvents);
}

function saveEvents(events) {
    setJSON(STORAGE_KEYS.events, events);
}

function getStoredClients() {
    return getJSON(STORAGE_KEYS.clients, []);
}

function saveClients(clients) {
    setJSON(STORAGE_KEYS.clients, clients);
}

function getStoredProfessionals() {
    return getJSON(STORAGE_KEYS.professionals, defaultProfessionals);
}

function saveProfessionals(professionals) {
    setJSON(STORAGE_KEYS.professionals, professionals);
}

function getStoredServices() {
    return getJSON(STORAGE_KEYS.services, defaultServices);
}

function saveServices(services) {
    setJSON(STORAGE_KEYS.services, services);
}

function setLoggedIn(rememberUser) {
    localStorage.setItem(STORAGE_KEYS.loggedIn, "true");
    localStorage.setItem(STORAGE_KEYS.remember, rememberUser ? "true" : "false");
}

function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.loggedIn);
    localStorage.removeItem(STORAGE_KEYS.remember);
}

function isLoggedIn() {
    return localStorage.getItem(STORAGE_KEYS.loggedIn) === "true";
}

function addOneHour(dateString, timeString) {
    // aqui eu pego a data e horario escolhidos e crio 1 hora de duracao pro agendamento
    const startDate = new Date(`${dateString}T${timeString}:00`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    return {
        start: formatLocalDate(startDate),
        end: formatLocalDate(endDate)
    };
}

function getEventColor(service) {
    // cada servico ganha uma cor diferente no calendario
    const colors = {
        Manicure: "#E94B6A",
        Pedicure: "#a20ee7",
        "Unha em gel": "#ffb347",
        "Spa dos pes": "#48b9a8"
    };

    return colors[service] || "#E94B6A";
}

function initLoginForm() {
    // parte do login
    const form = document.getElementById("login-form");
    if (!form) {
        return;
    }

    const rememberInput = document.getElementById("remember");
    const storedUser = getStoredUser();

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const username = formData.get("username")?.toString().trim();
        const password = formData.get("password")?.toString().trim();

        if (!storedUser) {
            alert("Cadastre uma conta antes de entrar.");
            window.location.href = "cadastro.html";
            return;
        }

        if (storedUser.username !== username || storedUser.password !== password) {
            alert("Usuario ou senha invalidos.");
            return;
        }

        setLoggedIn(Boolean(rememberInput?.checked));
        window.location.href = "dashboard.html";
    });
}

function initRegisterForm() {
    // parte do cadastro de usuario do sistema
    const form = document.getElementById("register-form");
    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const password = formData.get("password")?.toString();
        const confirmPassword = formData.get("confirm_password")?.toString();

        if (password !== confirmPassword) {
            alert("As senhas precisam ser iguais.");
            return;
        }

        saveUser({
            name: formData.get("name")?.toString().trim(),
            lastname: formData.get("lastname")?.toString().trim(),
            email: formData.get("email")?.toString().trim(),
            phone: formData.get("phone")?.toString().trim(),
            username: formData.get("username")?.toString().trim(),
            password
        });

        alert("Cadastro realizado com sucesso. Agora faca login.");
        window.location.href = "index.html";
    });
}

function initRecoveryForm() {
    // parte de recuperar senha
    const form = document.getElementById("recovery-form");
    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const email = formData.get("email")?.toString().trim();
        const user = getStoredUser();

        if (!user || user.email !== email) {
            alert("Nenhuma conta encontrada com esse email.");
            return;
        }

        alert(`Senha cadastrada: ${user.password}`);
        window.location.href = "index.html";
    });
}

function initDashboard() {
    // aqui eu junto tudo o que acontece dentro do dashboard
    const calendarEl = document.getElementById("calendar");
    const form = document.getElementById("agendamento");
    const calendarTitle = document.getElementById("calendar-title");
    const prevButton = document.getElementById("calendar-prev");
    const nextButton = document.getElementById("calendar-next");
    const bookingDrawer = document.getElementById("booking-drawer");
    const clientDrawer = document.getElementById("client-drawer");
    const settingsDrawer = document.getElementById("settings-drawer");
    const drawerBackdrop = document.getElementById("drawer-backdrop");
    const openBookingPanel = document.getElementById("open-booking-panel");
    const closeBookingPanel = document.getElementById("close-booking-panel");
    const openClientPanel = document.getElementById("open-client-panel");
    const closeClientPanel = document.getElementById("close-client-panel");
    const openSettingsPanel = document.getElementById("open-settings-panel");
    const closeSettingsPanel = document.getElementById("close-settings-panel");
    const clientForm = document.getElementById("client-form");
    const clientNameInput = document.getElementById("nome");
    const clientPhoneInput = document.getElementById("telefone");
    const clientSuggestions = document.getElementById("client-suggestions");
    const professionalSelect = document.getElementById("profissional");
    const serviceInput = document.getElementById("servico");
    const settingsTabs = document.querySelectorAll(".settings-tab");
    const settingsPanels = document.querySelectorAll(".settings-panel");
    const scheduledList = document.getElementById("scheduled-list");
    const employeeForm = document.getElementById("employee-form");
    const employeeList = document.getElementById("employee-list");
    const serviceForm = document.getElementById("service-form");
    const serviceList = document.getElementById("service-list");
    const financeList = document.getElementById("finance-list");

    if (!calendarEl || !form || !window.FullCalendar) {
        return;
    }

    if (!isLoggedIn()) {
        alert("Faca login para acessar o dashboard.");
        window.location.href = "index.html";
        return;
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {
        // configuracao principal do calendario
        initialView: "resourceTimeGridDay",
        initialDate: "2026-03-25",
        locale: "pt-br",
        slotMinTime: "08:00:00",
        slotMaxTime: "20:00:00",
        slotDuration: "00:30:00",
        allDaySlot: false,
        nowIndicator: true,
        height: 470,
        headerToolbar: false,
        resources: getStoredProfessionals(),
        events: getStoredEvents(),
        datesSet: () => updateCalendarTitle()
    });

    function updateCalendarTitle() {
        // atualiza o titulo com a data que esta aberta no calendario
        if (!calendarTitle) {
            return;
        }

        const currentDate = calendar.getDate();
        calendarTitle.textContent = currentDate.toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    function renderClientSuggestions() {
        // coloca os clientes cadastrados como sugestao no campo nome
        if (!clientSuggestions) {
            return;
        }

        clientSuggestions.innerHTML = getStoredClients()
            .map((client) => `<option value="${client.name}"></option>`)
            .join("");
    }

    function renderProfessionalOptions() {
        // atualiza a lista de funcionarias no formulario de agendamento
        if (!professionalSelect) {
            return;
        }

        const currentValue = professionalSelect.value;
        professionalSelect.innerHTML = getStoredProfessionals()
            .map((professional) => `<option value="${professional.id}">${professional.title}</option>`)
            .join("");

        if (currentValue) {
            professionalSelect.value = currentValue;
        }
    }

    function ensureSelectedService() {
        // garante que sempre tenha um servico valido salvo no input escondido
        if (!serviceInput) {
            return;
        }

        const services = getStoredServices();
        if (!services.includes(serviceInput.value)) {
            serviceInput.value = services[0] || "Manicure";
        }
    }

    function syncClientPhone() {
        // se a pessoa escolher um cliente ja cadastrado, eu completo o telefone automaticamente
        if (!clientNameInput || !clientPhoneInput) {
            return;
        }

        const typedName = clientNameInput.value.trim().toLowerCase();
        const matchedClient = getStoredClients().find(
            (client) => client.name.trim().toLowerCase() === typedName
        );

        if (matchedClient) {
            clientPhoneInput.value = matchedClient.phone;
        }
    }

    function renderScheduledList() {
        // mostra todos os horarios cadastrados dentro da aba de cancelamento
        if (!scheduledList) {
            return;
        }

        const events = getStoredEvents();
        if (!events.length) {
            scheduledList.innerHTML = "<p class=\"empty-state\">Nenhum agendamento cadastrado.</p>";
            return;
        }

        scheduledList.innerHTML = events
            .map((event, index) => `
                <div class="settings-item">
                    <div>
                        <strong>${event.title}</strong>
                        <span>${event.start.slice(0, 10)} ${event.start.slice(11, 16)}</span>
                    </div>
                    <button type="button" class="danger-btn" data-cancel-event="${index}">Cancelar</button>
                </div>
            `)
            .join("");
    }

    function renderEmployees() {
        // lista as funcionarias para poder remover depois
        if (!employeeList) {
            return;
        }

        employeeList.innerHTML = getStoredProfessionals()
            .map((professional) => `
                <div class="settings-item">
                    <div>
                        <strong>${professional.title}</strong>
                        <span>ID ${professional.id}</span>
                    </div>
                    <button type="button" class="danger-btn" data-remove-professional="${professional.id}">Remover</button>
                </div>
            `)
            .join("");
    }

    function renderServices() {
        // lista os servicos cadastrados
        if (!serviceList) {
            return;
        }

        serviceList.innerHTML = getStoredServices()
            .map((service) => `
                <div class="settings-item">
                    <div>
                        <strong>${service}</strong>
                    </div>
                    <button type="button" class="danger-btn" data-remove-service="${service}">Remover</button>
                </div>
            `)
            .join("");
    }

    function renderFinance() {
        // aqui eu deixei alguns boletos fixos de exemplo no financeiro
        if (!financeList) {
            return;
        }

        financeList.innerHTML = `
            <div class="settings-item">
                <div>
                    <strong>Boleto abril/2026</strong>
                    <span>Vencimento: 10/04/2026</span>
                </div>
                <span class="status-pill">Pendente</span>
            </div>
            <div class="settings-item">
                <div>
                    <strong>Boleto maio/2026</strong>
                    <span>Vencimento: 10/05/2026</span>
                </div>
                <span class="status-pill">Pendente</span>
            </div>
            <div class="settings-item">
                <div>
                    <strong>Boleto junho/2026</strong>
                    <span>Vencimento: 10/06/2026</span>
                </div>
                <span class="status-pill">Pendente</span>
            </div>
        `;
    }

    function switchSettingsTab(tabName) {
        // troca de aba dentro de configuracoes
        settingsTabs.forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.settingsTab === tabName);
        });

        settingsPanels.forEach((panel) => {
            panel.classList.toggle("active", panel.dataset.settingsPanel === tabName);
        });
    }

    function refreshCalendarEvents() {
        // recarrega os eventos do calendario depois de alguma mudanca
        calendar.removeAllEvents();
        calendar.addEventSource(getStoredEvents());
    }

    function refreshCalendarResources() {
        // recarrega as colunas do calendario quando muda as funcionarias
        calendar.refetchResources();
        calendar.setOption("resources", getStoredProfessionals());
    }

    function closeAllDrawers() {
        // fecha todos os paineis laterais
        [bookingDrawer, clientDrawer, settingsDrawer].forEach((drawer) => {
            if (drawer) {
                drawer.classList.remove("is-open");
                drawer.setAttribute("aria-hidden", "true");
            }
        });

        if (drawerBackdrop) {
            drawerBackdrop.hidden = true;
        }
    }

    function openDrawer(drawer) {
        // abre o painel lateral que eu clicar no menu
        if (!drawer || !drawerBackdrop) {
            return;
        }

        closeAllDrawers();
        drawer.classList.add("is-open");
        drawer.setAttribute("aria-hidden", "false");
        drawerBackdrop.hidden = false;
    }

    calendar.render();
    updateCalendarTitle();
    renderClientSuggestions();
    renderProfessionalOptions();
    ensureSelectedService();
    renderScheduledList();
    renderEmployees();
    renderServices();
    renderFinance();

    openBookingPanel?.addEventListener("click", () => openDrawer(bookingDrawer));
    openClientPanel?.addEventListener("click", () => openDrawer(clientDrawer));
    openSettingsPanel?.addEventListener("click", () => openDrawer(settingsDrawer));
    closeBookingPanel?.addEventListener("click", closeAllDrawers);
    closeClientPanel?.addEventListener("click", closeAllDrawers);
    closeSettingsPanel?.addEventListener("click", closeAllDrawers);
    drawerBackdrop?.addEventListener("click", closeAllDrawers);

    clientNameInput?.addEventListener("change", syncClientPhone);
    clientNameInput?.addEventListener("blur", syncClientPhone);

    settingsTabs.forEach((tab) => {
        tab.addEventListener("click", () => switchSettingsTab(tab.dataset.settingsTab));
    });

    prevButton?.addEventListener("click", () => {
        calendar.prev();
        updateCalendarTitle();
    });

    nextButton?.addEventListener("click", () => {
        calendar.next();
        updateCalendarTitle();
    });

    form.addEventListener("submit", (event) => {
        // cria um novo agendamento e joga no calendario
        event.preventDefault();

        const formData = new FormData(form);
        const nome = formData.get("nome")?.toString().trim();
        const telefone = formData.get("telefone")?.toString().trim();
        const servico = formData.get("servico")?.toString();
        const profissional = formData.get("profissional")?.toString();
        const data = formData.get("data")?.toString();
        const horario = formData.get("horario")?.toString();

        if (!nome || !telefone || !servico || !profissional || !data || !horario) {
            alert("Preencha todos os campos para criar o agendamento.");
            return;
        }

        const duration = addOneHour(data, horario);
        const newEvent = {
            title: `${servico} - ${nome}`,
            start: duration.start,
            end: duration.end,
            resourceId: profissional,
            backgroundColor: getEventColor(servico),
            extendedProps: {
                telefone
            }
        };

        calendar.addEvent(newEvent);
        saveEvents(calendar.getEvents().map((calendarEvent) => ({
            title: calendarEvent.title,
            start: calendarEvent.startStr,
            end: calendarEvent.endStr,
            resourceId: calendarEvent.getResources()[0]?.id || profissional,
            backgroundColor: calendarEvent.backgroundColor,
            extendedProps: calendarEvent.extendedProps
        })));

        form.reset();
        ensureSelectedService();
        renderScheduledList();
        alert("Agendamento criado com sucesso.");
        closeAllDrawers();
    });

    clientForm?.addEventListener("submit", (event) => {
        // cadastra cliente novo ou atualiza se ja existir
        event.preventDefault();

        const formData = new FormData(clientForm);
        const newClient = {
            name: formData.get("name")?.toString().trim(),
            phone: formData.get("phone")?.toString().trim(),
            email: formData.get("email")?.toString().trim(),
            note: formData.get("note")?.toString().trim()
        };

        const clients = getStoredClients();
        const existingClientIndex = clients.findIndex(
            (client) => client.name.trim().toLowerCase() === newClient.name.toLowerCase()
        );

        if (existingClientIndex >= 0) {
            clients[existingClientIndex] = newClient;
        } else {
            clients.push(newClient);
        }

        saveClients(clients);
        renderClientSuggestions();
        alert("Cliente cadastrado com sucesso.");
        clientForm.reset();
        closeAllDrawers();
    });

    employeeForm?.addEventListener("submit", (event) => {
        // adiciona uma nova funcionaria
        event.preventDefault();

        const formData = new FormData(employeeForm);
        const name = formData.get("name")?.toString().trim();
        if (!name) {
            return;
        }

        const professionals = getStoredProfessionals();
        professionals.push({
            id: String(Date.now()),
            title: name
        });

        saveProfessionals(professionals);
        renderEmployees();
        renderProfessionalOptions();
        refreshCalendarResources();
        employeeForm.reset();
    });

    serviceForm?.addEventListener("submit", (event) => {
        // adiciona um novo servico
        event.preventDefault();

        const formData = new FormData(serviceForm);
        const name = formData.get("name")?.toString().trim();
        if (!name) {
            return;
        }

        const services = getStoredServices();
        services.push(name);
        saveServices(services);
        renderServices();
        ensureSelectedService();
        serviceForm.reset();
    });

    scheduledList?.addEventListener("click", (event) => {
        // cancela um horario salvo quando clicar no botao
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const cancelIndex = target.dataset.cancelEvent;
        if (cancelIndex === undefined) {
            return;
        }

        const events = getStoredEvents();
        events.splice(Number(cancelIndex), 1);
        saveEvents(events);
        refreshCalendarEvents();
        renderScheduledList();
    });

    employeeList?.addEventListener("click", (event) => {
        // remove uma funcionaria
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const professionalId = target.dataset.removeProfessional;
        if (!professionalId) {
            return;
        }

        const professionals = getStoredProfessionals().filter(
            (professional) => professional.id !== professionalId
        );
        saveProfessionals(professionals);
        renderEmployees();
        renderProfessionalOptions();
        refreshCalendarResources();
    });

    serviceList?.addEventListener("click", (event) => {
        // remove um servico
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const serviceName = target.dataset.removeService;
        if (!serviceName) {
            return;
        }

        const services = getStoredServices().filter((service) => service !== serviceName);
        saveServices(services);
        renderServices();
        ensureSelectedService();
    });
}

function initMenu() {
    // aqui so troco a classe active do menu para mostrar onde a pessoa clicou
    const items = document.querySelectorAll(".menu li");
    if (!items.length) {
        return;
    }

    items.forEach((item) => {
        item.addEventListener("click", () => {
            const current = document.querySelector(".menu .active");
            if (current) {
                current.classList.remove("active");
            }
            item.classList.add("active");
        });
    });
}

function initLogout() {
    // logout simples limpando a sessao e voltando pro login
    const logoutButton = document.querySelector(".logout");
    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", () => {
        clearSession();
        alert("Voce foi redirecionada para a pagina de login.");
        window.location.href = "index.html";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // quando a pagina carrega, eu inicio tudo o que o sistema precisa
    initLoginForm();
    initRegisterForm();
    initRecoveryForm();
    initDashboard();
    initMenu();
    initLogout();
});
