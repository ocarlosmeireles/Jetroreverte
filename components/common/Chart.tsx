
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from './Card';
import { formatCurrency, formatCurrencyInteger } from '../../utils/formatters';

interface ChartProps {
    data: any[];
    title: string;
    barKey: string;
    xAxisKey: string;
    delay?: number;
}

const Chart = ({ data, title, barKey, xAxisKey, delay = 0 }: ChartProps): React.ReactElement => {
    return (
        <Card delay={delay}>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">{title}</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 20,
                            left: -10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey={xAxisKey} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis 
                            tick={{ fill: '#64748b', fontSize: 12 }} 
                            tickFormatter={(value) => formatCurrencyInteger(value as number)} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(96, 125, 255, 0.1)' }}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.75rem',
                                color: '#1e293b',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            formatter={(value: number) => [formatCurrency(value), "Valor"]}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}/>
                        <Bar dataKey={barKey} fill="#607dff" name="Valor" radius={[8, 8, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default Chart;