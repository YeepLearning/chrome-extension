import { log } from '@/utils/logger'

export interface PageContent {
    title: string;
    mainContent: string;
    screenshot?: string;  // Base64 encoded screenshot data
}

// Helper function to capture visible tab screenshot
async function captureVisibleTab(): Promise<string | null> {
    try {
        // Request the screenshot from background script since content scripts can't directly use chrome.tabs
        const response = await chrome.runtime.sendMessage({ action: 'CAPTURE_SCREENSHOT' });
        return response.screenshot;
    } catch (error) {
        log('screenshot_error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            url: window.location.href
        });
        console.error('Error capturing screenshot:', error);
        return null;
    }
}

export async function getContent(): Promise<PageContent | null> {
    try {
        log('default_content_request_start', {
            url: window.location.href,
            timestamp: Date.now()
        });

        // Get page title
        const title = document.title;

        // Get main content with improved extraction
        const mainContent = extractStructuredContent();

        // Capture screenshot
        const screenshot = await captureVisibleTab();

        log('default_content_success', {
            url: window.location.href,
            timestamp: Date.now(),
            hasScreenshot: !!screenshot
        });

        return {
            title,
            mainContent,
            screenshot: screenshot || undefined
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

function extractStructuredContent(): string {
    // First, try to find the main content container
    const mainElement = findMainContentElement();
    if (!mainElement) return '';

    // Clone the element to avoid modifying the actual page
    const content = mainElement.cloneNode(true) as HTMLElement;

    // Remove unwanted elements
    const selectorsToRemove = [
        'nav',
        'header',
        'footer',
        '.navigation',
        '.nav',
        '.menu',
        '.sidebar',
        '.ads',
        '.advertisement',
        'script',
        'style',
        'iframe',
        '[role="navigation"]',
        '[role="complementary"]',
        '.table-of-contents',
        '#table-of-contents',
    ];

    selectorsToRemove.forEach(selector => {
        content.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Convert content to markdown-like format
    return convertToMarkdown(content);
}

function findMainContentElement(): HTMLElement | null {
    const selectors = [
        'article',
        'main',
        '[role="main"]',
        '#main-content',
        '.main-content',
        '.content',
        '.post-content',
        '.article-content',
        '.markdown-body', // Common in documentation sites
        '.documentation',
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && isContentRich(element)) {
            return element as HTMLElement;
        }
    }

    // Fallback: Try to find the element with the most content
    return findElementWithMostContent();
}

function isContentRich(element: Element): boolean {
    const text = element.textContent || '';
    const words = text.split(/\s+/).filter(w => w.length > 0);
    // Consider content rich if it has at least 20 words
    return words.length >= 20;
}

function findElementWithMostContent(): HTMLElement | null {
    let bestElement = null;
    let maxScore = 0;

    function scoreElement(element: Element): number {
        const text = element.textContent || '';
        const words = text.split(/\s+/).filter(w => w.length > 0);
        // Penalize very short or very long content
        if (words.length < 20 || words.length > 10000) return 0;
        // Bonus for article-like elements
        const tagBonus = ['article', 'main', 'section'].includes(element.tagName.toLowerCase()) ? 1.5 : 1;
        return words.length * tagBonus;
    }

    document.body.querySelectorAll('*').forEach(element => {
        const score = scoreElement(element);
        if (score > maxScore) {
            maxScore = score;
            bestElement = element;
        }
    });

    return bestElement as HTMLElement | null;
}

function convertToMarkdown(element: HTMLElement): string {
    let markdown = '';
    const childNodes = Array.from(element.childNodes);

    for (const node of childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim() || '';
            if (text) markdown += text + '\n';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;

            // Skip empty elements
            if (!el.textContent?.trim()) continue;

            // Handle different element types
            switch (el.tagName.toLowerCase()) {
                case 'h1':
                    markdown += `# ${el.textContent}\n\n`;
                    break;
                case 'h2':
                    markdown += `## ${el.textContent}\n\n`;
                    break;
                case 'h3':
                    markdown += `### ${el.textContent}\n\n`;
                    break;
                case 'h4':
                case 'h5':
                case 'h6':
                    markdown += `#### ${el.textContent}\n\n`;
                    break;
                case 'p':
                    markdown += `${el.textContent}\n\n`;
                    break;
                case 'ul':
                    el.querySelectorAll('li').forEach(li => {
                        markdown += `* ${li.textContent}\n`;
                    });
                    markdown += '\n';
                    break;
                case 'ol':
                    let i = 1;
                    el.querySelectorAll('li').forEach(li => {
                        markdown += `${i}. ${li.textContent}\n`;
                        i++;
                    });
                    markdown += '\n';
                    break;
                case 'pre':
                case 'code':
                    markdown += '```\n' + el.textContent + '\n```\n\n';
                    break;
                case 'blockquote':
                    markdown += `> ${el.textContent}\n\n`;
                    break;
                default:
                    if (el.textContent?.trim()) {
                        markdown += `${el.textContent}\n\n`;
                    }
            }
        }
    }

    // Clean up the markdown
    return markdown
        .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
        .replace(/\n\s+\n/g, '\n\n') // Remove lines that are only whitespace
        .trim();
} 