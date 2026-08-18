/* =====================================================
   IMPORTS
===================================================== */

import * as Storage from "./storage.js";
import * as Transactions from "./transactions.js";
import * as Categories from "./categories.js";
import * as Budgets from "./budgets.js";
import * as Statistics from "./statistics.js";

/* =====================================================
   VARIABLES GLOBALES
===================================================== */

let currentPage = "dashboard";
let currentMonth = "";
let currentEditId = null;

/* =====================================================
   INITIALISATION
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initNavigation();

    initForms();

    loadDefaultMonth();

    renderAll();

});

/* =====================================================
   NAVIGATION
===================================================== */

function initNavigation() {

    const buttons = document.querySelectorAll(".menu");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            openPage(page);

        });

    });

}

function openPage(pageName) {

    currentPage = pageName;

    document.querySelectorAll(".page").forEach(page => {

        page.classList.remove("active");

    });

    document.querySelectorAll(".menu").forEach(button => {

        button.classList.remove("active");

    });

    const page = document.getElementById(pageName + "-page");

    if (page) {

        page.classList.add("active");

    }

    const menu = document.querySelector(`[data-page="${pageName}"]`);

    if (menu) {

        menu.classList.add("active");

    }

    const title = document.getElementById("page-title");

    if (title) {

        switch (pageName) {

            case "dashboard":
                title.textContent = "Tableau de bord";
                break;

            case "transactions":
                title.textContent = "Transactions";
                break;

            case "categories":
                title.textContent = "Catégories";
                break;

            case "budgets":
                title.textContent = "Budgets";
                break;

            case "statistics":
                title.textContent = "Statistiques";
                break;

            case "export":
                title.textContent = "Export";
                break;

            case "settings":
                title.textContent = "Paramètres";
                break;
        }

    }

}

/* =====================================================
   MOIS PAR DÉFAUT
===================================================== */

function loadDefaultMonth() {

    currentMonth = new Date().toISOString().slice(0, 7);

    const monthFilter = document.getElementById("month-filter");
    const budgetMonth = document.getElementById("budget-month");

    if (monthFilter) {

        monthFilter.value = currentMonth;

    }

    if (budgetMonth) {

        budgetMonth.value = currentMonth;

    }

}

/* =====================================================
   FONCTIONS D'INITIALISATION
===================================================== */

function initForms() {

    // Les événements des formulaires
    // seront ajoutés dans la Partie 2.

}

/* =====================================================
   RENDER GLOBAL
===================================================== */

function renderAll() {

    renderDashboard();

    renderTransactions();

    renderCategories();

    renderBudgets();

    renderStatistics();

}
/* =====================================================
   FORMULAIRES
===================================================== */

function initForms() {

    /* ---------- Transaction ---------- */

    const transactionForm = document.getElementById("transaction-form");

    transactionForm?.addEventListener("submit", (event) => {

        event.preventDefault();

        addTransaction();

    });

    /* ---------- Catégorie ---------- */

    const categoryForm = document.getElementById("category-form");

    categoryForm?.addEventListener("submit", (event) => {

        event.preventDefault();

        addCategory();

    });

    /* ---------- Budget global ---------- */

    const globalBudgetForm = document.getElementById("global-budget-form");

    globalBudgetForm?.addEventListener("submit", (event) => {

        event.preventDefault();

        saveGlobalBudget();

    });

    /* ---------- Budget catégorie ---------- */

    const categoryBudgetForm = document.getElementById("category-budget-form");

    categoryBudgetForm?.addEventListener("submit", (event) => {

        event.preventDefault();

        saveCategoryBudget();

    });

    /* ---------- Recherche ---------- */

    document
        .getElementById("search")
        ?.addEventListener("input", renderTransactions);

    /* ---------- Filtres ---------- */

    document
        .getElementById("month-filter")
        ?.addEventListener("change", renderAll);

    document
        .getElementById("type-filter")
        ?.addEventListener("change", renderTransactions);

    document
        .getElementById("category-filter")
        ?.addEventListener("change", renderTransactions);

}

/* =====================================================
   AJOUT TRANSACTION
===================================================== */

