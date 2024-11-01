import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Encapsulate book-related functionality
const Book = {
    /**
     * Creates a DOM element for a book preview.
     * @param {Object} book - The book object containing details like id, image, title, and author.
     * @returns {HTMLElement} - The button element representing the book preview.
     */
    createElement: (book) => {
        const element = document.createElement('button');
        element.classList.add('preview');
        element.setAttribute('data-preview', book.id); // Set a data attribute for identifying the book
        element.innerHTML = `
            <img class="preview__image" src="${book.image}" />
            <div class="preview__info">
                <h3 class="preview__title">${book.title}</h3>
                <div class="preview__author">${authors[book.author]}</div>
            </div>
        `;
        return element;
    }
};

// Encapsulate theme management
const Theme = {
    /**
     * Updates the theme of the application.
     * @param {string} theme - The desired theme ('day' or 'night').
     */
    update: (theme) => {
        const isNightMode = theme === 'night';
        // Update CSS variables for theme colors
        document.documentElement.style.setProperty('--color-dark', isNightMode ? '255, 255, 255' : '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', isNightMode ? '10, 10, 20' : '255, 255, 255');
        document.querySelector('[data-settings-theme]').value = theme; // Update the theme selector value
    },

    /**
     * Initializes the theme based on the user's preference or system setting.
     */
    initialize: () => {
        const prefersDarkScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        // Set theme based on user's system preference
        Theme.update(prefersDarkScheme ? 'night' : 'day');
    }
};

// Encapsulate dropdown functionality
const Dropdown = {
    /**
     * Populates a dropdown menu with options.
     * @param {string} selector - The CSS selector for the dropdown menu.
     * @param {Object} data - The data to populate the dropdown (e.g., authors or genres).
     * @param {string} defaultOption - The default option text to display.
     */
    populate: (selector, data, defaultOption) => {
        const fragment = document.createDocumentFragment();
        const firstOption = document.createElement('option');
        firstOption.value = 'any';
        firstOption.innerText = defaultOption;
        fragment.appendChild(firstOption);

        Object.entries(data).forEach(([id, name]) => {
            const option = document.createElement('option');
            option.value = id;
            option.innerText = name;
            fragment.appendChild(option);
        });

        document.querySelector(selector).appendChild(fragment); // Append the options to the dropdown
    }
};

// Encapsulate book list management
const BookList = {
    page: 1, // Current page number for pagination
    matches: books, // Filtered list of books based on search criteria
    
    /**
     * Renders a list of books to the DOM.
     * @param {Object[]} booksToRender - Array of book objects to render.
     */
    render: (booksToRender) => {
        const fragment = document.createDocumentFragment();
        booksToRender.forEach(book => {
            fragment.appendChild(Book.createElement(book)); // Create and append book elements
        });
        document.querySelector('[data-list-items]').appendChild(fragment); // Append the book elements to the list
    },

    /**
     * Filters the list of books based on search criteria.
     * @param {Object} filters - The filtering criteria (e.g., genre, title, author).
     */
    filter: (filters) => {
        BookList.matches = books.filter(book => {
            const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
            const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
            const authorMatch = filters.author === 'any' || book.author === filters.author;
            return titleMatch && authorMatch && genreMatch;
        });
        BookList.page = 1; // Reset to the first page after filtering
    },

    /**
     * Updates the 'Show More' button based on the number of remaining books.
     */
    updateShowMoreButton: () => {
        const remainingBooks = BookList.matches.length - (BookList.page * BOOKS_PER_PAGE);
        const showMoreButton = document.querySelector('[data-list-button]');
        showMoreButton.disabled = remainingBooks <= 0; // Disable button if no more books to show
        showMoreButton.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${Math.max(remainingBooks, 0)})</span>
        `;
    }
};

// Initialize application
Theme.initialize(); // Set initial theme
Dropdown.populate('[data-search-genres]', genres, 'All Genres'); // Populate genre dropdown
Dropdown.populate('[data-search-authors]', authors, 'All Authors'); // Populate author dropdown
BookList.render(BookList.matches.slice(0, BOOKS_PER_PAGE)); // Render the first page of books
BookList.updateShowMoreButton(); // Update 'Show More' button status

// Event listeners
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false; // Close search overlay
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false; // Close settings overlay
});

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true; // Open search overlay
    document.querySelector('[data-search-title]').focus(); // Focus on search title input
});

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true; // Open settings overlay
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false; // Close book details overlay
});

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData); // Extract theme from form data
    Theme.update(theme); // Update the theme
    document.querySelector('[data-settings-overlay]').open = false; // Close settings overlay
});

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData); // Extract search filters from form data
    BookList.filter(filters); // Filter the list of books

    const noMatches = BookList.matches.length === 0;
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', noMatches); // Show or hide no-matches message
    document.querySelector('[data-list-items]').innerHTML = ''; // Clear the current list of books
    BookList.render(BookList.matches.slice(0, BOOKS_PER_PAGE)); // Render the filtered books
    BookList.updateShowMoreButton(); // Update 'Show More' button status
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top of the page
    document.querySelector('[data-search-overlay]').open = false; // Close search overlay
});

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const nextPageBooks = BookList.matches.slice(BookList.page * BOOKS_PER_PAGE, (BookList.page + 1) * BOOKS_PER_PAGE);
    BookList.render(nextPageBooks); // Render the next page of books
    BookList.page += 1; // Increment page number
    BookList.updateShowMoreButton(); // Update 'Show More' button status
});

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const button = event.target.closest('[data-preview]');
    if (button) {
        const bookId = button.dataset.preview; // Get the book ID from the data attribute
        const book = books.find(book => book.id === bookId); // Find the book by ID

        if (book) {
            document.querySelector('[data-list-active]').open = true; // Open book details overlay
            document.querySelector('[data-list-blur]').src = book.image; // Set blur image
            document.querySelector('[data-list-image]').src = book.image; // Set main image
            document.querySelector('[data-list-title]').innerText = book.title; // Set book title
            document.querySelector('[data-list-subtitle]').innerText = `${authors[book.author]} (${new Date(book.published).getFullYear()})`; // Set subtitle with author and publication year
            document.querySelector('[data-list-description]').innerText = book.description; // Set book description
        }
    }
});
