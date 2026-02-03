package site.silverbot.domain.elder;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ElderRepository extends JpaRepository<Elder, Long> {
    List<Elder> findAllByUserId(Long userId);
}
