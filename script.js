// --- State ---
const KEY = "mymony:transactions";
let tx = JSON.parse(localStorage.getItem(KEY) || "[]");

// --- DOM ---
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const txForm = $("#txForm");
const titleEl = $("#title");
const amountEl = $("#amount");
const typeEl = $("#type");
const listEl = $("#txList");
const searchEl = $("#search");
const filterEl = $("#filterType");
const resetBtn = $("#resetAll");
const sumIncomeEl = $("#sumIncome");
const sumExpenseEl = $("#sumExpense");
const sumTotalEl = $("#sumTotal");

// --- Utils ---
const fmt = (n) =>
  Number(n).toLocaleString("th-TH", { style: "currency", currency: "THB" });

const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

function save() { localStorage.setItem(KEY, JSON.stringify(tx)); }

function recalc() {
  const income = tx.filter(t => t.type === "income").reduce((a,b)=>a+b.amount,0);
  const expense = tx.filter(t => t.type === "expense").reduce((a,b)=>a+b.amount,0);
  const total = income - expense;
  sumIncomeEl.textContent  = `+ ${fmt(income)}`;
  sumExpenseEl.textContent = `− ${fmt(expense)}`;
  sumTotalEl.textContent   = fmt(total);
  sumTotalEl.classList.toggle("text-rose-600", total < 0);
  sumTotalEl.classList.toggle("text-slate-800", total >= 0);
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  const filter = filterEl.value; // all | income | expense

  listEl.innerHTML = "";
  tx
    .filter(t => (filter === "all" ? true : t.type === filter))
    .filter(t => t.title.toLowerCase().includes(q))
    .sort((a,b) => b.createdAt - a.createdAt)
    .forEach(t => {
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `
        <span class="badge ${t.type === "income" ? "badge-income" : "badge-expense"}">
          ${t.type === "income" ? "รายรับ" : "รายจ่าย"}
        </span>
        <div class="grow">
          <div class="title">${escapeHtml(t.title)}</div>
          <div class="meta">${new Date(t.createdAt).toLocaleString("th-TH")}</div>
        </div>
        <div class="amount ${t.type}">${t.type === "income" ? "+" : "−"} ${fmt(t.amount)}</div>
        <button class="clear-btn ml-3" data-id="${t.id}" aria-label="ลบ">ลบ</button>
      `;
      listEl.appendChild(li);
    });

  recalc();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

// --- Events ---
txForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleEl.value.trim();
  const amount = Number(amountEl.value);
  const type = typeEl.value;

  if (!title || !amount || isNaN(amount)) return;

  tx.push({ id: id(), title, amount: Math.abs(amount), type, createdAt: Date.now() });
  save();
  txForm.reset();
  render();
});

listEl.addEventListener("click", (e) => {
  const id = e.target.dataset?.id;
  if (!id) return;
  tx = tx.filter(t => t.id !== id);
  save();
  render();
});

[searchEl, filterEl].forEach(el => el.addEventListener("input", render));

resetBtn.addEventListener("click", () => {
  if (!confirm("ลบข้อมูลทั้งหมด?")) return;
  tx = [];
  save();
  render();
});

// --- Init ---
render();
