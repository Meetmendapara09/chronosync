# ChronoSync - Your Ultimate Time Companion

ChronoSync is a web application designed to provide a suite of essential time-related tools. Whether you need to convert time zones, count down to an event, check global times, or perform date calculations, ChronoSync offers a clean, intuitive interface to help you manage time effectively.

## Features

-   **Time Zone Converter**: Easily convert date and time between various global time zones.
-   **Countdown Timer**: Set up a live countdown for your important events, deadlines, or occasions.
-   **World Clock**: Display the current time in multiple cities across the world simultaneously.
-   **Date Calculator**: Perform calculations such as adding or subtracting days, weeks, months, or years from a given date.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router and React Server Components)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) components
-   **Date/Time Management**: [Luxon](https://moment.github.io/luxon/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Deployment**: Vercel (Recommended)

## Getting Started

### Prerequisites

-   Node.js (v18 or later recommended)
-   pnpm (or npm/yarn)

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Meetmendapara09/chronosync.git
    cd chronosync
    ```

2.  **Install dependencies:**
    Using pnpm (recommended):
    ```bash
    pnpm install
    ```
    Or using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

3.  **Run the development server:**
    Using pnpm:
    ```bash
    pnpm dev
    ```
    Or using npm:
    ```bash
    npm run dev
    ```
    Or using yarn:
    ```bash
    yarn dev
    ```
    The application will typically be available at `http://localhost:9002` (or another port if 9002 is busy).

### Building for Production

To create a production build:
Using pnpm:
```bash
pnpm build
```
Or using npm:
```bash
npm run build
```
Or using yarn:
```bash
yarn build
```
This will create an optimized build in the `.next` folder.

### Running in Production Mode (Locally)

After building, you can start the application in production mode:
Using pnpm:
```bash
pnpm start
```
Or using npm:
```bash
npm run start
```
Or using yarn:
```bash
yarn start
```

## Deployment

### Deploying to Vercel

Vercel is the recommended platform for deploying Next.js applications.

1.  **Sign up or Log in to Vercel:**
    Go to [Vercel](https://vercel.com) and create an account or log in.

2.  **Import Project:**
    -   Click on "Add New..." -> "Project".
    -   Connect your Git provider (GitHub, GitLab, Bitbucket) where your ChronoSync repository is hosted.
    -   Select the ChronoSync repository.

3.  **Configure Project:**
    -   Vercel will automatically detect that it's a Next.js project.
    -   The default build settings should generally work.
    -   You can configure environment variables if needed (e.g., for future features like Supabase integration).

4.  **Deploy:**
    -   Click the "Deploy" button.
    -   Vercel will build and deploy your application. You'll receive a unique URL for your live site.

## Project Structure

-   `src/app/`: Contains the core application routes and pages (using Next.js App Router).
    -   `layout.tsx`: Root layout for the application.
    -   `page.tsx`: Home page of ChronoSync.
    -   `globals.css`: Global styles and Tailwind CSS theme configuration.
    -   `[feature-name]/page.tsx`: Individual pages for each feature.
-   `src/components/`: Shared UI components.
    -   `feature/`: Components specific to each ChronoSync feature (e.g., `TimeZoneConverter.tsx`).
    -   `layout/`: Layout components like `Header.tsx`.
    -   `ui/`: ShadCN UI components.
-   `src/lib/`: Utility functions.
-   `public/`: Static assets.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is open-source and available under the MIT License.
