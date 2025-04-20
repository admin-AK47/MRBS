package com.example.mrbs.repository;

import com.example.mrbs.model.RoomUsageStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomUsageStatsRepository extends JpaRepository<RoomUsageStats, Long> {

    Optional<RoomUsageStats> findByRoomId(Long roomId);
}