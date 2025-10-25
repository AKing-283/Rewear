// Dark Mode Toggle Functionality
function initializeTheme() {
  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Update toggle button text
  updateThemeToggleText(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeToggleText(newTheme);
}

function updateThemeToggleText(theme) {
  const toggleButtons = [
    document.getElementById('theme-toggle'),
    document.getElementById('theme-toggle-user')
  ];
  
  toggleButtons.forEach(button => {
    if (button) {
      button.innerHTML = theme === 'light' 
        ? '<i class="fas fa-moon"></i> Dark' 
        : '<i class="fas fa-sun"></i> Light';
    }
  });
}

function setupEventListeners() {
  // Theme toggle setup for both buttons
  const themeToggleButtons = [
    document.getElementById('theme-toggle'),
    document.getElementById('theme-toggle-user')
  ];
  
  themeToggleButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', toggleTheme);
    }
  });
  
  // Stub function to prevent errors
  // Add event listeners here if needed in future
}

// Global state
let currentUser = null;
let currentPage = "landing";
let allItems = [];
let categories = [];

// API Base URL
const API_BASE = "/api";

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  initializeTheme();
  checkAuth();
  loadCategories();
  loadFeaturedItems();
  setupEventListeners();
  // Avatar upload event
  const avatarForm = document.getElementById("avatar-upload-form");
  if (avatarForm) {
    avatarForm.addEventListener("submit", handleAvatarUpload);
  }
  // Profile avatar upload event
  const profileAvatarForm = document.getElementById(
    "profile-avatar-upload-form"
  );
  if (profileAvatarForm) {
    profileAvatarForm.addEventListener("submit", handleProfileAvatarUpload);
  }
  // Notifications bell event
  const notificationsBell = document.getElementById("notifications-bell");
  if (notificationsBell) {
    notificationsBell.addEventListener("click", openNotificationsModal);
  }
  // Call scroll-to-top setup here
  setupScrollToTop();

  // Hamburger menu toggle for mobile
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('open');
  });

  // Optional: Close menu when a link is clicked (for better UX)
  document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
              navMenu.classList.remove('open');
          }
      });
  });
});


// Image upload function
async function handleImageUpload() {
  const fileInput = document.getElementById("item-image");
  const file = fileInput.files[0];

  if (!file) {
    showToast("Please select an image file.", "error");
    return;
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    showToast("Please select a valid image file (JPEG, PNG, or GIF).", "error");
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast("Image file size must be less than 5MB.", "error");
    return;
  }

  showLoading();

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${API_BASE}/upload-image`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      // Store the uploaded image URL
      window.uploadedImageUrl = data.url;

      // Show preview
      const previewDiv = document.getElementById("uploaded-image-preview");
      previewDiv.innerHTML = `
                <div style="margin-top: 10px;">
                    <img src="${data.url}" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #007aff;" />
                    <p style="margin-top: 5px; color: #007aff; font-size: 0.9rem;">✓ Image uploaded successfully!</p>
                </div>
            `;

      showToast("Image uploaded successfully!", "success");
    } else {
      showToast(data.error || "Upload failed", "error");
    }
  } catch (error) {
    console.error("Upload error:", error);
    showToast("Upload failed. Please try again.", "error");
  } finally {
    hideLoading();
  }
}

// Authentication functions
async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE}/auth/check-auth`, {
      credentials: "include",
    });
    const data = await response.json();

    if (data.authenticated) {
      const userResponse = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });
      const userData = await userResponse.json();

      if (userData.user) {
        currentUser = userData.user;
        updateAuthUI();
      }
    }
  } catch (error) {
    console.error("Auth check failed:", error);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  showLoading();

  const formData = new FormData(e.target);
  const loginData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.user;
      updateAuthUI();
      showToast("Login successful!", "success");
      showPage("dashboard");
      e.target.reset();
    } else {
      showToast(data.error || "Login failed", "error");
    }
  } catch (error) {
    showToast("Login failed. Please try again.", "error");
  } finally {
    hideLoading();
  }
}

async function handleSignup(e) {
  e.preventDefault();
  showLoading();

  const formData = new FormData(e.target);
  const signupData = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(signupData),
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.user;
      updateAuthUI();
      showToast("Account created successfully!", "success");
      showPage("dashboard");
      e.target.reset();
    } else {
      showToast(data.error || "Signup failed", "error");
    }
  } catch (error) {
    showToast("Signup failed. Please try again.", "error");
  } finally {
    hideLoading();
  }
}

