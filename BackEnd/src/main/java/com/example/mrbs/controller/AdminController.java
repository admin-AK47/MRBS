package com.example.mrbs.controller;

import com.example.mrbs.dto.RoomDto;
import com.example.mrbs.model.MeetingRoom;
import com.example.mrbs.model.Reservation;
import com.example.mrbs.model.RoomUsageStats;
import com.example.mrbs.model.User;
import com.example.mrbs.service.MeetingRoomService;
import com.example.mrbs.service.ReservationService;
import com.example.mrbs.service.RoomUsageStatsService;
import com.example.mrbs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('admin')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private MeetingRoomService roomService;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private RoomUsageStatsService statsService;

    // User management APIs
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        User updatedUser = userService.updateUserRole(id, role);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // Meeting room management APIs
    @GetMapping("/rooms")
    public ResponseEntity<List<MeetingRoom>> getAllRooms() {
        List<MeetingRoom> rooms = roomService.findAllRooms();
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/rooms")
    public ResponseEntity<MeetingRoom> createRoom(@Valid @RequestBody RoomDto roomDto) {
        MeetingRoom newRoom = roomService.createRoom(roomDto);
        return new ResponseEntity<>(newRoom, HttpStatus.CREATED);
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<MeetingRoom> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomDto roomDto) {
        MeetingRoom updatedRoom = roomService.updateRoom(id, roomDto);
        return ResponseEntity.ok(updatedRoom);
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok().build();
    }

    // Reservation management APIs
    @GetMapping("/reservations")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        List<Reservation> reservations = reservationService.findAllReservations();
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/reservations/room/{roomId}")
    public ResponseEntity<List<Reservation>> getReservationsByRoom(@PathVariable Long roomId) {
        List<Reservation> reservations = reservationService.findReservationsByRoom(roomId);
        return ResponseEntity.ok(reservations);
    }

    @PutMapping("/reservations/{id}/status")
    public ResponseEntity<Reservation> updateReservationStatus(@PathVariable Long id, @RequestParam String status) {
        Reservation updatedReservation = reservationService.updateReservationStatus(id, status);
        return ResponseEntity.ok(updatedReservation);
    }

    // Room usage statistics APIs
    @GetMapping("/stats/rooms")
    public ResponseEntity<List<RoomUsageStats>> getAllRoomStats() {
        List<RoomUsageStats> stats = statsService.findAllRoomStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/rooms/{roomId}")
    public ResponseEntity<RoomUsageStats> getRoomStatsById(@PathVariable Long roomId) {
        RoomUsageStats stats = statsService.findByRoomId(roomId);
        return ResponseEntity.ok(stats);
    }
}