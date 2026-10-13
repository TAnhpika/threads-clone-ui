import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary phát hiện lỗi runtime:", error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50 dark:bg-zinc-950">
                    <div className="max-w-md p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-red-200 dark:border-red-950">
                        <h2 className="text-xl font-bold text-red-600 mb-2">
                            Đã xảy ra sự cố!
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Giao diện gặp lỗi ngoài ý muốn. Vui lòng thử tải lại
                            trang hoặc quay về trang chủ.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Tải lại trang
                            </button>
                            <a
                                href="/"
                                className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Về trang chủ
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
