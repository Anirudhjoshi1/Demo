document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const formMessage = document.getElementById('formMessage');
    const SERVER_URL = 'http://101.53.149.101:3000'; // Your server URL

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formMessage.textContent = '';
        formMessage.style.color = 'var(--color-error)';

        // --- Get form data ---
        const name = document.getElementById('name').value;
        const mobile_number = document.getElementById('mobile_number').value;
        const email = document.getElementById('email').value;
        const specialty = document.getElementById('specialty').value;
        const registration_number = document.getElementById('registration_number').value;
        const city = document.getElementById('city').value;
        const password = document.getElementById('password').value;
        const confirm_password = document.getElementById('confirm_password').value;

        // --- Basic Validation ---
        if (password !== confirm_password) {
            formMessage.textContent = 'Passwords do not match.';
            return;
        }

        if (password.length < 6) {
            formMessage.textContent = 'Password must be at least 6 characters long.';
            return;
        }

        const doctorData = {
            name,
            mobile_number,
            email,
            specialty,
            registration_number,
            city,
            password_hash: password // Sending plain password, server will handle it
        };

        try {
            const response = await fetch(`${SERVER_URL}/api/doctor-signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(doctorData),
            });

            const data = await response.json();

            if (data.success) {
                formMessage.style.color = 'var(--color-success)';
                formMessage.textContent = 'Registration successful! You can now log in.';
                signupForm.reset(); // Clear the form
            } else {
                formMessage.textContent = data.message || 'Registration failed. Please try again.';
            }
        } catch (error) {
            console.error('Signup request failed:', error);
            formMessage.textContent = 'An error occurred. Please try again later.';
        }
    });
});
