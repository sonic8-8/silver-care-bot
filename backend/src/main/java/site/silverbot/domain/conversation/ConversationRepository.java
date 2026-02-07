package site.silverbot.domain.conversation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Page<Conversation> findByRobotIdOrderByRecordedAtDescIdDesc(Long robotId, Pageable pageable);
}
