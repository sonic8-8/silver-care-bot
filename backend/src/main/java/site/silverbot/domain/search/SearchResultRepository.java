package site.silverbot.domain.search;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SearchResultRepository extends JpaRepository<SearchResult, Long> {
    Page<SearchResult> findByRobotIdOrderBySearchedAtDescIdDesc(Long robotId, Pageable pageable);
}
