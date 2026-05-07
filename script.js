// Initialize AOS (Animate On Scroll) library
AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true,
    mirror: false,
    offset: 100
});

// Lightbox functionality
let currentImageIndex = 0;
let allImages = [];

// Background Music Control
document.addEventListener('DOMContentLoaded', function() {
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let isPlaying = false;

    if (musicToggle && bgMusic) {
        // Set volume to a comfortable level
        bgMusic.volume = 0.3;
        
        // Check if audio can be loaded
        bgMusic.addEventListener('canplay', function() {
            console.log('Music file loaded successfully!');
        });
        
        musicToggle.addEventListener('click', function() {
            if (isPlaying) {
                bgMusic.pause();
                musicToggle.classList.remove('playing');
                musicToggle.querySelector('.music-icon').textContent = '🎵';
                isPlaying = false;
            } else {
                // Try to play and handle any errors
                const playPromise = bgMusic.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        musicToggle.classList.add('playing');
                        musicToggle.querySelector('.music-icon').textContent = '🎶';
                        isPlaying = true;
                    }).catch(error => {
                        console.log('Playback failed:', error);
                        // Check if file exists
                        if (error.name === 'NotSupportedError' || error.name === 'NotAllowedError') {
                            alert('Please make sure:\n1. The file is named exactly "wedding-song.mp3"\n2. The file is in the same folder as index.html\n3. The file is a valid MP3 format');
                        }
                    });
                }
            }
        });
        
        // Handle music end (though it's looped)
        bgMusic.addEventListener('ended', function() {
            musicToggle.classList.remove('playing');
            musicToggle.querySelector('.music-icon').textContent = '🎵';
            isPlaying = false;
        });
        
        // Handle errors - but don't show alert immediately
        bgMusic.addEventListener('error', function(e) {
            console.error('Audio error:', e);
            // Only show error when user tries to play
        });
    }
});

// Smooth scrolling for the entire page
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Create lightbox HTML
    createLightbox();
    
    // Get all gallery images and videos
    const photoItems = document.querySelectorAll('.photo-item img');
    const videoItems = document.querySelectorAll('.video-item video, .video-item-large video');
    
    allImages = Array.from(photoItems);
    
    // Add click event to each image
    photoItems.forEach((img, index) => {
        img.addEventListener('click', function() {
            openLightbox(index);
        });
        img.style.cursor = 'pointer';
    });
    
    // Add click event to each video
    videoItems.forEach((video) => {
        video.addEventListener('click', function(e) {
            e.preventDefault();
            if (video.paused) {
                // Pause all other videos
                videoItems.forEach(v => v.pause());
                video.play();
                const overlay = video.parentElement.querySelector('.video-overlay, .video-overlay-large');
                if (overlay) overlay.style.opacity = '0';
            } else {
                video.pause();
                const overlay = video.parentElement.querySelector('.video-overlay, .video-overlay-large');
                if (overlay) overlay.style.opacity = '1';
            }
        });
        video.style.cursor = 'pointer';
        
        // Handle video ended
        video.addEventListener('ended', function() {
            const overlay = video.parentElement.querySelector('.video-overlay, .video-overlay-large');
            if (overlay) overlay.style.opacity = '1';
        });
    });
    
    // Optional: Add click event to scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const gallery = document.querySelector('.gallery');
            gallery.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Add loading effect for images
    const images = document.querySelectorAll('.photo-item img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.animation = 'none';
        });
    });
    
    // Add parallax effect to hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-content');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            hero.style.opacity = 1 - (scrolled / 700);
        }
    });
    
    // Add intersection observer for lazy loading optimization
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
});

// Create lightbox structure
function createLightbox() {
    const lightboxHTML = `
        <div class="lightbox" id="lightbox">
            <div class="lightbox-content">
                <span class="lightbox-close" onclick="closeLightbox()">&times;</span>
                <img src="" alt="Wedding Photo" id="lightbox-img">
                <div class="lightbox-counter" id="lightbox-counter"></div>
            </div>
            <div class="lightbox-prev" onclick="changeImage(-1)">&#10094;</div>
            <div class="lightbox-next" onclick="changeImage(1)">&#10095;</div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    
    // Close lightbox when clicking outside the image
    document.getElementById('lightbox').addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation for lightbox
    document.addEventListener('keydown', function(e) {
        const lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                changeImage(-1);
            } else if (e.key === 'ArrowRight') {
                changeImage(1);
            }
        } else {
            // Regular page navigation when lightbox is not active
            if (e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                window.scrollBy({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                window.scrollBy({
                    top: -window.innerHeight,
                    behavior: 'smooth'
                });
            } else if (e.key === 'Home') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else if (e.key === 'End') {
                e.preventDefault();
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    });
}

// Open lightbox with specific image
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    
    lightboxImg.src = allImages[currentImageIndex].src;
    counter.textContent = `${currentImageIndex + 1} / ${allImages.length}`;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Change image in lightbox
function changeImage(direction) {
    currentImageIndex += direction;
    
    // Loop around
    if (currentImageIndex >= allImages.length) {
        currentImageIndex = 0;
    } else if (currentImageIndex < 0) {
        currentImageIndex = allImages.length - 1;
    }
    
    const lightboxImg = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    
    // Add fade effect
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transition = 'opacity 0.15s ease';
    
    setTimeout(() => {
        lightboxImg.src = allImages[currentImageIndex].src;
        counter.textContent = `${currentImageIndex + 1} / ${allImages.length}`;
        lightboxImg.style.opacity = '1';
    }, 150);
}

// Add a subtle cursor effect for both mouse and touch
document.addEventListener('mousemove', function(e) {
    createCursorTrail(e.pageX, e.pageY, 'mouse');
});

document.addEventListener('touchstart', function(e) {
    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        createCursorTrail(touch.pageX, touch.pageY, 'touch');
    }
});

document.addEventListener('touchmove', function(e) {
    // Only prevent default if touching interactive elements, not the whole page
    const target = e.target;
    const isInteractive = target.tagName === 'VIDEO' || 
                         target.closest('.photo-item') || 
                         target.closest('.video-item-large') ||
                         target.closest('.music-btn');
    
    if (isInteractive) {
        // Allow normal scrolling, only create trail effect
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            createCursorTrail(touch.pageX, touch.pageY, 'touch');
        }
    }
}, { passive: true });

document.addEventListener('click', function(e) {
    createCursorTrail(e.pageX, e.pageY, 'click');
});

function createCursorTrail(x, y, type) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-trail';
    
    // Add different classes based on interaction type
    if (type === 'touch') {
        cursor.classList.add('touch');
    } else if (type === 'click') {
        cursor.classList.add('large');
    }
    
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';
    document.body.appendChild(cursor);
    
    // Remove the element after animation
    const animationDuration = type === 'touch' ? 1500 : 1200;
    setTimeout(() => {
        if (cursor.parentNode) {
            cursor.remove();
        }
    }, animationDuration);
}

// Prevent right-click on images (optional protection)
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
    }
});
