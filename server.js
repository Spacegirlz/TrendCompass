const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { generateContent } = require('./services/openai');
const { generatePDF } = require('./services/pdf');
const { sendEmail } = require('./services/email');
const { saveToCRM } = require('./services/sheets');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/generate-playbook', async (req, res) => {
    try {
        const { name, email, niche, audience, goal, platforms, timezone } = req.body;
        
        // Validate required fields
        if (!name || !email || !niche || !audience || !goal || !platforms || !timezone) {
            return res.status(400).json({ 
                error: 'All fields are required',
                details: 'Please fill in all form fields before submitting.'
            });
        }

        console.log('Generating playbook for:', { name, email, niche, audience, goal, platforms, timezone });

        // Generate AI content
        const aiContent = await generateContent({
            name,
            email,
            niche,
            target_audience: audience,
            goal,
            platforms: platforms.split(',').map(p => p.trim()),
            timezone
        });

        console.log('AI content generated successfully');

        // Generate PDF
        const { pdfBuffer, csvData } = await generatePDF(aiContent, {
            name,
            email,
            niche,
            audience,
            goal,
            platforms,
            timezone
        });

        console.log('PDF generated successfully');

        // Send email with attachments
        try {
            await sendEmail(email, name, pdfBuffer, csvData);
            console.log('Email sent successfully');
        } catch (emailError) {
            console.error('Email sending failed, but continuing workflow:', emailError.message);
        }

        // Save to CRM
        await saveToCRM({
            name,
            email,
            niche,
            audience,
            goal,
            platforms,
            timezone,
            generated_at: new Date().toISOString(),
            status: 'completed'
        });

        console.log('Saved to CRM successfully');

        res.json({ 
            success: true, 
            message: 'Your Viral Trends Strategy Playbook has been generated and sent to your email!',
            details: 'Please check your inbox (and spam folder) for your personalized playbook and CSV file.'
        });

    } catch (error) {
        console.error('Error generating playbook:', error);
        res.status(500).json({ 
            error: 'Failed to generate playbook',
            details: error.message || 'An unexpected error occurred. Please try again.'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        details: 'An unexpected error occurred. Please try again later.'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Viral Trends server running on port ${PORT}`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
});
