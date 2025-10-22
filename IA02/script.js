class Calculator {
  constructor() {
    this.display = document.getElementById("mainDisplay");
    this.historyDisplay = document.getElementById("historyDisplay");
    this.currentValue = "0";
    this.previousValue = "";
    this.operator = null;
    this.shouldResetDisplay = false;
    this.memory = 0;
    this.history = [];

    this.initializeEventListeners();
    this.updateDisplay();
  }

  initializeEventListeners() {
    // Number buttons
    document.querySelectorAll(".number-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        const number = e.target.dataset.number;

        if (action === "decimal") this.addDecimal();
        else if (action === "negate") this.negate();
        else if (action === "percent") this.percentage();
        else if (action === "reciprocal") this.reciprocal();
        else if (action === "square") this.square();
        else if (action === "sqrt") this.squareRoot();
        else if (number) this.appendNumber(number);
      });
    });

    // Operator buttons
    document.querySelectorAll(".operator-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const operator = e.target.dataset.operator;
        this.setOperator(operator);
      });
    });

    // Function buttons (clear, delete, etc.)
    document.querySelectorAll(".function-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        this.handleFunction(action);
      });
    });

    // Equals button
    document.querySelector(".equals-btn").addEventListener("click", () => {
      this.calculate();
    });

    // Memory buttons
    document.getElementById("mcBtn").addEventListener("click", () => this.memoryClear());
    document.getElementById("mrBtn").addEventListener("click", () => this.memoryRecall());
    document.getElementById("mPlusBtn").addEventListener("click", () => this.memoryAdd());
    document.getElementById("mMinusBtn").addEventListener("click", () => this.memorySubtract());
    document.getElementById("msBtn").addEventListener("click", () => this.memoryStore());

    // Keyboard support
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));

    // Sidebar controls
    document.getElementById("historyBtn").addEventListener("click", () => this.toggleHistory());
    document.getElementById("memoryBtn").addEventListener("click", () => this.toggleMemory());

    // Sidebar tab switching
    document.getElementById("historyTab").addEventListener("click", () => {
    this.showTab("history")
    })

    document.getElementById("memoryTab").addEventListener("click", () => {
    this.showTab("memory")
    })
    // Close sidebar button
    document.getElementById("closePanelBtn").addEventListener("click", () => {
      document.getElementById("sidePanel").classList.remove("open");
    });

    // Close sidebar when clicking outside (optional)
    document.addEventListener("click", (e) => {
      const sidePanel = document.getElementById("sidePanel");
      const isClickInsideSidebar = sidePanel.contains(e.target);
      const isClickOnToggleBtn = e.target.id === "historyBtn" || e.target.id === "memoryBtn";
      
      if (!isClickInsideSidebar && !isClickOnToggleBtn && sidePanel.classList.contains("open")) {
        sidePanel.classList.remove("open");
      }
    });
  }

  // ==========================
  // Sidebar & Display Management
  // ==========================
  toggleHistory() {
    const sidePanel = document.getElementById("sidePanel");
    sidePanel.classList.add("open");
    this.showTab("history");
  }

  toggleMemory() {
    const sidePanel = document.getElementById("sidePanel");
    sidePanel.classList.add("open");
    this.showTab("memory");
  }

  showTab(tab) {
    document.querySelectorAll(".tab").forEach((btn) => btn.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.remove("active"));

    if (tab === "history") {
      document.getElementById("historyTab").classList.add("active");
      document.getElementById("historyContent").classList.add("active");
    } else {
      document.getElementById("memoryTab").classList.add("active");
      document.getElementById("memoryContent").classList.add("active");
    }
  }

  // ==========================
  // Memory Operations
  // ==========================
  addToHistory(expression) {
    const historyContent = document.getElementById("historyContent");
    const entry = document.createElement("div");
    entry.textContent = expression;
    historyContent.prepend(entry);
  }

  updateMemoryPanel() {
    const memoryContent = document.getElementById("memoryContent");
    memoryContent.innerHTML = "";
    if (this.memory !== 0) {
      const memEntry = document.createElement("div");
      memEntry.textContent = this.memory;
      memoryContent.appendChild(memEntry);
    }
  }

  memoryClear() {
    this.memory = 0;
    this.updateMemoryPanel();
  }

  memoryRecall() {
    this.currentValue = String(this.memory);
    this.shouldResetDisplay = true;
    this.updateDisplay();
  }

  memoryAdd() {
    this.memory += Number.parseFloat(this.currentValue);
    this.updateMemoryPanel();
    this.shouldResetDisplay = true;
  }

  memorySubtract() {
    this.memory -= Number.parseFloat(this.currentValue);
    this.updateMemoryPanel();
    this.shouldResetDisplay = true;
  }

  memoryStore() {
    this.memory = Number.parseFloat(this.currentValue);
    this.updateMemoryPanel();
    this.shouldResetDisplay = true;
  }

  // ==========================
  // Core Calculator Functions
  // ==========================
  appendNumber(number) {
    if (this.shouldResetDisplay) {
      this.currentValue = number;
      this.shouldResetDisplay = false;
    } else {
      this.currentValue = this.currentValue === "0" ? number : this.currentValue + number;
    }
    this.updateDisplay();
  }

  addDecimal() {
    if (this.shouldResetDisplay) {
      this.currentValue = "0.";
      this.shouldResetDisplay = false;
    } else if (!this.currentValue.includes(".")) {
      this.currentValue += ".";
    }
    this.updateDisplay();
  }

  negate() {
    this.currentValue = String(-Number(this.currentValue));
    this.updateDisplay();
  }

  percentage() {
    const current = Number(this.currentValue);
    
    // Nếu có operator trước đó (ví dụ: 200 + 10%)
    if (this.operator && this.previousValue) {
      const prev = Number(this.previousValue);
      
      switch (this.operator) {
        case "+":
        case "-":
          // 200 + 10% → 10 biến thành 200 * 10% = 20
          this.currentValue = String(prev * current / 100);
          break;
        case "*":
        case "/":
          // 200 * 10% → 10 biến thành 10/100 = 0.1
          this.currentValue = String(current / 100);
          break;
      }
    } else {
      // Không có operator → chỉ chia cho 100
      // 50% → 0.5
      this.currentValue = String(current / 100);
    }
    
    this.updateDisplay();
  }

  reciprocal() {
    const current = Number.parseFloat(this.currentValue);
    if (current === 0) {
      this.currentValue = "Cannot divide by zero";
    } else {
      this.currentValue = String(1 / current);
    }
    this.updateDisplay();
  }
  square() {
    const current = Number.parseFloat(this.currentValue);
    this.currentValue = String(current * current);
    this.updateDisplay();
  }
  squareRoot() {
    const current = Number.parseFloat(this.currentValue);
    if (current < 0) {
      this.currentValue = "Invalid input";
    }
    else {
      this.currentValue = String(Math.sqrt(current));
    }
    this.updateDisplay();
  }

  setOperator(operator) {
    if (this.operator !== null && !this.shouldResetDisplay) this.calculate();
    this.operator = operator;
    this.previousValue = this.currentValue;
    this.shouldResetDisplay = true;
  }

  handleFunction(action) {
    switch (action) {
      case "clear":
        this.clear();
        break;
      case "backspace":
        this.delete();
        break;
      case "ce":
        this.currentValue = "0";
        this.updateDisplay();
        break;
      default:
        break;
    }
  }

  clear() {
    this.currentValue = "0";
    this.previousValue = "";
    this.operator = null;
    this.updateDisplay();
  }

  delete() {
    this.currentValue = this.currentValue.slice(0, -1) || "0";
    this.updateDisplay();
  }

  calculate() {
    if (this.operator === null || this.shouldResetDisplay) return;

    const prev = Number.parseFloat(this.previousValue);
    const current = Number.parseFloat(this.currentValue);
    let result;

    switch (this.operator) {
      case "+": result = prev + current; break;
      case "-": result = prev - current; break;
      case "*": result = prev * current; break;
      case "/":
        if (current === 0) {
          this.currentValue = "Cannot divide by zero";
          this.operator = null;
          this.previousValue = "";
          this.shouldResetDisplay = true;
          this.updateDisplay();
          return;
        }
        result = prev / current;
        break;
      default: return;
    }

    const expression = `${this.previousValue} ${this.operator} ${this.currentValue} = ${result}`;
    this.history.push(expression);
    this.addToHistory(expression);

    this.currentValue = String(this.formatResult(result));
    this.operator = null;
    this.previousValue = "";
    this.shouldResetDisplay = true;
    this.updateDisplay();
  }

  // ==========================
  // Helpers
  // ==========================
  formatResult(num) {
    return Number.isInteger(num) ? num : parseFloat(num.toFixed(6));
  }

  updateDisplay() {
    this.display.textContent = this.currentValue;
    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    if (this.operator && this.previousValue) {
      const operatorSymbol = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷'
      }[this.operator] || this.operator;
      
      this.historyDisplay.textContent = `${this.previousValue} ${operatorSymbol}`;
    } else {
      this.historyDisplay.textContent = '';
    }
  }

  handleKeyboard(e) {
    if (e.key >= "0" && e.key <= "9") this.appendNumber(e.key);
    if (e.key === ".") this.addDecimal();
    if (e.key === "Enter" || e.key === "=") this.calculate();
    if (["+", "-", "*", "/"].includes(e.key)) this.setOperator(e.key);
    if (e.key === "Backspace") this.delete();
    if (e.key === "Escape") this.clear();
  }
}

// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const calc = new Calculator()
})