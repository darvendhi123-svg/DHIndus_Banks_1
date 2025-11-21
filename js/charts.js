// ===== CHART MANAGER =====

class ChartManager {
    constructor() {
        this.chart = null;
        this.currentPeriod = 'month';
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                chartBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentPeriod = btn.getAttribute('data-period');
                this.updateChart();
            });
        });
    }

    updateChart(transactions = []) {
        const canvas = document.getElementById('account-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        // Prepare data based on period
        const data = this.prepareChartData(transactions);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: data.income,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: data.expenses,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Balance',
                        data: data.balance,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#cbd5e1',
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#1e293b',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: '#334155',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${CONFIG.APP.CURRENCY}${context.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#334155',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        grid: {
                            color: '#334155',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            callback: (value) => {
                                return `${CONFIG.APP.CURRENCY}${value.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    prepareChartData(transactions) {
        const now = new Date();
        let labels = [];
        let income = [];
        let expenses = [];
        let balance = [];

        if (this.currentPeriod === 'week') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
                
                const dayTransactions = transactions.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate.toDateString() === date.toDateString();
                });

                const dayIncome = dayTransactions.filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const dayExpense = dayTransactions.filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                income.push(dayIncome);
                expenses.push(dayExpense);
                balance.push(dayIncome - dayExpense);
            }
        } else if (this.currentPeriod === 'month') {
            // Last 30 days (grouped by week)
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(weekStart.getDate() - (i * 7));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);

                labels.push(`Week ${4 - i}`);

                const weekTransactions = transactions.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate >= weekStart && tDate <= weekEnd;
                });

                const weekIncome = weekTransactions.filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const weekExpense = weekTransactions.filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                income.push(weekIncome);
                expenses.push(weekExpense);
                balance.push(weekIncome - weekExpense);
            }
        } else if (this.currentPeriod === 'year') {
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
                labels.push(month.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }));

                const monthTransactions = transactions.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate.getMonth() === month.getMonth() && 
                           tDate.getFullYear() === month.getFullYear();
                });

                const monthIncome = monthTransactions.filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const monthExpense = monthTransactions.filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                income.push(monthIncome);
                expenses.push(monthExpense);
                balance.push(monthIncome - monthExpense);
            }
        }

        return { labels, income, expenses, balance };
    }
}

// Note: Chart.js library needs to be included
// Add this to HTML: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

// Initialize Chart Manager
let chartManager = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check if Chart.js is loaded
    if (typeof Chart !== 'undefined') {
        chartManager = new ChartManager();
        window.chartManager = chartManager;
    } else {
        console.warn('Chart.js not loaded. Charts will not be available.');
    }
});

