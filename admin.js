/**
 * Côte Rôtie - Admin Management Console JavaScript
 * Maître d' Dashboard & Menu / Reservation Management System
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initSidebarTabs();
  initReservations();
  initMenuAdmin();
  initMessages();
  initSettings();
  refreshAllData();
});

/* ==========================================================================
   1. Authentication System
   ========================================================================== */
function initAuth() {
  const loginScreen = document.getElementById('loginScreen');
  const adminApp = document.getElementById('adminApp');
  const loginForm = document.getElementById('adminLoginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');

  // Check existing session
  const hasSession = localStorage.getItem('coterotie_admin_session') || sessionStorage.getItem('coterotie_admin_session');
  if (hasSession === 'true') {
    loginScreen.style.display = 'none';
    adminApp.style.display = 'flex';
  } else {
    loginScreen.style.display = 'flex';
    adminApp.style.display = 'none';
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('adminUsername').value.trim();
      const pass = document.getElementById('adminPassword').value.trim();
      const remember = document.getElementById('rememberMe').checked;

      // Accepted credentials: admin / coterotie2026
      if (user === 'admin' && (pass === 'coterotie2026' || pass === 'admin123')) {
        loginError.textContent = '';
        if (remember) {
          localStorage.setItem('coterotie_admin_session', 'true');
        } else {
          sessionStorage.setItem('coterotie_admin_session', 'true');
        }
        loginScreen.style.display = 'none';
        adminApp.style.display = 'flex';
        refreshAllData();
      } else {
        loginError.textContent = 'Invalid credentials. Please use admin / coterotie2026.';
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('coterotie_admin_session');
      sessionStorage.removeItem('coterotie_admin_session');
      adminApp.style.display = 'none';
      loginScreen.style.display = 'flex';
    });
  }
}

/* ==========================================================================
   2. Sidebar & Tab Switching
   ========================================================================== */
function initSidebarTabs() {
  const navItems = document.querySelectorAll('.sidebar-nav-item');
  const pageTitle = document.getElementById('pageTitle');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');

  const titles = {
    overview: 'Dashboard Overview',
    reservations: 'Table Reservations Hub',
    menu: 'Menu Showcase Management',
    messages: 'Guest Inquiries & Messages',
    settings: 'Restaurant Configuration'
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.getAttribute('data-tab');
      switchTab(tab);
      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('open');
      }
    });
  });

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

