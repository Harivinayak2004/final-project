import { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Calendar, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { Card } from './ui/card';
import type { Message } from './ChatMessage';

interface StressHistoryProps {
  messages: Message[];
}

interface DailyStress {
  date: string;
  avgStress: number;
  maxStress: number;
  minStress: number;
  messageCount: number;
}

export function StressHistory({ messages }: StressHistoryProps) {
  const dailyData = useMemo(() => {
    const dataMap = new Map<string, { stressLevels: number[], count: number }>();
    
    messages.forEach((message) => {
      // FIX: Ensure we check for stressLevel and it is a valid number
      if (
        message.sender === 'user' &&
        message.emotion &&
        typeof message.emotion.stressLevel === 'number' &&
        !isNaN(message.emotion.stressLevel)
      ) {
        const date = new Date(message.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        
        if (!dataMap.has(date)) {
          dataMap.set(date, { stressLevels: [], count: 0 });
        }
        
        const dayData = dataMap.get(date)!;
        
        // FIX: Consistently use stressLevel and scale it to 10 to match ChatInterface
        const scaledStress = message.emotion.stressScore / 10;
        dayData.stressLevels.push(scaledStress);
        dayData.count++;
      }
    });
    
    const result: DailyStress[] = [];
    dataMap.forEach((data, date) => {
      if (data.stressLevels.length === 0) return;

      const sum = data.stressLevels.reduce((a, b) => a + b, 0);
      const avgStress = sum / data.stressLevels.length;

      result.push({
        date,
        avgStress: Math.round(avgStress * 10) / 10,
        maxStress: Math.max(...data.stressLevels),
        minStress: Math.min(...data.stressLevels),
        messageCount: data.count
      });
    });
    
    return result.slice(-14); // Last 14 days
  }, [messages]);

  const stats = useMemo(() => {
    if (dailyData.length === 0) {
      return { current: 0, avg: 0, trend: 0 };
    }
    
    const current = dailyData[dailyData.length - 1]?.avgStress || 0;
    const avg = dailyData.reduce((sum, day) => sum + day.avgStress, 0) / dailyData.length;
    const trend = dailyData.length >= 2
      ? dailyData[dailyData.length - 1].avgStress - dailyData[dailyData.length - 2].avgStress
      : 0;
    
    return {
      current: Math.round(current * 10) / 10,
      avg: Math.round(avg * 10) / 10,
      trend: Math.round(trend * 10) / 10
    };
  }, [dailyData]);

  if (dailyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No Stress Data Yet
        </h2>
        <p className="text-gray-600 max-w-md">
          Start chatting to track your stress levels over time. Your wellness journey begins with the first conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Stress History</h2>
          <p className="text-gray-600">Track your emotional wellness journey over time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Level</p>
                <p className="text-3xl font-bold text-gray-900">{stats.current}</p>
                <p className="text-xs text-gray-500 mt-1">out of 10</p>
              </div>
              <div className={`p-2 rounded-full ${
                stats.current >= 7 ? 'bg-red-100' :
                stats.current >= 5 ? 'bg-yellow-100' :
                'bg-green-100'
              }`}>
                <Activity className={`w-5 h-5 ${
                  stats.current >= 7 ? 'text-red-600' :
                  stats.current >= 5 ? 'text-yellow-600' :
                  'text-green-600'
                }`} />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Level</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avg}</p>
                <p className="text-xs text-gray-500 mt-1">Last {dailyData.length} days</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Trend</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.trend > 0 ? '+' : ''}{stats.trend}
                </p>
                <p className="text-xs text-gray-500 mt-1">vs previous day</p>
              </div>
              <div className={`p-2 rounded-full ${
                stats.trend > 0 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {stats.trend > 0 ? (
                  <TrendingUp className="w-5 h-5 text-red-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Area Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stress Level Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                domain={[0, 10]}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="avgStress"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorStress)"
                name="Avg Stress"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Line Chart with Min/Max */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Stress Range</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                domain={[0, 10]}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="maxStress"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Max Stress"
              />
              <Line
                type="monotone"
                dataKey="avgStress"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Avg Stress"
              />
              <Line
                type="monotone"
                dataKey="minStress"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Min Stress"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Daily Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Summary</h3>
          <div className="space-y-3">
            {dailyData.slice().reverse().map((day) => (
              <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{day.date}</p>
                    <p className="text-sm text-gray-600">{day.messageCount} messages</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {day.avgStress.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {day.minStress.toFixed(1)} - {day.maxStress.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}