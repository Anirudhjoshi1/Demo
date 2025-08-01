document.addEventListener('DOMContentLoaded', () => {
    const SERVER_URL = 'https://101.53.149.101:3003';
    let startDate = moment().subtract(29, 'days').format('YYYY-MM-DD');
    let endDate = moment().format('YYYY-MM-DD');

    // Chart instances
    let topDoctorsChart, topMedicinesChart, medicineDoctorsChart;

    // DOM Elements
    const loadingSpinner = document.getElementById('loadingSpinner');
    const medicineSearch = document.getElementById('medicineSearch');
    const suggestionsBox = document.getElementById('suggestionsBox');
    const medicineAnalysisSection = document.getElementById('medicineAnalysisSection');
    const medicineAnalysisTitle = document.getElementById('medicineAnalysisTitle');

    // --- INITIALIZATION ---

    // Initialize Date Range Picker
    $('#dateRangePicker').daterangepicker({
        startDate: moment().subtract(29, 'days'),
        endDate: moment(),
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, (start, end) => {
        startDate = start.format('YYYY-MM-DD');
        endDate = end.format('YYYY-MM-DD');
        fetchAllData();
    });

    // --- CHART RENDERING FUNCTIONS ---

    function renderBarChart(canvasId, chartInstance, data, label, title, indexAxis = 'x') {
        const ctx = document.getElementById(canvasId).getContext('2d');
        if (chartInstance) chartInstance.destroy();
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: label,
                    data: data.values,
                    backgroundColor: 'rgba(33, 128, 141, 0.6)',
                    borderColor: 'rgba(33, 128, 141, 1)',
                    borderWidth: 1
                }]
            },
            options: { indexAxis, responsive: true, plugins: { title: { display: true, text: title } } }
        });
    }

    // --- DATA FETCHING ---

    async function fetchGeneralInsights() {
        loadingSpinner.style.display = 'block';
        try {
            const response = await fetch(`${SERVER_URL}/api/pharma/general-insights?startDate=${startDate}&endDate=${endDate}`);
            const data = await response.json();
            if (data.success) {
                topDoctorsChart = renderBarChart('topDoctorsChart', topDoctorsChart, {
                    labels: data.topDoctors.map(d => `${d.name} (${d.city})`),
                    values: data.topDoctors.map(d => d.prescription_count)
                }, 'Prescriptions', 'Top Doctors by Prescription Volume', 'y');

                topMedicinesChart = renderBarChart('topMedicinesChart', topMedicinesChart, {
                    labels: data.topMedicines.map(m => m.medicine_name),
                    values: data.topMedicines.map(m => m.prescription_count)
                }, 'Prescriptions', 'Top Prescribed Medicines', 'y');
            }
        } catch (error) {
            console.error('Error fetching general insights:', error);
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    async function searchMedicines(term) {
        if (term.length < 3) {
            suggestionsBox.style.display = 'none';
            return;
        }
        try {
            const response = await fetch(`${SERVER_URL}/api/pharma/medicine-search?term=${term}`);
            const suggestions = await response.json();
            suggestionsBox.innerHTML = '';
            if (suggestions.length > 0) {
                suggestions.forEach(name => {
                    const div = document.createElement('div');
                    div.textContent = name;
                    div.style.padding = '10px';
                    div.style.cursor = 'pointer';
                    div.onclick = () => {
                        medicineSearch.value = name;
                        suggestionsBox.style.display = 'none';
                        fetchMedicineDoctors(name);
                    };
                    suggestionsBox.appendChild(div);
                });
                suggestionsBox.style.display = 'block';
            } else {
                suggestionsBox.style.display = 'none';
            }
        } catch (error) {
            console.error('Error searching medicines:', error);
        }
    }

    async function fetchMedicineDoctors(medicineName) {
        loadingSpinner.style.display = 'block';
        medicineAnalysisSection.style.display = 'block';
        medicineAnalysisTitle.textContent = `Top Doctors Prescribing "${medicineName}"`;
        try {
            const response = await fetch(`${SERVER_URL}/api/pharma/medicine-doctors?medicineName=${medicineName}&startDate=${startDate}&endDate=${endDate}`);
            const data = await response.json();
            if (data.success) {
                medicineDoctorsChart = renderBarChart('medicineDoctorsChart', medicineDoctorsChart, {
                    labels: data.doctors.map(d => `${d.name} (${d.city})`),
                    values: data.doctors.map(d => d.prescription_count)
                }, 'Prescriptions', `Top Doctors for ${medicineName}`, 'y');
            }
        } catch (error) {
            console.error('Error fetching medicine doctors:', error);
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }
    
    function fetchAllData() {
        fetchGeneralInsights();
        if (medicineSearch.value) {
            fetchMedicineDoctors(medicineSearch.value);
        }
    }

    // --- EVENT LISTENERS ---
    let debounceTimer;
    medicineSearch.addEventListener('keyup', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchMedicines(e.target.value);
        }, 300);
    });
    
    document.addEventListener('click', (e) => {
        if (!suggestionsBox.contains(e.target) && e.target !== medicineSearch) {
            suggestionsBox.style.display = 'none';
        }
    });

    // --- INITIAL LOAD ---
    fetchAllData();
});