async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    currentUser = null;
    updateAuthUI();
    showToast("Logged out successfully", "success");
    showPage("landing");
  } catch (error) {
    showToast("Logout failed", "error");
  }
}

function updateAuthUI() {
  const authButtons = document.getElementById("auth-buttons");
  const userMenu = document.getElementById("user-menu");
  const addItemLink = document.getElementById("add-item-link");
  const dashboardLink = document.getElementById("dashboard-link");
  const adminLink = document.getElementById("admin-link");
  const profileLink = document.getElementById("profile-link");
  const notificationsBell = document.getElementById("notifications-bell");

  if (currentUser) {
    authButtons.style.display = "none";
    userMenu.style.display = "flex";
    addItemLink.style.display = "block";
    dashboardLink.style.display = "block";
    profileLink.style.display = "block";
    notificationsBell.style.display = "inline-block";
    document.getElementById("username-display").textContent =
      currentUser.username;
    document.getElementById(
      "user-points"
    ).textContent = `${currentUser.points} pts`;
    if (currentUser.is_admin) {
      adminLink.style.display = "block";
    }
    fetchAndShowNotificationsBadge();
  } else {
    authButtons.style.display = "flex";
    userMenu.style.display = "none";
    addItemLink.style.display = "none";
    dashboardLink.style.display = "none";
    profileLink.style.display = "none";
    notificationsBell.style.display = "none";
    adminLink.style.display = "none";
  }
}

// Profile page logic
function showProfilePage() {
  if (!currentUser) return;
  // Set avatar
  const avatarImg = document.getElementById("profile-avatar");
  if (avatarImg && currentUser.avatar) {
    avatarImg.src = `/${currentUser.avatar}`;
  } else if (avatarImg) {
    avatarImg.src = "";
  }
  // Set username and email
  document.getElementById("profile-username").textContent =
    currentUser.username;
  document.getElementById("profile-email").textContent = currentUser.email;
}

// Page navigation
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  // Show selected page
  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.add("active");
    currentPage = pageName;

    // Load page-specific data
    switch (pageName) {
      case "browse":
        loadItems();
        break;
      case "dashboard":
        if (currentUser) {
          loadDashboardData();
        }
        break;
      case "admin":
        if (currentUser && currentUser.is_admin) {
          loadAdminData();
        }
        break;
      case "profile":
        if (currentUser) {
          showProfilePage();
        }
        break;
    }
  }
}

// Items functions
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    const data = await response.json();
    categories = data;

    // Populate category filters
    const categoryFilter = document.getElementById("category-filter");
    const itemCategory = document.getElementById("item-category");

    categories.forEach((category) => {
      const option1 = new Option(category, category);
      const option2 = new Option(category, category);
      categoryFilter.appendChild(option1);
      itemCategory.appendChild(option2);
    });
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
}

async function loadFeaturedItems() {
  try {
    const response = await fetch(`${API_BASE}/featured`);
    const data = await response.json();

    const carousel = document.getElementById("featured-carousel");
    carousel.innerHTML = "";

    data.forEach((item) => {
      const itemCard = createItemCard(item);
      carousel.appendChild(itemCard);
    });
  } catch (error) {
    console.error("Failed to load featured items:", error);
  }
}

async function loadItems(search = "", category = "") {
  try {
    showLoading();
    let url = `${API_BASE}/items?approved_only=true`;

    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;

    const response = await fetch(url);
    const data = await response.json();
    allItems = data;

    displayItems(data);
  } catch (error) {
    console.error("Failed to load items:", error);
    showToast("Failed to load items", "error");
  } finally {
    hideLoading();
  }
}

function displayItems(items) {
  const grid = document.getElementById("items-grid");
  grid.innerHTML = "";

  if (items.length === 0) {
    grid.innerHTML =
      '<p style="text-align: center; color: #6e6e73; grid-column: 1 / -1;">No items found</p>';
    return;
  }

  items.forEach((item) => {
    const itemCard = createItemCard(item, true);
    grid.appendChild(itemCard);
  });
}

