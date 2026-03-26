const STORAGE_KEYS = {
    // aqui eu concentrei todas as chaves que uso no localStorage
    users: "manicure-users",
    currentUser: "manicure-current-user",
    loggedIn: "manicure-logged-in",
    remember: "manicure-remember",
    events: "manicure-events",
    clients: "manicure-clients",
    professionals: "manicure-professionals",
    services: "manicure-services",
    bills: "manicure-bills",
    help: "manicure-help",
    resetRequests: "manicure-reset-requests"
};

const PLANS = {
    // esses sao os planos disponiveis dentro do sistema
    none: { id: "none", name: "Sem plano", price: "0,00", description: "Acesso livre para testar o sistema com limite de 2 horarios por dia." },
    basico: { id: "basico", name: "Basico", price: "59,00", description: "Cadastro de horarios e funcionarios." },
    line: { id: "line", name: "Line", price: "79,00", description: "Plano completo para o sistema." },
    saloon: { id: "saloon", name: "Saloon", price: "89,00", description: "Plano completo com consultoria de vendas e treinamento." }
};

const PAYMENT_LABELS = {
    boleto: "Boleto",
    pix: "Pix",
    credito: "Cartao de credito",
    debito: "Cartao de debito"
};

const PLAN_DUE_DAYS = ["5", "10", "15", "20"];

const DEFAULT_LOGO = "img/ico.png";

const defaultAdminUser = {
    // usuario admin padrao para eu conseguir acessar o painel administrativo
    id: "admin-1",
    role: "admin",
    name: "Administrador",
    lastname: "Auralynne",
    email: "admin@auralynne.com",
    phone: "(00) 00000-0000",
    username: "admin",
    password: "admin123",
    companyName: "Auralynne",
    logo: DEFAULT_LOGO,
    planId: "line",
    planStatus: "active",
    paymentMethod: "pix",
    planDueDay: "10"
};

const defaultProfessionals = [
    // funcionarias iniciais que ja aparecem no calendario
    { id: "1", title: "Maria" },
    { id: "2", title: "Ana" },
    { id: "3", title: "Joana" },
    { id: "4", title: "Carla" }
];

const defaultServices = [
    { name: "Manicure", duration: 60 },
    { name: "Pedicure", duration: 60 },
    { name: "Unha em gel", duration: 90 },
    { name: "Spa dos pes", duration: 60 }
];

const defaultEvents = [
    // eventos de exemplo para o calendario nao começar vazio
    {
        title: "Manicure - Paula",
        start: "2026-03-25T09:00:00",
        end: "2026-03-25T10:00:00",
        resourceId: "1",
        backgroundColor: "#E94B6A",
        extendedProps: { owner: "demo" }
    },
    {
        title: "Pedicure - Bianca",
        start: "2026-03-25T10:30:00",
        end: "2026-03-25T11:30:00",
        resourceId: "2",
        backgroundColor: "#a20ee7",
        extendedProps: { owner: "demo" }
    }
];

function createDefaultProfessionalsForUser(username) {
    return defaultProfessionals.map((professional) => ({
        ...professional,
        owner: username
    }));
}

function getJSON(key, fallbackValue) {
    // funcao geral para buscar qualquer dado salvo no localStorage
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
        localStorage.setItem(key, JSON.stringify(fallbackValue));
        return Array.isArray(fallbackValue) ? [...fallbackValue] : fallbackValue;
    }
    return JSON.parse(rawValue);
}

function setJSON(key, value) {
    // funcao geral para salvar dados no localStorage
    localStorage.setItem(key, JSON.stringify(value));
}

function ensureBaseData() {
    // aqui eu garanto que os dados iniciais sempre existam
    const users = getJSON(STORAGE_KEYS.users, [defaultAdminUser]).map((user) => ({
        ...user,
        planDueDay: user.planDueDay || (user.planId && user.planId !== "none" ? "10" : ""),
        companyName: user.companyName || user.name || user.username
    }));
    if (!users.some((user) => user.username === defaultAdminUser.username)) {
        users.push(defaultAdminUser);
    }
    setJSON(STORAGE_KEYS.users, users);
    getJSON(STORAGE_KEYS.events, defaultEvents);
    getJSON(STORAGE_KEYS.clients, []);
    const professionals = getJSON(STORAGE_KEYS.professionals, defaultProfessionals).map((professional) =>
        professional.owner ? professional : { ...professional, owner: "legacy-default" }
    );
    users
        .filter((user) => user.role !== "admin")
        .forEach((user) => {
            if (!professionals.some((professional) => professional.owner === user.username)) {
                professionals.push(...createDefaultProfessionalsForUser(user.username));
            }
        });
    setJSON(STORAGE_KEYS.professionals, professionals);
    const services = getJSON(STORAGE_KEYS.services, defaultServices).map((service) =>
        typeof service === "string" ? { name: service, duration: 60 } : { ...service, duration: Number(service.duration) || 60 }
    );
    setJSON(STORAGE_KEYS.services, services);
    getJSON(STORAGE_KEYS.bills, []);
    getJSON(STORAGE_KEYS.help, []);
    getJSON(STORAGE_KEYS.resetRequests, []);
}

function getStoredUsers() { return getJSON(STORAGE_KEYS.users, [defaultAdminUser]); }
function saveUsers(users) { setJSON(STORAGE_KEYS.users, users); }
function getStoredEvents() { return getJSON(STORAGE_KEYS.events, defaultEvents); }
function saveEvents(events) { setJSON(STORAGE_KEYS.events, events); }
function getStoredClients() { return getJSON(STORAGE_KEYS.clients, []); }
function saveClients(clients) { setJSON(STORAGE_KEYS.clients, clients); }
function getStoredProfessionals() { return getJSON(STORAGE_KEYS.professionals, []); }
function saveProfessionals(professionals) { setJSON(STORAGE_KEYS.professionals, professionals); }
function getStoredServices() { return getJSON(STORAGE_KEYS.services, defaultServices); }
function saveServices(services) { setJSON(STORAGE_KEYS.services, services); }
function getStoredBills() { return getJSON(STORAGE_KEYS.bills, []); }
function saveBills(bills) { setJSON(STORAGE_KEYS.bills, bills); }
function getStoredHelpRequests() { return getJSON(STORAGE_KEYS.help, []); }
function saveHelpRequests(requests) { setJSON(STORAGE_KEYS.help, requests); }
function getStoredResetRequests() { return getJSON(STORAGE_KEYS.resetRequests, []); }
function saveResetRequests(requests) { setJSON(STORAGE_KEYS.resetRequests, requests); }

function getUserEvents(username) {
    return getStoredEvents().filter((event) => event.extendedProps?.owner === username);
}

function saveUserEvents(username, userEvents) {
    const otherEvents = getStoredEvents().filter((event) => event.extendedProps?.owner !== username);
    saveEvents([...otherEvents, ...userEvents]);
}

function getUserProfessionals(username) {
    return getStoredProfessionals().filter((professional) => professional.owner === username);
}

function getOwnedProfessionals(username) {
    return getStoredProfessionals().filter((professional) => professional.owner === username);
}

function saveUserProfessionals(username, userProfessionals) {
    const otherProfessionals = getStoredProfessionals().filter((professional) => professional.owner !== username);
    saveProfessionals([...otherProfessionals, ...userProfessionals.map((professional) => ({
        ...professional,
        owner: username
    }))]);
}

function getUserServices(username) {
    return getStoredServices()
        .filter((service) => !service.owner || service.owner === username)
        .map((service) => ({ ...service, duration: Number(service.duration) || 60 }));
}

function getOwnedServices(username) {
    return getStoredServices()
        .filter((service) => service.owner === username)
        .map((service) => ({ ...service, duration: Number(service.duration) || 60 }));
}

function saveUserServices(username, userServices) {
    const normalizedUserServices = userServices.map((service) =>
        typeof service === "string"
            ? { name: service, duration: 60, owner: username }
            : { ...service, duration: Number(service.duration) || 60, owner: username }
    );
    const otherServices = getStoredServices().filter((service) =>
        service.owner !== username
    );
    saveServices([...otherServices, ...normalizedUserServices]);
}

function getCurrentUser() {
    const username = localStorage.getItem(STORAGE_KEYS.currentUser);
    return username ? getStoredUsers().find((user) => user.username === username) || null : null;
}

