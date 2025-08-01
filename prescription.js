class MedScriptApp {
    constructor() {
        // --- Core Properties ---
        this.recognition = null;
        this.isRecording = false;
        this.prescriptionData = {};
        this.doctorInfo = JSON.parse(sessionStorage.getItem('doctorInfo'));
        
        // --- Constants ---
        this.API_KEY = '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';
        this.SERVER_URL = 'http://101.53.149.101:3000';

        // --- Initialization ---
        this.init();
    }

    init() {
        // For testing purposes, create mock doctor info if not available
        if (!this.doctorInfo) {
            this.doctorInfo = {
                doctor_id: 'test_001',
                name: 'Dr. Test Doctor',
                registration_number: 'REG123456',
                specialty: 'General Medicine'
            };
            sessionStorage.setItem('doctorInfo', JSON.stringify(this.doctorInfo));
        }
        
        this.setupSpeechRecognition();
        this.setupEventListeners();
        this.loadDoctorData();
        this.addInitialMedication();
        this.setCurrentDate();
        this.showLoading(false);
    }

    // --- SETUP & INITIALIZATION ---

    loadDoctorData() {
        document.getElementById('doctorName').value = this.doctorInfo.name || '';
        document.getElementById('doctorReg').value = this.doctorInfo.registration_number || '';
        document.getElementById('doctorSpecialty').value = this.doctorInfo.specialty || '';
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('consultationDate').value = today;
    }

    setupEventListeners() {
        // Patient Search
        document.getElementById('searchPatientBtn').addEventListener('click', () => this.searchPatient());

// Add this event listener inside the setupEventListeners function
document.getElementById('dashboardBtn').addEventListener('click', (e) => {
    e.preventDefault(); // This prevents the link from acting like a normal link
    window.location.href = 'dashboard.html'; // This navigates to the dashboard
});

        // Recording
        document.getElementById('startRecording').addEventListener('click', () => this.startRecording());
        document.getElementById('stopRecording').addEventListener('click', () => this.stopRecording());
        document.getElementById('clearTranscript').addEventListener('click', () => this.clearTranscript());
        
        // AI Formatting
        document.getElementById('formatWithAI').addEventListener('click', () => this.formatWithAI());

        // Medications
        document.getElementById('addMedication').addEventListener('click', () => this.addMedication());

        // Actions & Export
        document.getElementById('saveAndDownloadPDF').addEventListener('click', () => this.saveAndDownloadPDF());
        document.getElementById('downloadExcel').addEventListener('click', () => this.downloadExcel());
        document.getElementById('sendEmail').addEventListener('click', () => this.sendEmail());
        document.getElementById('shareWhatsApp').addEventListener('click', () => this.shareWhatsApp());
    }

    // --- PATIENT MANAGEMENT ---

    async searchPatient() {
        const mobile = document.getElementById('patientMobile').value;
        const statusEl = document.getElementById('patientSearchStatus');

        if (!mobile) {
            this.showToast('Please enter a mobile number to search.', 'warning');
            return;
        }

        this.showLoading(true);
        statusEl.textContent = 'Searching...';
        statusEl.style.color = 'var(--color-info)';

        try {
            const response = await fetch(`${this.SERVER_URL}/api/search-patient/${mobile}`);
            const data = await response.json();

            if (data.success && data.found) {
                this.populatePatientForm(data.patient);
                statusEl.textContent = `Existing patient found: ${data.patient.name}`;
                statusEl.style.color = 'var(--color-success)';
                this.showToast('Patient data loaded.', 'success');
            } else {
                this.clearPatientForm();
                statusEl.textContent = 'New patient. Please fill in the details.';
                statusEl.style.color = 'var(--color-warning)';
                this.showToast('No existing patient found.', 'info');
            }
        } catch (error) {
            console.error('Patient search failed:', error);
            statusEl.textContent = 'Error searching for patient.';
            statusEl.style.color = 'var(--color-error)';
            this.showToast('Patient search failed.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    populatePatientForm(patient) {
        document.getElementById('patientName').value = patient.name || '';
        document.getElementById('patientAge').value = patient.age || '';
        document.getElementById('patientGender').value = patient.gender || '';
        document.getElementById('patientPincode').value = patient.pincode || ''; // 🚀 REVISED
        document.getElementById('patientEmail').value = patient.email || '';
        document.getElementById('whatsappNumber').value = document.getElementById('patientMobile').value;
    }

    clearPatientForm() {
        document.getElementById('patientName').value = '';
        document.getElementById('patientAge').value = '';
        document.getElementById('patientGender').value = '';
        document.getElementById('patientPincode').value = ''; // 🚀 REVISED
        document.getElementById('patientEmail').value = '';
    }

    // --- CORE FUNCTIONALITY (Voice, AI) ---
    
    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.onstart = () => { this.isRecording = true; this.updateRecordingStatus('recording'); this.updateRecordingButtons(true); };
            this.recognition.onend = () => { this.isRecording = false; this.updateRecordingStatus('ready'); this.updateRecordingButtons(false); };
            this.recognition.onerror = (event) => { console.error('Speech recognition error:', event.error); this.showToast('Speech recognition error: ' + event.error, 'error'); this.stopRecording(); };
            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                }
                document.getElementById('transcriptText').value += finalTranscript;
            };
        } else {
            this.showToast('Speech recognition not supported.', 'warning');
        }
    }

    startRecording = () => this.recognition?.start();
    stopRecording = () => this.recognition?.stop();
    clearTranscript = () => document.getElementById('transcriptText').value = '';
    updateRecordingButtons = (isRecording) => {
        document.getElementById('startRecording').disabled = isRecording;
        document.getElementById('stopRecording').disabled = !isRecording;
    }
    updateRecordingStatus(status) {
        const statusElement = document.getElementById('recordingStatus');
        statusElement.className = 'status-indicator'; // Reset
        switch (status) {
            case 'recording': statusElement.textContent = 'Recording...'; statusElement.classList.add('recording'); break;
            case 'processing': statusElement.textContent = 'Processing...'; statusElement.classList.add('processing'); break;
            default: statusElement.textContent = 'Ready'; break;
        }
    }

    async formatWithAI() {
        const transcript = document.getElementById('transcriptText').value;
        if (!transcript.trim()) return this.showToast('No text to format.', 'warning');
        
        this.showLoading(true);
        this.updateRecordingStatus('processing');

        try {
            const formattedData = await this.callPerplexityAPI(transcript);
            this.populatePrescriptionFields(formattedData);
            this.showToast('Formatted with AI!', 'success');
        } catch (error) {
            this.showToast('AI formatting error: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
            this.updateRecordingStatus('ready');
        }
    }

    async callPerplexityAPI(text) {
        const prompt = `Format the following medical dictation into JSON. Categories are: chiefComplaint, clinicalFindings, diagnosis, medications (array of objects with name, strength, form, quantity, sig), investigations, advice. Dictation: "${text}"`;
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'sonar-pro', messages: [{ role: 'user', content: prompt }] })
        });
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));
    }

    populatePrescriptionFields(data) {
        document.getElementById('chiefComplaint').value = data.chiefComplaint || '';
        document.getElementById('clinicalFindings').value = data.clinicalFindings || '';
        document.getElementById('diagnosis').value = data.diagnosis || '';
        document.getElementById('investigations').value = data.investigations || '';
        document.getElementById('advice').value = data.advice || '';

        const medList = document.getElementById('medicationsList');
        medList.innerHTML = ''; // Clear existing
        if (data.medications?.length > 0) {
            data.medications.forEach(med => this.addMedication(med));
        } else {
            this.addMedication(); // Add one empty row
        }
    }

    // --- MEDICATION MANAGEMENT ---
    
    addInitialMedication = () => this.addMedication();