function createItemCard(item, showActions = false) {
  const card = document.createElement("div");
  card.className = "item-card";
  card.onclick = () => showItemDetail(item.id);

  // Parse images from JSON string or use empty array
  let images = [];
  try {
    if (item.images) {
      images =
        typeof item.images === "string" ? JSON.parse(item.images) : item.images;
    }
  } catch (e) {
    console.error("Error parsing images:", e);
  }

  const imageUrl = images && images.length > 0 ? images[0] : null;

  card.innerHTML = `
        <div class="item-image">
            ${
              imageUrl
                ? `<img src="${imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`
                : "👕"
            }
        </div>
        <div class="item-content">
            <h3 class="item-title">${item.title}</h3>
            <div class="item-details">
                <span class="item-category">${item.category}</span>
                <span class="item-points">${item.points_value} pts</span>
            </div>
            <p class="item-condition">Condition: ${item.condition}</p>
            ${
              showActions && currentUser && item.owner_id !== currentUser.id
                ? `
                <div class="item-actions">
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); openSwapModal(${item.id}, 'points')">
                        Redeem (${item.points_value} pts)
                    </button>
                    <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); openSwapModal(${item.id}, 'direct')">
                        Swap
                    </button>
                </div>
            `
                : ""
            }
        </div>
    `;

  return card;
}

async function showItemDetail(itemId) {
  try {
    showLoading();
    const response = await fetch(`${API_BASE}/items/${itemId}`);
    const item = await response.json();

    // Parse images from JSON string or use empty array
    let images = [];
    try {
      if (item.images) {
        images =
          typeof item.images === "string"
            ? JSON.parse(item.images)
            : item.images;
      }
    } catch (e) {
      console.error("Error parsing images:", e);
    }

    const imageUrl = images && images.length > 0 ? images[0] : null;

    const content = document.getElementById("item-detail-content");
    content.innerHTML = `
            <div class="item-detail-header">
                <div class="item-detail-image">
                    ${
                      imageUrl
                        ? `<img src="${imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`
                        : "👕"
                    }
                </div>
                <div class="item-detail-info">
                    <h1>${item.title}</h1>
                    <div class="item-detail-meta">
                        <div class="meta-item">
                            <div class="meta-label">Category</div>
                            <div class="meta-value">${item.category}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Size</div>
                            <div class="meta-value">${item.size}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Condition</div>
                            <div class="meta-value">${item.condition}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Points Value</div>
                            <div class="meta-value">${
                              item.points_value
                            } pts</div>
                        </div>
                    </div>
                    ${
                      currentUser &&
                      item.owner_id !== currentUser.id &&
                      item.is_available
                        ? `
                        <div class="item-detail-actions">
                            <button class="btn btn-primary" onclick="openSwapModal(${item.id}, 'points')">
                                Redeem for ${item.points_value} Points
                            </button>
                            <button class="btn btn-outline" onclick="openSwapModal(${item.id}, 'direct')">
                                Request Swap
                            </button>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
            <div class="item-detail-body">
                <div class="item-description">
                    <h3>Description</h3>
                    <p>${item.description}</p>
                </div>
                ${
                  item.tags && item.tags.length > 0
                    ? `
                    <div class="item-tags">
                        ${item.tags
                          .map((tag) => `<span class="tag">${tag}</span>`)
                          .join("")}
                    </div>
                `
                    : ""
                }
            </div>
        `;

    showPage("item-detail");
  } catch (error) {
    console.error("Failed to load item details:", error);
    showToast("Failed to load item details", "error");
  } finally {
    hideLoading();
  }
}

