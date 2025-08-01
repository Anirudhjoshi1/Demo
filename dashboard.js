document.addEventListener('DOMContentLoaded', () => {
    const doctorInfo = JSON.parse(sessionStorage.getItem('doctorInfo'));
    const SERVER_URL = 'https://101.53.149.101:3003';

    // Modal elements
    const modal = document.getElementById('prescriptionModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalTextElement = document.getElementById('modalPrescriptionText');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');

    // Patient Search elements
    const patientSearchPhone = document.getElementById('patientSearchPhone');
    const patientSearchBtn = document.getElementById('patientSearchBtn');
    const patientSearchResults = document.getElementById('patientSearchResults');

    // Chart instances
    let topMedicinesChart = null;
    let genderPieChart = null;
    let ageBarChart = null;

    // Protect the route
    if (!doctorInfo) {
        window.location.href = 'login.html';
        return;
    }

    // Populate UI with doctor's name
    document.getElementById('doctorName').textContent = doctorInfo.name;

    // --- CHART RENDERING FUNCTIONS ---
    function renderTopMedicinesChart(medicines) { const ctx = document.getElementById('topMedicinesChart').getContext('2d'); const labels = medicines.map(m => m.medicine_name); const data = medicines.map(m => m.prescription_count); if (topMedicinesChart) topMedicinesChart.destroy(); topMedicinesChart = new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Number of Prescriptions', data: data, backgroundColor: 'rgba(33, 128, 141, 0.6)', borderColor: 'rgba(33, 128, 141, 1)', borderWidth: 1 }] }, options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } } }); }
    function renderGenderPieChart(genders) { const ctx = document.getElementById('genderPieChart').getContext('2d'); const labels = genders.map(g => g.gender); const data = genders.map(g => g.count); if (genderPieChart) genderPieChart.destroy(); genderPieChart = new Chart(ctx, { type: 'pie', data: { labels: labels, datasets: [{ data: data, backgroundColor: ['rgba(33, 128, 141, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 205, 86, 0.7)'], }] }, options: { responsive: true, maintainAspectRatio: false } }); }
    function renderAgeBarChart(ages) { const ctx = document.getElementById('ageBarChart').getContext('2d'); const labels = Object.keys(ages); const data = Object.values(ages); if (ageBarChart) ageBarChart.destroy(); ageBarChart = new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Number of Patients', data: data, backgroundColor: 'rgba(168, 75, 47, 0.6)', borderColor: 'rgba(168, 75, 47, 1)', borderWidth: 1 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } }); }

    // --- DATA FETCHING & DISPLAY FUNCTIONS ---
    const showModal = () => modal.classList.remove('hidden');
    const hideModal = () => modal.classList.add('hidden');

    async function viewPrescription(prescriptionId) {
        modalTextElement.textContent = 'Loading...';
        downloadPdfBtn.dataset.prescriptionText = ''; // Clear previous text
        showModal();
        try {
            const response = await fetch(`${SERVER_URL}/api/prescription/${prescriptionId}`);
            const data = await response.json();
            if (data.success) {
                modalTextElement.textContent = data.prescription.prescription_text;
                // Store the text for PDF download
                downloadPdfBtn.dataset.prescriptionText = data.prescription.prescription_text;
            } else {
                modalTextElement.textContent = `Error: ${data.message}`;
            }
        } catch (error) {
            modalTextElement.textContent = 'Failed to load prescription details.';
        }
    }

    async function fetchDashboardData() {
        try {
            const response = await fetch(`${SERVER_URL}/api/dashboard-data/${doctorInfo.doctor_id}`);
            const data = await response.json();
            if (data.success) {
                document.getElementById('patientsToday').textContent = data.patientsToday;
                document.getElementById('patientsThisMonth').textContent = data.patientsThisMonth;
                document.getElementById('totalPrescriptions').textContent = data.totalPrescriptions;
                const tableBody = document.getElementById('recentPrescriptionsTable');
                tableBody.innerHTML = '';
                if (data.recentPrescriptions.length > 0) {
                    data.recentPrescriptions.forEach(p => {
                        const row = document.createElement('tr');
                        row.innerHTML = `<td style="padding: 8px;">${p.patient_name}</td><td style="padding: 8px;">${new Date(p.date).toLocaleDateString()}</td><td style="text-align: right; padding: 8px;"><button class="btn btn--sm btn--outline view-btn" data-id="${p.prescription_id}">View</button></td>`;
                        tableBody.appendChild(row);
                    });
                } else {
                    tableBody.innerHTML = '<tr><td colspan="3" class="text-center" style="padding: 16px;">No recent prescriptions found.</td></tr>';
                }
            }
        } catch (error) { console.error('Failed to fetch dashboard data:', error); }
    }

    async function fetchDashboardInsights() {
        try {
            const response = await fetch(`${SERVER_URL}/api/dashboard-insights/${doctorInfo.doctor_id}`);
            const data = await response.json();
            if (data.success && data.insights) {
                renderTopMedicinesChart(data.insights.topMedicines);
                renderGenderPieChart(data.insights.genderDistribution);
                renderAgeBarChart(data.insights.ageDistribution);
            }
        } catch (error) { console.error('Failed to fetch dashboard insights:', error); }
    }

    async function searchPatientHistory() {
        const phone = patientSearchPhone.value;
        if (!phone) {
            alert('Please enter a phone number.');
            return;
        }
        patientSearchResults.innerHTML = '<p>Searching...</p>';
        try {
            const response = await fetch(`${SERVER_URL}/api/doctor/${doctorInfo.doctor_id}/patient-search?phone=${phone}`);
            const data = await response.json();
            patientSearchResults.innerHTML = '';
            if (data.success && data.prescriptions.length > 0) {
                const table = document.createElement('table');
                table.className = 'table';
                table.style.width = '100%';
                table.innerHTML = `<thead><tr><th>Patient Name</th><th>Date</th><th style="text-align: right;">Action</th></tr></thead>`;
                const tbody = document.createElement('tbody');
                data.prescriptions.forEach(p => {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${p.patient_name}</td><td>${new Date(p.date).toLocaleDateString()}</td><td style="text-align: right;"><button class="btn btn--sm btn--outline view-btn" data-id="${p.prescription_id}">View</button></td>`;
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                patientSearchResults.appendChild(table);
            } else {
                patientSearchResults.innerHTML = '<p>No prescriptions found for this patient.</p>';
            }
        } catch (error) {
            console.error('Patient search failed:', error);
            patientSearchResults.innerHTML = '<p>An error occurred during the search.</p>';
        }
    }

    function downloadPrescriptionAsPdf() {
        const text = downloadPdfBtn.dataset.prescriptionText;
        if (!text) {
            alert('No prescription text to download.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(text, 180);
        doc.text(lines, 15, 20);
        doc.save('prescription.pdf');
    }

    // --- EVENT LISTENERS ---
    document.getElementById('logoutBtn').addEventListener('click', () => { sessionStorage.removeItem('doctorInfo'); window.location.href = 'login.html'; });
    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
    downloadPdfBtn.addEventListener('click', downloadPrescriptionAsPdf);
    patientSearchBtn.addEventListener('click', searchPatientHistory);

    // Use event delegation for all view buttons on the page
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('view-btn')) {
            viewPrescription(e.target.getAttribute('data-id'));
        }
    });

    // --- INITIALIZATION ---
    fetchDashboardData();
    fetchDashboardInsights();
});

