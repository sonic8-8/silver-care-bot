package site.silverbot.domain.report;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AIReportRepository extends JpaRepository<AIReport, Long> {
    Optional<AIReport> findByElderIdAndPeriodStartAndPeriodEnd(Long elderId, LocalDate periodStart, LocalDate periodEnd);
}