async function handleAddItem(e) {
  e.preventDefault();

  if (!currentUser) {
    showToast("Please login to add items", "error");
    return;
  }

  showLoading();

  const formData = new FormData(e.target);
  const fileInput = document.getElementById("item-image");
  const file = fileInput.files[0];
  let imageUrl = null;

  // If an image is selected, upload it first
  if (file) {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      showToast(
        "Please select a valid image file (JPEG, PNG, or GIF).",
        "error"
      );
      hideLoading();
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image file size must be less than 5MB.", "error");
      hideLoading();
      return;
    }
    const imgFormData = new FormData();
    imgFormData.append("image", file);
    try {
      const response = await fetch(`${API_BASE}/upload-image`, {
        method: "POST",
        body: imgFormData,
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.url) {
        imageUrl = data.url;
      } else {
        showToast(data.error || "Image upload failed", "error");
        hideLoading();
        return;
      }
    } catch (error) {
      showToast("Image upload failed. Please try again.", "error");
      hideLoading();
      return;
    }
  }

  const itemData = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    item_type: formData.get("item_type"),
    size: formData.get("size"),
    condition: formData.get("condition"),
    tags: formData.get("tags"),
    points_value: parseInt(formData.get("points_value")),
    images: imageUrl ? [imageUrl] : [],
  };

  try {
    const response = await fetch(`${API_BASE}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(itemData),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Item added successfully! Awaiting admin approval.", "success");
      e.target.reset();
      document.getElementById("uploaded-image-preview").innerHTML = "";
      showPage("dashboard");
    } else {
      showToast(data.error || "Failed to add item", "error");
    }
  } catch (error) {
    showToast("Failed to add item. Please try again.", "error");
  } finally {
    hideLoading();
  }
}

// Search and filter functions
function handleSearch(e) {
  const searchTerm = e.target.value;
  const category = document.getElementById("category-filter").value;
  loadItems(searchTerm, category);
}

function handleCategoryFilter(e) {
  const category = e.target.value;
  const search = document.getElementById("search-input").value;
  loadItems(search, category);
}

// Dashboard functions
async function loadDashboardData() {
  if (!currentUser) return;
  setUserAvatar();
  try {
    // Load user's items
    const itemsResponse = await fetch(`${API_BASE}/my-items`, {
      credentials: "include",
    });
    const items = await itemsResponse.json();

    // Load user's swaps
    const swapsResponse = await fetch(`${API_BASE}/my-swaps`, {
      credentials: "include",
    });
    const swaps = await swapsResponse.json();

    // Count only accepted swaps where the user is requester or owner
    const completedSwaps = [
      ...(swaps.sent_swaps || []),
      ...(swaps.received_swaps || []),
    ].filter((swap) => swap.status === "accepted").length;

    // Update stats
    document.getElementById("user-points-display").textContent =
      currentUser.points;
    document.getElementById("user-items-count").textContent = items.length;
    document.getElementById("user-swaps-count").textContent = completedSwaps;

    // Display items
    displayMyItems(items);
    displayMySwaps(swaps);

    // Load sustainability impact, but use completedSwaps for Items Swapped
    const impactRes = await fetch("/api/sustainability-impact", {
      credentials: "include",
    });
    if (impactRes.ok) {
      const impact = await impactRes.json();
      // Overwrite items_swapped with completedSwaps for consistency
      document.getElementById("sustainability-impact").innerHTML = `
              <div class="impact-summary">
                <h3>Your Sustainability Impact</h3>
                <p><strong>Items Swapped:</strong> ${completedSwaps}</p>
                <p><strong>CO₂ Saved:</strong> ${completedSwaps * 5} kg</p>
                <p><strong>Water Saved:</strong> ${completedSwaps * 2000} L</p>
                <div class="impact-message">${impact.summary}</div>
              </div>
            `;
    }
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  }
}

function displayMyItems(items) {
  const grid = document.getElementById("my-items-grid");
  grid.innerHTML = "";

  if (items.length === 0) {
    grid.innerHTML =
      '<p style="text-align: center; color: #6e6e73;">No items listed yet</p>';
    return;
  }

  items.forEach((item) => {
    const card = createItemCard(item);
    // Add approval status
    const statusBadge = document.createElement("div");
    statusBadge.className = `item-status ${
      item.is_approved ? "approved" : "pending"
    }`;
    statusBadge.textContent = item.is_approved
      ? "Approved"
      : "Pending Approval";
    statusBadge.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            background: ${item.is_approved ? "#d4edda" : "#fff3cd"};
            color: ${item.is_approved ? "#155724" : "#856404"};
        `;
    card.style.position = "relative";
    card.appendChild(statusBadge);
    grid.appendChild(card);
  });
}

function displayMySwaps(swaps) {
  const receivedContainer = document.getElementById("received-swaps");
  const sentContainer = document.getElementById("sent-swaps");

  receivedContainer.innerHTML = "";
  sentContainer.innerHTML = "";

  // Display received swaps
  if (swaps.received_swaps && swaps.received_swaps.length > 0) {
    swaps.received_swaps.forEach((swap) => {
      const swapCard = createSwapCard(swap, "received");
      receivedContainer.appendChild(swapCard);
    });
  } else {
    receivedContainer.innerHTML =
      '<p style="color: #6e6e73;">No swap requests received</p>';
  }

  // Display sent swaps
  if (swaps.sent_swaps && swaps.sent_swaps.length > 0) {
    swaps.sent_swaps.forEach((swap) => {
      const swapCard = createSwapCard(swap, "sent");
      sentContainer.appendChild(swapCard);
    });
  } else {
    sentContainer.innerHTML =
      '<p style="color: #6e6e73;">No swap requests sent</p>';
  }
}

