/**
 * Côte Rôtie - Official Website JavaScript
 * European Bistro & Artisanal Pâtisserie at Alliance Française Karachi
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveHours();
  initAnnouncement();
  initNavigation();
  initMenuSystem();
  initGalleryLightbox();
  initReservationSystem();
  initContactForm();
  initFooterYear();
});

function initAnnouncement() {
  try {
    const raw = localStorage.getItem('coterotie_announcement');
    if (!raw) return;
    const { isEnabled, text } = JSON.parse(raw);
    if (isEnabled && text) {
      let banner = document.getElementById('publicAnnouncementBanner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'publicAnnouncementBanner';
        banner.className = 'announcement-banner';
        banner.innerHTML = `<div class="container announcement-content"><i class="fa-solid fa-bell"></i> <span>${text}</span></div>`;
        const topBar = document.querySelector('.top-bar');
        if (topBar) topBar.insertAdjacentElement('afterend', banner);
      }
    }
  } catch (e) {}
}

/* ==========================================================================
   1. Live Hours & Karachi Local Time Status Indicator
   ========================================================================== */
function initLiveHours() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('liveStatusText');

  if (!statusDot || !statusText) return;

  function updateStatus() {
    // Current UTC time + 5 hours for Pakistan Standard Time (PKT)
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const pktTime = new Date(utcTime + (3600000 * 5));

    const day = pktTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = pktTime.getHours();
    const minute = pktTime.getMinutes();
    const currentTimeMinutes = hour * 60 + minute;

    // Operating hours: Tue (2) to Sun (0): 12:30 PM (750 mins) to 11:00 PM (1380 mins)
    // Monday (1): Closed
    const isMonday = (day === 1);
    const openTime = 12 * 60 + 30; // 12:30 PM = 750
    const closeTime = 23 * 60;      // 11:00 PM = 1380

    if (isMonday) {
      statusDot.className = 'status-indicator closed';
      statusText.textContent = 'Closed Today (Monday) · Reopens Tuesday 12:30 PM';
    } else if (currentTimeMinutes >= openTime && currentTimeMinutes < closeTime) {
      statusDot.className = 'status-indicator';
      statusText.textContent = 'Open Today · Lunch & Dinner until 11:00 PM';
    } else if (currentTimeMinutes < openTime) {
      statusDot.className = 'status-indicator closed';
      statusText.textContent = 'Opens at 12:30 PM · Alliance Française Courtyard';
    } else {
      statusDot.className = 'status-indicator closed';
      statusText.textContent = 'Closed for the Night · Opens Tomorrow 12:30 PM';
    }
  }

  updateStatus();
  setInterval(updateStatus, 60000); // Check every minute
}

/* ==========================================================================
   2. Navigation, Sticky Header & Mobile Drawer
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('header');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateActiveNavLink();
  });

  // Mobile Drawer toggles
  function openDrawer() {
    mobileDrawer.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeDrawer);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // ScrollSpy: Update active link based on scroll position
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }
}

/* ==========================================================================
   3. Menu Showcase & Dynamic LocalStorage Data
   ========================================================================== */
