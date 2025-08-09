document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('playbookForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const resultMessage = document.getElementById('resultMessage');

    // Form validation
    function validateForm(formData) {
        const errors = [];
        
        if (!formData.name.trim()) {
            errors.push('Name is required');
        }
        
        if (!formData.email.trim()) {
            errors.push('Email is required');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!formData.niche.trim()) {
            errors.push('Niche is required');
        }
        
        if (!formData.audience.trim()) {
            errors.push('Target audience is required');
        }
        
        if (!formData.goal) {
            errors.push('Primary goal is required');
        }
        
        if (!formData.platforms) {
            errors.push('Please select at least one platform');
        }
        
        if (!formData.timezone) {
            errors.push('Timezone is required');
        }
        
        return errors;
    }

    // Get selected platforms
    function getSelectedPlatforms() {
        const checkboxes = document.querySelectorAll('input[name="platforms"]:checked');
        return Array.from(checkboxes).map(cb => cb.value).join(', ');
    }

    // Show result message
    function showMessage(message, type = 'success') {
        resultMessage.textContent = message;
        resultMessage.className = `result-message ${type}`;
        resultMessage.style.display = 'block';
        
        // Scroll to message
        resultMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto hide success messages after 10 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (resultMessage.classList.contains('success')) {
                    resultMessage.style.display = 'none';
                }
            }, 10000);
        }
    }

    // Set loading state
    function setLoading(loading) {
        submitBtn.disabled = loading;
        btnText.style.display = loading ? 'none' : 'inline';
        btnLoading.style.display = loading ? 'flex' : 'none';
        
        if (loading) {
            form.classList.add('loading');
        } else {
            form.classList.remove('loading');
        }
    }

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide previous messages
        resultMessage.style.display = 'none';
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            niche: document.getElementById('niche').value,
            audience: document.getElementById('audience').value,
            goal: document.getElementById('goal').value,
            platforms: getSelectedPlatforms(),
            timezone: document.getElementById('timezone').value
        };
        
        // Validate form
        const errors = validateForm(formData);
        if (errors.length > 0) {
            showMessage(errors.join('. '), 'error');
            return;
        }
        
        // Set loading state
        setLoading(true);
        
        try {
            const response = await fetch('/api/generate-playbook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                showMessage(result.message, 'success');
                
                // Reset form after successful submission
                setTimeout(() => {
                    form.reset();
                    // Uncheck all platform checkboxes
                    document.querySelectorAll('input[name="platforms"]').forEach(cb => {
                        cb.checked = false;
                    });
                }, 2000);
                
            } else {
                throw new Error(result.details || result.error || 'Failed to generate playbook');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showMessage(
                error.message || 'An unexpected error occurred. Please check your internet connection and try again.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    });

    // Add subtle animation to form elements on focus
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-1px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    // Platform checkbox interactions
    const platformCheckboxes = document.querySelectorAll('input[name="platforms"]');
    platformCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.closest('.checkbox-label');
            if (this.checked) {
                label.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    label.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });

    // Add loading animation to the container
    const formContainer = document.querySelector('.form-container');
    
    // Intersection Observer for entrance animation
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        },
        { threshold: 0.1 }
    );
    
    // Initial state for animation
    formContainer.style.opacity = '0';
    formContainer.style.transform = 'translateY(20px)';
    formContainer.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    observer.observe(formContainer);
});
