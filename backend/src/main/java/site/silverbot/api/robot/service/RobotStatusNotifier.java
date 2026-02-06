package site.silverbot.api.robot.service;

import java.time.Duration;

import site.silverbot.domain.robot.Robot;

public interface RobotStatusNotifier {
    void notifyStatusChanged(Robot robot);

    void notifyOffline(Robot robot, Duration offlineDuration);
}
