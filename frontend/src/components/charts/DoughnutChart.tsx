import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart() {
  const { isDark } = useTheme();
  
  const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        display: false,
        labels: {
          color: textColor,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        bodyColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
      },
    },
    cutout: '70%',
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  const data = {
    labels: ['Direct', 'Social', 'Organic', 'Referral'],
    datasets: [
      {
        data: [35, 25, 25, 15],
        backgroundColor: [
          '#4F46E5', // primary
          '#0D9488', // secondary
          '#10B981', // success
          '#F59E0B', // warning
        ],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  };

  return <Doughnut options={options} data={data} />;
}