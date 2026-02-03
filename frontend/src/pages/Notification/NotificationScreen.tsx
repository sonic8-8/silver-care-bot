import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';

const notifications = [
    { title: '복약 알림이 전송되었습니다.', time: '10분 전' },
    { title: '로봇이 거실로 이동했습니다.', time: '1시간 전' },
    { title: '일정이 30분 남았습니다.', time: '어제' },
];

function NotificationScreen() {
    return (
        <GuardianAppContainer title="알림" description="최근 알림을 확인합니다.">
            <div className="space-y-3">
                {notifications.map((item) => (
                    <article
                        key={item.title}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card"
                    >
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="mt-2 text-xs text-gray-400">{item.time}</p>
                    </article>
                ))}
            </div>
        </GuardianAppContainer>
    );
}

export default NotificationScreen;
