package com.alp2.library.repository;

import com.alp2.library.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByUserId(Long userId);

    List<Loan> findByDueDateBeforeAndIsReturnedFalse(LocalDate date);

    Optional<Loan> findByBookIdAndIsReturnedFalse(Long bookId);

    List<Loan> findByIsReturnedFalse();
}
