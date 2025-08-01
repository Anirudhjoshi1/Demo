document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const SERVER_URL = 'https://101.53.149.101:3003'; // Your server URL

    // For testing, pre-fill with the credentials of Dr. Anju Bajoria
    // In doctor_master, assuming mobile is '7763869555' and password is 'password123'
    document.getElementById('mobile_number').value = '7763869555';
    document.getElementById('password').value = 'temppass';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';

        const mobile_number = document.getElementById('mobile_number').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${SERVER_URL}/api/doctor-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mobile_number, password }),
            });

            const data = await response.json();

            if (data.success) {
                // Store doctor info in session storage for security
                sessionStorage.setItem('doctorInfo', JSON.stringify(data.doctor));
                window.location.href = 'dashboard.html'; // Redirect to dashboard
            } else {
                loginError.textContent = data.message || 'Login failed. Please check your credentials.';
            }
        } catch (error) {
            console.error('Login request failed:', error);
            loginError.textContent = 'An error occurred. Please try again later.';
        }
    });
});