const DEFAULT_MENU_ITEMS = [
  // --- COLD APPETIZERS & SALADS ---
  {
    id: 'cold-1',
    name: 'Ricotta with Honey, Figs & Walnuts',
    category: 'cold',
    price: 1450,
    description: 'Whipped fresh ricotta drizzled with wild honey, sweet figs, and toasted walnuts, served with artisanal levain toasts.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80',
    tags: ['Vegetarian', 'Artisanal Toast'],
    isAvailable: true
  },
  {
    id: 'cold-2',
    name: 'Smoked Salmon Crostini',
    category: 'cold',
    price: 2800,
    description: 'House-cured smoked salmon ribbons served over crisp sourdough crostini with herb crème fraîche, caper berries, and fresh dill.',
    image: 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?auto=format&fit=crop&w=500&q=80',
    tags: ['Seafood', 'Bistro Favorite'],
    isAvailable: true
  },
  {
    id: 'cold-3',
    name: 'Burrata with Cherry Tomatoes & Basil Pesto',
    category: 'cold',
    price: 2300,
    description: 'Creamy artisanal burrata cheese with blistered sweet cherry tomatoes, scratch-made basil pine nut pesto, and aged balsamic glaze.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=500&q=80',
    tags: ['Vegetarian', "Chef's Recommendation"],
    isAvailable: true
  },
  {
    id: 'cold-4',
    name: 'Chicken Fajita Cobb Salad',
    category: 'cold',
    price: 1850,
    description: 'Grilled spice-rubbed chicken breast, avocado, crisp beef bacon bits, hard-boiled eggs, sweet corn, and artisan buttermilk lime dressing.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80',
    tags: ['Protein-Rich', 'Fresh Greens'],
    isAvailable: true
  },
  {
    id: 'cold-5',
    name: 'Crab Salad with Apple, Iceberg & Walnuts',
    category: 'cold',
    price: 1950,
    description: 'Delicate hand-picked lump crab meat tossed with crisp Granny Smith apple batons, chilled iceberg lettuce, and candied walnuts.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
    tags: ['Seafood', 'Crisp & Light'],
    isAvailable: true
  },
  {
    id: 'cold-6',
    name: 'Charred Prawns, Street Corn & Tomato Salad',
    category: 'cold',
    price: 2550,
    description: 'Flame-charred Arabian Gulf prawns with roasted sweet corn, heirloom tomatoes, pickled red onion, and citrus herb vinaigrette.',
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=500&q=80',
    tags: ['Seafood', 'Gluten-Free'],
    isAvailable: true
  },
  {
    id: 'cold-7',
    name: 'Dill Salmon Tartare & Smoked Salmon Salad',
    category: 'cold',
    price: 2650,
    description: 'Finely hand-diced fresh salmon tartare with shallots and fresh dill, paired with cold-smoked salmon and wild baby arugula.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80',
    tags: ['Signature Cold', 'Catch of the Day'],
    isAvailable: true
  },
  {
    id: 'cold-8',
    name: 'Crispy Chicken Tender Salad',
    category: 'cold',
    price: 1950,
    description: 'Crispy buttermilk-fried chicken breast tenders over seasonal farm greens, cherry tomatoes, radish, and house mustard vinaigrette.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80',
    tags: ['House Classic'],
    isAvailable: true
  },
  {
    id: 'cold-9',
    name: 'Beef Carpaccio with Bresaola',
    category: 'cold',
    price: 6250,
    description: 'Ultra-thin sliced cured beef bresaola, 24-month aged Parmigiano-Reggiano curls, wild peppery rocket, and cold-pressed olive oil.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
    tags: ['Prime Cut', 'Gluten-Free'],
    isAvailable: true
  },

  // --- HOT APPETIZERS & PLATES ---
  {
    id: 'hot-1',
    name: 'Selection of Artisanal Breads',
    category: 'hot',
    price: 500,
    description: 'Warm in-house levain sourdough batard and French baguettes baked daily, served with whipped cultured salted butter.',
    image: 'assets/bread.jpg',
    tags: ['Baked Daily In-House', 'French Tradition'],
    isAvailable: true
  },
  {
    id: 'hot-2',
    name: 'Leek & Potato Soup',
    category: 'hot',
    price: 700,
    description: 'Velvety smooth traditional French velouté of braised sweet leeks, Yukon Gold potatoes, touch of cream, and fresh garden chives.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=500&q=80',
    tags: ['Comfort Classic', 'Vegetarian'],
    isAvailable: true
  },
  {
    id: 'hot-3',
    name: 'Pizza Diavola (Pepperoni, Olives, Jalapeños)',
    category: 'hot',
    price: 3850,
    description: 'Wood-fired sourdough pizza topped with spicy beef pepperoni, Kalamata olives, fire-pickled jalapeños, and melted fresh mozzarella.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
    tags: ['Wood-Fired', 'Artisan Sourdough'],
    isAvailable: true
  },
  {
    id: 'hot-4',
    name: 'Boursin Stuffed Mushrooms',
    category: 'hot',
    price: 1850,
    description: 'Fresh button mushroom caps filled with creamy garlic and fine herb French Boursin cheese, gratinéed with crisp panko crumbs.',
    image: 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?auto=format&fit=crop&w=500&q=80',
    tags: ['Vegetarian', 'Hot Hors d’Oeuvre'],
    isAvailable: true
  },
  {
    id: 'hot-5',
    name: 'Spinach & Artichoke Dip with Sourdough',
    category: 'hot',
    price: 1950,
    description: 'Bubbling cast iron skillet of tender artichoke hearts and baby spinach folded in gruyère and cream, served with warm sourdough toasts.',
    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=500&q=80',
    tags: ['Vegetarian', 'Sharing Plate'],
    isAvailable: true
  },
  {
    id: 'hot-6',
    name: 'Two Cheese Toasted Ravioli',
    category: 'hot',
    price: 1200,
    description: 'Crisp golden-crusted toasted ricotta and mozzarella ravioli pillows served with warm San Marzano tomato dipping sauce.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80',
    tags: ['Vegetarian', 'Crispy Pasta'],
    isAvailable: true
  },
  {
    id: 'hot-7',
    name: 'Baked Feta with Chili & Honey',
    category: 'hot',
    price: 1950,
    description: 'Warm block of Greek feta oven-baked with cracked red chili flakes, fresh garden thyme, and raw wildflower honey, with bread.',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=500&q=80',
    tags: ['Vegetarian', 'Sweet & Spicy'],
    isAvailable: true
  },
  {
    id: 'hot-8',
    name: 'Raspberry Chipotle Brie Bites',
    category: 'hot',
    price: 2250,
    description: 'Warm French brie wheels wrapped in crisp golden puff pastry, glazed with spicy sweet raspberry chipotle reduction.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
    tags: ['Signature Starter', 'Warm Pastry'],
    isAvailable: true
  },
  {
    id: 'hot-9',
    name: 'Sticky Mango Prawns',
    category: 'hot',
    price: 1750,
    description: 'Crisp tempura tiger prawns tossed in sweet tangy Sindh mango reduction with red chili flakes and fresh scallions.',
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=500&q=80',
    tags: ['Seafood', 'Local Mango Glaze'],
    isAvailable: true
  },
  {
    id: 'hot-10',
    name: 'Crab & Salmon Cakes',
    category: 'hot',
    price: 1750,
    description: 'Pan-seared lump crab meat and fresh salmon patties served with spiced caper remoulade and micro salad.',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=500&q=80',
    tags: ['Seafood', 'Pan-Seared'],
    isAvailable: true
  },
  {
    id: 'hot-11',
    name: 'Kund Malir Mussels in Garlic Butter',
    category: 'hot',
    price: 1200,
    description: 'Fresh local coastal mussels gently steamed in white grape emulsion, fragrant garlic butter, and fresh Italian parsley.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
    tags: ['Local Coastal Catch', 'Fresh Shellfish'],
    isAvailable: true
  },
  {
    id: 'hot-12',
    name: 'Roasted Razor Clams with Garlic & Chili',
    category: 'hot',
    price: 1450,
    description: 'Sizzled razor clams roasted with garlic slivers, chili flakes, sea salt, and fresh lemon butter.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80',
    tags: ['Coastal Seafood', 'Pan-Roasted'],
    isAvailable: true
  },
  {
    id: 'hot-13',
    name: 'Escargots de Bourgogne',
    category: 'hot',
    price: 4750,
    description: 'Classic Burgundian snails baked in their shells with rich garlic, shallot, and flat-leaf parsley butter sauce.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
    tags: ['French Haute Tradition', 'Gourmet'],
    isAvailable: true
  },
  {
    id: 'hot-14',
    name: 'Squid with Burst Cherry Tomatoes',
    category: 'hot',
    price: 2250,
    description: 'Flash-seared tender calamari rings with blistered cherry tomatoes, capers, garlic cloves, and toasted breadcrumbs.',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=500&q=80',
    tags: ['Mediterranean', 'Seafood'],
    isAvailable: true
  },
  {
    id: 'hot-15',
    name: 'Honey Chipotle Chicken Tacos',
    category: 'hot',
    price: 1600,
    description: 'Tender pulled chicken tossed in honey chipotle glaze, served in soft tortillas with pickled slaw and lime crema.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80',
    tags: ['Tacos', 'Bistro Special'],
    isAvailable: true
  },
  {
    id: 'hot-16',
    name: 'Slow-Cooked Prime Beef Tacos',
    category: 'hot',
    price: 1600,
    description: 'Braised prime beef in soft warm tortillas with roasted tomato salsa, pickled red onions, and fresh cilantro.',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=500&q=80',
    tags: ['Tacos', 'Prime Beef'],
    isAvailable: true
  },

  // --- PASTA & RISOTTO ---
  {
    id: 'pasta-1',
    name: 'Seafood Linguine',
    category: 'pasta',
    price: 3250,
    description: 'Artisanal linguine pasta with jumbo prawns, tender squid, and mussels in a delicate white grape and garlic herb broth.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80',
    tags: ['Seafood Pasta', 'Bistro Specialty'],
    isAvailable: true
  },
  {
    id: 'pasta-2',
    name: 'Penne with Lobster & Chili',
    category: 'pasta',
    price: 4950,
    description: 'Al dente penne pasta folded with succulent lobster tail meat, spicy calabrian chili cream, and sweet cherry tomatoes.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80',
    tags: ['Signature Haute Pasta', 'Lobster'],
    isAvailable: true
  },
  {
    id: 'pasta-3',
    name: 'Shrimp Scampi with Linguine',
    category: 'pasta',
    price: 3450,
    description: 'Plump grilled shrimp tossed with garlic, crushed red pepper flakes, fresh lemon zest, and butter sauce over fresh linguine.',
    image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=500&q=80',
    tags: ['Chalkboard Special', 'Chef Recommendation'],
    isAvailable: true
  },
  {
    id: 'pasta-4',
    name: 'Saffron Risotto with Grilled Prawns',
    category: 'pasta',
    price: 2850,
    description: 'Creamy slow-simmered Carnaroli rice infused with Spanish saffron threads, aged Parmigiano, and grilled tiger prawns.',
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=500&q=80',
    tags: ['Italian Risotto', 'Gluten-Free'],
    isAvailable: true
  },
  {
    id: 'pasta-5',
    name: 'Tagliatelle Bolognese',
    category: 'pasta',
    price: 1800,
    description: 'Handcrafted egg tagliatelle ribbon pasta coated in slow-simmered prime beef and tomato ragù, finished with aged parmesan.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281724?auto=format&fit=crop&w=500&q=80',
    tags: ['Handmade Egg Pasta', 'Slow-Simmered'],
    isAvailable: true
  },
  {
    id: 'pasta-6',
    name: 'Spaghetti alla Nerano',
    category: 'pasta',
    price: 1950,
    description: 'Classic Amalfi coast recipe of al dente spaghetti with fried golden zucchini coins, Provolone cheese, and fresh sweet basil.',
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=500&q=80',
    tags: ['Vegetarian', 'Italian Heritage'],
    isAvailable: true
  },
  {
    id: 'pasta-7',
    name: 'Wild Mushroom Linguine',
    category: 'pasta',
    price: 2800,
    description: 'Sautéed forest chanterelles and cremini mushrooms, white truffle oil essence, garlic, and fresh parmesan cream over linguine.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=500&q=80',
    tags: ['Vegetarian', 'Truffle Essence'],
    isAvailable: true
  },
  {
    id: 'pasta-8',
    name: 'Artichoke & Ricotta Ravioli',
    category: 'pasta',
    price: 2250,
    description: 'Handmade pasta pillows filled with roasted artichoke hearts and fresh ricotta cheese, tossed in sage brown butter.',
    image: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=500&q=80',
    tags: ['Vegetarian', 'House-Rolled Pasta'],
    isAvailable: true
  },
  {
    id: 'pasta-9',
    name: 'Spaghetti with Cherry Tomato Sauce',
    category: 'pasta',
    price: 2250,
    description: 'Slow-blistered sweet cherry tomatoes, extra virgin olive oil, garlic confit, and fresh basil over al dente spaghetti.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80',
    tags: ['Vegetarian', 'Simple Perfection'],
    isAvailable: true
  },

  // --- MAINS & CHEF'S CUTS ---
  {
    id: 'mains-1',
    name: 'Roast Fillet of Beef with Morel Sauce',
    category: 'mains',
    price: 3800,
    description: 'Prime aged beef tenderloin fillet seared in thyme butter, served with rich wild morel mushroom cream reduction and potatoes.',
    image: 'assets/hero-dish.jpg',
    tags: ['Signature Steak', "Chef's Cut"],
    isAvailable: true
  },
  {
    id: 'mains-2',
    name: 'Mango and Wasabi Steak',
    category: 'mains',
    price: 3950,
    description: 'Flame-grilled prime tenderloin medallions glazed with sweet Sindh mango relish, fiery wasabi butter, and grilled asparagus.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
    tags: ['Chalkboard Special', 'Fusion Excellence'],
    isAvailable: true
  },
  {
    id: 'mains-3',
    name: 'Provençal Braised Lamb Shank',
    category: 'mains',
    price: 5450,
    description: '7-hour slow-braised tender lamb shank in rosemary and aromatic root vegetable jus, served on creamy mashed potatoes.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
    tags: ['Slow Braised 7h', 'French Heritage'],
    isAvailable: true
  },
  {
    id: 'mains-4',
    name: 'Slow Roasted Salmon, Fennel & Chilies',
    category: 'mains',
    price: 5550,
    description: 'Norwegian salmon fillet gently slow-roasted with shaved fennel bulbs, mild red chilies, and lemon-infused extra virgin olive oil.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80',
    tags: ['Fresh Salmon', 'Gluten-Free'],
    isAvailable: true
  },
  {
    id: 'mains-5',
    name: 'Lentil Crusted Snapper with Citrus Sauce',
    category: 'mains',
    price: 3350,
    description: 'Fresh red snapper fillet coated in a crunchy spiced lentil crust, served over sautéed baby spinach and bright citrus beurre blanc.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80',
    tags: ['Catch of the Day', 'Seafood'],
    isAvailable: true
  },
  {
    id: 'mains-6',
    name: 'Creamy Artichoke Chicken',
    category: 'mains',
    price: 3800,
    description: 'Pan-seared tender chicken breasts smothered in a rich, velvety artichoke heart and parmesan velouté, served with baby potatoes.',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=500&q=80',
    tags: ['Poultry', 'Rich Velouté'],
    isAvailable: true
  },
  {
    id: 'mains-7',
    name: 'Spiced Chicken Thighs with Spinach Salad',
    category: 'mains',
    price: 3150,
    description: 'Char-grilled spiced deboned chicken thighs served with a warm bacon and baby spinach salad in house herb vinaigrette.',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=500&q=80',
    tags: ['Grilled', 'Salad Pairing'],
    isAvailable: true
  },
  {
    id: 'mains-8',
    name: 'Boeuf Bourguignon',
    category: 'mains',
    price: 2050,
    description: 'Classic French beef stew with pearl onions, cremini mushrooms, and sweet baby carrots slow-simmered in rich reduction.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80',
    tags: ['French Bistro Classic'],
    isAvailable: true
  },
  {
    id: 'mains-9',
    name: 'Roasted Sole, Garlic Butter & Braised Leeks',
    category: 'mains',
    price: 2550,
    description: 'Delicate fillet of sole pan-roasted in foaming garlic butter, served over sweet braised leeks and steamed potatoes.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80',
    tags: ['Seafood', 'Light & Elegant'],
    isAvailable: true
  },
  {
    id: 'mains-10',
    name: 'BBQ Tiger Prawns with Chili Lemon Butter',
    category: 'mains',
    price: 4850,
    description: 'Jumbo Arabian tiger prawns flame-grilled over charcoal, brushed with smoked chili lemon garlic butter and herb rice.',
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=500&q=80',
    tags: ['Jumbo Prawns', 'Charcoal Grilled'],
    isAvailable: true
  },
  {
    id: 'mains-11',
    name: 'Crispy Sea Bass with Tomato Olive Salsa',
    category: 'mains',
    price: 9800,
    description: 'Whole crispy wild sea bass seasoned with herbs, served with Sicilian tomato, Kalamata olive, caper and lemon salsa.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80',
    tags: ['Haute Catch', 'Sharing Special'],
    isAvailable: true
  },
  {
    id: 'mains-12',
    name: 'Screaming Eagle Beef Sandwich',
    category: 'mains',
    price: 2150,
    description: 'Tender sliced roast beef on crusty house-baked sourdough batard with molten sharp cheddar, caramelized onions, and horseradish aioli.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80',
    tags: ['Chalkboard Special', 'Artisanal Sourdough'],
    isAvailable: true
  },

  // --- ARTISANAL SIDES ---
  {
    id: 'sides-1',
    name: 'Truffle Fries with Herb Aioli',
    category: 'sides',
    price: 1200,
    description: 'Hand-cut crispy potatoes tossed with white truffle oil, coarse sea salt, and grated aged parmesan, with garlic aioli.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80',
    tags: ['Side', 'Truffle'],
    isAvailable: true
  },
  {
    id: 'sides-2',
    name: 'Gratin Potato Dauphinoise',
    category: 'sides',
    price: 800,
    description: 'Thinly sliced potatoes layered with cream, garlic, nutmeg, and Gruyère cheese, baked to a bubbly golden crust.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
    tags: ['French Side', 'Vegetarian'],
    isAvailable: true
  },
  {
    id: 'sides-3',
    name: 'Grass-Fed Butter Fried Potatoes',
    category: 'sides',
    price: 1100,
    description: 'Baby Yukon Gold potatoes smashed and crisp-fried in grass-fed French butter with rosemary and sea salt.',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80',
    tags: ['Side', 'Gluten-Free'],
    isAvailable: true
  },
  {
    id: 'sides-4',
    name: 'Creamed Spinach with Pearl Onions',
    category: 'sides',
    price: 650,
    description: 'Fresh baby spinach folded in velvety nutmeg cream with tender braised pearl onions.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80',
    tags: ['Side', 'Vegetarian'],
    isAvailable: true
  },
  {
    id: 'sides-5',
    name: 'Charred Sweet Potato with Hot Honey',
    category: 'sides',
    price: 1350,
    description: 'Oven-roasted sweet potato wedges caramelized with spicy red chili honey and fresh thyme.',
    image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=500&q=80',
    tags: ['Side', 'Vegetarian'],
    isAvailable: true
  },

  // --- DESSERTS ---
  {
    id: 'dessert-1',
    name: 'Signature Valrhona Dark Chocolate Tart',
    category: 'desserts',
    price: 1850,
    description: 'Decadent 70% French Valrhona chocolate silk ganache inside a crisp cocoa sablé crust, finished with edible gold leaf and fresh raspberries.',
    image: 'assets/dessert.jpg',
    tags: ['Legendary', 'Must Try'],
    isAvailable: true
  },
  {
    id: 'dessert-2',
    name: 'Madagascar Vanilla Crème Brûlée',
    category: 'desserts',
    price: 1550,
    description: 'Silky rich egg custard infused with real Madagascar vanilla bean seeds, cracked table-side under a brittle caramelized sugar crust.',
    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=500&q=80',
    tags: ['Gluten-Free', 'Classic'],
    isAvailable: true
  },
  {
    id: 'dessert-3',
    name: 'Warm Caramelized Tarte Tatin',
    category: 'desserts',
    price: 1650,
    description: 'Upside-down puff pastry tart of slow-caramelized Granny Smith apples bathed in butterscotch caramel, served with cold crème Chantilly.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
    tags: ['Warm Dessert', 'House Pastry'],
    isAvailable: true
  },

  // --- BEVERAGES ---
  {
    id: 'bev-1',
    name: 'Artisanal French Press Single Origin',
    category: 'beverages',
    price: 850,
    description: 'Freshly roasted Arabica beans brewed table-side in a classic French press with rich crema and notes of dark chocolate.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
    tags: ['Barista Craft'],
    isAvailable: true
  },
  {
    id: 'bev-2',
    name: 'Sparkling Elderflower & Mint Cooler',
    category: 'beverages',
    price: 950,
    description: 'Artisanal French elderflower cordial infused with crushed garden mint, fresh lime juice, and fine sparkling mineral water.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80',
    tags: ['Signature Mocktail', 'Refreshing'],
    isAvailable: true
  },
  {
    id: 'bev-3',
    name: 'Wild Berry & Hibiscus Botanique',
    category: 'beverages',
    price: 950,
    description: 'Steeped Egyptian hibiscus flowers blended with fresh crushed blackberries, tart pomegranate, and sparkling tonic water.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=80',
    tags: ['House Specialty', 'Chilled'],
    isAvailable: true
  },
  {
    id: 'bev-4',
    name: 'Fresh Mint Lime with Sparkling Soda',
    category: 'beverages',
    price: 550,
    description: 'Freshly squeezed Karachi farm limes, bruised wild garden mint, raw cane sugar syrup, and fizzy sparkling soda.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80',
    tags: ['Cooler', 'Chilled'],
    isAvailable: true
  }
];

