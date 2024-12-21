import '../style/finance-tracker.css';
import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CATEGORIES = [
  'Salary',
  'Investments',
  'Freelance', // Income categories
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Other', // Expense categories
];

const COLORS = [
  '#4ade80',
  '#f87171',
  '#60a5fa',
  '#818cf8',
  '#fb923c',
  '#a78bfa',
  '#f472b6',
  '#34d399',
  '#fbbf24',
];

const FinanceTracker = () => {
  const [entries, setEntries] = useState([]);
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!income || !expense || !date || !category || !description) return;

    const newEntry = {
      date,
      income: parseFloat(income),
      expense: parseFloat(expense),
      balance: parseFloat(income) - parseFloat(expense),
      category,
      description,
      timestamp: new Date().toISOString(),
    };

    setEntries([...entries, newEntry]);
    setIncome('');
    setExpense('');
    setDescription('');
  };

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        // Search term filter
        const searchMatch =
          entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.category.toLowerCase().includes(searchTerm.toLowerCase());

        // Date range filter
        const entryDate = new Date(entry.date);
        const afterStart =
          !dateRange.start || entryDate >= new Date(dateRange.start);
        const beforeEnd =
          !dateRange.end || entryDate <= new Date(dateRange.end);

        // Type filter
        const typeMatch =
          filterType === 'all' ||
          (filterType === 'income' && entry.income > 0) ||
          (filterType === 'expense' && entry.expense > 0);

        return searchMatch && afterStart && beforeEnd && typeMatch;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [entries, searchTerm, dateRange, filterType]);

  const statistics = useMemo(() => {
    const stats = {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      categoryTotals: {},
      averageIncome: 0,
      averageExpense: 0,
    };

    if (filteredEntries.length === 0) return stats;

    filteredEntries.forEach((entry) => {
      stats.totalIncome += entry.income;
      stats.totalExpense += entry.expense;
      stats.categoryTotals[entry.category] =
        (stats.categoryTotals[entry.category] || 0) + entry.expense;
    });

    stats.netBalance = stats.totalIncome - stats.totalExpense;
    stats.averageIncome = stats.totalIncome / filteredEntries.length;
    stats.averageExpense = stats.totalExpense / filteredEntries.length;

    return stats;
  }, [filteredEntries]);

  const pieChartData = useMemo(() => {
    return Object.entries(statistics.categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [statistics.categoryTotals]);

  return (
    <div className="container">
      {/* Input Form */}
      <div className="card fade-in">
        <div className="card-header">
          <h2 className="card-title">Daily Finance Tracker</h2>
          <div className="card-title-balance-container">
            <div className="card-title card-title-balance">Balance:</div>
            <div
              className={
                statistics.netBalance.toFixed(2) > 0
                  ? 'card-title text-success'
                  : 'card-title text-danger'
              }
            >
              ${statistics.netBalance.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-grid">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="Income"
                className="form-input"
                step="0.01"
                min="0"
                required
              />
              <input
                type="number"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
                placeholder="Expense"
                className="form-input"
                step="0.01"
                min="0"
                required
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="submit-button">
              Add Entry
            </button>
          </form>
        </div>
      </div>

      {/* Filters */}
      <div className="card fade-in mt-4">
        <div className="card-header">
          <h2 className="card-title">Filters</h2>
        </div>
        <div className="card-content">
          <div className="form-grid">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entries..."
              className="form-input"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-input"
            >
              <option value="all">All Entries</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="form-input"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="form-input"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <>
          {/* Statistics Summary */}
          <div className="card fade-in mt-4">
            <div className="card-header">
              <h2 className="card-title">Financial Summary</h2>
            </div>
            <div className="card-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Total Income</div>
                  <div className="stat-value text-success">
                    ${statistics.totalIncome.toFixed(2)}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Total Expenses</div>
                  <div className="stat-value text-danger">
                    ${statistics.totalExpense.toFixed(2)}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Net Balance</div>
                  <div className="stat-value">
                    ${statistics.netBalance.toFixed(2)}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Average Income</div>
                  <div className="stat-value">
                    ${statistics.averageIncome.toFixed(2)}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Average Expense</div>
                  <div className="stat-value">
                    ${statistics.averageExpense.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="card fade-in mt-4">
            <div className="card-header">
              <h2 className="card-title">Financial Overview</h2>
            </div>
            <div className="card-content">
              <div className="charts-container">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredEntries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#4ade80"
                        name="Income"
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="#f87171"
                        name="Expense"
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#60a5fa"
                        name="Balance"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card fade-in mt-4">
            <div className="card-header">
              <h2 className="card-title">Recent Entries</h2>
            </div>
            <div className="card-content">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th className="text-right">Income</th>
                      <th className="text-right">Expense</th>
                      <th className="text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.date}</td>
                        <td>{entry.description}</td>
                        <td>{entry.category}</td>
                        <td className="text-right text-success">
                          ${entry.income.toFixed(2)}
                        </td>
                        <td className="text-right text-danger">
                          ${entry.expense.toFixed(2)}
                        </td>
                        <td className="text-right">
                          ${entry.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinanceTracker;