function addTransaction() {

    const amount = Number(
        document.getElementById("amount").value
    );

    const label = document
        .getElementById("label")
        .value
        .trim();

    const date = document
        .getElementById("date")
        .value;

    const type = document
        .getElementById("type")
        .value;

    const category = document
        .getElementById("category")
        .value;

    if (!amount || amount <= 0) {

        alert("Montant invalide.");
        return;

    }

    if (!label) {

        alert("Description obligatoire.");
        return;

    }

    if (!date) {

        alert("Date obligatoire.");
        return;

    }

    Transactions.addTransaction({

        type,
        amount,
        label,
        date,
        category

    });

    document.getElementById("transaction-form").reset();

    renderAll();

}

/* =====================================================
   AJOUT CATÉGORIE
===================================================== */

function addCategory() {

    const input = document.getElementById("new-category");

    const type = document.getElementById("category-type").value;

    const name = input.value.trim();

    if (!name) {

        alert("Nom de catégorie vide.");

        return;

    }

    Categories.addCategory({

        name,
        type

    });

    input.value = "";

    renderCategories();

}

/* =====================================================
   ENREGISTRER BUDGET GLOBAL
===================================================== */

function saveGlobalBudget() {

    const month = document
        .getElementById("budget-month")
        .value;

    const limit = Number(

        document
            .getElementById("global-budget")
            .value

    );

    if (!month || limit <= 0) {

        alert("Budget invalide.");

        return;

    }

    Budgets.setMonthlyBudget(

        month,
        limit

    );

    renderBudgets();

}

/* =====================================================
   ENREGISTRER BUDGET CATÉGORIE
===================================================== */

function saveCategoryBudget() {

    const month = document
        .getElementById("budget-month")
        .value;

    const category = document
        .getElementById("budget-category")
        .value;

    const limit = Number(

        document
            .getElementById("budget-category-amount")
            .value

    );

    if (!category || limit <= 0) {

        alert("Budget invalide.");

        return;

    }

    Budgets.setCategoryBudget(

        month,
        category,
        limit

    );

    renderBudgets();

}

/* =====================================================
   RECHERCHE
===================================================== */

function getSearchText() {

    return document
        .getElementById("search")
        .value
        .trim()
        .toLowerCase();

}

/* =====================================================
   FILTRES
===================================================== */

function getFilters() {

    return {

        month:

            document
                .getElementById("month-filter")
                .value,

        type:

            document
                .getElementById("type-filter")
                .value,

        category:

            document
                .getElementById("category-filter")
                .value,

        search:

            getSearchText()

    };

}
/* =====================================================
   RENDER DASHBOARD
===================================================== */

function renderDashboard() {

    const stats = Statistics.getStats();

    document.getElementById("revenus").textContent =
        stats.income.toFixed(2) + " €";

    document.getElementById("depenses").textContent =
        stats.expense.toFixed(2) + " €";

    document.getElementById("solde").textContent =
        stats.balance.toFixed(2) + " €";

    const summary =
        Budgets.getMonthlyBudgetSummary(currentMonth);

    document.getElementById("budget-restant").textContent =
        summary.remaining.toFixed(2) + " €";

    renderLastTransactions();

}

/* =====================================================
   DERNIÈRES TRANSACTIONS
===================================================== */

function renderLastTransactions() {

    const container =
        document.getElementById("last-transactions");

    container.innerHTML = "";

    const list = Transactions
        .getAllTransactions()
        .slice(-5)
        .reverse();

    list.forEach(tx => {

        const div = document.createElement("div");

        div.className = "transaction-row";

        div.innerHTML = `
            <span>${tx.date}</span>
            <span>${tx.label}</span>
            <span>${tx.category}</span>
            <strong>${tx.amount.toFixed(2)} €</strong>
        `;

        container.appendChild(div);

    });

}

/* =====================================================
   TABLEAU DES TRANSACTIONS
===================================================== */

