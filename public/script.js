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

    // Copy to clipboard functionality
    function addCopyButton(element, text, label = 'Copy') {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = `📋 ${label}`;
        copyBtn.className = 'copy-btn';
        copyBtn.style.cssText = `
            margin-left: 8px;
            padding: 4px 8px;
            background: var(--gold);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        copyBtn.addEventListener('mouseover', () => {
            copyBtn.style.background = 'var(--gold-soft)';
        });
        
        copyBtn.addEventListener('mouseout', () => {
            copyBtn.style.background = 'var(--gold)';
        });
        
        copyBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                await navigator.clipboard.writeText(text);
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✅ Copied!';
                copyBtn.style.background = '#28a745';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = 'var(--gold)';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                copyBtn.textContent = '❌ Failed';
                setTimeout(() => {
                    copyBtn.textContent = `📋 ${label}`;
                }, 2000);
            }
        };
        
        element.appendChild(copyBtn);
        return copyBtn;
    }

    // Add viral score badge
    function addViralScore(element, score, category) {
        const scoreBadge = document.createElement('span');
        scoreBadge.className = 'viral-score-badge';
        scoreBadge.textContent = `🔥 ${score}/100`;
        scoreBadge.title = category;
        
        let badgeColor = '#dc3545'; // Red for low scores
        if (score >= 80) badgeColor = '#28a745'; // Green for high scores
        else if (score >= 70) badgeColor = '#ffc107'; // Yellow for medium scores
        else if (score >= 60) badgeColor = '#fd7e14'; // Orange for below average
        
        scoreBadge.style.cssText = `
            display: inline-block;
            background: ${badgeColor};
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            margin-left: 8px;
            vertical-align: middle;
        `;
        
        element.appendChild(scoreBadge);
        return scoreBadge;
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
        const lines = markdown.split('\n').filter(line => line.trim());
        let html = '<div class="viral-ideas-table"><table>';
        let headers = [];
        
        lines.forEach((line, index) => {
            if (index === 0) {
                // Header row
                headers = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                html += '<thead><tr>';
                headers.forEach(header => {
                    html += `<th>${header}</th>`;
                });
                html += '<th>Actions</th></tr></thead><tbody>';
            } else if (line.includes('---')) {
                // Skip separator line
                return;
            } else {
                // Data row
                const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                if (cells.length >= 2) {
                    const ideaTitle = cells[1].replace(/\*\*/g, '').replace(/"/g, '').trim();
                    html += '<tr class="idea-row" data-idea="' + ideaTitle.replace(/"/g, '&quot;') + '">';
                    
                    cells.forEach((cell, cellIndex) => {
                        const label = headers[cellIndex] || `Column ${cellIndex + 1}`;
                        if (cellIndex === 1) {
                            // This is the idea title - add copy button and data label for mobile
                            html += `<td class="idea-title-cell" data-label="${label}">
                                <span class="idea-title">${cell}</span>
                                <div class="idea-actions">
                                    <button class="copy-btn-small" onclick="copyToClipboard('${ideaTitle.replace(/'/g, "\\'")}')">📋</button>
                                </div>
                            </td>`;
                        } else {
                            html += `<td data-label="${label}">${cell}</td>`;
                        }
                    });
                    
                    // Add actions column
                    html += `<td class="actions-cell" data-label="Actions">
                        <button class="script-btn" onclick="generateScript(this)">📝 Get Script</button>
                        <button class="remix-btn" onclick="remixIdea(this)" style="margin-left: 4px;">🔄 Remix</button>
                    </td>`;
                    html += '</tr>';
                }
            }
        });
        
        html += '</tbody></table></div>';
        return html;
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

    // Global functions for inline onclick handlers
    window.copyToClipboard = async function(text) {
        try {
            await navigator.clipboard.writeText(text);
            showMessage(`Copied: "${text.substring(0, 50)}..."`, 'success');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            showMessage('Failed to copy text', 'error');
        }
    };

    window.remixIdea = async function(button) {
        const row = button.closest('tr');
        const idea = row.getAttribute('data-idea');
        
        if (!idea) {
            showMessage('Could not find idea to remix', 'error');
            return;
        }

        // Simple client-side remix using different viral patterns
        const remixPatterns = [
            `Nobody talks about ${idea.toLowerCase()}`,
            `I tried ${idea.toLowerCase()} for 30 days and the results shocked me`,
            `POV: You're 25 and just realized ${idea.toLowerCase()}`,
            `Why I stopped ${idea.toLowerCase().replace('how', 'doing').replace('why', 'believing')}`,
            `The truth about ${idea.toLowerCase()} that experts won't tell you`
        ];

        const remixedIdeas = remixPatterns.map(pattern => pattern.charAt(0).toUpperCase() + pattern.slice(1));
        
        // Display remixed ideas
        let remixHtml = `<div class="remix-results">
            <h4>🔄 Remixed Variations of: "${idea}"</h4>
            <div class="remix-list">`;
        
        remixedIdeas.forEach((remixedIdea, index) => {
            remixHtml += `<div class="remix-item">
                <span class="remix-text">${remixedIdea}</span>
                <button class="copy-btn-small" onclick="copyToClipboard('${remixedIdea.replace(/'/g, "\\'")}')">📋 Copy</button>
            </div>`;
        });
        
        remixHtml += `</div></div>`;
        
        // Insert remix results after the current row
        const remixRow = document.createElement('tr');
        remixRow.className = 'remix-row';
        remixRow.innerHTML = `<td colspan="100%" style="padding: 15px; background: #f8f9fa;">${remixHtml}</td>`;
        
        // Remove any existing remix rows
        const existingRemix = row.parentNode.querySelector('.remix-row');
        if (existingRemix) {
            existingRemix.remove();
        }
        
        // Insert new remix row
        row.parentNode.insertBefore(remixRow, row.nextSibling);
    };

    // Add touch-friendly features for mobile
    function initMobileTouchFeatures() {
        if ('ontouchstart' in window) {
            // Add swipe-to-copy for script content
            document.addEventListener('click', function(e) {
                if (e.target.closest('.script-content')) {
                    const scriptElement = e.target.closest('.script-content');
                    let touchStart = 0;
                    
                    scriptElement.addEventListener('touchstart', (touchEvent) => {
                        touchStart = touchEvent.touches[0].clientX;
                    }, { passive: true });
                    
                    scriptElement.addEventListener('touchend', (touchEvent) => {
                        const touchEnd = touchEvent.changedTouches[0].clientX;
                        if (touchStart - touchEnd > 50) {
                            // Swipe left - copy content
                            copyToClipboard(scriptElement.textContent.trim());
                            showMobileToast('Copied script to clipboard! 📋');
                        }
                    }, { passive: true });
                }
            });

            // Add haptic feedback for button presses
            document.addEventListener('click', function(e) {
                if (e.target.matches('.script-btn, .remix-btn, .copy-btn-small, .submit-btn, .luxury-btn, .trends-btn')) {
                    // Trigger haptic feedback on supported devices
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
            });
        }
    }

    // Mobile toast notification system
    function showMobileToast(message, duration = 2000) {
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.mobile-toast');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = 'mobile-toast';
        toast.textContent = message;
        
        // Add toast styles directly if CSS hasn't loaded yet
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--gold, #d4af37);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            z-index: 10000;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideUp 0.3s ease;
            max-width: 90%;
            text-align: center;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // PWA-style local storage for mobile draft saving
    function initMobileDraftSaving() {
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            // Auto-save trending topic input
            const topicInput = document.getElementById('topic');
            if (topicInput) {
                // Load saved draft on page load
                const savedTopic = localStorage.getItem('viralTrendsDraft');
                if (savedTopic) {
                    const draftData = JSON.parse(savedTopic);
                    const oneHourAgo = Date.now() - (60 * 60 * 1000);
                    
                    if (draftData.timestamp > oneHourAgo) {
                        topicInput.value = draftData.topic;
                        showMobileToast('💾 Restored your draft from earlier', 3000);
                    }
                }
                
                // Auto-save on input blur
                topicInput.addEventListener('blur', saveDraft);
                topicInput.addEventListener('input', debounce(saveDraft, 2000));
            }
            
            // Auto-save playbook form inputs
            const playbookInputs = document.querySelectorAll('#playbookForm input, #playbookForm select');
            playbookInputs.forEach(input => {
                // Load saved drafts
                const savedValue = localStorage.getItem(`playbook_${input.name || input.id}`);
                if (savedValue && input.type !== 'checkbox') {
                    input.value = savedValue;
                } else if (savedValue && input.type === 'checkbox') {
                    input.checked = savedValue === 'true';
                }
                
                // Auto-save changes
                input.addEventListener('blur', () => savePlaybookField(input));
                if (input.type === 'checkbox') {
                    input.addEventListener('change', () => savePlaybookField(input));
                }
            });
        }
    }
    
    function saveDraft() {
        const topicInput = document.getElementById('topic');
        if (topicInput && topicInput.value.trim()) {
            const draftData = {
                topic: topicInput.value.trim(),
                timestamp: Date.now()
            };
            localStorage.setItem('viralTrendsDraft', JSON.stringify(draftData));
        }
    }
    
    function savePlaybookField(input) {
        const value = input.type === 'checkbox' ? input.checked : input.value;
        if (value) {
            localStorage.setItem(`playbook_${input.name || input.id}`, value);
        }
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Clear old drafts (older than 24 hours)
    function clearOldDrafts() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        try {
            const savedTopic = localStorage.getItem('viralTrendsDraft');
            if (savedTopic) {
                const draftData = JSON.parse(savedTopic);
                if (draftData.timestamp < oneDayAgo) {
                    localStorage.removeItem('viralTrendsDraft');
                }
            }
        } catch (e) {
            // Clear corrupted data
            localStorage.removeItem('viralTrendsDraft');
        }
        
        // Clear old playbook fields
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('playbook_')) {
                // For simplicity, we'll keep these for the session
                // In a real app, you'd add timestamps here too
            }
        });
    }

    // Enhanced mobile loading with better UX
    function showMobileLoadingOverlay() {
        if (window.innerWidth < 768) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-card">
                    <div class="loading-spinner"></div>
                    <h3>Generating Viral Ideas</h3>
                    <p>This usually takes 45-60 seconds</p>
                    <div class="loading-progress">
                        <div class="progress-bar"></div>
                    </div>
                    <div class="loading-timer">Estimated: 60s</div>
                    <div class="loading-tips">
                        <p>💡 Tip: Screenshot your favorites for later!</p>
                    </div>
                    <button class="cancel-btn" onclick="cancelGeneration()">Cancel</button>
                </div>
            `;
            document.body.appendChild(overlay);
            
            // Auto-hide after 60 seconds as fallback
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 60000);
            
            return overlay;
        }
        return null;
    }
    
    // Global function for canceling generation
    window.cancelGeneration = function() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Reset form buttons
        const submitBtns = document.querySelectorAll('.submit-btn, .trends-btn');
        submitBtns.forEach(btn => {
            btn.disabled = false;
            const btnText = btn.querySelector('.btn-text');
            const btnLoading = btn.querySelector('.btn-loading');
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        });
        
        showMobileToast('Generation cancelled', 2000);
    };

    // Initialize all mobile features
    function initAllMobileFeatures() {
        initMobileTouchFeatures();
        initMobileDraftSaving();
        clearOldDrafts();
        
        // Add mobile loading to form submissions
        const forms = document.querySelectorAll('#trendsForm, #playbookForm');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                if (window.innerWidth < 768) {
                    setTimeout(() => showMobileLoadingOverlay(), 100);
                }
            });
        });
    }

    // Initialize mobile features when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllMobileFeatures);
    } else {
        initAllMobileFeatures();
    }
});