function initMenuSystem() {
  const menuContainer = document.getElementById('menuItemsGrid');
  const tabButtons = document.querySelectorAll('.menu-tab-btn');

  if (!menuContainer) return;

  // Retrieve menu items from localStorage or seed defaults
  let menuData = [];
  const storedMenu = localStorage.getItem('coterotie_menu');
  if (storedMenu) {
    try {
      menuData = JSON.parse(storedMenu);
      // If stored menu is from old dummy schema, re-seed with authentic menu
      if (!menuData.some(item => item.id.startsWith('cold-'))) {
        menuData = DEFAULT_MENU_ITEMS;
        localStorage.setItem('coterotie_menu', JSON.stringify(DEFAULT_MENU_ITEMS));
      }
    } catch (e) {
      menuData = DEFAULT_MENU_ITEMS;
      localStorage.setItem('coterotie_menu', JSON.stringify(DEFAULT_MENU_ITEMS));
    }
  } else {
    menuData = DEFAULT_MENU_ITEMS;
    localStorage.setItem('coterotie_menu', JSON.stringify(DEFAULT_MENU_ITEMS));
  }

  // Active category state
  let currentCategory = 'cold';

  function renderCategory(category) {
    const filteredItems = menuData.filter(item => item.category === category);

    if (filteredItems.length === 0) {
      menuContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--charcoal-muted);">
          <i class="fa-solid fa-utensils" style="font-size: 2rem; margin-bottom: 12px; color: var(--pearl-grey);"></i>
          <p>No dishes currently listed in this category.</p>
        </div>
      `;
      return;
    }

    menuContainer.innerHTML = filteredItems.map(item => `
      <article class="menu-item-card" data-id="${item.id}">
        <img src="${item.image || 'assets/ambiance-table-menu.jpg'}" alt="${item.name}" class="menu-item-thumb" loading="lazy" onerror="this.src='assets/ambiance-table-menu.jpg'">
        <div class="menu-item-info">
          <div class="menu-item-header">
            <h3 class="menu-item-title">${item.name}</h3>
            <span class="menu-item-price">PKR ${Number(item.price).toLocaleString()}</span>
          </div>
          <p class="menu-item-description">${item.description}</p>
          <div class="menu-item-tags">
            ${(item.tags || []).map(tag => `<span class="diet-tag ${tag.toLowerCase().includes('special') || tag.toLowerCase().includes('signature') || tag.toLowerCase().includes('legendary') || tag.toLowerCase().includes('recommendation') ? 'special' : ''}">${tag}</span>`).join('')}
            ${!item.isAvailable ? '<span class="diet-tag sold-out">Sold Out Today</span>' : ''}
          </div>
        </div>
      </article>
    `).join('');
  }

  // Initial render
  renderCategory(currentCategory);

  // Tab click listeners
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      currentCategory = btn.getAttribute('data-category');
      renderCategory(currentCategory);
    });
  });

  // Listen for storage events (if admin changes items in another tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'coterotie_menu') {
      try {
        menuData = JSON.parse(e.newValue);
        renderCategory(currentCategory);
      } catch (err) {}
    }
  });
}

/* ==========================================================================
   4. Gallery Category Filters & Lightbox Modal
   ========================================================================== */
function initGalleryLightbox() {
  const filterBtns = document.querySelectorAll('.gallery-filter-buttons .filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const zoomBtns = document.querySelectorAll('.gallery-zoom-btn');
  
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCaption = document.getElementById('lightboxCaption');

  // Filter functionality
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filter === 'all' || itemCategory === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // Lightbox view for gallery zoom buttons
  zoomBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const imgUrl = btn.getAttribute('data-img');
      const title = btn.getAttribute('data-title');
      const caption = btn.getAttribute('data-caption');

      if (lightboxImg) lightboxImg.src = imgUrl;
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxCaption) lightboxCaption.textContent = caption;

      lightboxModal.classList.add('open');
      lightboxModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  // Lightbox view for official menu card buttons
  const menuCardBtns = document.querySelectorAll('.open-menu-card-btn');
  menuCardBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cardUrl = btn.getAttribute('data-menu-card');
      const title = btn.getAttribute('data-menu-title') || 'Official Menu Card';
      const caption = btn.getAttribute('data-menu-caption') || 'Côte Rôtie Karachi';

      if (lightboxImg) lightboxImg.src = cardUrl;
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxCaption) lightboxCaption.textContent = caption;

      lightboxModal.classList.add('open');
      lightboxModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('open');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('open')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   5. Reservation System & Client Validation
   ========================================================================== */
function initReservationSystem() {
  const form = document.getElementById('reservationForm');
  const dateInput = document.getElementById('resDate');
  const modal = document.getElementById('confirmationModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const summaryContainer = document.getElementById('reservationSummary');

  if (!form) return;

  // Set minimum date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Field references
    const name = document.getElementById('resName');
    const phone = document.getElementById('resPhone');
    const email = document.getElementById('resEmail');
    const guests = document.getElementById('resGuests');
    const date = document.getElementById('resDate');
    const time = document.getElementById('resTime');
    const seating = document.getElementById('resSeating');
    const notes = document.getElementById('resNotes');

    let isValid = true;

    // Validate Name
    if (!name.value.trim() || name.value.trim().length < 2) {
      setError('nameError', 'Please enter your full name.');
      name.classList.add('error');
      isValid = false;
    } else {
      clearError('nameError');
      name.classList.remove('error');
    }

    // Validate Phone (Pakistan 11 digit e.g. 03xx-xxxxxxx or general telephone)
    const phoneVal = phone.value.replace(/[\s\-\+]/g, '');
    if (!phoneVal || phoneVal.length < 9) {
      setError('phoneError', 'Please enter a valid contact phone number.');
      phone.classList.add('error');
      isValid = false;
    } else {
      clearError('phoneError');
      phone.classList.remove('error');
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      setError('emailError', 'Please enter a valid email address.');
      email.classList.add('error');
      isValid = false;
    } else {
      clearError('emailError');
      email.classList.remove('error');
    }

    // Validate Date
    if (!date.value) {
      setError('dateError', 'Please select a date.');
      date.classList.add('error');
      isValid = false;
    } else {
      clearError('dateError');
      date.classList.remove('error');
    }

    if (!isValid) return;

    // Generate unique confirmation code: #CR-2026-XXXX
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `CR-2026-${randomHex}`;

    // Build reservation object
    const newReservation = {
      id: 'res_' + Date.now(),
      code: bookingCode,
      name: name.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      guests: guests.value,
      date: date.value,
      time: time.value,
      seating: seating.value,
      notes: notes.value.trim() || 'None',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Store in localStorage for the Admin Panel
    let reservations = [];
    try {
      const stored = localStorage.getItem('coterotie_reservations');
      reservations = stored ? JSON.parse(stored) : [];
    } catch (err) {
      reservations = [];
    }
    reservations.unshift(newReservation);
    localStorage.setItem('coterotie_reservations', JSON.stringify(reservations));

    // Populate modal summary
    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="summary-row">
          <span class="summary-label">Booking Reference:</span>
          <span class="summary-value summary-code">${bookingCode}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Primary Guest:</span>
          <span class="summary-value">${newReservation.name}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Date &amp; Time:</span>
          <span class="summary-value">${newReservation.date} at ${newReservation.time}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Party Size:</span>
          <span class="summary-value">${newReservation.guests} ${newReservation.guests == 1 ? 'Guest' : 'Guests'}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Seating:</span>
          <span class="summary-value">${newReservation.seating}</span>
        </div>
      `;
    }

    // Open confirmation modal
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    // Reset Form
    form.reset();
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  });

  function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.textContent = message;
  }

  function clearError(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
}

