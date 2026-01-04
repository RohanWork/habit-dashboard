import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useHabits } from '../hooks/useHabits';
import { getDailyLogsByDateRange } from '../firebase/db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Yearly = () => {
  const { user } = useAuth();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [yearLogs, setYearLogs] = useState({});
  
  // Helper function to convert date to local YYYY-MM-DD format
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = getLocalDateString(new Date());
  const { habits } = useHabits(today);

  // Fetch all logs for the year
  useEffect(() => {
    if (!user) return;

    const fetchYearLogs = async () => {
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      try {
        const logs = await getDailyLogsByDateRange(user.uid, startDate, endDate);
        const logsMap = {};
        logs.forEach(log => {
          logsMap[log.date] = log;
        });
        setYearLogs(logsMap);
      } catch (error) {
        console.error('Error fetching year logs:', error);
      }
    };

    fetchYearLogs();
  }, [user, currentYear]);

  // Calculate monthly statistics
  const getMonthlyStats = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const stats = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = `${currentYear}-${String(month + 1).padStart(2, '0')}-01`;
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      const monthEnd = `${currentYear}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;

      let totalCompleted = 0;
      let totalPossible = 0;
      let totalMood = 0;
      let totalEnergy = 0;
      let totalFocus = 0;
      let daysWithData = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const log = yearLogs[dateString];

        if (log) {
          daysWithData++;
          totalMood += log.mood || 0;
          totalEnergy += log.energy || 0;
          totalFocus += log.focus || 0;

          if (habits.length > 0) {
            habits.forEach(habit => {
              totalPossible++;
              if (log.habits && log.habits[habit.id]) {
                totalCompleted++;
              }
            });
          }
        }
      }

      const completion = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
      const avgMood = daysWithData > 0 ? Math.round((totalMood / daysWithData) * 10) / 10 : 0;
      const avgEnergy = daysWithData > 0 ? Math.round((totalEnergy / daysWithData) * 10) / 10 : 0;
      const avgFocus = daysWithData > 0 ? Math.round((totalFocus / daysWithData) * 10) / 10 : 0;

      stats.push({
        month: monthNames[month],
        completion,
        mood: avgMood,
        energy: avgEnergy,
        focus: avgFocus,
      });
    }

    return stats;
  };

  const monthlyStats = getMonthlyStats();

  // Find best and worst months
  const sortedByCompletion = [...monthlyStats].sort((a, b) => b.completion - a.completion);
  const bestMonth = sortedByCompletion[0];
  const worstMonth = sortedByCompletion[sortedByCompletion.length - 1];

  const sortedByMood = [...monthlyStats].sort((a, b) => b.mood - a.mood);
  const bestMoodMonth = sortedByMood[0];

  const handlePrevYear = () => setCurrentYear(currentYear - 1);
  const handleNextYear = () => setCurrentYear(currentYear + 1);

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-dark">Analytics</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevYear}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              ← Previous Year
            </button>
            <span className="text-lg font-semibold text-text-dark w-20 text-center">{currentYear}</span>
            <button
              onClick={handleNextYear}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Next Year →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-text-gray mb-1">Best Month (Completion)</p>
            <p className="text-2xl font-bold text-primary">{bestMonth.month}</p>
            <p className="text-xs text-text-gray mt-1">{bestMonth.completion}% complete</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-text-gray mb-1">Lowest Month</p>
            <p className="text-2xl font-bold text-orange-500">{worstMonth.month}</p>
            <p className="text-xs text-text-gray mt-1">{worstMonth.completion}% complete</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-text-gray mb-1">Best Mood Month</p>
            <p className="text-2xl font-bold text-blue-500">{bestMoodMonth.month}</p>
            <p className="text-xs text-text-gray mt-1">{bestMoodMonth.mood}/5 average</p>
          </div>
        </div>

        {/* Habit Completion Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-text-dark mb-4">Habit Completion by Month</h2>
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: '#F3F7F1',
                    border: '1px solid #6AA84F',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="completion" fill="#6AA84F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood, Energy, Focus Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mood */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Mood Trend</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#6B7280" domain={[0, 5]} />
                  <Tooltip
                    formatter={(value) => value.toFixed(1)}
                    contentStyle={{
                      backgroundColor: '#F3F7F1',
                      border: '1px solid #6AA84F',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-text-gray text-center mt-2">
              Avg: {(monthlyStats.reduce((sum, m) => sum + m.mood, 0) / 12).toFixed(1)}/5
            </p>
          </div>

          {/* Energy */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Energy Trend</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#6B7280" domain={[0, 5]} />
                  <Tooltip
                    formatter={(value) => value.toFixed(1)}
                    contentStyle={{
                      backgroundColor: '#F3F7F1',
                      border: '1px solid #6AA84F',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="energy" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-text-gray text-center mt-2">
              Avg: {(monthlyStats.reduce((sum, m) => sum + m.energy, 0) / 12).toFixed(1)}/5
            </p>
          </div>

          {/* Focus */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Focus Trend</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#6B7280" domain={[0, 5]} />
                  <Tooltip
                    formatter={(value) => value.toFixed(1)}
                    contentStyle={{
                      backgroundColor: '#F3F7F1',
                      border: '1px solid #6AA84F',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="focus" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-text-gray text-center mt-2">
              Avg: {(monthlyStats.reduce((sum, m) => sum + m.focus, 0) / 12).toFixed(1)}/5
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Yearly;
