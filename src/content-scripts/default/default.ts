import { log } from '@/utils/logger'

export interface PageContent {
    title: string;
    mainContent: string;
}

export async function getContent(): Promise<PageContent | null> {
    try {
        log('default_content_request_start', {
            url: window.location.href,
            timestamp: Date.now()
        });

        // Get page title
        const title = document.title;

        // Get main content - try to find the most relevant content container
        const mainContent = findMainContent();

        log('default_content_success', {
            url: window.location.href,
            timestamp: Date.now()
        });

        return {
            title,
            mainContent
        };

    } catch (error) {
        log('default_error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            url: window.location.href
        });
        console.error('Error getting page content:', error);
        return null;
    }
}

function findMainContent(): string {
    // Try to find the main content using common selectors
    const selectors = [
        'main',
        'article',
        '[role="main"]',
        '#main-content',
        '.main-content',
        '.content'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element.textContent || '';
        }
    }

    // If no main content container found, return the body text
    return document.body.textContent || '';
} 