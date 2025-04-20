package com.example.mrbs.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "room_usage_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomUsageStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "room_id", nullable = false)
    private MeetingRoom room;

    @Column(name = "total_bookings", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer totalBookings = 0;

    @Column(name = "hours_booked", nullable = false, columnDefinition = "FLOAT DEFAULT 0")
    private Float hoursBooked = 0.0f;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now();
}