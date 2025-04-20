package com.example.mrbs.repository;

import com.example.mrbs.model.Reservation;
import com.example.mrbs.model.Reservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByUserEmail(String email);

    List<Reservation> findByRoomId(Long roomId);

    List<Reservation> findByStatus(ReservationStatus status);

    @Query("""
        SELECT r FROM Reservation r 
        WHERE r.room.id = :roomId 
        AND r.startTime >= :fromDate 
        AND r.endTime <= :toDate
    """)
    List<Reservation> findByRoomIdAndDateRange(
            @Param("roomId") Long roomId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

    @Query("""
        SELECT COUNT(r) > 0 FROM Reservation r 
        WHERE r.room.id = :roomId 
        AND r.status = 'confirmed' 
        AND ((r.startTime <= :endTime AND r.endTime >= :startTime))
    """)
    boolean existsOverlappingReservation(
            @Param("roomId") Long roomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("""
        SELECT COUNT(r) > 0 FROM Reservation r 
        WHERE r.id != :reservationId 
        AND r.room.id = :roomId 
        AND r.status = 'confirmed' 
        AND ((r.startTime <= :endTime AND r.endTime >= :startTime))
    """)
    boolean existsOverlappingReservationExcludingThis(
            @Param("reservationId") Long reservationId,
            @Param("roomId") Long roomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}