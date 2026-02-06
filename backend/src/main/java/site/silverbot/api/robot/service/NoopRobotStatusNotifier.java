package site.silverbot.api.robot.service;

import java.time.Duration;

import org.springframework.stereotype.Service;

import site.silverbot.domain.robot.Robot;

@Service
public class NoopRobotStatusNotifier implements RobotStatusNotifier {
    @Override
    public void notifyStatusChanged(Robot robot) {
        // no-op
    }

    @Override
    public void notifyOffline(Robot robot, Duration offlineDuration) {
        // no-op
    }
}