// This is the updated function for your prescription.js file

addMedication(medData = null) {
    const list = document.getElementById('medicationsList');
    const item = document.createElement('div');
    item.className = 'medication-item';

    // The change is in the HTML template string below
    item.innerHTML = `
        <div class="form-group">
            <label class="form-label">Name</label>
            <input type="text" class="form-control med-name" value="${medData?.name || ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Strength</label>
            <input type="text" class="form-control med-strength" value="${medData?.strength || ''}">
        </div>

        <!-- 🚀 REVISED FORM DROPDOWN -->
        <div class="form-group">
            <label class="form-label">Form</label>
            <select class="form-control med-form">
                <option value="">Select form</option>
                <option value="Tablet" ${medData?.form === 'Tablet' ? 'selected' : ''}>Tablet</option>
                <option value="Capsule" ${medData?.form === 'Capsule' ? 'selected' : ''}>Capsule</option>
                <option value="Syrup" ${medData?.form === 'Syrup' ? 'selected' : ''}>Syrup</option>
                <option value="Injection" ${medData?.form === 'Injection' ? 'selected' : ''}>Injection</option>
                <option value="Drops" ${medData?.form === 'Drops' ? 'selected' : ''}>Drops</option>
                <option value="Cream" ${medData?.form === 'Cream' ? 'selected' : ''}>Cream</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Quantity</label>
            <input type="text" class="form-control med-quantity" value="${medData?.quantity || ''}">
        </div>
        <button type="button" class="remove-medication">×</button>
        <div class="form-group medication-sig">
            <label class="form-label">Instructions (Sig)</label>
            <input type="text" class="form-control med-sig" value="${medData?.sig || ''}">
        </div>
    `;
    item.querySelector('.remove-medication').addEventListener('click', () => item.remove());
    list.appendChild(item);
}
    
    // --- DATA GATHERING & SAVING ---

    gatherPrescriptionData() {
        // Doctor Data
        const doctorData = {
            doctor_id: this.doctorInfo.doctor_id,
            name: this.doctorInfo.name,
            registration: this.doctorInfo.registration_number,
            specialty: this.doctorInfo.specialty
        };
        
        // Patient Data
        const patientData = {
            name: document.getElementById('patientName').value,
            age: document.getElementById('patientAge').value,
            gender: document.getElementById('patientGender').value,
            pincode: document.getElementById('patientPincode').value, // 🚀 REVISED
            whatsapp_phone: document.getElementById('patientMobile').value,
            date: document.getElementById('consultationDate').value,
            email: document.getElementById('patientEmail').value,
        };

        // Medications
        const medications = Array.from(document.querySelectorAll('.medication-item')).map(item => ({
            name: item.querySelector('.med-name').value,
            strength: item.querySelector('.med-strength').value,
            form: item.querySelector('.med-form').value,
            quantity: item.querySelector('.med-quantity').value,
            sig: item.querySelector('.med-sig').value
        })).filter(m => m.name);

        // Prescription texts
        const prescriptionFields = {
            chiefComplaint: document.getElementById('chiefComplaint').value,
            clinicalFindings: document.getElementById('clinicalFindings').value,
            diagnosis: document.getElementById('diagnosis').value,
            investigations: document.getElementById('investigations').value,
            advice: document.getElementById('advice').value,
            followUp: document.getElementById('followUp').value,
            medications: medications
        };

        // Generate full text for DB
        prescriptionFields.fullText = this.generateFullPrescriptionText(doctorData, patientData, prescriptionFields);
        
        return { doctor: doctorData, patient: patientData, prescription: prescriptionFields };
    }
    
    generateFullPrescriptionText(doctor, patient, prescription) {
        let text = `PRESCRIPTION\n\n`;
        text += `Doctor: ${doctor.name} (${doctor.specialty})\nReg. No: ${doctor.registration}\n\n`;
        text += `Patient: ${patient.name}, Age: ${patient.age}, Gender: ${patient.gender}\nDate: ${patient.date}\n\n`;
        if (prescription.chiefComplaint) text += `Chief Complaint:\n${prescription.chiefComplaint}\n\n`;
        if (prescription.diagnosis) text += `Diagnosis:\n${prescription.diagnosis}\n\n`;
        text += `Medications (Rx):\n`;
        prescription.medications.forEach(m => {
            text += `- ${m.name} ${m.strength} (${m.form}) - Qty: ${m.quantity}\n  Sig: ${m.sig}\n`;
        });
        text += `\n`;
        if (prescription.investigations) text += `Investigations:\n${prescription.investigations}\n\n`;
        if (prescription.advice) text += `Advice:\n${prescription.advice}\n\n`;
        if (prescription.followUp) text += `Follow-up on: ${prescription.followUp}\n`;
        return text;
    }


    async saveAndDownloadPDF() {
        const data = this.gatherPrescriptionData();
        if (!data.patient.name || !data.patient.whatsapp_phone) {
            return this.showToast('Patient Name and Mobile are required.', 'warning');
        }

        this.showLoading(true);
        try {
            // Step 1: Save data to the server
            const response = await fetch(`${this.SERVER_URL}/api/save-prescription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (!result.success) throw new Error(result.message || 'Failed to save prescription.');
            
            this.showToast('Prescription saved successfully!', 'success');
            
            // Step 2: Generate and download PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            this.addPrescriptionToPDF(doc, data);
            doc.save(`Prescription_${data.patient.name}.pdf`);
            
        } catch (error) {
            console.error('Save/Download PDF failed:', error);
            this.showToast(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // --- EXPORT & SHARING ---

    addPrescriptionToPDF(doc, data) {
        let y = 20;
        doc.setFontSize(18).setFont(undefined, 'bold').text('Medical Prescription', 105, y, { align: 'center' });
        y += 15;
        doc.setFontSize(10).setFont(undefined, 'normal').splitTextToSize(data.prescription.fullText, 180).forEach(line => {
             doc.text(line, 15, y);
             y+=5;
        });
    }

    async downloadExcel() {
        const data = this.gatherPrescriptionData();
        if (!data.patient.name || !data.patient.whatsapp_phone) {
            return this.showToast('Patient Name and Mobile are required.', 'warning');
        }

        try {
            const wb = XLSX.utils.book_new();
            const wsData = [
                ['Field', 'Value'],
                ['Doctor Name', data.doctor.name],
                ['Registration', data.doctor.registration],
                ['Specialty', data.doctor.specialty],
                ['Patient Name', data.patient.name],
                ['Age', data.patient.age],
                ['Gender', data.patient.gender],
                ['Mobile', data.patient.whatsapp_phone],
                ['Date', data.patient.date],
                ['Chief Complaint', data.prescription.chiefComplaint],
                ['Clinical Findings', data.prescription.clinicalFindings],
                ['Diagnosis', data.prescription.diagnosis],
                ['Investigations', data.prescription.investigations],
                ['Advice', data.prescription.advice],
                ['Follow-up', data.prescription.followUp]
            ];
            
            // Add medications
            data.prescription.medications.forEach((med, index) => {
                wsData.push([`Medication ${index + 1}`, `${med.name} ${med.strength} (${med.form}) - Qty: ${med.quantity} - ${med.sig}`]);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, 'Prescription');
            XLSX.writeFile(wb, `Prescription_${data.patient.name}.xlsx`);
            this.showToast('Excel file downloaded successfully!', 'success');
        } catch (error) {
            console.error('Excel download failed:', error);
            this.showToast('Failed to download Excel file.', 'error');
        }
    }

    async sendEmail() {
        const email = document.getElementById('patientEmail').value;
        if (!email) {
            return this.showToast('Please enter patient email address.', 'warning');
        }

        const data = this.gatherPrescriptionData();
        if (!data.patient.name || !data.patient.whatsapp_phone) {
            return this.showToast('Patient Name and Mobile are required.', 'warning');
        }

        this.showLoading(true);
        try {
            const response = await fetch(`${this.SERVER_URL}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    subject: `Prescription for ${data.patient.name}`,
                    prescriptionData: data
                })
            });

            const result = await response.json();
            if (result.success) {
                this.showToast('Email sent successfully!', 'success');
            } else {
                throw new Error(result.message || 'Failed to send email');
            }
        } catch (error) {
            console.error('Email sending failed:', error);
            this.showToast(`Failed to send email: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async shareWhatsApp() {
        const whatsappNumber = document.getElementById('whatsappNumber').value;
        if (!whatsappNumber) {
            return this.showToast('Please enter WhatsApp number.', 'warning');
        }

        const data = this.gatherPrescriptionData();
        if (!data.patient.name || !data.patient.whatsapp_phone) {
            return this.showToast('Patient Name and Mobile are required.', 'warning');
        }

        try {
            // Format the prescription text for WhatsApp
            const prescriptionText = this.formatPrescriptionForWhatsApp(data);
            
            // Clean the phone number (remove spaces, dashes, etc.)
            const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
            
            // Create WhatsApp URL
            const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(prescriptionText)}`;
            
            // Open WhatsApp in a new window/tab
            window.open(whatsappUrl, '_blank');
            
            this.showToast('WhatsApp opened with prescription details!', 'success');
            
            // Optionally save the sharing activity to the server
            await this.logWhatsAppShare(data, cleanNumber);
            
        } catch (error) {
            console.error('WhatsApp sharing failed:', error);
            this.showToast(`Failed to share via WhatsApp: ${error.message}`, 'error');
        }
    }

    formatPrescriptionForWhatsApp(data) {
        let text = `*MEDICAL PRESCRIPTION*\n\n`;
        text += `*Doctor:* ${data.doctor.name}\n`;
        text += `*Specialty:* ${data.doctor.specialty}\n`;
        text += `*Registration:* ${data.doctor.registration}\n\n`;
        
        text += `*Patient:* ${data.patient.name}\n`;
        text += `*Age:* ${data.patient.age} | *Gender:* ${data.patient.gender}\n`;
        text += `*Date:* ${data.patient.date}\n\n`;
        
        if (data.prescription.chiefComplaint) {
            text += `*Chief Complaint:*\n${data.prescription.chiefComplaint}\n\n`;
        }
        
        if (data.prescription.clinicalFindings) {
            text += `*Clinical Findings:*\n${data.prescription.clinicalFindings}\n\n`;
        }
        
        if (data.prescription.diagnosis) {
            text += `*Diagnosis:*\n${data.prescription.diagnosis}\n\n`;
        }
        
        if (data.prescription.medications && data.prescription.medications.length > 0) {
            text += `*Medications (Rx):*\n`;
            data.prescription.medications.forEach((med, index) => {
                text += `${index + 1}. *${med.name}* ${med.strength}\n`;
                text += `   Form: ${med.form} | Qty: ${med.quantity}\n`;
                text += `   Instructions: ${med.sig}\n\n`;
            });
        }
        
        if (data.prescription.investigations) {
            text += `*Investigations:*\n${data.prescription.investigations}\n\n`;
        }
        
        if (data.prescription.advice) {
            text += `*Advice:*\n${data.prescription.advice}\n\n`;
        }
        
        if (data.prescription.followUp) {
            text += `*Follow-up Date:* ${data.prescription.followUp}\n\n`;
        }
        
        text += `---\n*Generated by MedScript Pro*`;
        
        return text;
    }

    async logWhatsAppShare(data, phoneNumber) {
        try {
            await fetch(`${this.SERVER_URL}/api/log-whatsapp-share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: data.doctor.doctor_id,
                    patientName: data.patient.name,
                    patientPhone: data.patient.whatsapp_phone,
                    sharedToPhone: phoneNumber,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.log('Failed to log WhatsApp share activity:', error);
            // Don't show error to user as this is just logging
        }
    }


    // --- UTILITY METHODS ---

    showLoading(show) {
        document.getElementById('loadingOverlay').classList.toggle('hidden', !show);
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    new MedScriptApp();
});