function renderTransactions() {

    const tbody =
        document.getElementById("transaction-list");

    tbody.innerHTML = "";

    const filters = getFilters();

    let list =
        Transactions.getAllTransactions();

    if (filters.month) {

        list = list.filter(t =>
            t.date.startsWith(filters.month)
        );

    }

    if (filters.type !== "all") {

        list = list.filter(t =>
            t.type === filters.type
        );

    }

    if (filters.category !== "all") {

        list = list.filter(t =>
            t.category === filters.category
        );

    }

    if (filters.search !== "") {

        list = list.filter(t =>
            t.label.toLowerCase().includes(filters.search)
        );

    }

    list.forEach(tx => {

        const tr = document.createElement("tr");

        tr.innerHTML = `

            <td>${tx.date}</td>

            <td>${tx.label}</td>

            <td>${tx.category}</td>

            <td>${tx.type}</td>

            <td>${tx.amount.toFixed(2)} €</td>

            <td>

                <button
                    class="edit-btn"
                    data-id="${tx.id}"
                >
                    ✏️
                </button>

                <button
                    class="delete-btn"
                    data-id="${tx.id}"
                >
                    🗑️
                </button>

            </td>

        `;

        tbody.appendChild(tr);

    });

}

/* =====================================================
   CATÉGORIES
===================================================== */

function renderCategories() {

    const list =
        document.getElementById("category-list");

    list.innerHTML = "";

    const select =
        document.getElementById("category");

    const budgetSelect =
        document.getElementById("budget-category");

    const filterSelect =
        document.getElementById("category-filter");

    select.innerHTML = "";

    budgetSelect.innerHTML = "";

    filterSelect.innerHTML =
        `<option value="all">Toutes les catégories</option>`;

    Categories.getAllCategories().forEach(cat => {

        const div = document.createElement("div");

        div.className = "category-item";

        div.innerHTML = `

            <span>${cat.name}</span>

            <small>${cat.type}</small>

        `;

        list.appendChild(div);

        const option1 =
            document.createElement("option");

        option1.value = cat.name;

        option1.textContent = cat.name;

        select.appendChild(option1);

        const option2 =
            document.createElement("option");

        option2.value = cat.name;

        option2.textContent = cat.name;

        budgetSelect.appendChild(option2);

        const option3 =
            document.createElement("option");

        option3.value = cat.name;

        option3.textContent = cat.name;

        filterSelect.appendChild(option3);

    });

}

/* =====================================================
   BUDGETS
===================================================== */

function renderBudgets() {

    const container =
        document.getElementById("budget-list");

    container.innerHTML = "";

    const budgets =
        Budgets.getAllBudgets();

    budgets.forEach(budget => {

        const summary =
            Budgets.calculateBudgetUsage(
                budget.month,
                budget.category
            );

        const div =
            document.createElement("div");

        div.className = "budget-card";

        div.innerHTML = `

            <h3>

                ${budget.category ?? "Global"}

            </h3>

            <p>

                Budget :
                ${summary.limit.toFixed(2)} €

            </p>

            <p>

                Dépensé :
                ${summary.spent.toFixed(2)} €

            </p>

            <p>

                Restant :
                ${summary.remaining.toFixed(2)} €

            </p>

            <progress
                value="${summary.percent}"
                max="100">
            </progress>

        `;

        container.appendChild(div);

    });

}

/* =====================================================
   STATISTIQUES
===================================================== */

function renderStatistics() {

    Statistics.drawMonthChart(
        "monthChart"
    );

    Statistics.drawYearChart(
        "yearChart"
    );

    Statistics.drawCategoryChart(
        "categoryChart"
    );

}
/////////////////////////////////////////////////////
// GESTION DES CATÉGORIES
/////////////////////////////////////////////////////

function addCategory() {

    const input = document.getElementById("new-category");
    const type = document.getElementById("category-type");

    const name = input.value.trim();

    if (name === "") {
        alert("Entrez un nom de catégorie.");
        return;
    }

    if (!categories[type.value].includes(name)) {

        categories[type.value].push(name);

    } else {

        alert("Cette catégorie existe déjà.");
        return;

    }

    input.value = "";

    updateCategorySelect();
    updateBudgetSelect();

    render();
}

/////////////////////////////////////////////////////
// LISTE DES CATÉGORIES TRANSACTION
/////////////////////////////////////////////////////

function updateCategorySelect() {

    const select = document.getElementById("category");

    if (!select) return;

    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Choisir une catégorie";

    select.appendChild(defaultOption);

    categories.expense.forEach(cat => {

        const option = document.createElement("option");

        option.value = cat;
        option.textContent = cat;

        select.appendChild(option);

    });

}

/////////////////////////////////////////////////////
// LISTE DES CATÉGORIES BUDGET
/////////////////////////////////////////////////////

