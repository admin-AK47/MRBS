package com.example.mrbs.controller;

import com.example.mrbs.dto.FeedbackDto;
import com.example.mrbs.model.Feedback;
import com.example.mrbs.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<Feedback> addFeedback(@RequestBody FeedbackDto dto) {
        return ResponseEntity.ok(feedbackService.addFeedback(dto));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Feedback>> getByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByRoom(roomId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Feedback>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByUser(userId));
    }
}