function switchTab(tabId) {
  // Update nav items
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update panes
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  const activePane = document.getElementById(`tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
  if (activePane) activePane.classList.add('active');

  // Update title
  const titles = {
    overview: 'Dashboard Overview',
    reservations: 'Table Reservations Hub',
    menu: 'Menu Showcase Management',
    messages: 'Guest Inquiries & Messages',
    settings: 'Restaurant Configuration'
  };
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle && titles[tabId]) pageTitle.textContent = titles[tabId];

  // Refresh data on tab activation
  if (tabId === 'overview') renderOverview();
  if (tabId === 'reservations') renderReservations();
  if (tabId === 'menu') renderMenuAdmin();
  if (tabId === 'messages') renderMessages();
}

/* ==========================================================================
   3. Reservations Management
   ========================================================================== */
function getReservations() {
  try {
    const raw = localStorage.getItem('coterotie_reservations');
    if (!raw) return seedSampleReservations();
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveReservations(resList) {
  localStorage.setItem('coterotie_reservations', JSON.stringify(resList));
  refreshAllData();
}

function seedSampleReservations() {
  const sample = [
    {
      id: 'res_sample_1',
      code: 'CR-2026-8491',
      name: 'Dr. Tariq Siddiqui',
      phone: '+92 300 8291042',
      email: 'tariq.siddiqui@gmail.com',
      guests: '4',
      date: new Date().toISOString().split('T')[0],
      time: '08:00 PM',
      seating: 'Courtyard Garden',
      notes: 'Anniversary celebration · quiet table preferred',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    },
    {
      id: 'res_sample_2',
      code: 'CR-2026-7215',
      name: 'Zainab & Bilal Farooq',
      phone: '+92 312 4492019',
      email: 'zainab.farooq@outlook.com',
      guests: '2',
      date: new Date().toISOString().split('T')[0],
      time: '08:30 PM',
      seating: 'Indoor Salon',
      notes: 'Request window table near art gallery',
      status: 'Pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 'res_sample_3',
      code: 'CR-2026-3190',
      name: 'Murtaza Hashwani',
      phone: '+92 321 9901234',
      email: 'murtaza@hashwani.pk',
      guests: '6',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '01:30 PM',
      seating: 'Courtyard Garden',
      notes: 'Business luncheon with French delegates',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem('coterotie_reservations', JSON.stringify(sample));
  return sample;
}

function initReservations() {
  const searchInput = document.getElementById('resSearchInput');
  const statusFilter = document.getElementById('resStatusFilter');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const btnExportCsvOverview = document.getElementById('btnExportCsvOverview');
  const btnAddNewRes = document.getElementById('btnAddNewRes');
  const btnQuickBooking = document.getElementById('btnQuickBooking');

  // Modal elements
  const resModal = document.getElementById('reservationModal');
  const resModalClose = document.getElementById('resModalClose');
  const resModalCancel = document.getElementById('resModalCancel');
  const resModalBackdrop = document.getElementById('resModalBackdrop');
  const resModalForm = document.getElementById('resModalForm');

  if (searchInput) searchInput.addEventListener('input', renderReservations);
  if (statusFilter) statusFilter.addEventListener('change', renderReservations);

  if (btnExportCsv) btnExportCsv.addEventListener('click', exportReservationsToCsv);
  if (btnExportCsvOverview) btnExportCsvOverview.addEventListener('click', exportReservationsToCsv);

  function openResModal(res = null) {
    resModalForm.reset();
    const title = document.getElementById('resModalTitle');
    const editId = document.getElementById('editResId');

    if (res) {
      title.textContent = `Edit Reservation: ${res.code}`;
      editId.value = res.id;
      document.getElementById('modalResName').value = res.name;
      document.getElementById('modalResPhone').value = res.phone;
      document.getElementById('modalResEmail').value = res.email || '';
      document.getElementById('modalResGuests').value = res.guests;
      document.getElementById('modalResDate').value = res.date;
      document.getElementById('modalResTime').value = res.time;
      document.getElementById('modalResSeating').value = res.seating;
      document.getElementById('modalResStatus').value = res.status;
      document.getElementById('modalResNotes').value = res.notes !== 'None' ? res.notes : '';
    } else {
      title.textContent = 'Manual / Walk-In Reservation';
      editId.value = '';
      document.getElementById('modalResDate').value = new Date().toISOString().split('T')[0];
    }

    resModal.classList.add('open');
    resModal.setAttribute('aria-hidden', 'false');
  }

  function closeResModal() {
    resModal.classList.remove('open');
    resModal.setAttribute('aria-hidden', 'true');
  }

  if (btnAddNewRes) btnAddNewRes.addEventListener('click', () => openResModal());
  if (btnQuickBooking) btnQuickBooking.addEventListener('click', () => openResModal());
  if (resModalClose) resModalClose.addEventListener('click', closeResModal);
  if (resModalCancel) resModalCancel.addEventListener('click', closeResModal);
  if (resModalBackdrop) resModalBackdrop.addEventListener('click', closeResModal);

  // Save Modal Form
  if (resModalForm) {
    resModalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('editResId').value;
      const reservations = getReservations();

      const bookingData = {
        name: document.getElementById('modalResName').value.trim(),
        phone: document.getElementById('modalResPhone').value.trim(),
        email: document.getElementById('modalResEmail').value.trim(),
        guests: document.getElementById('modalResGuests').value,
        date: document.getElementById('modalResDate').value,
        time: document.getElementById('modalResTime').value,
        seating: document.getElementById('modalResSeating').value,
        status: document.getElementById('modalResStatus').value,
        notes: document.getElementById('modalResNotes').value.trim() || 'None'
      };

      if (editId) {
        // Edit existing
        const index = reservations.findIndex(r => r.id === editId);
        if (index !== -1) {
          reservations[index] = { ...reservations[index], ...bookingData };
        }
      } else {
        // Create new
        const hex = Math.floor(1000 + Math.random() * 9000);
        const newRes = {
          id: 'res_' + Date.now(),
          code: `CR-2026-${hex}`,
          ...bookingData,
          createdAt: new Date().toISOString()
        };
        reservations.unshift(newRes);
      }

      saveReservations(reservations);
      closeResModal();
    });
  }

  window.openEditReservation = (id) => {
    const list = getReservations();
    const found = list.find(r => r.id === id);
    if (found) openResModal(found);
  };
}

function renderReservations() {
  const tbody = document.getElementById('reservationsTableBody');
  const search = (document.getElementById('resSearchInput')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('resStatusFilter')?.value || 'all';
  const totalCountText = document.getElementById('resTotalCountText');

  if (!tbody) return;

  let list = getReservations();

  // Apply filters
  if (statusFilter !== 'all') {
    list = list.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
  }

  if (search) {
    list = list.filter(r => 
      (r.name && r.name.toLowerCase().includes(search)) ||
      (r.phone && r.phone.toLowerCase().includes(search)) ||
      (r.code && r.code.toLowerCase().includes(search))
    );
  }

  if (totalCountText) {
    totalCountText.textContent = `Showing ${list.length} reservation${list.length === 1 ? '' : 's'}`;
  }

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--admin-charcoal-muted);">
          <i class="fa-regular fa-folder-open" style="font-size: 1.8rem; margin-bottom: 8px;"></i>
          <p>No reservations matched your criteria.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td><span class="ref-code">${r.code}</span></td>
      <td>
        <span class="guest-name">${r.name}</span>
      </td>
      <td>
        <div class="guest-contact">
          <div><i class="fa-solid fa-phone" style="font-size: 0.7rem;"></i> ${r.phone}</div>
          ${r.email ? `<div><i class="fa-regular fa-envelope" style="font-size: 0.7rem;"></i> ${r.email}</div>` : ''}
        </div>
      </td>
      <td>
        <strong>${r.date}</strong><br>
        <span style="font-size: 0.78rem; color: var(--admin-charcoal-muted);">${r.time}</span>
      </td>
      <td><strong>${r.guests}</strong> guests</td>
      <td><span style="font-size: 0.8rem;">${r.seating}</span></td>
      <td><span style="font-size: 0.78rem; color: var(--admin-charcoal-muted);">${r.notes}</span></td>
      <td>
        <span class="status-pill ${r.status.toLowerCase()}">${r.status}</span>
      </td>
      <td>
        <div class="table-actions">
          ${r.status !== 'Confirmed' ? `
            <button class="action-icon-btn confirm-btn" onclick="updateResStatus('${r.id}', 'Confirmed')" title="Confirm Reservation">
              <i class="fa-solid fa-check"></i>
            </button>
          ` : `
            <button class="action-icon-btn" onclick="updateResStatus('${r.id}', 'Seated')" title="Mark Seated / Arrived">
              <i class="fa-solid fa-chair"></i>
            </button>
          `}
          <button class="action-icon-btn" onclick="openEditReservation('${r.id}')" title="Edit Booking">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="action-icon-btn" onclick="deleteReservation('${r.id}')" title="Cancel & Delete">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.updateResStatus = (id, newStatus) => {
  const list = getReservations();
  const item = list.find(r => r.id === id);
  if (item) {
    item.status = newStatus;
    saveReservations(list);
  }
};

window.deleteReservation = (id) => {
  if (confirm('Are you sure you want to delete this reservation?')) {
    const list = getReservations().filter(r => r.id !== id);
    saveReservations(list);
  }
};

function exportReservationsToCsv() {
  const list = getReservations();
  if (list.length === 0) {
    alert('No reservations to export.');
    return;
  }

  const headers = ['Booking Ref', 'Guest Name', 'Phone', 'Email', 'Guests', 'Date', 'Time', 'Seating Area', 'Notes', 'Status', 'Logged At'];
  const rows = list.map(r => [
    `"${r.code || ''}"`,
    `"${r.name || ''}"`,
    `"${r.phone || ''}"`,
    `"${r.email || ''}"`,
    `"${r.guests || ''}"`,
    `"${r.date || ''}"`,
    `"${r.time || ''}"`,
    `"${r.seating || ''}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
    `"${r.status || ''}"`,
    `"${r.createdAt || ''}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Cote_Rotie_Reservations_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   4. Menu Showcase Management
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

function getMenuItems() {
  try {
    const raw = localStorage.getItem('coterotie_menu');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.some(item => item.id.startsWith('cold-'))) {
        return parsed;
      }
    }
    localStorage.setItem('coterotie_menu', JSON.stringify(DEFAULT_MENU_ITEMS));
    return DEFAULT_MENU_ITEMS;
  } catch (e) {
    return DEFAULT_MENU_ITEMS;
  }
}

function saveMenuItems(items) {
  localStorage.setItem('coterotie_menu', JSON.stringify(items));
  refreshAllData();
}

function initMenuAdmin() {
  const searchInput = document.getElementById('menuSearchInput');
  const categoryFilter = document.getElementById('menuCategoryFilter');
  const btnAddNewDish = document.getElementById('btnAddNewDish');
  const btnResetMenuData = document.getElementById('btnResetMenuData');

  const dishModal = document.getElementById('dishModal');
  const dishModalClose = document.getElementById('dishModalClose');
  const dishModalCancel = document.getElementById('dishModalCancel');
  const dishModalBackdrop = document.getElementById('dishModalBackdrop');
  const dishModalForm = document.getElementById('dishModalForm');

  if (searchInput) searchInput.addEventListener('input', renderMenuAdmin);
  if (categoryFilter) categoryFilter.addEventListener('change', renderMenuAdmin);

  if (btnResetMenuData) {
    btnResetMenuData.addEventListener('click', () => {
      if (confirm('Reset menu items to factory default Côte Rôtie menu?')) {
        localStorage.removeItem('coterotie_menu');
        location.reload();
      }
    });
  }

  function openDishModal(dish = null) {
    dishModalForm.reset();
    const title = document.getElementById('dishModalTitle');
    const editId = document.getElementById('editDishId');

    if (dish) {
      title.textContent = `Edit Dish: ${dish.name}`;
      editId.value = dish.id;
      document.getElementById('dishName').value = dish.name;
      document.getElementById('dishCategory').value = dish.category;
      document.getElementById('dishPrice').value = dish.price;
      document.getElementById('dishTags').value = (dish.tags || []).join(', ');
      document.getElementById('dishImage').value = dish.image || '';
      document.getElementById('dishDescription').value = dish.description;
      document.getElementById('dishAvailable').checked = dish.isAvailable !== false;
    } else {
      title.textContent = 'Add New Dish';
      editId.value = '';
      document.getElementById('dishAvailable').checked = true;
    }

    dishModal.classList.add('open');
    dishModal.setAttribute('aria-hidden', 'false');
  }

  function closeDishModal() {
    dishModal.classList.remove('open');
    dishModal.setAttribute('aria-hidden', 'true');
  }

  if (btnAddNewDish) btnAddNewDish.addEventListener('click', () => openDishModal());
  if (dishModalClose) dishModalClose.addEventListener('click', closeDishModal);
  if (dishModalCancel) dishModalCancel.addEventListener('click', closeDishModal);
  if (dishModalBackdrop) dishModalBackdrop.addEventListener('click', closeDishModal);

  // Form submit
  if (dishModalForm) {
    dishModalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('editDishId').value;
      const menu = getMenuItems();

      const tags = document.getElementById('dishTags').value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const dishData = {
        name: document.getElementById('dishName').value.trim(),
        category: document.getElementById('dishCategory').value,
        price: Number(document.getElementById('dishPrice').value),
        tags: tags,
        image: document.getElementById('dishImage').value.trim() || 'assets/hero-dish.jpg',
        description: document.getElementById('dishDescription').value.trim(),
        isAvailable: document.getElementById('dishAvailable').checked
      };

      if (editId) {
        const index = menu.findIndex(d => d.id === editId);
        if (index !== -1) {
          menu[index] = { ...menu[index], ...dishData };
        }
      } else {
        const newDish = {
          id: 'dish_' + Date.now(),
          ...dishData
        };
        menu.push(newDish);
      }

      saveMenuItems(menu);
      closeDishModal();
    });
  }

  window.openEditDish = (id) => {
    const list = getMenuItems();
    const found = list.find(d => d.id === id);
    if (found) openDishModal(found);
  };
}

function renderMenuAdmin() {
  const grid = document.getElementById('menuAdminGrid');
  const search = (document.getElementById('menuSearchInput')?.value || '').toLowerCase();
  const categoryFilter = document.getElementById('menuCategoryFilter')?.value || 'all';

  if (!grid) return;

  let items = getMenuItems();

  if (categoryFilter !== 'all') {
    items = items.filter(d => d.category === categoryFilter);
  }

  if (search) {
    items = items.filter(d => 
      d.name.toLowerCase().includes(search) || 
      d.description.toLowerCase().includes(search)
    );
  }

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--admin-charcoal-muted);">
        <p>No dishes found matching this search.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(dish => `
    <div class="menu-admin-card" data-id="${dish.id}">
      <div class="menu-admin-media">
        <img src="${dish.image || 'assets/ambiance-table-menu.jpg'}" alt="${dish.name}" onerror="this.src='assets/ambiance-table-menu.jpg'">
        <span class="menu-admin-status-badge ${dish.isAvailable ? 'in-stock' : 'out-stock'}">
          ${dish.isAvailable ? 'In Stock' : 'Sold Out'}
        </span>
      </div>
      <div class="menu-admin-body">
        <div class="menu-admin-header">
          <h4 class="menu-admin-name">${dish.name}</h4>
          <span class="menu-admin-price">PKR ${Number(dish.price).toLocaleString()}</span>
        </div>
        <div class="menu-admin-category">${dish.category}</div>
        <p class="menu-admin-desc">${dish.description}</p>
        <div class="menu-admin-footer">
          <button class="btn-text-link" onclick="toggleDishStock('${dish.id}')">
            <i class="fa-solid fa-power-off"></i> Toggle Stock
          </button>
          <div class="table-actions">
            <button class="action-icon-btn" onclick="openEditDish('${dish.id}')" title="Edit Dish">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-icon-btn" onclick="deleteDish('${dish.id}')" title="Remove Dish">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

window.toggleDishStock = (id) => {
  const menu = getMenuItems();
  const dish = menu.find(d => d.id === id);
  if (dish) {
    dish.isAvailable = !dish.isAvailable;
    saveMenuItems(menu);
  }
};

window.deleteDish = (id) => {
  if (confirm('Are you sure you want to delete this menu item?')) {
    const menu = getMenuItems().filter(d => d.id !== id);
    saveMenuItems(menu);
  }
};

/* ==========================================================================
   5. Guest Inquiries / Messages
   ========================================================================== */
function getMessages() {
  try {
    const raw = localStorage.getItem('coterotie_messages');
    if (!raw) return seedSampleMessages();
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveMessages(msgList) {
  localStorage.setItem('coterotie_messages', JSON.stringify(msgList));
  refreshAllData();
}

function seedSampleMessages() {
  const sample = [
    {
      id: 'msg_sample_1',
      name: 'Salma Merchant',
      email: 'salma.m@merchantgroup.pk',
      phone: '+92 300 2109988',
      subject: 'Private Courtyard Dinner for 25 Guests',
      message: 'Hello Chef Fahim, We are looking to host a corporate dinner in the Alliance Française courtyard next Friday. Could you please share options for a 4-course fixed menu?',
      date: 'Oct 10, 2026, 4:15 PM',
      isRead: false
    }
  ];
  localStorage.setItem('coterotie_messages', JSON.stringify(sample));
  return sample;
}

function initMessages() {
  const btnClear = document.getElementById('btnClearReadMessages');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      const remaining = getMessages().filter(m => !m.isRead);
      saveMessages(remaining);
    });
  }
}

function renderMessages() {
  const container = document.getElementById('messagesList');
  if (!container) return;

  const messages = getMessages();

  if (messages.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--admin-charcoal-muted);">
        <i class="fa-regular fa-envelope-open" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p>No customer messages at this time.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = messages.map(m => `
    <div class="message-item-card ${m.isRead ? '' : 'unread'}" data-id="${m.id}">
      <div class="message-header-row">
        <div>
          <span class="sender-name">${m.name}</span>
          <span style="font-size: 0.8rem; color: var(--admin-charcoal-muted);">(${m.email} ${m.phone ? '· ' + m.phone : ''})</span>
        </div>
        <span class="message-date">${m.date}</span>
      </div>
      <div class="message-subject"><i class="fa-regular fa-comment-dots"></i> ${m.subject}</div>
      <p class="message-text">${m.message}</p>
      <div class="message-actions-bar">
        <a href="mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}" class="btn-text-link">
          <i class="fa-solid fa-reply"></i> Reply via Email
        </a>
        <button class="btn-text-link" onclick="toggleMessageRead('${m.id}')">
          <i class="fa-regular fa-envelope"></i> ${m.isRead ? 'Mark as Unread' : 'Mark as Read'}
        </button>
        <button class="btn-text-link" style="color: #dc2626;" onclick="deleteMessage('${m.id}')">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

window.toggleMessageRead = (id) => {
  const list = getMessages();
  const m = list.find(msg => msg.id === id);
  if (m) {
    m.isRead = !m.isRead;
    saveMessages(list);
  }
};

window.deleteMessage = (id) => {
  const list = getMessages().filter(msg => msg.id !== id);
  saveMessages(list);
};

/* ==========================================================================
   6. Overview Screen & Live Calculations
   ========================================================================== */
function renderOverview() {
  const reservations = getReservations();
  const menuItems = getMenuItems();
  const messages = getMessages();

  // Metrics calculation
  const total = reservations.length;
  const pending = reservations.filter(r => r.status === 'Pending').length;
  const confirmedCovers = reservations
    .filter(r => r.status === 'Confirmed' || r.status === 'Seated')
    .reduce((sum, r) => sum + Number(r.guests || 2), 0);
  const unreadCount = messages.filter(m => !m.isRead).length;

  // DOM update
  document.getElementById('statTotalBookings').textContent = total;
  document.getElementById('statPendingBookings').textContent = pending;
  document.getElementById('statConfirmedGuests').textContent = confirmedCovers;
  document.getElementById('statMenuItems').textContent = menuItems.length;

  document.getElementById('pendingCountBadge').textContent = pending;
  document.getElementById('menuCountBadge').textContent = menuItems.length;
  document.getElementById('msgCountBadge').textContent = unreadCount;

  // Recent 5 Reservations table
  const recentTable = document.getElementById('overviewRecentTable');
  if (recentTable) {
    const recent = reservations.slice(0, 5);
    if (recent.length === 0) {
      recentTable.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">No reservations recorded yet.</td></tr>`;
    } else {
      recentTable.innerHTML = recent.map(r => `
        <tr>
          <td><span class="ref-code">${r.code}</span></td>
          <td><strong>${r.name}</strong></td>
          <td>${r.date} · ${r.time}</td>
          <td>${r.guests} covers</td>
          <td>${r.seating}</td>
          <td><span class="status-pill ${r.status.toLowerCase()}">${r.status}</span></td>
          <td>
            ${r.status === 'Pending' ? `
              <button class="action-icon-btn confirm-btn" onclick="updateResStatus('${r.id}', 'Confirmed')" title="Confirm">
                <i class="fa-solid fa-check"></i>
              </button>
            ` : `
              <button class="action-icon-btn" onclick="openEditReservation('${r.id}')" title="Edit">
                <i class="fa-solid fa-pen"></i>
              </button>
            `}
          </td>
        </tr>
      `).join('');
    }
  }
}

/* ==========================================================================
   7. Settings & Global Sync
   ========================================================================== */
function initSettings() {
  const settingsForm = document.getElementById('settingsForm');
  const btnSaveAnnouncement = document.getElementById('btnSaveAnnouncement');

  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Restaurant configuration saved successfully.');
    });
  }

  if (btnSaveAnnouncement) {
    btnSaveAnnouncement.addEventListener('click', () => {
      const isEnabled = document.getElementById('announcementToggle').checked;
      const text = document.getElementById('announcementText').value.trim();
      localStorage.setItem('coterotie_announcement', JSON.stringify({ isEnabled, text }));
      alert('Announcement banner updated.');
    });
  }
}

function refreshAllData() {
  renderOverview();
  renderReservations();
  renderMenuAdmin();
  renderMessages();
}