function setCurrentUser(username) { localStorage.setItem(STORAGE_KEYS.currentUser, username); }

function updateUser(partialUser) {
    // atualiza um usuario especifico sem perder os outros dados
    saveUsers(getStoredUsers().map((user) =>
        user.username === partialUser.username ? { ...user, ...partialUser } : user
    ));
}

function setLoggedIn(rememberUser) {
    localStorage.setItem(STORAGE_KEYS.loggedIn, "true");
    localStorage.setItem(STORAGE_KEYS.remember, rememberUser ? "true" : "false");
}

function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.loggedIn);
    localStorage.removeItem(STORAGE_KEYS.remember);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
}

function isLoggedIn() { return localStorage.getItem(STORAGE_KEYS.loggedIn) === "true"; }
function getPlanMeta(planId) { return PLANS[planId] || PLANS.none; }
function hasActivePlan(user) { return user && user.planId !== "none" && user.planStatus === "active"; }
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function normalizeLogoPath(path) {
    if (!path) {
        return DEFAULT_LOGO;
    }

    const trimmedPath = path.trim();
    if (!trimmedPath) {
        return DEFAULT_LOGO;
    }

    if (/^https?:\/\//i.test(trimmedPath) || /^data:/i.test(trimmedPath)) {
        return trimmedPath;
    }

    if (/^[a-zA-Z]:\\/.test(trimmedPath)) {
        return trimmedPath.replace(/\\/g, "/");
    }

    return trimmedPath.replace(/\\/g, "/");
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(DEFAULT_LOGO);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem."));
        reader.readAsDataURL(file);
    });
}

function formatDateOnly(date) {
    // aqui eu formato a data para abrir o calendario no dia certo
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addOneHour(dateString, timeString) {
    // todo agendamento ganha 1 hora de duracao
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
    return { start: formatLocalDate(startDate), end: formatLocalDate(endDate) };
}

function addDuration(dateString, timeString, durationInMinutes) {
    // aqui eu monto o horario final baseado na duracao do servico
    const startDate = new Date(`${dateString}T${timeString}:00`);
    const endDate = new Date(startDate.getTime() + Number(durationInMinutes || 60) * 60 * 1000);
    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };
    return { start: formatLocalDate(startDate), end: formatLocalDate(endDate) };
}

function isToday(dateString) {
    return dateString === formatDateOnly(new Date());
}

function getCurrentTimeFloor() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function isPastTimeForToday(dateString, timeString) {
    if (!isToday(dateString)) {
        return false;
    }
    return `${dateString}T${timeString}:00` <= `${formatDateOnly(new Date())}T${getCurrentTimeFloor()}:00`;
}

function hasProfessionalConflict(events, professionalId, start, end) {
    // aqui eu confiro se ja existe outro horario no mesmo periodo para a mesma profissional
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    return events.some((event) => {
        if (String(event.resourceId) !== String(professionalId)) {
            return false;
        }

        const eventStart = new Date(event.start).getTime();
        const eventEnd = new Date(event.end).getTime();

        return startTime < eventEnd && endTime > eventStart;
    });
}

function getEventColor(service) {
    const colors = {
        Manicure: "#E94B6A",
        Pedicure: "#a20ee7",
        "Unha em gel": "#ffb347",
        "Spa dos pes": "#48b9a8"
    };
    return colors[service] || "#E94B6A";
}

function formatMonthDate(year, monthIndex, dueDay) {
    const safeDueDay = Number(dueDay) || 10;
    const maxDay = new Date(year, monthIndex + 1, 0).getDate();
    const finalDay = String(Math.min(safeDueDay, maxDay)).padStart(2, "0");
    const finalMonth = String(monthIndex + 1).padStart(2, "0");
    return `${year}-${finalMonth}-${finalDay}`;
}

function getFirstDueDate(dueDay) {
    // aqui eu descubro o primeiro vencimento com base no dia escolhido
    const now = new Date();
    const selectedDay = Number(dueDay) || 10;
    const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), selectedDay);
    if (now <= currentMonthDate) {
        return formatMonthDate(now.getFullYear(), now.getMonth(), selectedDay);
    }
    return formatMonthDate(now.getFullYear(), now.getMonth() + 1, selectedDay);
}

function getNextMonthDueDate(baseDate, dueDay) {
    const sourceDate = new Date(`${baseDate}T00:00:00`);
    return formatMonthDate(sourceDate.getFullYear(), sourceDate.getMonth() + 1, dueDay);
}

function removeOpenPlanBills(username) {
    // quando a pessoa troca ou cancela o plano eu limpo as cobrancas abertas antigas
    saveBills(getStoredBills().filter((bill) =>
        !(bill.username === username && bill.billType === "plan" && bill.status === "pendente")
    ));
}