function createSwapCard(swap, type) {
  const card = document.createElement("div");
  card.className = "swap-card";

  card.innerHTML = `
        <div class="swap-header">
            <h4>${swap.item_title}</h4>
            <span class="swap-status ${swap.status}">${swap.status}</span>
        </div>
        <p><strong>Type:</strong> ${swap.swap_type.replace("_", " ")}</p>
        <p><strong>${type === "received" ? "From" : "To"}:</strong> ${
    type === "received" ? swap.requester_username : swap.owner_username
  }</p>
        ${
          swap.message ? `<p><strong>Message:</strong> ${swap.message}</p>` : ""
        }
        ${
          type === "received" && swap.status === "pending"
            ? `
            <div class="swap-actions">
                <button class="btn btn-success btn-small" onclick="respondToSwap(${swap.id}, 'accept')">Accept</button>
                <button class="btn btn-danger btn-small" onclick="respondToSwap(${swap.id}, 'reject')">Reject</button>
            </div>
        `
            : ""
        }
    `;

  return card;
}

async function respondToSwap(swapId, action) {
  try {
    showLoading();
    const response = await fetch(`${API_BASE}/swaps/${swapId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ action }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast(`Swap ${action}ed successfully!`, "success");
      loadDashboardData(); // Reload dashboard data

      // Update user points if needed
      if (action === "accept") {
        checkAuth(); // Refresh user data
      }
    } else {
      showToast(data.error || `Failed to ${action} swap`, "error");
    }
  } catch (error) {
    showToast(`Failed to ${action} swap`, "error");
  } finally {
    hideLoading();
  }
}

// Tab functions
function showDashboardTab(tabName) {
  // Update tab buttons
  document.querySelectorAll(".dashboard-tabs .tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  // Update tab content
  document
    .querySelectorAll("#dashboard-page .tab-content")
    .forEach((content) => {
      content.classList.remove("active");
    });
  document.getElementById(`${tabName}-tab`).classList.add("active");
}

function showAdminTab(tabName) {
  // Update tab buttons
  document.querySelectorAll(".admin-tabs .tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  // Update tab content
  document.querySelectorAll("#admin-page .tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(`${tabName}-tab`).classList.add("active");

  // Load tab-specific data
  if (tabName === "pending-items") {
    loadPendingItems();
  } else if (tabName === "all-users") {
    loadAllUsers();
  }
}

// Admin functions
async function loadAdminData() {
  if (!currentUser || !currentUser.is_admin) return;

  try {
    // Load admin stats
    const statsResponse = await fetch(`${API_BASE}/admin/stats`, {
      credentials: "include",
    });
    const stats = await statsResponse.json();

    document.getElementById("admin-total-users").textContent =
      stats.total_users;
    document.getElementById("admin-total-items").textContent =
      stats.total_items;
    document.getElementById("admin-pending-items").textContent =
      stats.pending_items;
    document.getElementById("admin-total-swaps").textContent =
      stats.total_swaps;

    // Load pending items by default
    loadPendingItems();
  } catch (error) {
    console.error("Failed to load admin data:", error);
  }
}

async function loadPendingItems() {
  try {
    const response = await fetch(`${API_BASE}/admin/pending-items`, {
      credentials: "include",
    });
    const items = await response.json();

    const grid = document.getElementById("pending-items-grid");
    grid.innerHTML = "";

    if (items.length === 0) {
      grid.innerHTML =
        '<p style="text-align: center; color: #6e6e73;">No pending items</p>';
      return;
    }

    items.forEach((item) => {
      const card = createItemCard(item);

      // Add admin actions
      const actions = document.createElement("div");
      actions.className = "item-actions";
      actions.style.marginTop = "15px";
      actions.innerHTML = `
                <button class="btn btn-success btn-small" onclick="approveItem(${item.id})">Approve</button>
                <button class="btn btn-danger btn-small" onclick="rejectItem(${item.id})">Reject</button>
            `;

      card.querySelector(".item-content").appendChild(actions);
      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to load pending items:", error);
  }
}

async function loadAllUsers() {
  try {
    const response = await fetch(`${API_BASE}/admin/users`, {
      credentials: "include",
    });
    const users = await response.json();

    const container = document.getElementById("users-list");
    container.innerHTML = "";

    users.forEach((user) => {
      const userItem = document.createElement("div");
      userItem.className = "user-item";
      userItem.innerHTML = `
                <div class="user-info">
                    <h4>${user.username}</h4>
                    <p>${user.email} • ${user.points} points • ${
        user.is_admin ? "Admin" : "User"
      }</p>
                </div>
                <div class="user-actions">
                    <button class="btn btn-outline btn-small" onclick="toggleAdminStatus(${
                      user.id
                    })">
                        ${user.is_admin ? "Remove Admin" : "Make Admin"}
                    </button>
                </div>
            `;
      container.appendChild(userItem);
    });
  } catch (error) {
    console.error("Failed to load users:", error);
  }
}

async function approveItem(itemId) {
  try {
    const response = await fetch(`${API_BASE}/admin/items/${itemId}/approve`, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      showToast("Item approved successfully!", "success");
      loadPendingItems();
      loadAdminData(); // Refresh stats
    } else {
      showToast("Failed to approve item", "error");
    }
  } catch (error) {
    showToast("Failed to approve item", "error");
  }
}

async function rejectItem(itemId) {
  try {
    const response = await fetch(`${API_BASE}/admin/items/${itemId}/reject`, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      showToast("Item rejected and removed", "success");
      loadPendingItems();
      loadAdminData(); // Refresh stats
    } else {
      showToast("Failed to reject item", "error");
    }
  } catch (error) {
    showToast("Failed to reject item", "error");
  }
}

async function toggleAdminStatus(userId) {
  try {
    const response = await fetch(
      `${API_BASE}/admin/users/${userId}/toggle-admin`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (response.ok) {
      showToast(data.message, "success");
      loadAllUsers();
    } else {
      showToast("Failed to update user status", "error");
    }
  } catch (error) {
    showToast("Failed to update user status", "error");
  }
}

// Swap modal functions
async function openSwapModal(itemId, swapType) {
  if (!currentUser) {
    showToast("Please login to request swaps", "error");
    return;
  }

  const modal = document.getElementById("swap-modal");
  const content = document.getElementById("swap-modal-content");

  if (swapType === "points") {
    // Points redemption
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;

    content.innerHTML = `
            <p>Redeem <strong>${item.title}</strong> for <strong>${
      item.points_value
    } points</strong>?</p>
            <p>Your current balance: <strong>${
              currentUser.points
            } points</strong></p>
            ${
              currentUser.points < item.points_value
                ? '<p style="color: #ff3b30;">Insufficient points!</p>'
                : `<div class="form-group">
                    <label for="swap-message">Message (optional)</label>
                    <textarea id="swap-message" rows="3" placeholder="Add a message..."></textarea>
                </div>
                <button class="btn btn-primary btn-full" onclick="submitSwap(${itemId}, 'points_redemption')">
                    Redeem for ${item.points_value} Points
                </button>`
            }
        `;
  } else {
    // Direct swap - load user's items
    try {
      const response = await fetch(`${API_BASE}/my-items`, {
        credentials: "include",
      });
      const myItems = await response.json();

      const availableItems = myItems.filter(
        (item) => item.is_approved && item.is_available
      );

      if (availableItems.length === 0) {
        content.innerHTML =
          "<p>You need to have approved items to offer for swap.</p>";
      } else {
        content.innerHTML = `
                    <div class="form-group">
                        <label for="offered-item">Select item to offer</label>
                        <select id="offered-item" required>
                            <option value="">Choose an item...</option>
                            ${availableItems
                              .map(
                                (item) =>
                                  `<option value="${item.id}">${item.title} (${item.condition})</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="swap-message">Message (optional)</label>
                        <textarea id="swap-message" rows="3" placeholder="Add a message..."></textarea>
                    </div>
                    <button class="btn btn-primary btn-full" onclick="submitSwap(${itemId}, 'direct_swap')">
                        Request Swap
                    </button>
                `;
      }
    } catch (error) {
      content.innerHTML = "<p>Failed to load your items. Please try again.</p>";
    }
  }

  modal.style.display = "block";
}