function updateBudgetSelect() {

    const select = document.getElementById("budget-category");

    if (!select) return;

    select.innerHTML = "";

    categories.expense.forEach(cat => {

        const option = document.createElement("option");

        option.value = cat;
        option.textContent = cat;

        select.appendChild(option);

    });

}

/////////////////////////////////////////////////////
// AJOUT D'UN BUDGET
/////////////////////////////////////////////////////

function setBudget() {

    const category =
        document.getElementById("budget-category").value;

    const amount =
        parseFloat(document.getElementById("budget-amount").value);

    if (!category) {

        alert("Choisissez une catégorie.");
        return;

    }

    if (isNaN(amount) || amount <= 0) {

        alert("Montant invalide.");
        return;

    }

    budgets[category] = amount;

    document.getElementById("budget-amount").value = "";

    render();
}

/////////////////////////////////////////////////////
// AFFICHAGE DES BUDGETS
/////////////////////////////////////////////////////

function renderBudgets() {

    const container = document.getElementById("budget-list");

    if (!container) return;

    container.innerHTML = "";

    Object.entries(budgets).forEach(([category, remaining]) => {

        const card = document.createElement("div");

        card.className = "item";

        card.innerHTML = `
            <span>${category}</span>
            <strong>${remaining.toFixed(2)} €</strong>
        `;

        container.appendChild(card);

    });

}
/* =====================================================
   RENDER COMPLET
===================================================== */

function render() {

    renderTransactions();

    renderDashboard();

    renderBudgets();

    renderCharts();

}

/* =====================================================
   AFFICHAGE TRANSACTIONS
===================================================== */

function renderTransactions() {

    const list = document.getElementById("list");

    if (!list) return;

    list.innerHTML = "";

    const data = getFilteredTransactions();

    data.sort((a, b) => b.date.localeCompare(a.date));

    data.forEach(tx => {

        const item = document.createElement("div");

        item.className = "item";

        item.innerHTML = `

            <div class="transaction-left">

                <strong>${tx.label}</strong>

                <small>

                    ${tx.category}

                    •

                    ${tx.date}

                </small>

            </div>

            <div class="transaction-right">

                <span class="${tx.type}">

                    ${tx.type === "income" ? "+" : "-"}

                    ${tx.amount.toFixed(2)} €

                </span>

            </div>

        `;

        list.appendChild(item);

    });

}

/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard() {

    let income = 0;

    let expense = 0;

    transactions.forEach(tx => {

        if (tx.type === "income") {

            income += tx.amount;

        } else {

            expense += tx.amount;

        }

    });

    const balance = income - expense;

    document.getElementById("revenus").textContent =
        income.toFixed(2) + " €";

    document.getElementById("depenses").textContent =
        expense.toFixed(2) + " €";

    document.getElementById("solde").textContent =
        balance.toFixed(2) + " €";

    updateRemainingBudget();

}

/* =====================================================
   BUDGET RESTANT
===================================================== */

function updateRemainingBudget() {

    let totalBudget = 0;

    Object.values(budgets).forEach(value => {

        totalBudget += value;

    });

    let spent = 0;

    transactions.forEach(tx => {

        if (tx.type === "expense") {

            spent += tx.amount;

        }

    });

    const remaining = totalBudget - spent;

    const element =
        document.getElementById("budget-restant");

    if (!element) return;

    element.textContent =
        remaining.toFixed(2) + " €";

    if (remaining < 0) {

        element.style.color = "#ff4d4d";

    } else {

        element.style.color = "#4CAF50";

    }

}

/* =====================================================
   GRAPHIQUES
===================================================== */

function renderCharts() {

    drawMonthChart();

    drawYearChart();

    drawCategoryChart();

}

/* =====================================================
   FILTRE
===================================================== */

function getFilteredTransactions() {

    const month =
        document.getElementById("month-filter")?.value;

    const type =
        document.getElementById("type-filter")?.value;

    const category =
        document.getElementById("category-filter")?.value;

    return transactions.filter(tx => {

        if (
            month &&
            !tx.date.startsWith(month)
        ) {
            return false;
        }

        if (
            type &&
            type !== "all" &&
            tx.type !== type
        ) {
            return false;
        }

        if (
            category &&
            category !== "all" &&
            tx.category !== category
        ) {
            return false;
        }

        return true;

    });

}