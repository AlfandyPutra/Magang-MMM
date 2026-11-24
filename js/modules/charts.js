/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Chart.js Visualization Module (Monthly Downtime & Cost Charts)
 */
        let dtChartMode = 'ratio'; // 'ratio' or 'hours'
        let costChartMode = 'ratio'; // 'ratio' or 'amount'
        let monthlyDtChartInstance = null;
let dtTrendLineChartInstance = null;
let lastDtTrendData = {
    labels: [],
    dtValues: [],
    pmValues: [],
    spikeDetails: [],
    stats: { latest: 0, avg: 0, peak: 0, peakDate: '-' }
};
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

        // RENDER GRAFIK GARIS TREN DT HARIAN & PENJELASAN LONJAKAN (GAYA RESMI DASHBOARD MMM)
        function renderDtTrendLineChart(labels, dtValues, pmValues, spikeDetails, stats) {
            if (labels && dtValues) {
                lastDtTrendData = {
                    labels: labels,
                    dtValues: dtValues,
                    pmValues: pmValues || [],
                    spikeDetails: spikeDetails || [],
                    stats: stats || {}
                };
            }

            const canvas = document.getElementById('dtTrendLineChart');
            if (!canvas) return;

            const currentData = lastDtTrendData;
            const targetLine = currentData.labels.map(() => 35); // Target batas harian 35 Jam

            // Update stats di atas grafik (Latest, Avg, Peak)
            const statLatest = document.getElementById('trendStatLatest');
            const statAvg = document.getElementById('trendStatAvg');
            const statPeak = document.getElementById('trendStatPeak');
            if (statLatest && currentData.stats.latest !== undefined) {
                statLatest.textContent = `${currentData.stats.latest.toFixed(1)} Jam`;
            }
            if (statAvg && currentData.stats.avg !== undefined) {
                statAvg.textContent = `${currentData.stats.avg.toFixed(1)} Jam/H`;
            }
            if (statPeak && currentData.stats.peak !== undefined) {
                statPeak.textContent = `${currentData.stats.peak.toFixed(1)} Jam`;
                const peakDateEl = document.getElementById('trendStatPeakDate');
                if (peakDateEl && currentData.stats.peakDate) {
                    peakDateEl.textContent = `(${currentData.stats.peakDate})`;
                }
            }

            if (typeof Chart === 'undefined') {
                setTimeout(() => {
                    if (typeof Chart !== 'undefined') {
                        renderDtTrendLineChart();
                    }
                }, 250);
                return;
            }

            if (dtTrendLineChartInstance) dtTrendLineChartInstance.destroy();

            const ctx = canvas.getContext('2d');

            // Gradient kurva DT (Cyan terang khas MMM Reject Dashboard)
            const gradDt = ctx.createLinearGradient(0, 0, 0, 280);
            gradDt.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
            gradDt.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

            dtTrendLineChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: currentData.labels,
                    datasets: [
                        {
                            label: 'DT (Kerusakan Mesin)',
                            data: currentData.dtValues,
                            borderColor: '#0891b2',
                            backgroundColor: gradDt,
                            fill: true,
                            tension: 0.38,
                            borderWidth: 2.8,
                            pointBackgroundColor: '#ffffff',
                            pointBorderColor: '#0891b2',
                            pointBorderWidth: 2.5,
                            pointRadius: 4.5,
                            pointHoverRadius: 7.5,
                            pointHoverBackgroundColor: '#0891b2',
                            pointHoverBorderColor: '#ffffff',
                            pointHoverBorderWidth: 2
                        },
                        {
                            label: 'Target Toleransi (≤ 35 Jam)',
                            data: targetLine,
                            borderColor: '#ef4444',
                            borderDash: [6, 4],
                            borderWidth: 1.5,
                            pointRadius: 0,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    onClick: (event, elements) => {
                        if (elements && elements.length > 0) {
                            const idx = elements[0].index;
                            const sp = currentData.spikeDetails ? currentData.spikeDetails[idx] : null;
                            if (sp && sp.topCode && typeof openMachineBreakdownModal === 'function') {
                                openMachineBreakdownModal(sp.topCode);
                            }
                        }
                    },
                    onHover: (event, chartElement) => {
                        const target = event && event.native ? event.native.target : null;
                        if (target) {
                            target.style.cursor = chartElement && chartElement.length > 0 ? 'pointer' : 'default';
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleFont: { size: 12, weight: 'bold' },
                            titleColor: '#f8fafc',
                            bodyFont: { size: 11 },
                            padding: 10,
                            cornerRadius: 8,
                            callbacks: {
                                afterBody: function (tooltipItems) {
                                    const idx = tooltipItems[0].dataIndex;
                                    const sp = currentData.spikeDetails ? currentData.spikeDetails[idx] : null;
                                    if (sp && sp.isSpike && sp.cause) {
                                        return [
                                            '',
                                            '⚠️ PENYEBAB LONJAKAN DOWNTIME:',
                                            `   ${sp.cause}`
                                        ];
                                    }
                                    return [];
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: v => v + ' Jam',
                                font: { size: 10 },
                                color: '#64748b'
                            },
                            grid: { color: '#f1f5f9' }
                        },
                        x: {
                            ticks: {
                                font: { size: 11, weight: '600' },
                                color: '#334155'
                            },
                            grid: { display: false }
                        }
                    }
                }
            });
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

        // ============================================================================
        // 5. GRAFIK TREN BIAYA HARIAN (DAILY COST TREND - SELARAS DENGAN GRAFIK DT)
        // ============================================================================
        let costTrendLineChartInstance = null;
        let costViewMode = 'daily';
        let currentCostData = {
            labels: [],
            costValues: [],
            spikeDetails: [],
            stats: { latest: 0, avg: 0, peak: 0, peakDate: '-' },
            target: 12000000
        };

        function renderDailyCostTrendChart(labels, costValues, spikeDetails, stats, targetValue) {
            if (labels && costValues) {
                currentCostData.labels = labels;
                currentCostData.costValues = costValues;
                currentCostData.spikeDetails = spikeDetails || [];
                currentCostData.stats = stats || { latest: 0, avg: 0, peak: 0, peakDate: '-' };
                if (targetValue) currentCostData.target = targetValue;
            }

            const canvas = document.getElementById('costTrendLineChart');
            if (!canvas) return;

            // Update stats badge di atas grafik
            const statLatest = document.getElementById('costTrendStatLatest');
            const statAvg = document.getElementById('costTrendStatAvg');
            const statPeak = document.getElementById('costTrendStatPeak');
            const statPeakDate = document.getElementById('costTrendStatPeakDate');

            if (statLatest && currentCostData.stats.latest !== undefined) {
                statLatest.textContent = formatShortIDR(currentCostData.stats.latest);
            }
            if (statAvg && currentCostData.stats.avg !== undefined) {
                statAvg.textContent = `${formatShortIDR(currentCostData.stats.avg)}/H`;
            }
            if (statPeak && currentCostData.stats.peak !== undefined) {
                statPeak.textContent = formatShortIDR(currentCostData.stats.peak);
                if (statPeakDate && currentCostData.stats.peakDate) {
                    statPeakDate.textContent = `(${currentCostData.stats.peakDate})`;
                }
            }

            if (typeof Chart === 'undefined') {
                setTimeout(() => { if (typeof Chart !== 'undefined') renderDailyCostTrendChart(); }, 250);
                return;
            }

            if (costTrendLineChartInstance) costTrendLineChartInstance.destroy();

            const ctx = canvas.getContext('2d');
            const gradCost = ctx.createLinearGradient(0, 0, 0, 260);
            gradCost.addColorStop(0, 'rgba(217, 119, 6, 0.32)');
            gradCost.addColorStop(1, 'rgba(217, 119, 6, 0.0)');

            const targetLine = currentCostData.labels.map(() => currentCostData.target);

            costTrendLineChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: currentCostData.labels,
                    datasets: [
                        {
                            label: 'Biaya Maintenance (IDR)',
                            data: currentCostData.costValues,
                            borderColor: '#d97706',
                            backgroundColor: gradCost,
                            fill: true,
                            tension: 0.38,
                            borderWidth: 2.8,
                            pointBackgroundColor: '#ffffff',
                            pointBorderColor: '#d97706',
                            pointBorderWidth: 2.5,
                            pointRadius: 4.5,
                            pointHoverRadius: 7.5,
                            pointHoverBackgroundColor: '#d97706',
                            pointHoverBorderColor: '#ffffff',
                            pointHoverBorderWidth: 2
                        },
                        {
                            label: 'Target Anggaran (≤ Rp 12 Jt/H)',
                            data: targetLine,
                            borderColor: '#ef4444',
                            borderDash: [6, 4],
                            borderWidth: 1.5,
                            pointRadius: 0,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    onClick: (event, elements) => {
                        if (elements && elements.length > 0) {
                            const idx = elements[0].index;
                            const sp = currentCostData.spikeDetails ? currentCostData.spikeDetails[idx] : null;
                            if (sp && sp.topCode && typeof openMachineBreakdownModal === 'function') {
                                openMachineBreakdownModal(sp.topCode);
                            }
                        }
                    },
                    onHover: (event, chartElement) => {
                        const target = event && event.native ? event.native.target : null;
                        if (target) {
                            target.style.cursor = chartElement && chartElement.length > 0 ? 'pointer' : 'default';
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleFont: { size: 12, weight: 'bold' },
                            titleColor: '#f8fafc',
                            bodyFont: { size: 11 },
                            padding: 10,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    if (context.datasetIndex === 0) {
                                        return ` Pengeluaran Biaya: Rp ${context.parsed.y.toLocaleString('id-ID')}`;
                                    } else {
                                        return ` Target Anggaran: Rp ${context.parsed.y.toLocaleString('id-ID')} / Hari`;
                                    }
                                },
                                afterBody: function(tooltipItems) {
                                    const idx = tooltipItems[0].dataIndex;
                                    const sp = currentCostData.spikeDetails ? currentCostData.spikeDetails[idx] : null;
                                    if (sp) {
                                        const lines = [
                                            '',
                                            `  • DT (Kerusakan): Rp ${Math.round(sp.costDt || 0).toLocaleString('id-ID')}`,
                                            `  • PM (Perawatan): Rp ${Math.round(sp.costPm || 0).toLocaleString('id-ID')}`
                                        ];
                                        if (sp.cause && sp.cost > 0) {
                                            lines.push('', '💰 PENGELUARAN TERBESAR:', `   ${sp.cause}`);
                                        }
                                        return lines;
                                    }
                                    return [];
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(val) {
                                    if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(0) + ' Jt';
                                    if (val >= 1000) return 'Rp ' + (val / 1000).toFixed(0) + ' Rb';
                                    return 'Rp ' + val;
                                },
                                font: { size: 10 },
                                color: '#64748b'
                            },
                            grid: { color: '#f1f5f9' }
                        },
                        x: {
                            ticks: {
                                font: { size: 11, weight: '600' },
                                color: '#334155'
                            },
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        function formatShortIDR(val) {
            if (!val || val === 0) return 'Rp 0';
            if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
            if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
            if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)} Rb`;
            return `Rp ${val}`;
        }

        // ============================================================================
        // 6. GRAFIK TREN BIAYA CABANG PABRIK (MODAL DRILLDOWN ALA GAMBAR 1 MMM)
        // ============================================================================
        let plantCostModalChartInstance = null;

        function renderPlantCostModalTrendChart(labels, values, spikeDetails, targetVal) {
            const canvas = document.getElementById('plantCostModalTrendChart');
            if (!canvas) return;

            if (plantCostModalChartInstance) {
                plantCostModalChartInstance.destroy();
                plantCostModalChartInstance = null;
            }

            if (typeof Chart === 'undefined') return;

            const ctx = canvas.getContext('2d');
            const gradPlant = ctx.createLinearGradient(0, 0, 0, 260);
            gradPlant.addColorStop(0, 'rgba(217, 119, 6, 0.32)');
            gradPlant.addColorStop(1, 'rgba(217, 119, 6, 0.0)');

            const target = targetVal || 6000000;
            const targetLine = labels.map(() => target);

            plantCostModalChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Biaya Maintenance Pabrik',
                            data: values,
                            borderColor: '#d97706',
                            backgroundColor: gradPlant,
                            fill: true,
                            tension: 0.38,
                            borderWidth: 2.8,
                            pointBackgroundColor: '#ffffff',
                            pointBorderColor: '#d97706',
                            pointBorderWidth: 2.5,
                            pointRadius: 4.5,
                            pointHoverRadius: 7.5,
                            pointHoverBackgroundColor: '#d97706',
                            pointHoverBorderColor: '#ffffff',
                            pointHoverBorderWidth: 2
                        },
                        {
                            label: `Target Toleransi (≤ ${formatShortIDR(target)}/H)`,
                            data: targetLine,
                            borderColor: '#ef4444',
                            borderDash: [6, 4],
                            borderWidth: 1.5,
                            pointRadius: 0,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    onClick: (event, elements) => {
                        if (elements && elements.length > 0) {
                            const idx = elements[0].index;
                            const sp = spikeDetails ? spikeDetails[idx] : null;
                            if (sp && sp.topCode && typeof openMachineBreakdownModal === 'function') {
                                openMachineBreakdownModal(sp.topCode);
                            }
                        }
                    },
                    onHover: (event, chartElement) => {
                        const target = event && event.native ? event.native.target : null;
                        if (target) {
                            target.style.cursor = chartElement && chartElement.length > 0 ? 'pointer' : 'default';
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleFont: { size: 12, weight: 'bold' },
                            titleColor: '#f8fafc',
                            bodyFont: { size: 11 },
                            padding: 10,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    if (context.datasetIndex === 0) {
                                        return ` Pengeluaran Biaya: Rp ${context.parsed.y.toLocaleString('id-ID')}`;
                                    } else {
                                        return ` Target Toleransi: Rp ${context.parsed.y.toLocaleString('id-ID')} / Hari`;
                                    }
                                },
                                afterBody: function(tooltipItems) {
                                    const idx = tooltipItems[0].dataIndex;
                                    const sp = spikeDetails ? spikeDetails[idx] : null;
                                    if (sp) {
                                        const lines = [
                                            '',
                                            `  • DT (Kerusakan): Rp ${Math.round(sp.costDt || 0).toLocaleString('id-ID')}`,
                                            `  • PM (Perawatan): Rp ${Math.round(sp.costPm || 0).toLocaleString('id-ID')}`
                                        ];
                                        if (sp.cause && sp.cost > 0) {
                                            lines.push('', '💰 PENGELUARAN TERBESAR:', `   ${sp.cause}`);
                                        }
                                        return lines;
                                    }
                                    return [];
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(val) {
                                    if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(0) + ' Jt';
                                    if (val >= 1000) return 'Rp ' + (val / 1000).toFixed(0) + ' Rb';
                                    return 'Rp ' + val;
                                },
                                font: { size: 10 },
                                color: '#64748b'
                            },
                            grid: { color: '#f1f5f9' }
                        },
                        x: {
                            ticks: {
                                font: { size: 11, weight: '600' },
                                color: '#334155'
                            },
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // Export globals to window
        window.renderDtTrendLineChart = renderDtTrendLineChart;
        window.renderMonthlyDtChart = renderMonthlyDtChart;
        window.renderMonthlyCostChart = renderMonthlyCostChart;
        window.renderDailyCostTrendChart = renderDailyCostTrendChart;
        window.renderPlantCostModalTrendChart = renderPlantCostModalTrendChart;
        window.setDtChartMode = setDtChartMode;
        window.setCostChartMode = setCostChartMode;
