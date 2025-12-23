package com.alp2.library.service;

import com.alp2.library.entity.Book;
import com.alp2.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;


    public Book addBook(Book book) {

        book.setAvailableCount(book.getStockCount());
        return bookRepository.save(book);
    }


    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }


    public Book updateBook(Long id, Book updatedBook) {
        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Güncellenecek kitap bulunamadı."));


        int stockDifference = updatedBook.getStockCount() - existingBook.getStockCount();


        if (existingBook.getAvailableCount() + stockDifference < 0) {
            throw new RuntimeException("Mevcut ödünç verilen kitap sayısından az stok ayarlayamazsınız!");
        }


        existingBook.setTitle(updatedBook.getTitle());
        existingBook.setAuthor(updatedBook.getAuthor());
        existingBook.setStockCount(updatedBook.getStockCount());
        existingBook.setAvailableCount(existingBook.getAvailableCount() + stockDifference);

        return bookRepository.save(existingBook);
    }


    public void deleteBook(Long id) {

        bookRepository.deleteById(id);
    }


    public List<Book> searchBooks(String query) {
        return bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                query, query, query);
    }
}