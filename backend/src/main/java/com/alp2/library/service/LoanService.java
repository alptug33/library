package com.alp2.library.service;

import com.alp2.library.entity.Book;
import com.alp2.library.entity.Loan;
import com.alp2.library.entity.User;
import com.alp2.library.repository.BookRepository;
import com.alp2.library.repository.LoanRepository;
import com.alp2.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    private static final int LOAN_PERIOD_DAYS = 14;

    public Loan borrowBook(Long bookId, String userEmail) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Kitap bulunamadı."));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        if (book.getAvailableCount() <= 0) {
            throw new RuntimeException("Kitap stokta yok.");
        }

        book.setAvailableCount(book.getAvailableCount() - 1);
        bookRepository.save(book);

        Loan loan = Loan.builder()
                .book(book)
                .user(user)
                .borrowDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(LOAN_PERIOD_DAYS))
                .isReturned(false)
                .build();

        return loanRepository.save(loan);
    }

    public Loan returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Ödünç kaydı bulunamadı."));

        if (loan.isReturned()) {
            throw new RuntimeException("Bu kitap zaten iade edilmiş.");
        }

        Book book = loan.getBook();
        book.setAvailableCount(book.getAvailableCount() + 1);
        bookRepository.save(book);

        loan.setReturnDate(LocalDate.now());
        loan.setReturned(true);

        if (loan.getReturnDate().isAfter(loan.getDueDate())) {
            System.out.println("DİKKAT: Kitap gecikmeli iade edildi! Ceza hesaplanmalı.");

        }

        return loanRepository.save(loan);
    }

    public List<Loan> getOverdueLoans() {
        return loanRepository.findByDueDateBeforeAndIsReturnedFalse(LocalDate.now());
    }

    public List<Loan> getUserLoanHistory(Long userId) {
        return loanRepository.findByUserId(userId);
    }

    public List<Loan> getAllActiveLoans() {
        return loanRepository.findByIsReturnedFalse();
    }
}
