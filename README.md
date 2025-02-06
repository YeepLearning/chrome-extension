# YouTube Transcript Viewer Extension

A Chrome extension that displays YouTube video transcripts synchronized with the current playback time. Built with React and TypeScript.

## Features

- Automatically fetches YouTube video transcripts
- Shows current transcript text based on video timestamp
- Real-time synchronization with video playback

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 18+ or 20+) installed on your machine.

### Setup

1. Clone the repository:

    ```sh
    git clone [your-repo-url]
    cd youtube-transcript-viewer
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

## 🏗️ Development

To start the development server:

```sh
npm run dev
```

## 📦 Build 

To create a production build:

```sh
npm run build
```

## 📂 Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle switch in the top right corner
3. Click "Load unpacked" and select the `build` directory

## Usage

1. Navigate to any YouTube video
2. Click the extension icon to view the transcript
3. The transcript will automatically sync with the video playback

## License

This project is licensed under the MIT License.