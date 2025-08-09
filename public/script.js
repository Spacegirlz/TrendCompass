document.addEventListener('DOMContentLoaded', function() {
    const playbookForm = document.getElementById('playbookForm');
    const trendsForm = document.getElementById('trendsForm');
    const submitBtn = document.getElementById('submitBtn');
    const resultMessage = document.getElementById('resultMessage');
    
    // Mode switching
    const trendsMode = document.getElementById('trendsMode');
    const playbookMode = document.getElementById('playbookMode');
    
    trendsMode.addEventListener('click', () => {
        trendsMode.classList.add('active');
        playbookMode.classList.remove('active');
        trendsForm.style.display = 'block';
        playbookForm.style.display = 'none';
        resultMessage.style.display = 'none';
    });
    
    playbookMode.addEventListener('click', () => {
        playbookMode.classList.add('active');
        trendsMode.classList.remove('active');
        playbookForm.style.display = 'block';
        trendsForm.style.display = 'none';
        resultMessage.style.display = 'none';
    });

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

    // Handle trending ideas form
    trendsForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const topic = document.getElementById('topic').value.trim();
        if (!topic) {
            showMessage('Please enter a topic', 'error');
            return;
        }

        const trendsBtn = trendsForm.querySelector('.trends-btn');
        const btnText = trendsBtn.querySelector('.btn-text');
        const btnLoading = trendsBtn.querySelector('.btn-loading');
        const loadingTimer = trendsBtn.querySelector('.loading-timer');
        const progressBar = trendsBtn.querySelector('.progress-bar');
        
        // Set loading state
        trendsBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'flex';
        
        // Start progress animation
        if (progressBar) {
            progressBar.style.animation = 'progress 60s linear';
        }
        
        // Update timer countdown
        let timeLeft = 60;
        let timerInterval;
        if (loadingTimer) {
            timerInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    loadingTimer.textContent = `Estimated: ${timeLeft}s`;
                } else {
                    loadingTimer.textContent = 'Almost ready...';
                }
            }, 1000);
        }
        
        try {
            const response = await fetch('/api/generate-trends', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                displayTrendingResults(result);
            } else {
                showMessage(result.details || 'Failed to generate trending ideas', 'error');
            }
        } catch (error) {
            console.error('Error details:', error);
            const errorMessage = error.message || 'Network error. Please check your connection and try again.';
            showMessage(errorMessage, 'error');
        } finally {
            // Reset loading state
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            trendsBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
            if (progressBar) {
                progressBar.style.animation = 'none';
                progressBar.style.width = '0%';
            }
        }
    });

    // Display trending results
    function displayTrendingResults(result) {
        // Handle nested data structure from Perplexity response
        const data = result.data.data || result.data;
        let html = `<div class="trends-results">
            <h3>🔥 Trending Ideas for "${result.topic}"</h3>
            <div class="trends-content">
                <div class="trends-section">
                    <h4>💡 Latest Trending Ideas</h4>
                    ${convertMarkdownTableWithScriptButtons(data.trending_ideas_table)}
                </div>`;
        
        if (data.platform_heatmap) {
            html += `<div class="trends-section">
                <h4>📊 Platform Performance Heat Map</h4>
                ${convertMarkdownTable(data.platform_heatmap)}
            </div>`;
        }
        
        if (data.unique_insights) {
            html += `<div class="trends-section">
                <h4>💡 Unique Content Creation Insights</h4>
                <div class="unique-insights">`;
            
            // Split insights into numbered list format and clean up references
            const insights = data.unique_insights.split(/\d+\.\s+/).filter(insight => insight.trim());
            insights.forEach((insight, index) => {
                if (insight.trim()) {
                    // Remove reference citations like [1][2][4]
                    const cleanInsight = insight.trim().replace(/\[\d+\](\[\d+\])*/g, '');
                    html += `<div class="insight-item">
                        <span class="insight-number">${index + 1}</span>
                        <p>${cleanInsight}</p>
                    </div>`;
                }
            });
            
            html += `</div></div>`;
        }
        
        if (data.viral_hashtags) {
            html += `<div class="trends-section">
                <h4>🏷️ Viral Hashtags by Platform</h4>
                <div class="viral-hashtags">`;
            
            if (typeof data.viral_hashtags === 'object') {
                // Handle object format
                for (const [platform, hashtags] of Object.entries(data.viral_hashtags)) {
                    html += `<p><strong>${platform}:</strong> ${hashtags}</p>`;
                }
            } else {
                // Handle string format
                html += convertMarkdownToHTML(data.viral_hashtags);
            }
            
            html += `</div></div>`;
        }
        
        html += `</div></div>`;
        
        // Safely clear and populate the result message using secure DOM methods
        resultMessage.textContent = '';
        const safeContent = createSafeHTMLContent(html);
        resultMessage.appendChild(safeContent);
        resultMessage.className = 'result-message success trends-display';
        resultMessage.style.display = 'block';
        resultMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Show script generator section
        document.querySelector('.script-generator-section').style.display = 'block';
    }

    // Generate script for viral idea
    window.generateScript = async function(button) {
        const row = button.closest('tr');
        const viralTitle = row.cells[1].textContent.trim();
        
        button.disabled = true;
        button.textContent = '⏳ Generating...';
        
        try {
            const response = await fetch('/api/generate-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    viralIdea: viralTitle,
                    platform: 'TikTok' 
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                displayScriptResults(result);
            } else {
                showMessage(result.details || 'Failed to generate script', 'error');
            }
        } catch (error) {
            console.error('Script generation error:', error);
            showMessage('Network error while generating script', 'error');
        } finally {
            button.disabled = false;
            button.textContent = '📝 Get Script';
        }
    }

    // Display script results
    function displayScriptResults(result) {
        const script = result.script;
        const html = `
            <div class="script-display">
                <h3>🎬 Complete Video Script</h3>
                <div class="script-title">"${result.viral_idea}"</div>
                
                <div class="script-section">
                    <h4>🎯 Hook (First 3-5 seconds)</h4>
                    <div class="script-content hook">${script.hook}</div>
                </div>
                
                <div class="script-section">
                    <h4>📝 Complete Script</h4>
                    <div class="script-content main-script">${script.script}</div>
                </div>
                
                <div class="script-section">
                    <h4>📞 Call-to-Action</h4>
                    <div class="script-content cta">${script.cta}</div>
                </div>
                
                <div class="script-section">
                    <h4>🖼️ Thumbnail Text</h4>
                    <div class="script-content thumbnail">${script.thumbnail_text}</div>
                </div>
                
                <div class="script-section">
                    <h4>🏷️ Hashtags</h4>
                    <div class="script-hashtags">${script.hashtags.join(' ')}</div>
                </div>
                
                <div class="script-section">
                    <h4>🔥 Engagement Tactics</h4>
                    <ul class="engagement-list">
                        ${script.engagement_tactics.map(tactic => `<li>${tactic}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        // Safely set content using secure DOM methods to prevent XSS
        const scriptResults = document.getElementById('scriptResults');
        scriptResults.textContent = '';
        const safeContent = createSafeHTMLContent(html);
        scriptResults.appendChild(safeContent);
        scriptResults.scrollIntoView({ behavior: 'smooth' });
    }

    // Convert markdown formatting to HTML
    function convertMarkdownToHTML(text) {
        if (!text) return '';
        
        // Convert **bold** to <strong>bold</strong>
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>italic</em>
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    // Convert markdown table to HTML with script generation buttons
    function convertMarkdownTableWithScriptButtons(markdown) {
        const html = convertMarkdownTable(markdown);
        // Add script generation buttons to each row
        return html.replace(/<tr>/g, '<tr class="idea-row">').replace(/<\/tr>/g, '<td><button class="script-btn" onclick="generateScript(this)">📝 Get Script</button></td></tr>');
    }

    // Safely create HTML content from string using secure DOM methods
    function createSafeHTMLContent(htmlString) {
        const container = document.createElement('div');
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        
        // Remove any script tags and other dangerous elements
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        const iframes = doc.querySelectorAll('iframe');
        iframes.forEach(iframe => iframe.remove());
        
        const objects = doc.querySelectorAll('object, embed');
        objects.forEach(obj => obj.remove());
        
        // Remove dangerous event handlers
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(elem => {
            for (let i = elem.attributes.length - 1; i >= 0; i--) {
                const attr = elem.attributes[i];
                if (attr.name.startsWith('on')) {
                    elem.removeAttribute(attr.name);
                }
            }
        });
        
        // Clone the body content safely
        const bodyContent = doc.body;
        while (bodyContent.firstChild) {
            container.appendChild(bodyContent.firstChild.cloneNode(true));
        }
        
        return container;
    }

    // Convert markdown table to HTML
    function convertMarkdownTable(markdown) {
        if (!markdown) return '';
        
        const lines = markdown.split('\n').filter(line => line.trim());
        if (lines.length < 2) return `<div class="markdown-content">${convertMarkdownToHTML(markdown)}</div>`;
        
        let html = '<table class="trends-table"><thead><tr>';
        
        // Header row
        const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
        headers.forEach(header => {
            html += `<th>${convertMarkdownToHTML(header)}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        // Data rows (skip header and separator)
        for (let i = 2; i < lines.length; i++) {
            const cells = lines[i].split('|').map(c => c.trim()).filter(c => c);
            if (cells.length > 0) {
                html += '<tr>';
                cells.forEach(cell => {
                    html += `<td>${convertMarkdownToHTML(cell)}</td>`;
                });
                html += '</tr>';
            }
        }
        
        html += '</tbody></table>';
        return html;
    }

    // Set loading state for playbook form
    function setLoading(loading) {
        if (submitBtn) {
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            submitBtn.disabled = loading;
            if (btnText) btnText.style.display = loading ? 'none' : 'inline';
            if (btnLoading) btnLoading.style.display = loading ? 'flex' : 'none';
        }
        
        if (loading && playbookForm) {
            playbookForm.classList.add('loading');
        } else if (playbookForm) {
            playbookForm.classList.remove('loading');
        }
    }

    // Handle playbook form submission
    if (playbookForm) {
        playbookForm.addEventListener('submit', async function(e) {
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
                    playbookForm.reset();
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

    }
});
