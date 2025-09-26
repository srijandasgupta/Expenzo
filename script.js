    class ExpenseTrackerPro {
            constructor() {
                this.transactions = this.loadTransactions();
                this.filteredTransactions = [...this.transactions];
                this.currentDate = new Date();
                this.currentMonth = this.currentDate.getMonth();
                this.currentYear = this.currentDate.getFullYear();
                this.currentView = 'dashboard';
                this.initializeElements();
                this.attachEventListeners();
                this.setDefaultDate();
                this.updateDisplay();
            }

            initializeElements() {
                // Form elements
                this.form = document.getElementById('transaction-form');
                this.nameInput = document.getElementById('transaction-name');
                this.amountInput = document.getElementById('transaction-amount');
                this.dateInput = document.getElementById('transaction-date');
                this.categorySelect = document.getElementById('transaction-category');
                this.errorMessage = document.getElementById('error-message');

                // Display elements
                this.balanceElement = document.getElementById('balance');
                this.balanceCard = document.getElementById('balance-card');
                this.totalIncomeElement = document.getElementById('total-income');
                this.totalExpensesElement = document.getElementById('total-expenses');
                this.transactionList = document.getElementById('transaction-list');
                this.recentTransactions = document.getElementById('recent-transactions');
                this.transactionCount = document.getElementById('transaction-count');

                // Navigation elements
                this.currentMonthYear = document.getElementById('current-month-year');
                this.prevMonthBtn = document.getElementById('prev-month');
                this.nextMonthBtn = document.getElementById('next-month');
                this.pageTitle = document.getElementById('page-title');

                // Filter elements
                this.searchInput = document.getElementById('search-input');
                this.filterCategory = document.getElementById('filter-category');
                this.filterType = document.getElementById('filter-type');
                this.clearFiltersBtn = document.getElementById('clear-filters');

                // Chart elements
                this.chartTabs = document.querySelectorAll('.chart-tab');
                this.chartViews = document.querySelectorAll('.chart-view');
                this.categoryBars = document.getElementById('category-bars');
                this.typeBars = document.getElementById('type-bars');
                this.analyticsCategoryBars = document.getElementById('analytics-category-bars');
                this.analyticsTypeBars = document.getElementById('analytics-type-bars');

                // Mobile elements
                this.sidebar = document.getElementById('sidebar');
                this.overlay = document.getElementById('overlay');
                this.mobileMenuBtn = document.getElementById('mobile-menu-btn');

                // Other buttons
                this.exportBtn = document.getElementById('export-btn');
                this.clearDataBtn = document.getElementById('clear-data-btn');
                this.addTransactionBtn = document.getElementById('add-transaction-btn');
            }

            attachEventListeners() {
                // Form events
                this.form.addEventListener('submit', (e) => this.handleSubmit(e));

                // Navigation events
                this.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
                this.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));

                // Filter events
                this.searchInput.addEventListener('input', () => this.applyFilters());
                this.filterCategory.addEventListener('change', () => this.applyFilters());
                this.filterType.addEventListener('change', () => this.applyFilters());
                this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());

                // Chart events
                this.chartTabs.forEach(tab => {
                    tab.addEventListener('click', () => this.switchChart(tab.dataset.chart));
                });

                // Mobile menu events
                this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
                this.overlay.addEventListener('click', () => this.closeMobileMenu());

                // View navigation
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.switchView(item.dataset.view);
                    });
                });

                // Other events
                this.exportBtn.addEventListener('click', () => this.exportToCSV());
                this.clearDataBtn.addEventListener('click', () => this.clearAllData());
                this.addTransactionBtn.addEventListener('click', () => this.switchView('transactions'));

                // Auto-update category based on transaction type
                document.querySelectorAll('input[name="transaction-type"]').forEach(radio => {
                    radio.addEventListener('change', () => this.updateCategoryOptions());
                });

                // Window resize event
                window.addEventListener('resize', () => this.handleResize());
            }

            switchView(viewName) {
                // Update navigation
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.toggle('active', item.dataset.view === viewName);
                });

                // Update views
                document.querySelectorAll('.view').forEach(view => {
                    view.style.display = view.id === `${viewName}-view` ? 'block' : 'none';
                });

                // Update page title
                const titles = {
                    dashboard: 'Dashboard',
                    transactions: 'Transactions',
                    analytics: 'Analytics',
                    settings: 'Settings'
                };
                this.pageTitle.textContent = titles[viewName] || 'Dashboard';

                this.currentView = viewName;
                this.closeMobileMenu();

                // Update display for current view
                if (viewName === 'analytics') {
                    this.updateAnalyticsCharts();
                }
            }

            toggleMobileMenu() {
                this.sidebar.classList.toggle('open');
                this.overlay.classList.toggle('show');
            }

            closeMobileMenu() {
                this.sidebar.classList.remove('open');
                this.overlay.classList.remove('show');
            }

            handleResize() {
                if (window.innerWidth > 768) {
                    this.closeMobileMenu();
                }
            }

            updateCategoryOptions() {
                const type = document.querySelector('input[name="transaction-type"]:checked').value;
                const category = this.categorySelect;

                category.value = '';

                if (type === 'income') {
                    category.innerHTML = `
                        <option value="">Select Income Category</option>
                        <option value="salary">💼 Salary</option>
                        <option value="freelance">💻 Freelance</option>
                        <option value="investment">📈 Investment</option>
                        <option value="other">💰 Other Income</option>
                    `;
                } else {
                    category.innerHTML = `
                        <option value="">Select Expense Category</option>
                        <option value="food">🍔 Food & Dining</option>
                        <option value="transport">🚗 Transportation</option>
                        <option value="entertainment">🎬 Entertainment</option>
                        <option value="shopping">🛍️ Shopping</option>
                        <option value="bills">💡 Bills & Utilities</option>
                        <option value="healthcare">🏥 Healthcare</option>
                        <option value="education">📚 Education</option>
                        <option value="other">📦 Other Expenses</option>
                    `;
                }
            }

            handleSubmit(e) {
                e.preventDefault();

                const selectedDate = new Date(this.dateInput.value);
                const name = this.nameInput.value.trim();
                const amount = parseFloat(this.amountInput.value);
                const category = this.categorySelect.value;
                const type = document.querySelector('input[name="transaction-type"]:checked').value;

                if (!this.validateTransaction(name, amount, category, selectedDate)) {
                    return;
                }

                const transaction = {
                    id: this.generateId(),
                    name: name,
                    amount: Math.abs(amount),
                    category: category,
                    type: type,
                    date: selectedDate.toISOString(),
                    dateFormatted: selectedDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                };

                this.addTransaction(transaction);
                this.resetForm();
                this.hideError();

                // Show success message
                this.showSuccess('Transaction added successfully!');
            }

            validateTransaction(name, amount, category, date) {
                if (!date || isNaN(date.getTime())) {
                    this.showError('Please select a valid date');
                    return false;
                }

                if (!name) {
                    this.showError('Please enter a transaction name');
                    return false;
                }

                if (!amount || amount <= 0) {
                    this.showError('Please enter a valid amount greater than 0');
                    return false;
                }

                if (!category) {
                    this.showError('Please select a category');
                    return false;
                }

                return true;
            }

            addTransaction(transaction) {
                this.transactions.unshift(transaction);
                this.saveTransactions();
                this.applyFilters();
                this.updateDisplay();
            }

            deleteTransaction(id) {
                if (confirm('Are you sure you want to delete this transaction?')) {
                    this.transactions = this.transactions.filter(t => t.id !== id);
                    this.saveTransactions();
                    this.applyFilters();
                    this.updateDisplay();
                }
            }

            clearAllData() {
                if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    this.transactions = [];
                    this.saveTransactions();
                    this.applyFilters();
                    this.updateDisplay();
                    this.showSuccess('All data cleared successfully!');
                }
            }

            applyFilters() {
                const searchTerm = this.searchInput.value.toLowerCase();
                const categoryFilter = this.filterCategory.value;
                const typeFilter = this.filterType.value;
                const monthTransactions = this.getMonthTransactions();

                this.filteredTransactions = monthTransactions.filter(transaction => {
                    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm);
                    const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
                    const matchesType = !typeFilter || transaction.type === typeFilter;

                    return matchesSearch && matchesCategory && matchesType;
                });

                this.updateTransactionList();
            }

            clearFilters() {
                this.searchInput.value = '';
                this.filterCategory.value = '';
                this.filterType.value = '';
                this.applyFilters();
            }

            navigateMonth(direction) {
                this.currentMonth += direction;

                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                } else if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }

                this.updateDisplay();
                this.setDefaultDate();
            }

            updateMonthDisplay() {
                const monthNames = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];

                this.currentMonthYear.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
            }

            getMonthTransactions() {
                return this.transactions.filter(transaction => {
                    const transactionDate = new Date(transaction.date);
                    return transactionDate.getMonth() === this.currentMonth &&
                           transactionDate.getFullYear() === this.currentYear;
                });
            }

            updateDisplay() {
                this.updateMonthDisplay();
                this.updateBalance();
                this.updateTransactionList();
                this.updateRecentTransactions();
                this.updateCharts();
                this.applyFilters();
            }

            updateBalance() {
                const totals = this.calculateTotals();

                this.balanceElement.textContent = this.formatCurrency(totals.balance);
                this.balanceCard.className = `balance-card ${totals.balance >= 0 ? '' : 'negative'}`;

                this.totalIncomeElement.textContent = this.formatCurrency(totals.income);
                this.totalExpensesElement.textContent = this.formatCurrency(totals.expenses);
            }

            calculateTotals() {
                const monthTransactions = this.getMonthTransactions();

                const income = monthTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);

                const expenses = monthTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                return { income, expenses, balance: income - expenses };
            }

            updateTransactionList() {
                const count = this.filteredTransactions.length;
                this.transactionCount.textContent = `${count} transaction${count !== 1 ? 's' : ''}`;

                if (count === 0) {
                    this.transactionList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">📊</div>
                            <div class="empty-title">No transactions found</div>
                            <p class="empty-text">Add your first transaction to get started!</p>
                        </div>
                    `;
                    return;
                }

                this.transactionList.innerHTML = this.filteredTransactions
                    .map(transaction => this.createTransactionHTML(transaction))
                    .join('');
            }

            updateRecentTransactions() {
                const recentTransactions = this.getMonthTransactions().slice(0, 5);

                if (recentTransactions.length === 0) {
                    this.recentTransactions.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">📊</div>
                            <div class="empty-title">No transactions yet</div>
                            <p class="empty-text">Add your first transaction to get started!</p>
                        </div>
                    `;
                    return;
                }

                this.recentTransactions.innerHTML = recentTransactions
                    .map(transaction => this.createTransactionHTML(transaction))
                    .join('');
            }

            createTransactionHTML(transaction) {
                const categoryClass = `category-${transaction.category}`;
                const amountPrefix = transaction.type === 'income' ? '+' : '-';
                const categoryIcon = this.getCategoryIcon(transaction.category);

                return `
                    <li class="transaction-item ${transaction.type}">
                        <div class="transaction-icon ${categoryClass}">
                            ${categoryIcon}
                        </div>
                        <div class="transaction-info">
                            <div class="transaction-name">${this.escapeHtml(transaction.name)}</div>
                            <div class="transaction-meta">
                                <span class="transaction-category ${categoryClass}">
                                    ${this.formatCategory(transaction.category)}
                                </span>
                                <span class="transaction-date">${transaction.dateFormatted}</span>
                            </div>
                        </div>
                        <div class="transaction-amount">
                            ${amountPrefix}${this.formatCurrency(transaction.amount)}
                        </div>
                        <button class="delete-btn" onclick="tracker.deleteTransaction('${transaction.id}')">
                            🗑️
                        </button>
                    </li>
                `;
            }

            getCategoryIcon(category) {
                const icons = {
                    salary: '💼', freelance: '💻', investment: '📈',
                    food: '🍔', transport: '🚗', entertainment: '🎬',
                    shopping: '🛍️', bills: '💡', healthcare: '🏥',
                    education: '📚', other: '📦'
                };
                return icons[category] || '📦';
            }

            formatCategory(category) {
                return category.charAt(0).toUpperCase() + category.slice(1);
            }

            switchChart(chartType) {
                // Update tab states
                document.querySelectorAll('.chart-tab').forEach(tab => {
                    if (tab.dataset.chart === chartType) {
                        tab.classList.add('active');
                    } else {
                        tab.classList.remove('active');
                    }
                });

                // Update chart views
                document.querySelectorAll('.chart-view').forEach(view => {
                    if (view.id.includes(chartType)) {
                        view.classList.add('active');
                    } else {
                        view.classList.remove('active');
                    }
                });

                this.updateCharts();
            }

            updateCharts() {
                this.updateCategoryChart();
                this.updateTypeChart();
            }

            updateAnalyticsCharts() {
                this.updateAnalyticsCategoryChart();
                this.updateAnalyticsTypeChart();
            }

            updateCategoryChart() {
                const transactions = this.getMonthTransactions();
                const categoryData = this.calculateCategoryData(transactions);
                this.renderChart(this.categoryBars, categoryData, 'category');
            }

            updateTypeChart() {
                const typeData = this.calculateTypeData();
                this.renderChart(this.typeBars, typeData, 'type');
            }

            updateAnalyticsCategoryChart() {
                const transactions = this.getMonthTransactions();
                const categoryData = this.calculateCategoryData(transactions);
                this.renderChart(this.analyticsCategoryBars, categoryData, 'category');
            }

            updateAnalyticsTypeChart() {
                const typeData = this.calculateTypeData();
                this.renderChart(this.analyticsTypeBars, typeData, 'type');
            }

            calculateCategoryData(transactions) {
                const categoryTotals = {};

                transactions.forEach(transaction => {
                    const category = transaction.category;
                    if (!categoryTotals[category]) {
                        categoryTotals[category] = 0;
                    }
                    categoryTotals[category] += transaction.amount;
                });

                return Object.entries(categoryTotals)
                    .map(([category, amount]) => ({ category, amount, type: 'category' }))
                    .sort((a, b) => b.amount - a.amount);
            }

            calculateTypeData() {
                const totals = this.calculateTotals();
                return [
                    { type: 'income', amount: totals.income },
                    { type: 'expense', amount: totals.expenses }
                ];
            }

            renderChart(container, data, chartType) {
                if (data.length === 0 || data.every(item => item.amount === 0)) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">📊</div>
                            <div class="empty-title">No data to display</div>
                            <p class="empty-text">Add some transactions to see analytics</p>
                        </div>
                    `;
                    return;
                }

                const maxAmount = Math.max(...data.map(item => item.amount));

                container.innerHTML = data.map(item => {
                    const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                    let icon, label, fillClass;

                    if (chartType === 'category') {
                        icon = this.getCategoryIcon(item.category);
                        label = this.formatCategory(item.category);
                        fillClass = `category-${item.category}`;
                    } else {
                        icon = item.type === 'income' ? '💰' : '💸';
                        label = item.type === 'income' ? 'Income' : 'Expenses';
                        fillClass = item.type;
                    }

                    return `
                        <div class="chart-bar-item">
                            <div class="chart-bar-label">
                                ${icon} ${label}
                            </div>
                            <div class="chart-bar-visual">
                                <div class="chart-bar-fill ${fillClass}" style="width: ${percentage}%"></div>
                            </div>
                            <div class="chart-bar-amount">
                                ${this.formatCurrency(item.amount)}
                            </div>
                        </div>
                    `;
                }).join('');
            }

            exportToCSV() {
                if (this.transactions.length === 0) {
                    alert('No transactions to export!');
                    return;
                }

                const headers = ['Date', 'Name', 'Category', 'Type', 'Amount'];
                const csvContent = [
                    headers.join(','),
                    ...this.transactions.map(t => [
                        t.dateFormatted,
                        `"${t.name}"`,
                        this.formatCategory(t.category),
                        t.type,
                        t.amount
                    ].join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);

                this.showSuccess('Data exported successfully!');
            }

            setDefaultDate() {
                const year = this.currentYear;
                const month = String(this.currentMonth + 1).padStart(2, '0');
                const day = String(new Date().getDate()).padStart(2, '0');
                this.dateInput.value = `${year}-${month}-${day}`;
            }

            resetForm() {
                this.setDefaultDate();
                this.nameInput.value = '';
                this.amountInput.value = '';
                this.categorySelect.value = '';
                document.querySelector('input[name="transaction-type"][value="income"]').checked = true;
                this.updateCategoryOptions();
                this.nameInput.focus();
            }

            showError(message) {
                this.errorMessage.textContent = message;
                this.errorMessage.style.display = 'block';
                setTimeout(() => this.hideError(), 5000);
            }

            hideError() {
                this.errorMessage.style.display = 'none';
            }

            showSuccess(message) {
                // Create temporary success message
                const successDiv = document.createElement('div');
                successDiv.className = 'error-message';
                successDiv.style.background = 'var(--success-light)';
                successDiv.style.borderColor = 'var(--success)';
                successDiv.style.color = 'var(--success)';
                successDiv.style.display = 'block';
                successDiv.textContent = message;

                this.errorMessage.parentNode.insertBefore(successDiv, this.errorMessage);

                setTimeout(() => {
                    successDiv.remove();
                }, 3000);
            }

            generateId() {
                return Date.now().toString(36) + Math.random().toString(36).substr(2);
            }

            formatCurrency(amount) {
                return new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 2
                }).format(Math.abs(amount));
            }

            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            saveTransactions() {
                try {
                    localStorage.setItem('expenseTrackerPro_transactions', JSON.stringify(this.transactions));
                } catch (error) {
                    console.error('Error saving transactions:', error);
                    this.showError('Error saving data. Please try again.');
                }
            }

            loadTransactions() {
                try {
                    const saved = localStorage.getItem('expenseTrackerPro_transactions');
                    return saved ? JSON.parse(saved) : [];
                } catch (error) {
                    console.error('Error loading transactions:', error);
                    return [];
                }
            }
        }

        // Initialize the application
        let tracker;
        document.addEventListener('DOMContentLoaded', () => {
            tracker = new ExpenseTrackerPro();
        });