function createPlanBill({ username, planId, paymentMethod, dueDay, status, dueDate }) {
    const plan = getPlanMeta(planId);
    return {
        id: `bill-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        username,
        description: `Mensalidade ${plan.name}`,
        dueDate,
        amount: plan.price,
        status,
        billType: "plan",
        paymentMethod,
        planId,
        recurring: true,
        dueDay: String(dueDay)
    };
}

function ensureNextRecurringPlanBill(user, referenceDueDate) {
    // sempre deixo a proxima mensalidade pronta para a cobranca recorrente
    if (!user || user.planId === "none" || !user.planDueDay) { return; }
    const bills = getStoredBills();
    const nextDueDate = getNextMonthDueDate(referenceDueDate, user.planDueDay);
    const alreadyExists = bills.some((bill) =>
        bill.username === user.username &&
        bill.billType === "plan" &&
        bill.planId === user.planId &&
        bill.dueDate === nextDueDate &&
        bill.status === "pendente"
    );
    if (alreadyExists) { return; }
    bills.push(createPlanBill({
        username: user.username,
        planId: user.planId,
        paymentMethod: user.paymentMethod || "boleto",
        dueDay: user.planDueDay,
        status: "pendente",
        dueDate: nextDueDate
    }));
    saveBills(bills);
}

function issuePlanBill(user, planId, paymentMethod, dueDay, statusOverride) {
    // quando a pessoa contrata um plano eu gero a cobranca da mensalidade
    if (planId === "none") { return; }
    const bills = getStoredBills();
    const firstDueDate = getFirstDueDate(dueDay);
    const currentStatus = statusOverride || (paymentMethod === "boleto" ? "pendente" : "pago");
    bills.push(createPlanBill({
        username: user.username,
        planId,
        paymentMethod,
        dueDay,
        status: currentStatus,
        dueDate: firstDueDate
    }));
    saveBills(bills);
    if (currentStatus === "pago") {
        ensureNextRecurringPlanBill({ ...user, planId, paymentMethod, planDueDay: String(dueDay) }, firstDueDate);
    }
}

function activateUserPlan(username, planId, paymentMethod, dueDay) {
    updateUser({
        username,
        planId,
        paymentMethod,
        planDueDay: dueDay || "",
        planStatus: planId === "none" ? "inactive" : "active"
    });
}

function initLoginForm() {
    // parte de login
    const form = document.getElementById("login-form");
    if (!form) { return; }
    const rememberInput = document.getElementById("remember");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const username = formData.get("username")?.toString().trim();
        const password = formData.get("password")?.toString().trim();
        const matchedUser = getStoredUsers().find(
            (user) => user.username === username && user.password === password
        );
        if (!matchedUser) {
            alert("Usuario ou senha invalidos.");
            return;
        }
        setCurrentUser(matchedUser.username);
        setLoggedIn(Boolean(rememberInput?.checked));
        window.location.href = matchedUser.role === "admin" ? "admin.html" : "dashboard.html";
    });
}

function initRegisterForm() {
    // parte do cadastro de usuario
    const form = document.getElementById("register-form");
    if (!form) { return; }
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const password = formData.get("password")?.toString();
        const confirmPassword = formData.get("confirm_password")?.toString();
        const username = formData.get("username")?.toString().trim();
        const email = formData.get("email")?.toString().trim();
        const planId = formData.get("plan")?.toString() || "none";
        const paymentMethod = formData.get("payment_method")?.toString() || "";
        const planDueDay = formData.get("plan_due_day")?.toString() || "";
        const users = getStoredUsers();
        if (!isValidEmail(email)) { alert("Digite um email valido."); return; }
        if (password !== confirmPassword) { alert("As senhas precisam ser iguais."); return; }
        if (users.some((user) => user.username === username)) { alert("Esse usuario ja existe."); return; }
        if (users.some((user) => user.email === email)) { alert("Esse email ja esta cadastrado."); return; }
        if (planId !== "none" && !paymentMethod) { alert("Escolha uma forma de pagamento para contratar um plano."); return; }
        if (planId !== "none" && !PLAN_DUE_DAYS.includes(planDueDay)) { alert("Escolha um dia de vencimento."); return; }
        const newUser = {
            id: `user-${Date.now()}`,
            role: "user",
            name: formData.get("name")?.toString().trim(),
            lastname: formData.get("lastname")?.toString().trim(),
            email,
            phone: formData.get("phone")?.toString().trim(),
            username,
            password,
            companyName: formData.get("name")?.toString().trim(),
            logo: DEFAULT_LOGO,
            planId,
            paymentMethod: paymentMethod || "",
            planDueDay: planDueDay || "",
            planStatus: planId === "none" ? "inactive" : paymentMethod === "boleto" ? "pending" : "active"
        };
        users.push(newUser);
        saveUsers(users);
        if (planId !== "none") { issuePlanBill(newUser, planId, paymentMethod, planDueDay); }
        alert("Cadastro realizado com sucesso. Agora faca login.");
        window.location.href = "index.html";
    });
}

function initRecoveryForm() {
    // parte de pedir recuperacao de senha
    const form = document.getElementById("recovery-form");
    if (!form) { return; }
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = new FormData(form).get("email")?.toString().trim();
        const user = getStoredUsers().find((storedUser) => storedUser.email === email);
        if (!user) { alert("Nenhuma conta encontrada com esse email."); return; }
        const token = String(Math.floor(100000 + Math.random() * 900000));
        const requests = getStoredResetRequests().filter((request) => request.email !== email);
        requests.push({ id: `reset-${Date.now()}`, email, username: user.username, token, used: false });
        saveResetRequests(requests);
        alert(`Email de recuperacao enviado de forma simulada. Codigo: ${token}`);
        window.location.href = `resetar-senha.html?email=${encodeURIComponent(email)}`;
    });
}

function initResetPasswordForm() {
    // parte de criar uma senha nova usando o codigo de recuperacao
    const form = document.getElementById("reset-password-form");
    if (!form) { return; }
    const params = new URLSearchParams(window.location.search);
    const emailInput = document.getElementById("reset-email");
    if (emailInput && params.get("email")) { emailInput.value = params.get("email"); }
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const email = formData.get("email")?.toString().trim();
        const token = formData.get("token")?.toString().trim();
        const password = formData.get("password")?.toString();
        const confirmPassword = formData.get("confirm_password")?.toString();
        if (password !== confirmPassword) { alert("As senhas precisam ser iguais."); return; }
        const requests = getStoredResetRequests();
        const request = requests.find((item) => item.email === email && item.token === token && !item.used);
        if (!request) { alert("Codigo de recuperacao invalido."); return; }
        saveUsers(getStoredUsers().map((user) => user.email === email ? { ...user, password } : user));
        saveResetRequests(requests.map((item) => item.id === request.id ? { ...item, used: true } : item));
        alert("Nova senha salva com sucesso.");
        window.location.href = "index.html";
    });
}

function initDashboard() {
    // aqui eu controlo toda a logica do dashboard normal
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl || !window.FullCalendar) { return; }

    const currentUser = getCurrentUser();
    if (!isLoggedIn() || !currentUser || currentUser.role === "admin") {
        window.location.href = "index.html";
        return;
    }

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
    const clientMenuItem = document.getElementById("open-client-panel");
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
    const externalLinkPanel = document.getElementById("external-link-panel");
    const companyForm = document.getElementById("company-form");
    const companyNameInput = document.getElementById("company-name");
    const helpForm = document.getElementById("help-form");
    const helpList = document.getElementById("help-list");
    const userLogo = document.getElementById("user-logo");
    const calendarClock = document.getElementById("calendar-clock");
    const today = new Date();
    const currentHour = String(today.getHours()).padStart(2, "0");

    const calendar = new FullCalendar.Calendar(calendarEl, {
        // configuracao principal do calendario
        initialView: "resourceTimeGridDay",
        initialDate: formatDateOnly(today),
        locale: "pt-br",
        slotMinTime: "08:00:00",
        slotMaxTime: "20:00:00",
        slotDuration: "00:30:00",
        scrollTime: `${currentHour}:00:00`,
        allDaySlot: false,
        nowIndicator: true,
        height: 470,
        headerToolbar: false,
        resources: getUserProfessionals(currentUser.username),
        events: getUserEvents(currentUser.username),
        datesSet: () => updateCalendarTitle(),
        eventClick: (info) => {
            const startLabel = new Date(info.event.startStr).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
            const shouldRemove = window.confirm(`Deseja cancelar o agendamento "${info.event.title}" de ${startLabel}?`);
            if (!shouldRemove) { return; }
            removeStoredEvent(info.event);
            info.event.remove();
            renderScheduledList();
            alert("Agendamento cancelado com sucesso.");
        }
    });

    function updateCalendarTitle() {
        if (calendarTitle) {
            calendarTitle.textContent = calendar.getDate().toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }
    }

    function updateCalendarClock() {
        // esse relogio fica no topo do dashboard mostrando a hora em tempo real
        if (!calendarClock) { return; }
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        calendarClock.textContent = `${hours}:${minutes}:${seconds}`;
    }

    function applyUserLogo() {
        if (userLogo) {
            userLogo.src = normalizeLogoPath(currentUser.logo);
        }
    }

    function renderClientSuggestions() {
        if (clientSuggestions) {
            clientSuggestions.innerHTML = getStoredClients().map((client) =>
                `<option value="${client.name}"></option>`
            ).join("");
        }
    }

    function renderProfessionalOptions() {
        if (professionalSelect) {
            professionalSelect.innerHTML = getUserProfessionals(currentUser.username).map((professional) =>
                `<option value="${professional.id}">${professional.title}</option>`
            ).join("");
        }
    }

    function renderServiceOptions() {
        if (!serviceInput) { return; }
        const services = getUserServices(currentUser.username);
        serviceInput.innerHTML = services.map((service) =>
            `<option value="${service.name}">${service.name}</option>`
        ).join("");
    }

    function ensureSelectedService() {
        const services = getUserServices(currentUser.username);
        const serviceNames = services.map((service) => service.name);
        if (serviceInput && !serviceNames.includes(serviceInput.value)) {
            serviceInput.value = serviceNames[0] || "Manicure";
        }
    }

    function updateBookingTimeLimit() {
        const dateInput = document.getElementById("data");
        const timeInput = document.getElementById("horario");
        if (!dateInput || !timeInput) { return; }
        timeInput.min = isToday(dateInput.value) ? getCurrentTimeFloor() : "";
    }

    function syncClientPhone() {
        if (!clientNameInput || !clientPhoneInput) { return; }
        const typedName = clientNameInput.value.trim().toLowerCase();
        const matchedClient = getStoredClients().find((client) =>
            client.name.trim().toLowerCase() === typedName
        );
        if (matchedClient) {
            clientPhoneInput.value = matchedClient.phone;
        }
    }

    function renderScheduledList() {
        if (!scheduledList) { return; }
        const events = getUserEvents(currentUser.username);
        scheduledList.innerHTML = events.length
            ? events.map((event, index) => `
                <div class="settings-item">
                    <div>
                        <strong>${event.title}</strong>
                        <span>${event.start.slice(0, 10)} ${event.start.slice(11, 16)}</span>
                    </div>
                    <button type="button" class="danger-btn" data-cancel-event="${index}">Cancelar</button>
                </div>
            `).join("")
            : "<p class=\"empty-state\">Nenhum agendamento cadastrado.</p>";
    }

    function renderEmployees() {
        if (employeeList) {
            const ownedProfessionals = getOwnedProfessionals(currentUser.username);
            employeeList.innerHTML = ownedProfessionals.length ? ownedProfessionals.map((professional) => `
                <div class="settings-item">
                    <div>
                        <strong>${professional.title}</strong>
                        <span>ID ${professional.id}</span>
                    </div>
                    <button type="button" class="danger-btn" data-remove-professional="${professional.id}">Remover</button>
                </div>
            `).join("") : '<p class="empty-state">Nenhuma profissional criada por essa conta ainda.</p>';
        }
    }

    function renderServices() {
        if (serviceList) {
            const ownedServices = getOwnedServices(currentUser.username);
            serviceList.innerHTML = ownedServices.length ? ownedServices.map((service) => `
                <div class="settings-item">
                    <div>
                        <strong>${service.name}</strong>
                        <span>Duracao: ${service.duration} minutos</span>
                    </div>
                    <button type="button" class="danger-btn" data-remove-service="${service.name}">Remover</button>
                </div>
            `).join("") : '<p class="empty-state">Nenhum servico criado por essa conta ainda.</p>';
        }
    }

    function getExternalBookingLink() {
        const url = new URL("agendamento-publico.html", window.location.href);
        url.searchParams.set("user", currentUser.username);
        return url.toString();
    }

    function renderExternalLinkPanel() {
        if (!externalLinkPanel) { return; }
        const externalLink = getExternalBookingLink();
        if (companyNameInput) {
            companyNameInput.value = currentUser.companyName || "";
        }
        externalLinkPanel.innerHTML = `
            <div class="external-link-box">
                <p><strong>Empresa:</strong> ${currentUser.companyName || currentUser.name || currentUser.username}</p>
                <p>Compartilhe esse link com seus clientes para que eles possam agendar sozinhos, sem login.</p>
                <div class="external-link-row">
                    <input type="text" value="${externalLink}" readonly>
                    <button type="button" class="secondary-btn" data-copy-external-link="true">Copiar</button>
                </div>
            </div>
        `;
    }

    function renderFinance() {
        // area do financeiro do usuario com plano atual, compra de plano e boletos
        if (!financeList) { return; }
        const user = getCurrentUser();
        const plan = getPlanMeta(user.planId);
        const bills = getStoredBills().filter((bill) => bill.username === user.username);
        const currentStatusLabel = user.planStatus === "active"
            ? "ativo"
            : user.planStatus === "pending"
                ? "aguardando pagamento"
                : "sem plano";
        const hasCurrentPlan = user.planId !== "none" && ["active", "pending"].includes(user.planStatus);
        financeList.innerHTML = `
            <div class="settings-item">
                <div>
                    <strong>Plano atual: ${plan.name}</strong>
                    <span>Status: ${currentStatusLabel}</span>
                    <span>Vencimento mensal: ${user.planDueDay || "--"} de cada mes</span>
                    <span>${plan.description}</span>
                </div>
                <span class="status-pill ${user.planStatus === "active" ? "paid" : ""}">${user.planStatus}</span>
            </div>
            ${hasCurrentPlan ? `
                <div class="plan-card">
                    <strong>Seu plano contratado</strong>
                    <span>${plan.name} - R$ ${plan.price}/mensal</span>
                    <p>As cobrancas ficam recorrentes no dia ${user.planDueDay || "10"} de cada mes.</p>
                    <button type="button" class="danger-btn" data-cancel-plan="true">Cancelar plano</button>
                </div>
            ` : `
            <div class="plan-shop">
                ${Object.values(PLANS).filter((planOption) => planOption.id !== "none").map((planOption) => `
                    <div class="plan-card">
                        <strong>${planOption.name}</strong>
                        <span>R$ ${planOption.price}/mensal</span>
                        <p>${planOption.description}</p>
                        <form class="plan-buy-form" data-plan-buy="${planOption.id}">
                            <select name="paymentMethod" required>
                                <option value="">Forma de pagamento</option>
                                <option value="boleto">Boleto</option>
                                <option value="pix">Pix</option>
                                <option value="credito">Cartao de credito</option>
                                <option value="debito">Cartao de debito</option>
                            </select>
                            <select name="planDueDay" required>
                                <option value="">Dia do pagamento</option>
                                ${PLAN_DUE_DAYS.map((day) => `<option value="${day}">${day}</option>`).join("")}
                            </select>
                            <button type="submit" class="btn">Contratar</button>
                        </form>
                    </div>
                `).join("")}
            </div>
            `}
            <div class="settings-list">
                ${bills.length ? bills.map((bill) => `
                    <div class="settings-item">
                        <div>
                            <strong>${bill.description}</strong>
                            <span>Vencimento: ${bill.dueDate} | Valor: R$ ${bill.amount}</span>
                            <span>Pagamento: ${PAYMENT_LABELS[bill.paymentMethod] || bill.paymentMethod} | Recorrencia: mensal</span>
                        </div>
                        ${bill.status === "pago"
                            ? '<span class="status-pill paid">Pago</span>'
                            : `<button type="button" class="danger-btn" data-pay-bill="${bill.id}">Pagar</button>`}
                    </div>
                `).join("") : '<p class="empty-state">Nenhum boleto lancado para sua conta.</p>'}
            </div>
        `;
    }

    function renderHelpRequests() {
        if (!helpList) { return; }
        const requests = getStoredHelpRequests().filter((request) => request.username === currentUser.username);
        helpList.innerHTML = requests.length
            ? requests.map((request) => `
                <div class="settings-item">
                    <div>
                        <strong>${request.subject}</strong>
                        <span>${request.email}</span>
                        ${request.response ? `<span>Resposta: ${request.response}</span>` : ""}
                    </div>
                    <span class="status-pill ${request.status === "respondido" ? "paid" : ""}">${request.status}</span>
                </div>
            `).join("")
            : "<p class=\"empty-state\">Nenhum pedido de ajuda enviado ainda.</p>";
    }

    function applyPlanAccess() {
        const user = getCurrentUser();
        const activePlan = hasActivePlan(user);
        const basicMode = user.planId === "basico" && user.planStatus === "active";
        const premiumMode = activePlan && ["line", "saloon"].includes(user.planId);
        const noPlan = !activePlan;

        if (clientMenuItem) {
            clientMenuItem.style.display = premiumMode ? "" : "none";
        }

        settingsTabs.forEach((tab) => {
            const name = tab.dataset.settingsTab;
            let allowed = true;

            if (premiumMode) {
                allowed = true;
            } else if (basicMode || noPlan) {
                allowed = ["funcionarios", "financeiro", "linkexterno", "ajuda"].includes(name);
            }

            tab.style.display = allowed ? "" : "none";
        });

        if (!premiumMode) {
            switchSettingsTab("funcionarios");
        }
    }

    function switchSettingsTab(tabName) {
        settingsTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.settingsTab === tabName));
        settingsPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.settingsPanel === tabName));
    }

    function refreshCalendarEvents() {
        calendar.removeAllEvents();
        calendar.addEventSource(getUserEvents(currentUser.username));
    }

    function refreshCalendarResources() {
        calendar.setOption("resources", getUserProfessionals(currentUser.username));
    }

    function removeStoredEvent(calendarEvent) {
        const updatedEvents = getUserEvents(currentUser.username).filter((event) =>
            !(
                event.title === calendarEvent.title &&
                event.start === calendarEvent.startStr &&
                event.end === calendarEvent.endStr &&
                String(event.resourceId) === String(calendarEvent.getResources()[0]?.id || calendarEvent.extendedProps?.resourceId || "")
            )
        );
        saveUserEvents(currentUser.username, updatedEvents);
    }

    function syncCurrentUserData() {
        const latestUser = getCurrentUser();
        if (!latestUser) {
            window.location.href = "index.html";
            return false;
        }

        Object.assign(currentUser, latestUser);
        applyUserLogo();
        renderFinance();
        renderExternalLinkPanel();
        renderHelpRequests();
        applyPlanAccess();
        return true;
    }

    function syncDashboardFromStorage(changedKey) {
        if (!syncCurrentUserData()) { return; }

        if (!changedKey || changedKey === STORAGE_KEYS.events) {
            refreshCalendarEvents();
            renderScheduledList();
        }

        if (!changedKey || changedKey === STORAGE_KEYS.professionals) {
            renderEmployees();
            renderProfessionalOptions();
            refreshCalendarResources();
        }

        if (!changedKey || changedKey === STORAGE_KEYS.services) {
            renderServices();
            renderServiceOptions();
            ensureSelectedService();
        }

        if (!changedKey || changedKey === STORAGE_KEYS.clients) {
            renderClientSuggestions();
            syncClientPhone();
        }

        if (!changedKey || changedKey === STORAGE_KEYS.help) {
            renderHelpRequests();
        }

        if (!changedKey || changedKey === STORAGE_KEYS.bills) {
            renderFinance();
        }

        if (!changedKey || changedKey === STORAGE_KEYS.users) {
            renderFinance();
            renderExternalLinkPanel();
            applyPlanAccess();
        }
    }

    function closeAllDrawers() {
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
        if (!drawer || !drawerBackdrop) { return; }
        closeAllDrawers();
        drawer.classList.add("is-open");
        drawer.setAttribute("aria-hidden", "false");
        drawerBackdrop.hidden = false;
    }

    function canCreateAppointment(date) {
        // se a pessoa nao tem plano ativo, ela so pode criar 2 horarios por dia
        const user = getCurrentUser();
        if (hasActivePlan(user)) {
            return true;
        }
        const appointmentsToday = getStoredEvents().filter((event) =>
            event.extendedProps?.owner === currentUser.username && event.start.slice(0, 10) === date
        );
        return appointmentsToday.length < 2;
    }

    calendar.render();
    applyUserLogo();
    updateCalendarTitle();
    updateCalendarClock();
    window.setInterval(updateCalendarClock, 1000);
    renderClientSuggestions();
    renderProfessionalOptions();
    renderServiceOptions();
    ensureSelectedService();
    updateBookingTimeLimit();
    renderScheduledList();
    renderEmployees();
    renderServices();
    renderFinance();
    renderExternalLinkPanel();
    renderHelpRequests();
    applyPlanAccess();

    openBookingPanel?.addEventListener("click", () => openDrawer(bookingDrawer));
    openClientPanel?.addEventListener("click", () => openDrawer(clientDrawer));
    openSettingsPanel?.addEventListener("click", () => openDrawer(settingsDrawer));
    closeBookingPanel?.addEventListener("click", closeAllDrawers);
    closeClientPanel?.addEventListener("click", closeAllDrawers);
    closeSettingsPanel?.addEventListener("click", closeAllDrawers);
    drawerBackdrop?.addEventListener("click", closeAllDrawers);
    clientNameInput?.addEventListener("change", syncClientPhone);
    clientNameInput?.addEventListener("blur", syncClientPhone);
    document.getElementById("data")?.addEventListener("change", updateBookingTimeLimit);
    settingsTabs.forEach((tab) => tab.addEventListener("click", () => switchSettingsTab(tab.dataset.settingsTab)));
    prevButton?.addEventListener("click", () => { calendar.prev(); updateCalendarTitle(); });
    nextButton?.addEventListener("click", () => { calendar.next(); updateCalendarTitle(); });
    window.addEventListener("storage", (event) => {
        if (!event.key || Object.values(STORAGE_KEYS).includes(event.key)) {
            syncDashboardFromStorage(event.key || "");
        }
    });
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            syncDashboardFromStorage();
        }
    });

    form?.addEventListener("submit", (event) => {
        // cria um agendamento novo
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
        if (!canCreateAppointment(data)) {
            alert("Sem plano ativo, voce so pode agendar 2 horarios por dia.");
            return;
        }
        if (isPastTimeForToday(data, horario)) {
            alert("Para hoje, escolha um horario a partir da hora atual.");
            return;
        }
        const selectedService = getUserServices(currentUser.username).find((service) => service.name === servico);
        const duration = addDuration(data, horario, selectedService?.duration || 60);
        if (hasProfessionalConflict(getUserEvents(currentUser.username), profissional, duration.start, duration.end)) {
            alert("Esse funcionario ja possui um agendamento nesse horario.");
            return;
        }
        const newEvent = {
            title: `${servico} - ${nome}`,
            start: duration.start,
            end: duration.end,
            resourceId: profissional,
            backgroundColor: getEventColor(servico),
            extendedProps: { telefone, owner: currentUser.username }
        };
        calendar.addEvent(newEvent);
        saveUserEvents(currentUser.username, calendar.getEvents().map((calendarEvent) => ({
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
        // cadastra ou atualiza cliente
        event.preventDefault();
        const formData = new FormData(clientForm);
        const newClient = {
            name: formData.get("name")?.toString().trim(),
            phone: formData.get("phone")?.toString().trim(),
            email: formData.get("email")?.toString().trim(),
            note: formData.get("note")?.toString().trim()
        };
        if (!isValidEmail(newClient.email)) {
            alert("Digite um email valido para o cliente.");
            return;
        }
        const clients = getStoredClients();
        const existingIndex = clients.findIndex((client) => client.name.trim().toLowerCase() === newClient.name.toLowerCase());
        if (existingIndex >= 0) {
            clients[existingIndex] = newClient;
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
        event.preventDefault();
        const name = new FormData(employeeForm).get("name")?.toString().trim();
        if (!name) { return; }
        const professionals = getOwnedProfessionals(currentUser.username);
        professionals.push({ id: String(Date.now()), title: name, owner: currentUser.username });
        saveUserProfessionals(currentUser.username, professionals);
        renderEmployees();
        renderProfessionalOptions();
        refreshCalendarResources();
        employeeForm.reset();
    });

    serviceForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(serviceForm);
        const name = formData.get("name")?.toString().trim();
        const duration = Number(formData.get("duration"));
        if (!name || !duration) { return; }
        const services = getOwnedServices(currentUser.username);
        services.push({ name, duration });
        saveUserServices(currentUser.username, services);
        renderServices();
        renderServiceOptions();
        ensureSelectedService();
        serviceForm.reset();
    });

    helpForm?.addEventListener("submit", (event) => {
        // envia um chamado de ajuda para o admin responder depois
        event.preventDefault();
        const formData = new FormData(helpForm);
        const requests = getStoredHelpRequests();
        requests.push({
            id: `help-${Date.now()}`,
            username: currentUser.username,
            subject: formData.get("subject")?.toString().trim(),
            email: formData.get("email")?.toString().trim(),
            message: formData.get("message")?.toString().trim(),
            status: "enviado",
            response: ""
        });
        saveHelpRequests(requests);
        renderHelpRequests();
        helpForm.reset();
        alert("Seu pedido de ajuda foi enviado.");
    });

    scheduledList?.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement) || target.dataset.cancelEvent === undefined) { return; }
        const events = getUserEvents(currentUser.username);
        events.splice(Number(target.dataset.cancelEvent), 1);
        saveUserEvents(currentUser.username, events);
        refreshCalendarEvents();
        renderScheduledList();
    });

    employeeList?.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement) || !target.dataset.removeProfessional) { return; }
        saveUserProfessionals(
            currentUser.username,
            getOwnedProfessionals(currentUser.username).filter((professional) => professional.id !== target.dataset.removeProfessional)
        );
        renderEmployees();
        renderProfessionalOptions();
        refreshCalendarResources();
    });

    serviceList?.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement) || !target.dataset.removeService) { return; }
        saveUserServices(
            currentUser.username,
            getOwnedServices(currentUser.username).filter((service) => service.name !== target.dataset.removeService)
        );
        renderServices();
        renderServiceOptions();
        ensureSelectedService();
    });

    financeList?.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) { return; }
        if (target.dataset.cancelPlan) {
            removeOpenPlanBills(currentUser.username);
            updateUser({
                username: currentUser.username,
                planId: "none",
                paymentMethod: "",
                planDueDay: "",
                planStatus: "inactive"
            });
            renderFinance();
            applyPlanAccess();
            alert("Plano cancelado com sucesso.");
            return;
        }
        if (target.dataset.payBill) {
            const billId = target.dataset.payBill;
            const bills = getStoredBills().map((bill) => bill.id === billId ? { ...bill, status: "pago" } : bill);
            saveBills(bills);
            const paidBill = bills.find((bill) => bill.id === billId);
            if (paidBill?.billType === "plan") {
                activateUserPlan(currentUser.username, paidBill.planId, paidBill.paymentMethod, paidBill.dueDay);
                ensureNextRecurringPlanBill({
                    ...getCurrentUser(),
                    username: currentUser.username,
                    planId: paidBill.planId,
                    paymentMethod: paidBill.paymentMethod,
                    planDueDay: paidBill.dueDay
                }, paidBill.dueDate);
                applyPlanAccess();
            }
            renderFinance();
        }
    });

    externalLinkPanel?.addEventListener("click", async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement) || !target.dataset.copyExternalLink) { return; }
        try {
            await navigator.clipboard.writeText(getExternalBookingLink());
            alert("Link copiado com sucesso.");
        } catch (error) {
            alert("Nao foi possivel copiar automaticamente. Copie o link manualmente.");
        }
    });

    financeList?.addEventListener("submit", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLFormElement) || !target.dataset.planBuy) { return; }
        event.preventDefault();
        const planId = target.dataset.planBuy;
        const formData = new FormData(target);
        const paymentMethod = formData.get("paymentMethod")?.toString();
        const planDueDay = formData.get("planDueDay")?.toString();
        if (!paymentMethod || !PLAN_DUE_DAYS.includes(planDueDay || "")) { return; }
        removeOpenPlanBills(currentUser.username);
        if (paymentMethod === "boleto") {
            updateUser({
                username: currentUser.username,
                planId,
                paymentMethod,
                planDueDay,
                planStatus: "pending"
            });
            issuePlanBill({ ...getCurrentUser(), username: currentUser.username }, planId, paymentMethod, planDueDay);
        } else {
            activateUserPlan(currentUser.username, planId, paymentMethod, planDueDay);
            issuePlanBill({ ...getCurrentUser(), username: currentUser.username }, planId, paymentMethod, planDueDay);
        }
        renderFinance();
        applyPlanAccess();
        alert("Plano atualizado com sucesso.");
    });

    companyForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const companyName = new FormData(companyForm).get("companyName")?.toString().trim();
        if (!companyName) {
            alert("Digite o nome da empresa.");
            return;
        }
        updateUser({ username: currentUser.username, companyName });
        currentUser.companyName = companyName;
        renderExternalLinkPanel();
        alert("Nome da empresa salvo com sucesso.");
    });
}

function initPublicBookingPage() {
    // essa pagina publica serve para o cliente agendar sem precisar fazer login
    const card = document.getElementById("wizard-card");
    if (!card) { return; }

    const logo = document.getElementById("public-booking-logo");
    const title = document.getElementById("public-booking-title");
    const subtitle = document.getElementById("public-booking-subtitle");
    const statusBox = document.getElementById("public-booking-status");
    const servicesWrap = document.getElementById("wizard-services");
    const professionalsWrap = document.getElementById("wizard-professionals");
    const timesWrap = document.getElementById("wizard-times");
    const summaryWrap = document.getElementById("wizard-summary");
    const nameInput = document.getElementById("wizard-client-name");
    const phoneInput = document.getElementById("wizard-client-phone");
    const dateInput = document.getElementById("wizard-date");
    const nextServiceButton = document.getElementById("wizard-next-service");
    const nextProfessionalButton = document.getElementById("wizard-next-professional");
    const nextSummaryButton = document.getElementById("wizard-next-summary");
    const confirmButton = document.getElementById("wizard-confirm");
    const panels = document.querySelectorAll("[data-step-panel]");
    const stepDots = document.querySelectorAll("[data-step-dot]");
    const stepLines = document.querySelectorAll("[data-step-line]");
    const successPanel = document.getElementById("wizard-success");
    const resetButton = document.getElementById("wizard-reset");
    const params = new URLSearchParams(window.location.search);
    const username = params.get("user")?.trim();
    const targetUser = getStoredUsers().find((user) => user.username === username && user.role !== "admin");

    const state = {
        service: null,
        professionalId: null,
        professionalName: null,
        date: "",
        time: "",
        name: "",
        phone: ""
    };

    function showPublicStatus(message) {
        if (!statusBox) { return; }
        statusBox.hidden = false;
        statusBox.textContent = message;
    }

    function hidePublicStatus() {
        if (!statusBox) { return; }
        statusBox.hidden = true;
        statusBox.textContent = "";
    }

    function getCurrentService() {
        return getUserServices(targetUser.username).find((service) => service.name === state.service) || null;
    }

    function getAvailableTimes(date, professionalId) {
        if (!date || !professionalId || !targetUser) { return []; }
        const userEvents = getUserEvents(targetUser.username);
        const times = [];
        const durationMinutes = getCurrentService()?.duration || 60;

        for (let hour = 8; hour < 20; hour += 1) {
            for (let minute = 0; minute < 60; minute += 30) {
                if (hour === 19 && minute === 30) {
                    continue;
                }
                const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
                if (isPastTimeForToday(date, time)) {
                    continue;
                }
                const duration = addDuration(date, time, durationMinutes);
                const isAvailable = !hasProfessionalConflict(userEvents, professionalId, duration.start, duration.end);

                if (isAvailable) {
                    times.push(time);
                }
            }
        }

        return times;
    }

    function updateWizardStep(step) {
        panels.forEach((panel) => {
            panel.hidden = panel.dataset.stepPanel !== String(step);
        });
        if (successPanel) {
            successPanel.hidden = true;
        }
        stepDots.forEach((dot, index) => {
            dot.classList.toggle("active", index + 1 === step);
            dot.classList.toggle("done", index + 1 < step);
        });
        stepLines.forEach((line, index) => {
            line.classList.toggle("done", index + 1 < step);
        });
    }

    function renderServices() {
        const services = getUserServices(targetUser.username);
        servicesWrap.innerHTML = services.map((service) => `
            <button type="button" class="wizard-service-card ${state.service === service.name ? "selected" : ""}" data-select-service="${service.name}">
                <span class="wizard-service-name">${service.name}</span>
                <span class="wizard-service-duration">${service.duration} min</span>
            </button>
        `).join("");
        nextServiceButton.disabled = !state.service;
    }

    function renderProfessionals() {
        const professionals = getUserProfessionals(targetUser.username);
        professionalsWrap.innerHTML = professionals.map((professional) => `
            <button type="button" class="wizard-pro-card ${state.professionalId === professional.id ? "selected" : ""}" data-select-professional="${professional.id}" data-professional-name="${professional.title}">
                <div class="wizard-pro-avatar">${professional.title.charAt(0)}</div>
                <div class="wizard-pro-meta">
                    <strong>${professional.title}</strong>
                    <span>Atendimento disponivel para esse servico</span>
                </div>
            </button>
        `).join("");
        nextProfessionalButton.disabled = !state.professionalId;
    }

    function renderAvailableTimes() {
        if (!state.service || !state.professionalId || !state.date) {
            timesWrap.innerHTML = '<div class="empty-state">Escolha servico, profissional e data para ver os horarios.</div>';
            nextSummaryButton.disabled = true;
            return;
        }

        const availableTimes = getAvailableTimes(state.date, state.professionalId);
        timesWrap.innerHTML = availableTimes.length
            ? availableTimes.map((time) => `
                <button type="button" class="wizard-time-slot ${state.time === time ? "selected" : ""}" data-select-time="${time}">${time}</button>
            `).join("")
            : '<div class="empty-state">Nenhum horario disponivel nessa data.</div>';
        validateStepThree();
    }

    function validateStepThree() {
        state.name = nameInput?.value.trim() || "";
        state.phone = phoneInput?.value.trim() || "";
        state.date = dateInput?.value || "";
        const isValid = state.name.length > 2 && state.phone.length > 7 && state.date && state.time;
        nextSummaryButton.disabled = !isValid;
    }

    function renderSummary() {
        summaryWrap.innerHTML = `
            <div class="wizard-summary-row"><span>Servico</span><span>${state.service || "—"}</span></div>
            <div class="wizard-summary-row"><span>Profissional</span><span>${state.professionalName || "—"}</span></div>
            <div class="wizard-summary-row"><span>Data</span><span>${state.date || "—"}</span></div>
            <div class="wizard-summary-row"><span>Horario</span><span>${state.time || "—"}</span></div>
            <div class="wizard-summary-row"><span>Cliente</span><span>${state.name || "—"}</span></div>
            <div class="wizard-summary-row"><span>Telefone</span><span>${state.phone || "—"}</span></div>
        `;
    }

    function resetWizard() {
        state.service = null;
        state.professionalId = null;
        state.professionalName = null;
        state.date = "";
        state.time = "";
        state.name = "";
        state.phone = "";
        if (nameInput) { nameInput.value = ""; }
        if (phoneInput) { phoneInput.value = ""; }
        if (dateInput) { dateInput.value = ""; }
        hidePublicStatus();
        renderServices();
        renderProfessionals();
        renderAvailableTimes();
        updateWizardStep(1);
    }

    if (!targetUser) {
        showPublicStatus("Nao encontramos um usuario valido para esse link de agendamento.");
        return;
    }

    if (logo) {
        logo.src = normalizeLogoPath(targetUser.logo);
    }
    if (title) {
        title.textContent = targetUser.companyName || targetUser.name || targetUser.username;
    }
    if (subtitle) {
        subtitle.textContent = "Selecione o servico, a profissional e finalize o agendamento em poucos passos.";
    }

    dateInput.min = formatDateOnly(new Date());
    renderServices();
    renderProfessionals();
    renderAvailableTimes();
    updateWizardStep(1);

    servicesWrap?.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) { return; }
        const button = target.closest("[data-select-service]");
        if (!(button instanceof HTMLElement)) { return; }
        state.service = button.dataset.selectService || null;
        state.time = "";
        renderServices();
        renderAvailableTimes();
    });

    professionalsWrap?.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) { return; }
        const button = target.closest("[data-select-professional]");
        if (!(button instanceof HTMLElement)) { return; }
        state.professionalId = button.dataset.selectProfessional || null;
        state.professionalName = button.dataset.professionalName || null;
        state.time = "";
        renderProfessionals();
        renderAvailableTimes();
    });

    timesWrap?.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) { return; }
        const button = target.closest("[data-select-time]");
        if (!(button instanceof HTMLElement)) { return; }
        state.time = button.dataset.selectTime || "";
        renderAvailableTimes();
    });

    nameInput?.addEventListener("input", validateStepThree);
    phoneInput?.addEventListener("input", validateStepThree);
    dateInput?.addEventListener("change", () => {
        state.time = "";
        validateStepThree();
        renderAvailableTimes();
    });

    nextServiceButton?.addEventListener("click", () => updateWizardStep(2));
    nextProfessionalButton?.addEventListener("click", () => updateWizardStep(3));
    document.getElementById("wizard-back-service")?.addEventListener("click", () => updateWizardStep(1));
    document.getElementById("wizard-back-professional")?.addEventListener("click", () => updateWizardStep(2));
    document.getElementById("wizard-back-details")?.addEventListener("click", () => updateWizardStep(3));

    nextSummaryButton?.addEventListener("click", () => {
        renderSummary();
        updateWizardStep(4);
    });

    confirmButton?.addEventListener("click", () => {
        if (!state.service || !state.professionalId || !state.date || !state.time || !state.name || !state.phone) {
            alert("Preencha tudo antes de confirmar.");
            return;
        }

        if (isPastTimeForToday(state.date, state.time)) {
            alert("Para hoje, escolha um horario futuro.");
            updateWizardStep(3);
            renderAvailableTimes();
            return;
        }

        const selectedService = getCurrentService();
        const selectedProfessional = getUserProfessionals(targetUser.username).find((professional) => professional.id === state.professionalId);

        if (!selectedProfessional) {
            alert("Nao encontramos uma profissional livre nesse horario. Escolha outro horario.");
            updateWizardStep(3);
            renderAvailableTimes();
            return;
        }

        const duration = addDuration(state.date, state.time, selectedService?.duration || 60);
        if (hasProfessionalConflict(getUserEvents(targetUser.username), selectedProfessional.id, duration.start, duration.end)) {
            alert("Esse horario acabou de ser ocupado. Escolha outro horario.");
            updateWizardStep(3);
            renderAvailableTimes();
            return;
        }

        const newEvent = {
            title: `${state.service} - ${state.name}`,
            start: duration.start,
            end: duration.end,
            resourceId: selectedProfessional.id,
            backgroundColor: getEventColor(state.service),
            extendedProps: { telefone: state.phone, owner: targetUser.username, externalBooking: true }
        };

        saveUserEvents(targetUser.username, [...getUserEvents(targetUser.username), newEvent]);
        hidePublicStatus();
        panels.forEach((panel) => { panel.hidden = true; });
        if (successPanel) {
            successPanel.hidden = false;
        }
        stepDots.forEach((dot) => {
            dot.classList.remove("active");
            dot.classList.add("done");
        });
        stepLines.forEach((line) => line.classList.add("done"));
    });

    resetButton?.addEventListener("click", resetWizard);
}

function initAdminDashboard() {
    // aqui eu controlo toda a logica do painel admin
    const usersOverview = document.getElementById("admin-users-overview");
    if (!usersOverview) { return; }
    const currentUser = getCurrentUser();
    if (!isLoggedIn() || !currentUser || currentUser.role !== "admin") {
        window.location.href = "index.html";
        return;
    }

    const usersDrawer = document.getElementById("admin-users-drawer");
    const billsDrawer = document.getElementById("admin-bills-drawer");
    const backdrop = document.getElementById("admin-drawer-backdrop");
    const openUsersPanel = document.getElementById("open-admin-users-panel");
    const openBillsPanel = document.getElementById("open-admin-bills-panel");
    const closeUsersPanel = document.getElementById("close-admin-users-panel");
    const closeBillsPanel = document.getElementById("close-admin-bills-panel");
    const adminUsersList = document.getElementById("admin-users-list");
    const adminUserForm = document.getElementById("admin-user-form");
    const billForm = document.getElementById("admin-bill-form");
    const adminBillsList = document.getElementById("admin-bills-list");
    const adminUserSelect = document.getElementById("admin-bill-user");
    const adminBillSearch = document.getElementById("admin-bill-search");
    const adminHelpList = document.getElementById("admin-help-list");

    function closeAdminDrawers() {
        [usersDrawer, billsDrawer].forEach((drawer) => {
            if (drawer) {
                drawer.classList.remove("is-open");
                drawer.setAttribute("aria-hidden", "true");
            }
        });
        if (backdrop) {
            backdrop.hidden = true;
        }
    }

    function openAdminDrawer(drawer) {
        if (!drawer || !backdrop) { return; }
        closeAdminDrawers();
        drawer.classList.add("is-open");
        drawer.setAttribute("aria-hidden", "false");
        backdrop.hidden = false;
    }

    function renderUsersOverview() {
        // painel principal com resumo dos usuarios
        const users = getStoredUsers().filter((user) => user.role !== "admin");
        usersOverview.innerHTML = users.length
            ? users.map((user) => `
                <div class="settings-item">
                    <div>
                        <strong>${user.name} ${user.lastname}</strong>
                        <span>${user.username} | ${user.email}</span>
                        <span>Plano: ${getPlanMeta(user.planId).name} | Status: ${user.planStatus}</span>
                    </div>
                    <span class="status-pill ${user.planStatus === "active" ? "paid" : ""}">${user.planStatus}</span>
                </div>
            `).join("")
            : "<p class=\"empty-state\">Nenhum usuario cadastrado ainda.</p>";
    }

    function renderUsersManagement() {
        // lista completa para eu criar, editar logo e excluir usuario
        const users = getStoredUsers().filter((user) => user.role !== "admin");
        adminUsersList.innerHTML = users.length
            ? users.map((user) => `
                <div class="settings-item">
                    <div>
                        <strong>${user.name} ${user.lastname}</strong>
                        <span>${user.username} | ${user.email}</span>
                        <span>Logo atual pronta para troca a qualquer momento</span>
                    </div>
                    <div class="admin-user-actions">
                        <input type="file" class="inline-file" data-logo-file="${user.username}" accept="image/*">
                        <button type="button" class="secondary-btn" data-update-logo="${user.username}">Salvar logo</button>
                        <button type="button" class="danger-btn" data-remove-user="${user.username}">Excluir</button>
                    </div>
                </div>
            `).join("")
            : "<p class=\"empty-state\">Nenhum usuario cadastrado ainda.</p>";
        adminUserSelect.innerHTML = users.map((user) => `<option value="${user.username}">${user.username}</option>`).join("");
    }

    function renderBillsManagement() {
        // aqui eu organizei os boletos por usuario com busca e card que abre ao clicar
        const searchTerm = adminBillSearch?.value?.trim().toLowerCase() || "";
        const users = getStoredUsers().filter((user) =>
            user.role !== "admin" && (
                !searchTerm ||
                `${user.name} ${user.lastname}`.toLowerCase().includes(searchTerm) ||
                user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            )
        );
        const bills = getStoredBills();
        adminBillsList.innerHTML = users.length
            ? users.map((user) => {
                const userBills = bills.filter((bill) => bill.username === user.username);
                const planMeta = getPlanMeta(user.planId);
                const planStatus = user.planStatus === "active"
                    ? "ativo"
                    : user.planStatus === "pending"
                        ? "aguardando pagamento"
                        : "sem plano";
                return `
                    <details class="bill-accordion">
                        <summary>
                            <div class="bill-accordion-head">
                                <strong>${user.name} ${user.lastname}</strong>
                                <span>${user.username} | ${user.email}</span>
                            </div>
                            <span class="bill-accordion-icon">+</span>
                        </summary>
                        <div class="bill-accordion-body">
                            <div class="bill-user-meta">
                                <div class="settings-item">
                                    <div>
                                        <strong>Informacoes do usuario</strong>
                                        <span>Email: ${user.email}</span>
                                        <span>Telefone: ${user.phone || "Nao informado"}</span>
                                        <span>Login: ${user.username}</span>
                                    </div>
                                </div>
                                <div class="settings-item">
                                    <div>
                                        <strong>Plano atual</strong>
                                        <span>${planMeta.name}</span>
                                        <span>Status: ${planStatus}</span>
                                        <span>Vencimento: ${user.planDueDay || "--"} de cada mes</span>
                                    </div>
                                </div>
                            </div>
                            <div class="settings-list">
                                ${userBills.length ? userBills.map((bill) => `
                                    <div class="settings-item">
                                        <div>
                                            <strong>${bill.description}</strong>
                                            <span>Vencimento: ${bill.dueDate} | R$ ${bill.amount}</span>
                                            <span>Pagamento: ${PAYMENT_LABELS[bill.paymentMethod] || bill.paymentMethod}</span>
                                        </div>
                                        <span class="status-pill ${bill.status === "pago" ? "paid" : ""}">${bill.status}</span>
                                    </div>
                                `).join("") : '<p class="empty-state">Sem boletos para esse usuario.</p>'}
                            </div>
                        </div>
                    </details>
                `;
            }).join("")
            : "<p class=\"empty-state\">Nenhum usuario encontrado para essa busca.</p>";
    }

    function renderHelpCenter() {
        // central onde eu consigo responder os chamados dos usuarios
        const requests = getStoredHelpRequests().filter((request) => request.username !== "admin");
        adminHelpList.innerHTML = requests.length
            ? requests.map((request) => `
                <div class="support-card">
                    <div class="support-card-head">
                        <div>
                            <strong>${request.username} - ${request.subject}</strong>
                            <span>${request.email}</span>
                        </div>
                        <span class="status-pill ${request.status === "respondido" ? "paid" : ""}">${request.status}</span>
                    </div>
                    <p class="support-text">${request.message}</p>
                    <textarea class="support-response" data-help-response="${request.id}" placeholder="Escreva a resposta">${request.response || ""}</textarea>
                    <button type="button" class="secondary-btn" data-send-help="${request.id}">Enviar resposta</button>
                </div>
            `).join("")
            : "<p class=\"empty-state\">Nenhum chamado de ajuda aberto.</p>";
    }

    openUsersPanel?.addEventListener("click", () => openAdminDrawer(usersDrawer));
    openBillsPanel?.addEventListener("click", () => openAdminDrawer(billsDrawer));
    closeUsersPanel?.addEventListener("click", closeAdminDrawers);
    closeBillsPanel?.addEventListener("click", closeAdminDrawers);
    backdrop?.addEventListener("click", closeAdminDrawers);
    adminBillSearch?.addEventListener("input", renderBillsManagement);

    adminUserForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(adminUserForm);
        const username = formData.get("username")?.toString().trim();
        const email = formData.get("email")?.toString().trim();
        const users = getStoredUsers();
        if (!isValidEmail(email)) { alert("Digite um email valido."); return; }
        if (users.some((user) => user.username === username)) { alert("Esse usuario ja existe."); return; }
        if (users.some((user) => user.email === email)) { alert("Esse email ja esta cadastrado."); return; }
        let logoData = DEFAULT_LOGO;
        try {
            logoData = await readFileAsDataURL(formData.get("logo_file"));
        } catch (error) {
            alert("Nao foi possivel carregar a imagem do logo.");
            return;
        }
        users.push({
            id: `user-${Date.now()}`,
            role: "user",
            name: formData.get("name")?.toString().trim(),
            lastname: formData.get("lastname")?.toString().trim(),
            email,
            phone: formData.get("phone")?.toString().trim(),
            username,
            password: formData.get("password")?.toString().trim(),
            companyName: formData.get("name")?.toString().trim(),
            logo: logoData,
            planId: "none",
            planStatus: "inactive",
            paymentMethod: ""
        });
        saveUsers(users);
        renderUsersOverview();
        renderUsersManagement();
        renderBillsManagement();
        adminUserForm.reset();
    });

    billForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(billForm);
        const username = formData.get("username")?.toString();
        const user = getStoredUsers().find((item) => item.username === username);
        if (!user) { return; }
        const billType = formData.get("billType")?.toString();
        const bills = getStoredBills();
        bills.push({
            id: `bill-${Date.now()}`,
            username,
            description: formData.get("description")?.toString(),
            dueDate: formData.get("dueDate")?.toString(),
            amount: formData.get("amount")?.toString(),
            status: "pendente",
            billType,
            paymentMethod: "boleto",
            planId: billType === "plan" ? user.planId : "none"
        });
        saveBills(bills);
        renderBillsManagement();
        billForm.reset();
    });

    adminUsersList?.addEventListener("click", async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) { return; }
        if (target.dataset.removeUser) {
            const username = target.dataset.removeUser;
            saveUsers(getStoredUsers().filter((user) => user.username !== username));
            saveBills(getStoredBills().filter((bill) => bill.username !== username));
            saveHelpRequests(getStoredHelpRequests().filter((request) => request.username !== username));
            saveEvents(getStoredEvents().filter((event) => event.extendedProps?.owner !== username));
            saveProfessionals(getStoredProfessionals().filter((professional) => professional.owner !== username));
            saveServices(getStoredServices().filter((service) => typeof service === "string" || service.owner !== username));
            renderUsersOverview();
            renderUsersManagement();
            renderBillsManagement();
            renderHelpCenter();
            return;
        }
        if (target.dataset.updateLogo) {
            const username = target.dataset.updateLogo;
            const input = adminUsersList.querySelector(`[data-logo-file="${username}"]`);
            const file = input instanceof HTMLInputElement ? input.files?.[0] : null;
            if (!file) {
                alert("Escolha uma imagem antes de salvar o logo.");
                return;
            }
            try {
                const logo = await readFileAsDataURL(file);
                updateUser({ username, logo });
            } catch (error) {
                alert("Nao foi possivel carregar a imagem do logo.");
                return;
            }
            if (input instanceof HTMLInputElement) {
                input.value = "";
            }
            renderUsersOverview();
            renderUsersManagement();
            alert("Logo atualizada com sucesso. Voce pode trocar novamente quando quiser.");
        }
    });

    adminHelpList?.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement) || !target.dataset.sendHelp) { return; }
        const requestId = target.dataset.sendHelp;
        const textarea = adminHelpList.querySelector(`[data-help-response="${requestId}"]`);
        const response = textarea instanceof HTMLTextAreaElement ? textarea.value.trim() : "";
        saveHelpRequests(getStoredHelpRequests().map((request) =>
            request.id === requestId ? { ...request, response, status: response ? "respondido" : "enviado" } : request
        ));
        renderHelpCenter();
    });

    renderUsersOverview();
    renderUsersManagement();
    renderBillsManagement();
    renderHelpCenter();
}

function initMenu() {
    const items = document.querySelectorAll(".menu li");
    if (!items.length) { return; }
    items.forEach((item) => {
        item.addEventListener("click", () => {
            const current = document.querySelector(".menu .active");
            if (current) { current.classList.remove("active"); }
            item.classList.add("active");
        });
    });
}

function initLogout() {
    const logoutButton = document.querySelector(".logout");
    if (!logoutButton) { return; }
    logoutButton.addEventListener("click", () => {
        clearSession();
        alert("Voce foi redirecionado para a pagina de login.");
        window.location.href = "index.html";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // quando a pagina abre, eu inicializo tudo que o sistema precisa
    ensureBaseData();
    initLoginForm();
    initRegisterForm();
    initRecoveryForm();
    initResetPasswordForm();
    initDashboard();
    initPublicBookingPage();
    initAdminDashboard();
    initMenu();
    initLogout();
});
