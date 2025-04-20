package com.example.mrbs.service;

import com.example.mrbs.exception.ResourceNotFoundException;
import com.example.mrbs.model.RoomUsageStats;
import com.example.mrbs.repository.RoomUsageStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoomUsageStatsService {

    @Autowired
    private RoomUsageStatsRepository statsRepository;

    @Transactional(readOnly = true)
    public List<RoomUsageStats> findAllRoomStats() {
        return statsRepository.findAll();
    }

    @Transactional(readOnly = true)
    public RoomUsageStats findByRoomId(Long roomId) {
        return statsRepository.findByRoomId(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room Usage Stats", "roomId", roomId));
    }
}