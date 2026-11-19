/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Chart.js Visualization Module (Monthly Downtime & Cost Charts)
 */
        let dtChartMode = 'ratio'; // 'ratio' or 'hours'
        let costChartMode = 'ratio'; // 'ratio' or 'amount'
        let monthlyDtChartInstance = null;
        let monthlyCostChartInstance = null;

        // Dataset Historis Bulanan (Data Riil Nov + Dummy Benchmark Konsisten untuk Agustus, Sept, Okt)
        let lastChartData = {
            months: ['Agustus 2026', 'September 2026', 'Oktober 2026', 'November (MtD)'],
            ratios: [64.0, 59.3, 61.1, 72.1],
            dtHours: [1210.0, 1050.0, 1180.0, 719.0],
            pmHours: [680.0, 720.0, 750.0, 278.5],
            costDtRatios: [68.0, 65.0, 70.0, 72.3],
            costAmounts: [185.4, 162.8, 194.5, 210.2], // Juta Rupiah
            costDtAmounts: [126.1, 105.8, 136.2, 152.1],
            costPmAmounts: [59.3, 57.0, 58.3, 58.1]
        };

        function setDtChartMode(mode) {
            dtChartMode = mode;
            const btnRatio = document.getElementById('btnChartModeRatio');
            const btnHours = document.getElementById('btnChartModeHours');
            if (mode === 'ratio') {
                if (btnRatio) btnRatio.className = 'px-2 py-0.5 text-xs font-semibold rounded bg-red-600 text-white transition cursor-pointer shadow-xs';
                if (btnHours) btnHours.className = 'px-2 py-0.5 text-xs font-medium rounded bg-transparent text-gray-600 hover:text-gray-900 transition cursor-pointer';
            } else {
                if (btnHours) btnHours.className = 'px-2 py-0.5 text-xs font-semibold rounded bg-red-600 text-white transition cursor-pointer shadow-xs';
                if (btnRatio) btnRatio.className = 'px-2 py-0.5 text-xs font-medium rounded bg-transparent text-gray-600 hover:text-gray-900 transition cursor-pointer';
            }
            renderMonthlyDtChart();
        }

        // TOGGLE MODE GRAFIK BIAYA (COST)
        function setCostChartMode(mode) {
            costChartMode = mode;
            const btnRatio = document.getElementById('btnCostChartModeRatio');
            const btnAmount = document.getElementById('btnCostChartModeAmount');
            if (mode === 'ratio') {
                if (btnRatio) btnRatio.className = 'px-2 py-0.5 text-xs font-semibold rounded bg-amber-600 text-white transition cursor-pointer shadow-xs';
                if (btnAmount) btnAmount.className = 'px-2 py-0.5 text-xs font-medium rounded bg-transparent text-gray-600 hover:text-gray-900 transition cursor-pointer';
            } else {
                if (btnAmount) btnAmount.className = 'px-2 py-0.5 text-xs font-semibold rounded bg-amber-600 text-white transition cursor-pointer shadow-xs';
                if (btnRatio) btnRatio.className = 'px-2 py-0.5 text-xs font-medium rounded bg-transparent text-gray-600 hover:text-gray-900 transition cursor-pointer';
            }
            renderMonthlyCostChart();
        }

        // RENDER GRAFIK DT BULANAN
        function renderMonthlyDtChart(currentDtHours, currentPmHours) {
            if (typeof currentDtHours === 'number' && typeof currentPmHours === 'number') {
                const total = currentDtHours + currentPmHours;
                const ratio = total > 0 ? (currentDtHours / total * 100) : 0;
                lastChartData.dtHours[3] = parseFloat(currentDtHours.toFixed(1));
                lastChartData.pmHours[3] = parseFloat(currentPmHours.toFixed(1));
                lastChartData.ratios[3] = parseFloat(ratio.toFixed(1));
            }

            const canvas = document.getElementById('monthlyDtChart');
            if (!canvas) return;

            const isRatio = dtChartMode === 'ratio';
            const labels = lastChartData.months;
            const dataValues = isRatio ? lastChartData.ratios : lastChartData.dtHours;

            if (typeof Chart !== 'undefined') {
                if (monthlyDtChartInstance) monthlyDtChartInstance.destroy();

                const ctx = canvas.getContext('2d');
                const bgColors = ['rgba(248, 113, 113, 0.45)', 'rgba(248, 113, 113, 0.45)', 'rgba(248, 113, 113, 0.45)', 'rgba(220, 38, 38, 0.95)'];
                const borderColors = ['#ef4444', '#ef4444', '#ef4444', '#b91c1c'];

                monthlyDtChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: isRatio ? 'Rasio DT (%)' : 'Jam Gangguan DT (Jam)',
                            data: dataValues,
                            backgroundColor: bgColors,
                            borderColor: borderColors,
                            borderWidth: 1.5,
                            borderRadius: 6,
                            maxBarThickness: 46
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 350 },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: '#1e293b',
                                padding: 8,
                                callbacks: {
                                    label: function (context) {
                                        const idx = context.dataIndex;
                                        return isRatio
                                            ? [` Rasio DT: ${context.parsed.y}%`, ` Jam DT: ${lastChartData.dtHours[idx]} Jam`, ` Jam PM: ${lastChartData.pmHours[idx]} Jam`]
                                            : ` Jam DT: ${context.parsed.y} Jam (PM: ${lastChartData.pmHours[idx]} Jam)`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: isRatio ? 100 : undefined,
                                ticks: { callback: v => isRatio ? v + '%' : v + ' Jam', font: { size: 10 }, color: '#64748b' },
                                grid: { color: '#f1f5f9' }
                            },
                            x: { ticks: { font: { size: 11, weight: '600' }, color: '#334155' }, grid: { display: false } }
                        }
                    }
                });
            } else {
                renderSvgFallbackChart(canvas, isRatio, labels, dataValues, '#dc2626', '#f87171', isRatio ? '%' : ' Jam');
            }
        }

        // RENDER GRAFIK BIAYA BULANAN
        function renderMonthlyCostChart(currentCostTotal, currentCostDt, currentCostPm) {
            if (typeof currentCostTotal === 'number' && typeof currentCostDt === 'number') {
                const ratio = currentCostTotal > 0 ? (currentCostDt / currentCostTotal * 100) : 0;
                lastChartData.costAmounts[3] = parseFloat((currentCostTotal / 1000000).toFixed(1));
                lastChartData.costDtAmounts[3] = parseFloat((currentCostDt / 1000000).toFixed(1));
                lastChartData.costPmAmounts[3] = parseFloat(((currentCostPm || 0) / 1000000).toFixed(1));
                lastChartData.costDtRatios[3] = parseFloat(ratio.toFixed(1));
            }

            const canvas = document.getElementById('monthlyCostChart');
            if (!canvas) return;

            const isRatio = costChartMode === 'ratio';
            const labels = lastChartData.months;
            const dataValues = isRatio ? lastChartData.costDtRatios : lastChartData.costAmounts;

            if (typeof Chart !== 'undefined') {
                if (monthlyCostChartInstance) monthlyCostChartInstance.destroy();

                const ctx = canvas.getContext('2d');
                const bgColors = ['rgba(251, 191, 36, 0.5)', 'rgba(251, 191, 36, 0.5)', 'rgba(251, 191, 36, 0.5)', 'rgba(217, 119, 6, 0.95)'];
                const borderColors = ['#f59e0b', '#f59e0b', '#f59e0b', '#b45309'];

                monthlyCostChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: isRatio ? 'Rasio Biaya DT (%)' : 'Total Biaya (Juta Rp)',
                            data: dataValues,
                            backgroundColor: bgColors,
                            borderColor: borderColors,
                            borderWidth: 1.5,
                            borderRadius: 6,
                            maxBarThickness: 46
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 350 },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: '#1e293b',
                                padding: 8,
                                callbacks: {
                                    label: function (context) {
                                        const idx = context.dataIndex;
                                        return isRatio
                                            ? [` Rasio Biaya DT: ${context.parsed.y}%`, ` Total: Rp ${lastChartData.costAmounts[idx]} Juta`, ` Biaya DT: Rp ${lastChartData.costDtAmounts[idx]} Juta`]
                                            : ` Total Biaya: Rp ${context.parsed.y} Juta (DT: Rp ${lastChartData.costDtAmounts[idx]} Juta)`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: isRatio ? 100 : undefined,
                                ticks: { callback: v => isRatio ? v + '%' : 'Rp ' + v + ' Juta', font: { size: 10 }, color: '#64748b' },
                                grid: { color: '#f1f5f9' }
                            },
                            x: { ticks: { font: { size: 11, weight: '600' }, color: '#334155' }, grid: { display: false } }
                        }
                    }
                });
            } else {
                renderSvgFallbackChart(canvas, isRatio, labels, dataValues, '#d97706', '#fbbf24', isRatio ? '%' : ' Juta');
            }
        }

        function renderSvgFallbackChart(canvas, isRatio, labels, values, activeColor, pastColor, unit) {
            const parent = canvas.parentElement;
            if (!parent) return;
            const maxVal = isRatio ? 100 : Math.max(10, ...values) * 1.15;
            let barsHtml = '';
            values.forEach((v, i) => {
                const heightPct = Math.min(95, Math.max(8, (v / maxVal) * 85));
                const isCurrent = i === values.length - 1;
                const barColor = isCurrent ? activeColor : pastColor;
                barsHtml += `
                    <div class="flex-1 flex flex-col items-center justify-end h-full">
                        <span class="text-[10px] font-bold text-gray-700 mb-1">${v}${unit}</span>
                        <div class="w-9 rounded-t-md transition-all duration-300" style="height: ${heightPct}%; background-color: ${barColor}; opacity: ${isCurrent ? '1' : '0.65'};"></div>
                        <span class="text-[10px] font-medium text-gray-600 mt-2 text-center leading-tight">${labels[i]}</span>
                    </div>
                `;
            });
            parent.innerHTML = `<div class="w-full h-full flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-gray-200">${barsHtml}</div>`;
        }