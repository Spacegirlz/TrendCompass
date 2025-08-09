const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { stringify } = require('csv-stringify/sync');

async function generatePDF(aiContent, userInputs) {
    let browser;
    
    try {
        console.log('Starting PDF generation...');
        
        // Read the HTML template
        const templatePath = path.join(__dirname, '../templates/playbook.html');
        const templateSource = await fs.readFile(templatePath, 'utf8');
        
        // Compile the template
        const template = handlebars.compile(templateSource);
        
        // Prepare template data
        const templateData = {
            ...userInputs,
            ...aiContent,
            generated_date: new Date().toLocaleDateString(),
            generated_time: new Date().toLocaleTimeString(),
            platforms_list: userInputs.platforms.split(',').map(p => p.trim()),
            ideas_with_hooks: aiContent.ideas?.map((idea, index) => ({
                ...idea,
                index: index + 1,
                public_hooks_list: idea.public?.hooks || [],
                private_hooks_list: idea.private?.hooks || [],
                public_hashtags_formatted: (idea.public?.hashtags || []).join(' '),
                private_hashtags_formatted: (idea.private?.hashtags || []).join(' ')
            })) || []
        };
        
        // Generate HTML
        const html = template(templateData);
        
        console.log('Template compiled, launching browser...');
        
        // Launch Puppeteer
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--single-process'
            ]
        });
        
        const page = await browser.newPage();
        
        // Set content and wait for fonts to load
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        console.log('Generating PDF...');
        
        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });
        
        console.log('PDF generated successfully');
        
        // Generate CSV data
        const csvData = generateCSVData(aiContent);
        
        return { pdfBuffer, csvData };
        
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

function generateCSVData(aiContent) {
    try {
        const csvRows = [];
        
        // Add header
        csvRows.push([
            'Trend Title',
            'Track Type',
            'Description',
            'Hook 1',
            'Hook 2', 
            'Hook 3',
            'Hashtags'
        ]);
        
        // Add data rows
        if (aiContent.ideas) {
            aiContent.ideas.forEach(idea => {
                // Public track row
                csvRows.push([
                    idea.title || '',
                    'Public',
                    idea.public?.description || '',
                    idea.public?.hooks?.[0] || '',
                    idea.public?.hooks?.[1] || '',
                    idea.public?.hooks?.[2] || '',
                    (idea.public?.hashtags || []).join(' ')
                ]);
                
                // Private track row
                csvRows.push([
                    idea.title || '',
                    'Private',
                    idea.private?.description || '',
                    idea.private?.hooks?.[0] || '',
                    idea.private?.hooks?.[1] || '',
                    idea.private?.hooks?.[2] || '',
                    (idea.private?.hashtags || []).join(' ')
                ]);
            });
        }
        
        const csvData = stringify(csvRows);
        console.log('CSV data generated successfully');
        
        return csvData;
        
    } catch (error) {
        console.error('CSV generation error:', error);
        return 'Error generating CSV data';
    }
}

module.exports = {
    generatePDF
};
