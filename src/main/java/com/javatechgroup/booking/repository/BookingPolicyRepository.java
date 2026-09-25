package com.javatechgroup.booking.repository;

import com.javatechgroup.booking.domain.BookingPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BookingPolicyRepository extends JpaRepository<BookingPolicy, Long> {
    Optional<BookingPolicy> findByCompanyId(Long companyId);
}
