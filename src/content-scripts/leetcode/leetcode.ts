import { log } from '@/utils/logger'

export interface LeetCodeContent {
    problemDescription: string;
    userSolution: string;
}

const SELECTORS = {
    PROBLEM_CONTENT: '#qd-content',
    MONACO_EDITOR: '.monaco-editor',
    CODE_CONTENT: '.view-lines'
};

async function waitForElement(selector: string, timeout = 5000): Promise<Element | null> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        const element = document.querySelector(selector);
        if (element) return element;
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
}

export async function getContent(): Promise<LeetCodeContent | null> {
    try {
        log('leetcode_content_request_start', {
            url: window.location.href,
            timestamp: Date.now()
        });

        // Wait for problem content
        const problemContent = await waitForElement(SELECTORS.PROBLEM_CONTENT);
        if (!problemContent) {
            log('leetcode_error', {
                error: 'problem_content_not_found',
                url: window.location.href
            });
            return null;
        }

        // Wait for code editor
        const editor = await waitForElement(SELECTORS.MONACO_EDITOR);
        if (!editor) {
            log('leetcode_error', {
                error: 'editor_not_found',
                url: window.location.href
            });
            return null;
        }

        // Extract problem description
        const problemDescription = problemContent.textContent || '';

        // Extract user's solution from Monaco editor
        const codeContent = editor.querySelector(SELECTORS.CODE_CONTENT);
        const userSolution = codeContent?.textContent || '';

        log('leetcode_content_success', {
            url: window.location.href,
            timestamp: Date.now()
        });

        return {
            problemDescription: problemDescription.trim(),
            userSolution: userSolution.trim()
        };

    } catch (error) {
        log('leetcode_error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            url: window.location.href
        });
        console.error('Error getting LeetCode content:', error);
        return null;
    }
}

// No need for getCurrentTime for LeetCode 