#Vid-watch

Vid-watch is a modern offline video library web app built with React, TypeScript, Vite, and Tailwind CSS. It allows you to upload, store, and watch large video files directly in your browser, with all data saved locally using IndexedDB. No data is sent to any server—your videos remain private and accessible offline.

## Features

- 📥 **Upload Videos:** Drag and drop or browse to add video files to your library.
- 🎞️ **Video Thumbnails:** Automatic thumbnail generation for each video.
- 🏷️ **Metadata:** Displays video duration, file size, and date added.
- ⭐ **Favorites:** Mark videos as favorites for quick access.
- ⏯️ **Watch Progress:** Tracks watch progress and last watched date.
- 🔍 **Search & Filter:** Search, sort, and filter your video collection.
- 📊 **Storage Usage:** Visualize storage usage and manage your library.
- ⚙️ **Settings:** Request persistent storage and clear your entire library.
- 🌙 **Dark Mode:** Beautiful dark/light theme toggle.
- 🔗 **Share & Download:** Download or share videos using browser APIs.
- 🖥️ **Responsive:** Works great on desktop and mobile browsers.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/vid-watch.git
   cd vid-watch
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

4. **Open in your browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

### Build for Production

```sh
npm run build
# or
yarn build
```

The output will be in the `dist/` directory.

## Project Structure

```
src/
  components/      # Reusable UI components
  contexts/        # React context providers (e.g., LibraryContext)
  pages/           # App pages (Home, Watch, Settings)
  types/           # TypeScript types
  utils/           # Utility functions (database, video processing)
  App.tsx          # Main app component
  main.tsx         # Entry point
  index.css        # Tailwind CSS styles
```

## Technologies Used

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (for local storage)

## Privacy

All videos and metadata are stored locally in your browser using IndexedDB. No data is uploaded or shared with any server.

## License

MIT

---

**Made with ❤️ for offline video lovers.**
