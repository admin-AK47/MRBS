package com.example.mrbs.service;

import com.example.mrbs.dto.RoomDto;
import com.example.mrbs.exception.ResourceNotFoundException;
import com.example.mrbs.model.MeetingRoom;
import com.example.mrbs.model.MeetingRoom.RoomAvailability;
import com.example.mrbs.model.MeetingRoom.RoomLocation;
import com.example.mrbs.model.RoomUsageStats;
import com.example.mrbs.repository.MeetingRoomRepository;
import com.example.mrbs.repository.RoomUsageStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MeetingRoomService {

    @Autowired
    private MeetingRoomRepository roomRepository;

    @Autowired
    private RoomUsageStatsRepository statsRepository;

    @Transactional(readOnly = true)
    public List<MeetingRoom> findAllRooms() {
        return roomRepository.findAll();
    }

    @Transactional(readOnly = true)
    public MeetingRoom findById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting Room", "id", id));
    }

    @Transactional(readOnly = true)
    public List<MeetingRoom> findAvailableRooms() {
        return roomRepository.findByAvailability(RoomAvailability.Available);
    }

    @Transactional(readOnly = true)
    public List<MeetingRoom> findRoomsByLocation(String location) {
        try {
            RoomLocation roomLocation = RoomLocation.valueOf(location.replace(" ", "_"));
            return roomRepository.findByLocation(roomLocation);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid location: " + location);
        }
    }

    @Transactional(readOnly = true)
    public List<MeetingRoom> findRoomsByMinCapacity(int capacity) {
        return roomRepository.findByMinCapacity(capacity);
    }

    @Transactional(readOnly = true)
    public List<MeetingRoom> findAvailableRoomsForTimeSlot(LocalDateTime startTime, LocalDateTime endTime) {
        // Validate time slot
        if (startTime.isAfter(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        return roomRepository.findAvailableRoomsForTimeSlot(startTime, endTime);
    }

    @Transactional
    public MeetingRoom createRoom(RoomDto roomDto) {
        MeetingRoom room = new MeetingRoom();
        room.setName(roomDto.getName());

        try {
            room.setLocation(RoomLocation.valueOf(roomDto.getLocation().replace(" ", "_")));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid location: " + roomDto.getLocation());
        }

        room.setCapacity(roomDto.getCapacity());
        room.setAvailability(RoomAvailability.Available);
        room.setFeedback(roomDto.getFeedback());

        MeetingRoom savedRoom = roomRepository.save(room);

        // Initialize usage statistics for the room
        RoomUsageStats stats = new RoomUsageStats();
        stats.setRoom(savedRoom);
        stats.setTotalBookings(0);
        stats.setHoursBooked(0.0f);
        statsRepository.save(stats);

        return savedRoom;
    }

    @Transactional
    public MeetingRoom updateRoom(Long id, RoomDto roomDto) {
        MeetingRoom room = findById(id);

        room.setName(roomDto.getName());

        try {
            room.setLocation(RoomLocation.valueOf(roomDto.getLocation().replace(" ", "_")));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid location: " + roomDto.getLocation());
        }

        room.setCapacity(roomDto.getCapacity());

        if (roomDto.getAvailability() != null) {
            try {
                room.setAvailability(RoomAvailability.valueOf(roomDto.getAvailability()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid availability status: " + roomDto.getAvailability());
            }
        }

        if (roomDto.getFeedback() != null) {
            room.setFeedback(roomDto.getFeedback());
        }

        return roomRepository.save(room);
    }

    @Transactional
    public MeetingRoom addFeedback(Long id, String feedback) {
        MeetingRoom room = findById(id);

        // Append new feedback to existing feedback with timestamp
        String timestamp = LocalDateTime.now().toString();
        String newFeedback = timestamp + ": " + feedback;

        if (room.getFeedback() != null && !room.getFeedback().isEmpty()) {
            room.setFeedback(room.getFeedback() + "\n" + newFeedback);
        } else {
            room.setFeedback(newFeedback);
        }

        return roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(Long id) {
        MeetingRoom room = findById(id);
        roomRepository.delete(room);
    }
}