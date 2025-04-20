package com.example.mrbs.service;

import com.example.mrbs.dto.ReservationDto;
import com.example.mrbs.exception.ResourceNotFoundException;
import com.example.mrbs.exception.RoomNotAvailableException;
import com.example.mrbs.model.MeetingRoom;
import com.example.mrbs.model.Reservation;
import com.example.mrbs.model.Reservation.ReservationStatus;
import com.example.mrbs.model.RoomUsageStats;
import com.example.mrbs.model.User;
import com.example.mrbs.repository.ReservationRepository;
import com.example.mrbs.repository.RoomUsageStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private MeetingRoomService roomService;

    @Autowired
    private RoomUsageStatsRepository statsRepository;

    @Transactional(readOnly = true)
    public List<Reservation> findAllReservations() {
        return reservationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", id));
    }

    @Transactional(readOnly = true)
    public List<Reservation> findUserReservations(String email) {
        return reservationRepository.findByUserEmail(email);
    }

    @Transactional(readOnly = true)
    public List<Reservation> findReservationsByUser(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Reservation> findReservationsByRoom(Long roomId) {
        return reservationRepository.findByRoomId(roomId);
    }

    @Transactional(readOnly = true)
    public List<Reservation> findReservationsByRoomAndDateRange(Long roomId, LocalDateTime fromDate, LocalDateTime toDate) {
        return reservationRepository.findByRoomIdAndDateRange(roomId, fromDate, toDate);
    }

    @Transactional
    public Reservation createReservation(String userEmail, ReservationDto reservationDto) {
        User user = userService.findByEmail(userEmail);
        MeetingRoom room = roomService.findById(reservationDto.getRoomId());

        // Validate time slot
        LocalDateTime startTime = reservationDto.getStartTime();
        LocalDateTime endTime = reservationDto.getEndTime();

        if (startTime.isAfter(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (startTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start time cannot be in the past");
        }

        // Check if room is available for the specified time slot
        boolean isOverlapping = reservationRepository.existsOverlappingReservation(
                room.getId(), startTime, endTime);

        if (isOverlapping) {
            throw new RoomNotAvailableException(room.getId(),
                    "from " + startTime + " to " + endTime);
        }

        // Create reservation
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setRoom(room);
        reservation.setTitle(reservationDto.getTitle());
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setStatus(ReservationStatus.confirmed);

        Reservation savedReservation = reservationRepository.save(reservation);

        // Update room usage statistics
        updateRoomUsageStats(room, startTime, endTime);

        return savedReservation;
    }

    @Transactional
    public Reservation updateReservation(Long id, String userEmail, ReservationDto reservationDto) {
        Reservation reservation = findById(id);
        User user = userService.findByEmail(userEmail);

        // Check if the reservation belongs to the user
        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You don't have permission to update this reservation");
        }

        // If room is changed, validate availability
        Long newRoomId = reservationDto.getRoomId();
        if (!reservation.getRoom().getId().equals(newRoomId)) {
            MeetingRoom newRoom = roomService.findById(newRoomId);

            // Check if new room is available for the specified time slot
            boolean isOverlapping = reservationRepository.existsOverlappingReservation(
                    newRoomId, reservationDto.getStartTime(), reservationDto.getEndTime());

            if (isOverlapping) {
                throw new RoomNotAvailableException(newRoomId,
                        "from " + reservationDto.getStartTime() + " to " + reservationDto.getEndTime());
            }

            // Update room usage stats for the old room (subtract)
            updateRoomUsageStats(reservation.getRoom(),
                    reservation.getStartTime(), reservation.getEndTime(), -1);

            // Set new room
            reservation.setRoom(newRoom);

            // Update room usage stats for the new room (add)
            updateRoomUsageStats(newRoom,
                    reservationDto.getStartTime(), reservationDto.getEndTime());
        }
        // If time slot is changed but room remains the same, validate availability
        else if (!reservation.getStartTime().equals(reservationDto.getStartTime()) ||
                !reservation.getEndTime().equals(reservationDto.getEndTime())) {

            // Check if room is available for the new time slot (excluding current reservation)
            boolean isOverlapping = reservationRepository.existsOverlappingReservationExcludingThis(
                    id, newRoomId, reservationDto.getStartTime(), reservationDto.getEndTime());

            if (isOverlapping) {
                throw new RoomNotAvailableException(newRoomId,
                        "from " + reservationDto.getStartTime() + " to " + reservationDto.getEndTime());
            }

            // Update room usage stats (subtract old time slot)
            updateRoomUsageStats(reservation.getRoom(),
                    reservation.getStartTime(), reservation.getEndTime(), -1);

            // Update room usage stats (add new time slot)
            updateRoomUsageStats(reservation.getRoom(),
                    reservationDto.getStartTime(), reservationDto.getEndTime());
        }

        // Update reservation details
        reservation.setTitle(reservationDto.getTitle());
        reservation.setStartTime(reservationDto.getStartTime());
        reservation.setEndTime(reservationDto.getEndTime());

        return reservationRepository.save(reservation);
    }

    @Transactional
    public void cancelReservation(Long id, String userEmail) {
        Reservation reservation = findById(id);
        User user = userService.findByEmail(userEmail);

        // Check if the reservation belongs to the user or user is admin
        if (!reservation.getUser().getId().equals(user.getId()) &&
                !user.getRole().equals(User.UserRole.admin)) {
            throw new IllegalArgumentException("You don't have permission to cancel this reservation");
        }

        // Update reservation status
        reservation.setStatus(ReservationStatus.cancelled);
        reservationRepository.save(reservation);

        // Update room usage stats (subtract)
        updateRoomUsageStats(reservation.getRoom(),
                reservation.getStartTime(), reservation.getEndTime(), -1);
    }

    @Transactional
    public Reservation updateReservationStatus(Long id, String status) {
        Reservation reservation = findById(id);

        try {
            ReservationStatus newStatus = ReservationStatus.valueOf(status);

            // If changing from confirmed to cancelled, update room usage stats
            if (reservation.getStatus() == ReservationStatus.confirmed &&
                    newStatus == ReservationStatus.cancelled) {
                updateRoomUsageStats(reservation.getRoom(),
                        reservation.getStartTime(), reservation.getEndTime(), -1);
            }
            // If changing from cancelled to confirmed, update room usage stats
            else if (reservation.getStatus() == ReservationStatus.cancelled &&
                    newStatus == ReservationStatus.confirmed) {
                updateRoomUsageStats(reservation.getRoom(),
                        reservation.getStartTime(), reservation.getEndTime());
            }

            reservation.setStatus(newStatus);
            return reservationRepository.save(reservation);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
    }

    private void updateRoomUsageStats(MeetingRoom room, LocalDateTime startTime, LocalDateTime endTime) {
        updateRoomUsageStats(room, startTime, endTime, 1);
    }

    private void updateRoomUsageStats(MeetingRoom room, LocalDateTime startTime,
                                      LocalDateTime endTime, int multiplier) {
        RoomUsageStats stats = statsRepository.findByRoomId(room.getId())
                .orElseGet(() -> {
                    RoomUsageStats newStats = new RoomUsageStats();
                    newStats.setRoom(room);
                    newStats.setTotalBookings(0);
                    newStats.setHoursBooked(0.0f);
                    return newStats;
                });

        // Calculate hours between start and end time
        float hours = Duration.between(startTime, endTime).toMinutes() / 60.0f;

        // Update stats
        if (multiplier > 0) {
            stats.setTotalBookings(stats.getTotalBookings() + 1);
        } else {
            stats.setTotalBookings(Math.max(0, stats.getTotalBookings() - 1));
        }

        stats.setHoursBooked(stats.getHoursBooked() + (hours * multiplier));
        stats.setLastUpdated(LocalDateTime.now());

        statsRepository.save(stats);
    }
}