/* ==========================================================================
   6. Contact & Inquiry Form
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const feedback = document.getElementById('contactFeedback');

  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const phone = document.getElementById('contactPhone');
    const subject = document.getElementById('contactSubject');
    const message = document.getElementById('contactMessage');

    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      if (feedback) {
        feedback.className = 'contact-form-feedback error';
        feedback.textContent = 'Please fill out all required fields.';
      }
      return;
    }

    const newMessage = {
      id: 'msg_' + Date.now(),
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone ? phone.value.trim() : '',
      subject: subject ? (subject.value.trim() || 'General Inquiry') : 'General Inquiry',
      message: message.value.trim(),
      date: new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    // Save to localStorage for Admin Panel
    let messages = [];
    try {
      const stored = localStorage.getItem('coterotie_messages');
      messages = stored ? JSON.parse(stored) : [];
    } catch (err) {
      messages = [];
    }
    messages.unshift(newMessage);
    localStorage.setItem('coterotie_messages', JSON.stringify(messages));

    if (feedback) {
      feedback.className = 'contact-form-feedback success';
      feedback.textContent = 'Thank you! Your message has been received and routed to our team.';
    }

    contactForm.reset();

    setTimeout(() => {
      if (feedback) feedback.textContent = '';
    }, 6000);
  });
}

/* ==========================================================================
   7. Footer Current Year
   ========================================================================== */
function initFooterYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
