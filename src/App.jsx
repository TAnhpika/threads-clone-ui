import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppRoutes from "@/routes/AppRoutes";

export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider defaultTheme="system" storageKey="theme">
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
