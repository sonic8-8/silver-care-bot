const navigationItems = [
    { label: '대시보드' },
    { label: '일정' },
    { label: '약 관리' },
    { label: '로봇' },
    { label: '설정' },
];

function BottomNavigation() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-1 px-4 py-2">
                {navigationItems.map((item) => (
                    <button
                        key={item.label}
                        type="button"
                        className="min-h-[48px] flex-1 rounded-lg px-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-500"
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}

export default BottomNavigation;
