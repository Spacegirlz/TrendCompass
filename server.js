const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { generateContent } = require('./services/openai');
const { generatePDF } = require('./services/pdf');
const { sendEmail } = require('./services/email');
const { saveToCRM } = require('./services/sheets');
const { generateTrendingIdeas } = require('./services/trending');
const ScriptGeneratorService = require('./services/scriptGenerator');
const { calculateViralScore } = require('./utils/viralScore');

const scriptGenerator = new ScriptGeneratorService();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5000', 'https://*.vercel.app', 'https://*.replit.dev'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add specific headers for Vercel compatibility
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
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

// Generate video script endpoint  
app.post('/api/generate-script', async (req, res) => {
    try {
        const { viralIdea, platform = 'TikTok' } = req.body;
        
        if (!viralIdea) {
            return res.status(400).json({ 
                success: false, 
                details: 'Viral idea is required' 
            });
        }

        const result = await scriptGenerator.generateVideoScript(viralIdea, platform);
        
        res.json({
            success: true,
            viral_idea: viralIdea,
            platform: platform,
            script: result.script,
            generated_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Script generation error:', error);
        res.status(500).json({ 
            success: false, 
            details: error.message || 'Failed to generate script'
        });
    }
});

app.post('/api/generate-trends', async (req, res) => {
    try {
        const { topic } = req.body;
        
        if (!topic || !topic.trim()) {
            return res.status(400).json({ 
                error: 'Topic is required',
                details: 'Please provide a topic to generate trending ideas for.'
            });
        }

        console.log(`Generating trending ideas for topic: ${topic}`);

        const trendingData = await generateTrendingIdeas(topic.trim());

        res.json({
            success: true,
            topic: topic.trim(),
            data: trendingData,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating trending ideas:', error);
        
        // More specific error handling for different scenarios
        let statusCode = 500;
        let errorMessage = 'Failed to generate trending ideas';
        let details = error.message || 'An unexpected error occurred. Please try again.';
        
        if (error.message?.includes('API key')) {
            statusCode = 401;
            errorMessage = 'API Configuration Error';
            details = 'OpenAI API key is missing or invalid. Please check your environment variables.';
        } else if (error.message?.includes('Rate limit')) {
            statusCode = 429;
            errorMessage = 'Rate Limit Exceeded';
            details = 'Too many requests. Please try again in a few minutes.';
        } else if (error.message?.includes('endpoint')) {
            statusCode = 503;
            errorMessage = 'Service Configuration Error';
            details = 'API endpoints are not properly configured. Please check your deployment.';
        }
        
        res.status(statusCode).json({ 
            success: false,
            error: errorMessage,
            details: details,
            timestamp: new Date().toISOString()
        });
    }
});

// Quick viral score endpoint for testing
app.post('/api/score-idea', (req, res) => {
    try {
        const { idea } = req.body;
        
        if (!idea || !idea.trim()) {
            return res.status(400).json({ 
                error: 'Idea is required',
                details: 'Please provide an idea to score.'
            });
        }

        const score = calculateViralScore(idea.trim());
        
        res.json({
            success: true,
            idea: idea.trim(),
            ...score,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error scoring idea:', error);
        res.status(500).json({ 
            error: 'Failed to score idea',
            details: error.message || 'An unexpected error occurred.'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '2.0.0-viral-enhanced'
    });
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
