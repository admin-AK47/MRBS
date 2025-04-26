package com.example.mrbs.repository;

import com.example.mrbs.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByMeetingRoomId(Long roomId);
    List<Feedback> findByUserId(Long userId);
}
