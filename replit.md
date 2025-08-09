# Overview

Mindblowing Viral Social Media Ideas - A luxury viral content strategy generator that creates dual-track (public and private) social media playbooks for content creators. The system generates personalized content strategies with AI-powered recommendations using OpenAI's GPT-4o model, delivers them as luxury-branded PDF playbooks with CSV exports, and includes automated email delivery and CRM integration. Features revolutionary AI Script Generator that turns viral ideas into complete video scripts with authentic inner-voice hooks.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent User Feedback & Improvement Requests

## Current Challenges Identified:
- Platform heatmap formatting needed improvement (fixed with High/Medium/Low)
- Unique insights needed better formatting without references (fixed)
- User seeking next-level improvements for design and output quality
- **CRITICAL FEEDBACK**: Script generator hooks were too generic - need authentic inner voice, real thoughts people think but don't say out loud (FIXED with enhanced prompt engineering)
- **SECURITY FIX (2025-08-09)**: Fixed XSS vulnerabilities in DOM manipulation - replaced unsafe innerHTML usage with secure DOM methods and content sanitization

## Next Level Improvement Priorities:
1. Advanced AI-powered content intelligence with real-time trend scoring
2. Interactive content creation suite with script generation
3. Enhanced UX with visual trend mapping and personalized dashboards

# System Architecture

## Frontend Architecture
- **Technology**: Vanilla HTML/CSS/JavaScript with luxury marble-themed UI
- **Design Pattern**: Single-page application with form-based user input
- **Styling**: Custom CSS with luxury brand colors (gold, marble, cream tones) and Google Fonts integration
- **User Experience**: Progressive form with validation and real-time feedback

## Backend Architecture
- **Framework**: Express.js REST API server
- **Architecture Pattern**: Service-oriented architecture with modular services
- **Content Generation**: OpenAI GPT-4o integration for AI-powered content strategy creation
- **Dual-Track System**: Automated content filtering to generate both public (platform-safe) and private (premium) content versions
- **Content Filtering**: Niche-specific and platform-specific content moderation system

## Data Processing Pipeline
1. **Input Validation**: Server-side validation of user form data
2. **AI Content Generation**: OpenAI API integration with custom prompt engineering
3. **Content Filtering**: Automated application of platform-specific and niche-specific content rules
4. **Document Generation**: PDF creation using Puppeteer and Handlebars templating
5. **CSV Export**: Structured data export for content scheduling tools
6. **Email Delivery**: Automated email with branded templates and attachments

## Service Architecture
- **OpenAI Service**: AI content generation with custom prompts and response formatting using GPT-4o
- **PDF Service**: Puppeteer-based PDF generation with luxury template rendering
- **Email Service**: Nodemailer integration for automated delivery
- **Sheets Service**: Google Sheets API integration for CRM data storage
- **Filter Utils**: Content moderation and platform compliance system
- **Prompt Utils**: Centralized prompt engineering with timezone and platform optimization

## Content Strategy System
- **Universal Prompt System**: Single prompt template that generates platform-optimized content
- **Compliance Layer**: Swappable rule packs for different niches (health, fitness, lifestyle)
- **Signal Detection**: Optional trend scraping capabilities for content recency
- **Dual-Track Output**: Automatic generation of public and private content versions

# External Dependencies

## AI and Content Generation
- **OpenAI API**: GPT-5 model (with GPT-4o fallback) for content strategy generation
- **GPT-5 Integration**: Successfully implemented GPT-5 with automatic fallback to GPT-4o if unavailable
- **Trending Ideas Feature**: Interactive research tool for generating viral content concepts with platform performance analysis
- **Content Specificity Challenge**: AI models tend toward generic categories rather than highly specific viral content due to safety constraints
- **Handlebars**: Template engine for PDF generation
- **Puppeteer**: Headless browser for PDF rendering and document generation

## Communication and Delivery
- **Nodemailer**: Email delivery service with Gmail integration
- **Google Sheets API**: CRM integration for lead management and data storage
- **Gmail API**: Email service provider for automated playbook delivery

## Data Processing and Utilities
- **CSV-Stringify**: CSV file generation for content scheduling tools
- **Moment-Timezone**: Timezone handling for optimal posting time recommendations
- **CORS**: Cross-origin resource sharing for frontend-backend communication
- **Body-Parser**: Request parsing middleware for form data handling

## Infrastructure and Hosting
- **Express.js**: Web server framework
- **Environment Variables**: Configuration management for API keys and service credentials
- **File System**: Template and asset management for PDF generation

## Google Cloud Integration
- **Google Sheets API**: Customer relationship management and lead tracking
- **Service Account Authentication**: Secure API access for Google services
- **OAuth2**: Authentication flow for Google services integration