async function submitSwap(itemId, swapType) {
  const message = document.getElementById("swap-message")?.value || "";
  let swapData = {
    item_id: itemId,
    swap_type: swapType,
    message: message,
  };

  if (swapType === "direct_swap") {
    const offeredItemId = document.getElementById("offered-item")?.value;
    if (!offeredItemId) {
      showToast("Please select an item to offer", "error");
      return;
    }
    swapData.offered_item_id = parseInt(offeredItemId);
  }

  try {
    showLoading();
    const response = await fetch(`${API_BASE}/swaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(swapData),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Swap request sent successfully!", "success");
      closeModal("swap-modal");

      // Update user points display if it was a points redemption
      if (swapType === "points_redemption") {
        checkAuth(); // Refresh user data
      }
    } else {
      showToast(data.error || "Failed to send swap request", "error");
    }
  } catch (error) {
    showToast("Failed to send swap request", "error");
  } finally {
    hideLoading();
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Utility functions
function showLoading() {
  document.getElementById("loading").style.display = "block";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 100);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => container.removeChild(toast), 300);
  }, 3000);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function toggleMobileMenu() {
  const navMenu = document.getElementById("nav-menu");
  navMenu.classList.toggle("active");
}

// Close modal when clicking outside
window.onclick = (function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
})(
  // AI Chat Widget Logic
  function () {
    const chatWidget = document.getElementById("ai-chat-widget");
    const chatToggle = document.getElementById("ai-chat-toggle");
    const chatWindow = document.getElementById("ai-chat-window");
    const chatClose = document.getElementById("ai-chat-close");
    const chatForm = document.getElementById("ai-chat-form");
    const chatInput = document.getElementById("ai-chat-input");
    const chatMessages = document.getElementById("ai-chat-messages");

    function openChat() {
      chatWindow.classList.remove("ai-chat-closed");
      chatInput.focus();
    }
    function closeChat() {
      chatWindow.classList.add("ai-chat-closed");
    }
    chatToggle.addEventListener("click", openChat);
    chatClose.addEventListener("click", closeChat);

    chatForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const userMsg = chatInput.value.trim();
      if (!userMsg) return;
      addMessage(userMsg, "user");
      chatInput.value = "";
      addMessage(
        '<span class="ai-chat-loading">Thinking...</span>',
        "assistant",
        true
      );
      try {
        const resp = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg }),
        });
        const data = await resp.json();
        removeLoadingMessage();
        if (data.response) {
          addMessage(data.response, "assistant");
        } else {
          addMessage("Sorry, I could not answer that right now.", "assistant");
        }
      } catch (err) {
        removeLoadingMessage();
        addMessage("Sorry, something went wrong.", "assistant");
      }
    });

    function addMessage(text, sender, isLoading = false) {
      const msgDiv = document.createElement("div");
      msgDiv.className =
        "ai-chat-message ai-chat-message-" +
        (sender === "user" ? "user" : "assistant");
      if (isLoading) msgDiv.classList.add("ai-chat-loading-msg");
      msgDiv.innerHTML = "<span>" + text + "</span>";
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    function removeLoadingMessage() {
      const loadingMsg = chatMessages.querySelector(".ai-chat-loading-msg");
      if (loadingMsg) loadingMsg.remove();
    }
  }
)();

async function handleAvatarUpload(e) {
  e.preventDefault();
  if (!currentUser) return;
  const input = document.getElementById("avatar-input");
  const file = input.files[0];
  if (!file) {
    showToast("Please select an image file.", "error");
    return;
  }
  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    showToast("Please select a valid image file (JPEG, PNG, or GIF).", "error");
    return;
  }
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast("Image file size must be less than 5MB.", "error");
    return;
  }
  showLoading();
  const formData = new FormData();
  formData.append("avatar", file);
  try {
    const response = await fetch(`/api/users/${currentUser.id}/avatar`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await response.json();
    if (response.ok) {
      showToast("Avatar updated!", "success");
      // Update avatar in UI and currentUser
      currentUser.avatar = data.avatar;
      setUserAvatar();
    } else {
      showToast(data.error || "Upload failed", "error");
    }
  } catch (error) {
    showToast("Upload failed. Please try again.", "error");
  } finally {
    hideLoading();
  }
}

async function handleProfileAvatarUpload(e) {
  e.preventDefault();
  if (!currentUser) return;
  const input = document.getElementById("profile-avatar-input");
  const file = input.files[0];
  if (!file) {
    showToast("Please select an image file.", "error");
    return;
  }
  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    showToast("Please select a valid image file (JPEG, PNG, or GIF).", "error");
    return;
  }
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast("Image file size must be less than 5MB.", "error");
    return;
  }
  showLoading();
  const formData = new FormData();
  formData.append("avatar", file);
  try {
    const response = await fetch(`/api/users/${currentUser.id}/avatar`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await response.json();
    if (response.ok) {
      showToast("Avatar updated!", "success");
      currentUser.avatar = data.avatar;
      showProfilePage();
    } else {
      showToast(data.error || "Upload failed", "error");
    }
  } catch (error) {
    showToast("Upload failed. Please try again.", "error");
  } finally {
    hideLoading();
  }
}

function setUserAvatar() {
  const avatarImg = document.getElementById("user-avatar");
  if (avatarImg && currentUser && currentUser.avatar) {
    avatarImg.src = `/${currentUser.avatar}`;
  } else if (avatarImg) {
    avatarImg.src = "";
  }
}

function openNotificationsModal() {
  fetchAndShowNotifications();
  document.getElementById("notifications-modal").style.display = "block";
}

async function fetchAndShowNotifications() {
  try {
    const res = await fetch("/api/notifications", { credentials: "include" });
    const notifications = await res.json();
    const list = document.getElementById("notifications-list");
    list.innerHTML = "";
    if (notifications.length === 0) {
      list.innerHTML =
        '<p style="color: #6e6e73; text-align: center;">No notifications</p>';
      return;
    }
    notifications.forEach((n) => {
      const div = document.createElement("div");
      div.className = "notification-item" + (n.is_read ? "" : " unread");
      div.style = "padding: 10px 0; border-bottom: 1px solid #eee;";
      div.innerHTML = `
                <span>${n.message}</span>
                <br><small style="color: #888;">${new Date(
                  n.created_at
                ).toLocaleString()}</small>
                ${
                  !n.is_read
                    ? `<button class="btn btn-outline btn-small" style="margin-left:10px;" onclick="markNotificationRead(${n.id}, this)">Mark as read</button>`
                    : ""
                }
            `;
      list.appendChild(div);
    });
  } catch (e) {
    document.getElementById("notifications-list").innerHTML =
      '<p style="color: red;">Failed to load notifications</p>';
  }
}

async function markNotificationRead(id, btn) {
  try {
    btn.disabled = true;
    await fetch(`/api/notifications/${id}/read`, {
      method: "POST",
      credentials: "include",
    });
    fetchAndShowNotifications();
    fetchAndShowNotificationsBadge();
  } catch (e) {
    showToast("Failed to mark as read", "error");
  }
}

async function fetchAndShowNotificationsBadge() {
  try {
    const res = await fetch("/api/notifications", { credentials: "include" });
    const notifications = await res.json();
    const unread = notifications.filter((n) => !n.is_read).length;
    const badge = document.getElementById("notifications-badge");
    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  } catch (e) {
    // ignore
  }
}

document
  .getElementById("feedback-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("feedback-name").value;
    const email = document.getElementById("feedback-email").value;
    const message = document.getElementById("feedback-message").value;

    // Optionally: Send data to server via fetch() here

    // Show thank you message
    document.getElementById("feedback-form").reset();
    document.getElementById("feedback-success").style.display = "block";

    // Hide after 5 seconds
    setTimeout(() => {
      document.getElementById("feedback-success").style.display = "none";
    }, 5000);
  });


// Scroll-to-Top Button functionality
function setupScrollToTop() {
  const scrollBtn = document.getElementById("scrollToTopBtn");
  
  if (!scrollBtn) return;

  // Debounced scroll handler for better performance
  let scrollTimeout;
  function handleScroll() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      
      if (scrollY > 50) {
        scrollBtn.classList.add('show');
      } else {
        scrollBtn.classList.remove('show');
      }
    }, 10);
  }

  // Smooth scroll to top
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Add event listeners
  window.addEventListener('scroll', handleScroll, { passive: true });
  scrollBtn.addEventListener('click', scrollToTop);
  
  // Add keyboard accessibility
  scrollBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  });

  // Set ARIA attributes for accessibility
  scrollBtn.setAttribute('aria-label', 'Scroll to top');
  scrollBtn.setAttribute('role', 'button');
  scrollBtn.setAttribute('tabindex', '0');
}


