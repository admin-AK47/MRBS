package com.example.mrbs.service;

import com.example.mrbs.dto.FeedbackDto;
import com.example.mrbs.model.Feedback;
import com.example.mrbs.model.MeetingRoom;
import com.example.mrbs.model.User;
import com.example.mrbs.repository.FeedbackRepository;
import com.example.mrbs.repository.MeetingRoomRepository;
import com.example.mrbs.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final MeetingRoomRepository meetingRoomRepository;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           UserRepository userRepository,
                           MeetingRoomRepository meetingRoomRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.meetingRoomRepository = meetingRoomRepository;
    }

    public Feedback addFeedback(FeedbackDto dto) {
        User user = userRepository.findById(dto.getUserId()).orElseThrow();
        MeetingRoom room = meetingRoomRepository.findById(dto.getRoomId()).orElseThrow();

        Feedback feedback = new Feedback();
        feedback.setComment(dto.getComment());
        feedback.setRating(dto.getRating());
        feedback.setUser(user);
        feedback.setMeetingRoom(room);

        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getFeedbackByRoom(Long roomId) {
        return feedbackRepository.findByMeetingRoomId(roomId);
    }

    public List<Feedback> getFeedbackByUser(Long userId) {
        return feedbackRepository.findByUserId(userId);
    }

    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }

}
