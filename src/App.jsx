import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import AppRoutes from "@/routes/AppRoutes";
import ReportProblemModal from "@/components/ReportProblemModal";
import { GlobalToast, ScrollToTop } from "@/components/common";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider defaultTheme="system" storageKey="theme">
                <TooltipProvider delay={200}>
                    <BrowserRouter>
                        <ScrollToTop />
                        <AuthProvider>
                            <AppRoutes />
                            <ReportProblemModal />
                            <GlobalToast />
                        </AuthProvider>
                    </BrowserRouter>
                </TooltipProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

