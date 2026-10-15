import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import AppRoutes from "@/routes/AppRoutes";
import ReportProblemModal from "@/components/ReportProblemModal";

export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider defaultTheme="system" storageKey="theme">
                <BrowserRouter>
                    <AuthProvider>
                        <AppRoutes />
                        <ReportProblemModal />
                    </AuthProvider>
                </BrowserRouter>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

