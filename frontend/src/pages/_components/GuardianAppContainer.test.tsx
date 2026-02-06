import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const { useNotificationRealtimeMock } = vi.hoisted(() => ({
    useNotificationRealtimeMock: vi.fn(),
}));

vi.mock('@/features/notification/hooks/useNotificationRealtime', () => ({
    useNotificationRealtime: useNotificationRealtimeMock,
}));

vi.mock('@/shared/ui', () => ({
    NotificationBell: () => <div data-testid="notification-bell">bell</div>,
}));

import GuardianAppContainer from './GuardianAppContainer';

describe('GuardianAppContainer', () => {
    it('mounts realtime hook even when notification bell is hidden', () => {
        render(
            <GuardianAppContainer
                title="알림"
                description="테스트"
                showNotificationBell={false}
                showBottomNav={false}
            >
                <div>body</div>
            </GuardianAppContainer>
        );

        expect(useNotificationRealtimeMock).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument();
    });
});
