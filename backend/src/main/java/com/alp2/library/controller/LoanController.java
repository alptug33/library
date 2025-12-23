package com.alp2.library.controller;

import com.alp2.library.entity.Loan;
import com.alp2.library.entity.User;
import com.alp2.library.repository.UserRepository;
import com.alp2.library.service.LoanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    private final UserRepository userRepository;

    @PostMapping("/borrow/{bookId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Loan> borrowBook(
            @PathVariable Long bookId,
            Authentication authentication) {

        String userEmail = authentication.getName();

        Loan newLoan = loanService.borrowBook(bookId, userEmail);
        return ResponseEntity.status(201).body(newLoan);
    }

    @PutMapping("/return/{loanId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Loan> returnBook(@PathVariable Long loanId) {
        Loan returnedLoan = loanService.returnBook(loanId);
        return ResponseEntity.ok(returnedLoan);
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<List<Loan>> getOverdueLoans() {
        return ResponseEntity.ok(loanService.getOverdueLoans());
    }

    @GetMapping("/history/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<List<Loan>> getUserLoanHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(loanService.getUserLoanHistory(userId));
    }

    @GetMapping("/history/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Loan>> getMyLoanHistory(Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        return ResponseEntity.ok(loanService.getUserLoanHistory(user.getId()));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<List<Loan>> getAllActiveLoans() {
        return ResponseEntity.ok(loanService.getAllActiveLoans());
    }
}