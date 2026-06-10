import { firebaseConfig, calendarConfig } from "../../assets/js/config.js";
import { CalendarService } from "./calendar-service.js";

// Format date as DD/MM/YYYY with optional time in South African timezone
function formatDate(date, includeTime = false) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  // Create formatter with South African timezone
  const options = {
    timeZone: "Africa/Johannesburg",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  // Add time options if needed
  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.hour12 = false;
  }

  // Format the date using the locale formatter
  return new Intl.DateTimeFormat("en-ZA", options).format(date);
}

class PasswordGenerator {
  constructor() {
    // First words — vivid, fun, easy to say aloud
    this.firstWords = [
      // Exotic foods & drinks
      "Mango", "Cinnamon", "Wasabi", "Sriracha", "Tiramisu", "Baklava",
      "Churros", "Gelato", "Croissant", "Macaron", "Kimchi", "Guacamole",
      "Pesto", "Tahini", "Habanero", "Tamarind", "Cardamom", "Saffron",
      "Mochi", "Boba", "Espresso", "Matcha", "Pretzel", "Waffle",
      "Cannoli", "Paprika", "Samosa", "Falafel", "Tempura", "Stroopwafel",

      // Exotic fruits & plants
      "Dragonfruit", "Passionfruit", "Lychee", "Kumquat", "Pomelo",
      "Jackfruit", "Rambutan", "Mangosteen", "Starfruit", "Durian",
      "Persimmon", "Guava", "Pitaya", "Cherimoya", "Soursop",

      // Interesting animals
      "Narwhal", "Platypus", "Axolotl", "Quokka", "Capybara", "Pangolin",
      "Echidna", "Wombat", "Tardigrade", "Puffin", "Toucan", "Chameleon",
      "Jellyfish", "Octopus", "Firefly", "Tapir", "Fossa", "Binturong",
      "Okapi", "Numbat", "Wolverine", "Meerkat", "Blobfish", "Axolotl",

      // Science & space
      "Quantum", "Plasma", "Photon", "Neutron", "Pulsar", "Quasar",
      "Vortex", "Prism", "Catalyst", "Neutrino", "Fractal", "Entropy",
      "Synapse", "Isotope", "Molecule", "Electron", "Hologram", "Cipher",

      // Mythology & fantasy creatures
      "Pegasus", "Chimera", "Basilisk", "Minotaur", "Sphinx", "Cyclops",
      "Banshee", "Valkyrie", "Selkie", "Kelpie", "Kitsune", "Tengu",
      "Thunderbird", "Wendigo", "Leviathan", "Tanuki", "Peryton",

      // Vivid descriptors
      "Crimson", "Cobalt", "Teal", "Scarlet", "Indigo", "Magenta",
      "Amber", "Ivory", "Vermillion", "Chartreuse", "Celadon", "Umber",
      "Turbo", "Hyper", "Neon", "Cosmic", "Galactic", "Radiant",
      "Velvet", "Primal", "Rogue", "Glacial", "Volcanic", "Ancient",
      "Cursed", "Hollow", "Blazing", "Frozen", "Shimmering", "Spectral",

      // Herbs & spices
      "Lavender", "Rosemary", "Turmeric", "Oregano", "Thyme", "Juniper",
      "Fennel", "Clove", "Anise", "Tarragon", "Sumac", "Caraway",
    ];

    // Second words — strong nouns, phenomena, places, creatures
    this.secondWords = [
      // Weather & natural forces
      "Blizzard", "Tsunami", "Avalanche", "Hurricane", "Cyclone",
      "Monsoon", "Tempest", "Solstice", "Equinox", "Tremor",
      "Geyser", "Vortex", "Eruption", "Deluge", "Squall",

      // Celestial & space
      "Supernova", "Asteroid", "Pulsar", "Comet", "Nebula",
      "Horizon", "Zenith", "Cosmos", "Solstice", "Aphelion",
      "Perihelion", "Eclipse", "Aurora", "Quasar", "Singularity",

      // Abstract & epic
      "Odyssey", "Paradox", "Labyrinth", "Mirage", "Reverie",
      "Havoc", "Rapture", "Cascade", "Nexus", "Apex",
      "Legacy", "Epoch", "Cipher", "Riddle", "Specter",
      "Solace", "Fury", "Abyss", "Pinnacle", "Threshold",
      "Verdict", "Omen", "Chronicle", "Requiem", "Fracture",

      // Materials & gems
      "Obsidian", "Titanium", "Sapphire", "Topaz", "Tungsten",
      "Bismuth", "Beryllium", "Malachite", "Opal", "Onyx",
      "Amethyst", "Zircon", "Pyrite", "Cinnabar",

      // Fantasy creatures & beings
      "Griffin", "Behemoth", "Colossus", "Titan", "Wraith",
      "Specter", "Golem", "Wyrm", "Wyvern", "Basilisk",
      "Hydra", "Kraken", "Leviathan", "Ifrit", "Djinn",

      // Places & structures
      "Fortress", "Citadel", "Sanctum", "Plateau", "Tundra",
      "Ravine", "Catacombs", "Spire", "Caldera", "Lagoon",
      "Archipelago", "Peninsula", "Atoll", "Fjord", "Steppe",

      // Action & motion
      "Surge", "Torrent", "Flare", "Pulse", "Frenzy",
      "Onslaught", "Ascent", "Plunge", "Ricochet", "Cascade",

      // Quirky food endings
      "Dumpling", "Sundae", "Noodle", "Biscuit", "Waffle",
      "Fritter", "Cobbler", "Scone", "Brioche", "Empanada",
    ];
  }

  getRandomWord(wordList) {
    // Use crypto.getRandomValues for better randomness
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return wordList[array[0] % wordList.length];
  }

  generatePassword() {
    const w1 = this.getRandomWord(this.firstWords);
    // Pick second word, re-rolling once if it happens to match the first
    let w2 = this.getRandomWord(this.secondWords);
    if (w2 === w1) w2 = this.getRandomWord(this.secondWords);

    // Append a 2-digit number for added uniqueness (10–99)
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const num = (array[0] % 90) + 10;

    // Randomly swap word order for more variety (~40% of the time)
    crypto.getRandomValues(array);
    return (array[0] % 10) < 4
      ? `${w2}${w1}${num}`
      : `${w1}${w2}${num}`;
  }

  generateOptions(count = 5) {
    const options = new Set();
    let attempts = 0;
    while (options.size < count && attempts < count * 10) {
      options.add(this.generatePassword());
      attempts++;
    }
    return [...options];
  }
}

class AdminPortal {
  constructor() {
    this.passwordGenerator = new PasswordGenerator();
    this.isSubmitting = false;
    this.defaultTypingPassword = '';
    this.calendarService = new CalendarService(calendarConfig);
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // Cache frequently-accessed static DOM elements
      this.loginSection = document.getElementById("loginSection");
      this.adminPanel = document.getElementById("adminPanel");

      this.initializeAuth();
      this.setupEventListeners();
      this.initializeCalendar();
      this.setupAutoArchiving();
    } catch (error) {
      console.error("Initialization error:", error);
      this.showToast(
        "Error initializing application: " + error.message,
        "error"
      );
    }
  }
  async editExamLink(examId) {
    try {
      const doc = await this.db.collection("exams").doc(examId).get();
      if (!doc.exists) {
        this.showToast("Assessment not found", "error");
        return;
      }

      const exam = doc.data();

      // Extract the file ID from the URL to display in a cleaner format
      let displayUrl = exam.url;
      const fileIdMatch = exam.url.match(/\/d\/(.*?)\/preview/);
      if (fileIdMatch && fileIdMatch[1]) {
        displayUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/view`;
      }

      const dialog = document.createElement("div");
      dialog.className = "edit-dialog-overlay";
      dialog.innerHTML = `
                <div class="edit-dialog">
                    <h3>Edit Assessment Link</h3>
                    <form id="editLinkForm" class="edit-form">
                        <div class="form-group">
                            <label>Grade ${exam.grade} - ${exam.subject}</label>
                        </div>
                        <div class="form-group">
                            <label for="editDriveUrl">Google Drive URL</label>
                            <input type="url" id="editDriveUrl" value="${displayUrl}" required 
                                   placeholder="https://drive.google.com/file/d/...">
                            <small>Paste the Google Drive URL for the PDF file</small>
                        </div>
                        <div class="button-group">
                            <button type="button" class="preview-btn" onclick="adminPortal.previewLink(document.getElementById('editDriveUrl').value)">
                                Preview Link
                            </button>
                            <button type="submit" class="save-btn">Save Changes</button>
                            <button type="button" class="cancel-btn" onclick="this.closest('.edit-dialog-overlay').remove()">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            `;

      document.body.appendChild(dialog);

      document
        .getElementById("editLinkForm")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const newUrl = document.getElementById("editDriveUrl").value;

          // Format the URL correctly for embedding
          const formattedUrl = this.formatDriveUrl(newUrl);

          try {
            await this.db.collection("exams").doc(examId).update({
              url: formattedUrl,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              updatedBy: this.auth.currentUser.email,
            });

            this.showToast("Assessment link updated successfully", "success");
            dialog.remove();
            this.loadExams(true);
          } catch (error) {
            console.error("Error updating assessment link:", error);
            this.showToast("Error updating link: " + error.message, "error");
          }
        });
    } catch (error) {
      console.error("Error loading assessment for edit:", error);
      this.showToast("Error loading assessment: " + error.message, "error");
    }
  }

  previewLink(url) {
    // Format the URL to ensure it's in the correct preview format
    const formattedUrl = this.formatDriveUrl(url);

    // Create modal for preview
    const previewDialog = document.createElement("div");
    previewDialog.className = "preview-dialog-overlay";
    previewDialog.innerHTML = `
            <div class="preview-dialog">
                <div class="preview-header">
                    <h3>Document Preview</h3>
                    <button class="close-preview-btn" onclick="this.closest('.preview-dialog-overlay').remove()">Close</button>
                </div>
                <div class="preview-content">
                    <iframe src="${formattedUrl}" frameborder="0"></iframe>
                </div>
            </div>
        `;

    document.body.appendChild(previewDialog);
  }

  viewExamLink(examId) {
    this.showConfirmDialog("Do you want to view this assessment?", async () => {
      try {
        const doc = await this.db.collection("exams").doc(examId).get();
        if (!doc.exists) {
          this.showToast("Assessment not found", "error");
          return;
        }

        const exam = doc.data();
        window.open(exam.url, "_blank");
      } catch (error) {
        console.error("Error viewing exam:", error);
        this.showToast("Error opening assessment: " + error.message, "error");
      }
    });
  }
  // Toast notification system
  showToast(message, type = "info", duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    // Create toast content
    const iconMap = {
      success:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      warning:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    };

    toast.innerHTML = `
            <div class="toast-icon">${iconMap[type] || iconMap.info}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Add animation class after a tiny delay (for animation to work)
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    // Set up close button
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => {
      removeToast(toast);
    });

    // Auto close after duration
    const timeoutId = setTimeout(() => {
      removeToast(toast);
    }, duration);

    // Store timeout ID for potential early removal
    toast.dataset.timeoutId = timeoutId;

    // Function to remove toast with animation
    function removeToast(toastElement) {
      // Clear existing timeout
      clearTimeout(parseInt(toastElement.dataset.timeoutId));

      // Start exit animation
      toastElement.classList.remove("show");
      toastElement.classList.add("hiding");

      // Remove after animation completes
      setTimeout(() => {
        if (toastElement.parentNode) {
          toastElement.parentNode.removeChild(toastElement);
        }

        // If no more toasts, remove the container
        if (toastContainer.children.length === 0) {
          toastContainer.remove();
        }
      }, 300); // Match this with CSS transition time
    }

    return toast;
  }

  // Add confirmation dialog to replace JavaScript confirms
  showConfirmDialog(message, onConfirm, onCancel = () => { }) {
    const dialog = document.createElement("div");
    dialog.className = "confirm-dialog-overlay";
    dialog.innerHTML = `
            <div class="confirm-dialog">
                <h3>Confirmation</h3>
                <p>${message}</p>
                <div class="button-group">
                    <button class="confirm-btn">Confirm</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            </div>
        `;

    document.body.appendChild(dialog);

    // Add event listeners
    const confirmBtn = dialog.querySelector(".confirm-btn");
    const cancelBtn = dialog.querySelector(".cancel-btn");

    confirmBtn.addEventListener("click", () => {
      dialog.remove();
      onConfirm();
    });

    cancelBtn.addEventListener("click", () => {
      dialog.remove();
      onCancel();
    });

    // Close on click outside
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.remove();
        onCancel();
      }
    });

    // Press ESC to cancel
    document.addEventListener("keydown", function escKeyPress(e) {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", escKeyPress);
        if (document.body.contains(dialog)) {
          dialog.remove();
          onCancel();
        }
      }
    });
  }

  async initializeCalendar() {
    try {
      await this.calendarService.ensureInitialized();
    } catch (error) {
      console.warn("Calendar initialization failed:", error);
    }
  }

  async initializeAuth() {
    await this.auth.signOut();

    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        if (user.email.endsWith("@maristsj.co.za")) {
          const isAuthorized = await this.checkUserAuthorization(user.email);
          if (isAuthorized) {
            this.loginSection.style.display = "none";
            this.adminPanel.style.display = "block";
            this.showAdminPanel(user);
          } else {
            this.showToast(
              "You are not authorized to access the admin panel. Please contact the administrator.",
              "error"
            );
            await this.auth.signOut();
          }
        } else {
          this.showToast(
            "Please use your SJMC email address to login.",
            "error"
          );
          await this.auth.signOut();
        }
      } else {
        this.loginSection.style.display = "flex";
        this.adminPanel.style.display = "none";
        this.hideAdminPanel();
      }
    });
  }

  setupEventListeners() {
    const loginButton = document.getElementById("googleLogin");
    if (loginButton) {
      loginButton.addEventListener("click", () => this.handleLogin());
    }

    const logoutButton = document.getElementById("logoutBtn");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    const manageUsersBtn = document.getElementById("manageUsersBtn");
    if (manageUsersBtn) {
      manageUsersBtn.addEventListener("click", () => this.manageUsers());
    }

    const assessmentForm = document.getElementById("assessmentForm");
    if (assessmentForm) {
      const newAssessmentForm = assessmentForm.cloneNode(true);
      assessmentForm.parentNode.replaceChild(newAssessmentForm, assessmentForm);

      newAssessmentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!this.isSubmitting) {
          const formData = this.getExamFormData();
          await this.saveExam(formData);
        }
      });
    }

    const calendarCheckbox = document.getElementById("addCalendarReminder");

    if (calendarCheckbox) {
      calendarCheckbox.addEventListener("change", async (e) => {
        if (e.target.checked) {
          try {
            await this.calendarService.ensureInitialized();
          } catch (error) {
            console.error("Failed to initialize calendar service:", error);
            e.target.checked = false;
            this.showToast(
              "Unable to enable calendar reminders. Please try again later.",
              "error"
            );
          }
        }
      });
    }

    this.setupTimeSelect();

    const applyFilterBtn = document.getElementById("applyFilter");
    if (applyFilterBtn) {
      applyFilterBtn.addEventListener("click", () => {
        this.loadExams(true);
      });
    }
    // Optional: Add reset filter button
    const filterControls = document.querySelector(".filter-controls");
    if (filterControls && !document.querySelector(".reset-filter-btn")) {
      const resetFilterBtn = document.createElement("button");
      resetFilterBtn.textContent = "Reset";
      resetFilterBtn.className = "reset-filter-btn";
      resetFilterBtn.addEventListener("click", () => {
        document.getElementById("filterGrade").value = "";
        document.getElementById("filterType").value = "";
        this.loadExams(false);
      });
      filterControls.appendChild(resetFilterBtn);
    }
    const archiveAllBtn = document.getElementById("archiveAll");
    if (archiveAllBtn) {
      archiveAllBtn.addEventListener("click", () => this.archiveAll());
    }

    const typeSelect = document.getElementById("assessmentType");
    if (typeSelect) {
      typeSelect.addEventListener("change", (e) => this.handleAssessmentTypeChange(e.target.value));
    }
  }

  handleAssessmentTypeChange(type) {
    const passwordInput = document.getElementById("password");
    const urlHint = document.getElementById("urlHint");
    const urlInput = document.getElementById("driveUrl");
    if (type === "typing") {
      if (passwordInput && this.defaultTypingPassword) {
        passwordInput.value = this.defaultTypingPassword;
      }
      if (urlHint) urlHint.textContent = "Enter the Google Doc URL — the learner will be able to type directly in this document.";
      if (urlInput) urlInput.placeholder = "https://docs.google.com/document/d/...";
    } else {
      if (urlHint) urlHint.textContent = "Supports Google Drive PDFs, Forms, Docs, Sheets, Slides, or any HTTPS URL";
      if (urlInput) urlInput.placeholder = "https://drive.google.com/file/d/...";
    }
  }

  ensureEditUrl(url) {
    if (url.includes("docs.google.com/document")) {
      return url.replace(/\/(preview|view)(\?.*)?$/, "/edit");
    }
    return url;
  }

  async loadTypingSettings() {
    try {
      const doc = await this.db.collection("settings").doc("portal").get();
      if (doc.exists && doc.data().typingPassword) {
        this.defaultTypingPassword = doc.data().typingPassword;
        const el = document.getElementById("defaultTypingPassword");
        if (el) el.value = this.defaultTypingPassword;
      }
    } catch (error) {
      console.warn("Could not load typing settings:", error);
    }
  }

  async saveTypingSettings() {
    const password = document.getElementById("defaultTypingPassword")?.value?.trim();
    if (!password) {
      this.showToast("Please enter a password", "error");
      return;
    }
    try {
      await this.db.collection("settings").doc("portal").set(
        { typingPassword: password },
        { merge: true }
      );
      this.defaultTypingPassword = password;
      this.showToast("Default typing password saved", "success");
    } catch (error) {
      this.showToast("Error saving: " + error.message, "error");
    }
  }

  async handleLogin() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account", // Force account selection every time
        hd: "maristsj.co.za",
      });

      // Clear any existing auth state first
      await this.auth.signOut();

      const result = await this.auth.signInWithPopup(provider);

      // Force a UI update
      if (result.user) {
        const isAuthorized = await this.checkUserAuthorization(
          result.user.email
        );
        if (isAuthorized) {
          this.showAdminPanel(result.user);
        } else {
          this.showToast(
            "You are not authorized to access the admin panel. Please contact the administrator.",
            "error"
          );
          await this.auth.signOut();
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/popup-blocked") {
        this.showToast("Please allow popups for this site to login.", "error");
      } else if (error.code === "auth/cancelled-popup-request") {
        // Popup was closed by user, no action needed
      } else {
        this.showToast("Login failed: " + error.message, "error");
      }
    }
  }

  async handleLogout() {
    try {
      await this.auth.signOut();
      const baseUrl = window.location.pathname.split("/admin")[0];
      window.location.href = baseUrl + "/index.html";
    } catch (error) {
      console.error("Logout error:", error);
      this.showToast("Logout failed: " + error.message, "error");
    }
  }

  setupAutoArchiving() {
    // Run immediately
    this.checkAndArchiveOldExams();

    // Then run every hour
    setInterval(() => this.checkAndArchiveOldExams(), 60 * 60 * 1000);
  }

  async saveExam(examData) {
    if (this.isSubmitting) {
      return;
    }

    const submitButton = document.querySelector('button[type="submit"]');
    try {
      this.isSubmitting = true;
      submitButton.disabled = true;
      submitButton.textContent = "Saving...";

      const docRef = await this.db.collection("exams").add({
        ...examData,
        createdBy: this.auth.currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      const addReminder = document.getElementById(
        "addCalendarReminder"
      ).checked;
      if (addReminder) {
        try {
          await this.calendarService.createReminder(examData);
        } catch (calendarError) {
          console.error("Calendar error (continuing anyway):", calendarError);
          this.showToast(
            "Assessment saved, but calendar reminder failed to create. Please add it manually if needed.",
            "warning"
          );
        }
      }

      document.getElementById("assessmentForm").reset();
      this.handleAssessmentTypeChange("exam");
      this.showToast("Assessment saved successfully!", "success");
      await this.loadExams();

      return docRef;
    } catch (error) {
      console.error("Save exam error:", error);
      this.showToast("Error: " + error.message, "error");
    } finally {
      this.isSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
  }

  async checkUserAuthorization(email) {
    try {
      const userDoc = await this.db.collection("users").doc(email).get();
      return userDoc.exists;
    } catch (error) {
      console.error("Error checking user authorization:", error);
      return false;
    }
  }

  showAdminPanel(user) {
    this.loginSection.style.display = "none";
    if (this.adminPanel) {
      this.adminPanel.style.display = "block";

      // Update user email display
      const userEmailElement = document.getElementById("userEmail");
      if (userEmailElement) {
        userEmailElement.textContent = user.email;
      }

      let examList = document.getElementById("examList");
      if (!examList) {
        examList = document.createElement("div");
        examList.id = "examList";
        examList.className = "exam-list";
        this.adminPanel.appendChild(examList);
      }
      this.loadExams();
      this.loadBroadcastStatus();
      this.fixExistingExams();
      this.loadTypingSettings();
    }
  }

  async loadBroadcastStatus() {
    const statusEl = document.getElementById("broadcastStatus");
    if (!statusEl) return;
    try {
      const targets = ["all", "grade_8", "grade_9", "grade_10", "grade_11", "grade_12"];
      const labels = { all: "All grades", grade_8: "Grade 8", grade_9: "Grade 9", grade_10: "Grade 10", grade_11: "Grade 11", grade_12: "Grade 12" };
      const active = [];
      for (const target of targets) {
        const doc = await this.db.collection("broadcasts").doc(target).get();
        if (doc.exists && doc.data().active && doc.data().message) {
          active.push(`${labels[target]}: "${doc.data().message}"`);
        }
      }
      statusEl.innerHTML = active.length
        ? active.map(m => `• ${m}`).join("<br>")
        : "";
    } catch (e) {
      // Broadcasts collection may not exist yet
    }
  }

  async sendBroadcast() {
    const message = document.getElementById("broadcastInput")?.value?.trim();
    const target = document.getElementById("broadcastGrade")?.value || "all";
    if (!message) {
      this.showToast("Please type a message to broadcast", "error");
      return;
    }
    try {
      await this.db.collection("broadcasts").doc(target).set({
        message,
        active: true,
        sentAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      this.showToast(`Message sent to ${target === "all" ? "all grades" : target.replace("_", " ")}`, "success");
      this.loadBroadcastStatus();
    } catch (error) {
      console.error("Broadcast error:", error);
      this.showToast("Failed to send broadcast", "error");
    }
  }

  async clearBroadcast() {
    const target = document.getElementById("broadcastGrade")?.value || "all";
    try {
      await this.db.collection("broadcasts").doc(target).set({
        message: "",
        active: false,
        clearedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      this.showToast(`Broadcast cleared for ${target === "all" ? "all grades" : target.replace("_", " ")}`, "success");
      this.loadBroadcastStatus();
    } catch (error) {
      console.error("Clear broadcast error:", error);
      this.showToast("Failed to clear broadcast", "error");
    }
  }

  hideAdminPanel() {
    this.loginSection.style.display = "flex";
    if (this.adminPanel) {
      this.adminPanel.style.display = "none";
    }
  }

  async manageUsers() {
    if (this.auth.currentUser.email !== "acoetzee@maristsj.co.za") {
      this.showToast("Only the administrator can manage users.", "error");
      return;
    }

    document.querySelector(".user-management-dialog")?.remove();

    const dialog = document.createElement("div");
    dialog.className = "user-management-dialog";
    dialog.innerHTML = `
      <div class="user-management-content">
        <div class="um-header">
          <h3>Manage Teachers</h3>
          <button class="um-close-btn" onclick="this.closest('.user-management-dialog').remove()">✕</button>
        </div>
        <div class="add-teacher-form">
          <div class="add-teacher-input-wrap">
            <input type="email" id="newUserEmail" placeholder="teacher@maristsj.co.za" autocomplete="off">
            <span class="email-error-msg" id="emailError"></span>
          </div>
          <button class="add-teacher-btn" onclick="adminPortal.addTeacher()">Add Teacher</button>
        </div>
        <div id="usersList" class="users-list">Loading...</div>
      </div>
    `;

    document.body.appendChild(dialog);

    const emailInput = dialog.querySelector("#newUserEmail");
    emailInput.addEventListener("keydown", (e) => { if (e.key === "Enter") this.addTeacher(); });
    emailInput.addEventListener("input", (e) => {
      const errorEl = document.getElementById("emailError");
      if (e.target.value && !e.target.value.endsWith("@maristsj.co.za")) {
        errorEl.textContent = "Must be a @maristsj.co.za address";
      } else {
        errorEl.textContent = "";
      }
    });

    this.loadTeachers();
  }

  async addTeacher() {
    const input = document.getElementById("newUserEmail");
    const errorEl = document.getElementById("emailError");
    const email = input.value.trim().toLowerCase();

    if (!email) return;

    if (!email.endsWith("@maristsj.co.za")) {
      errorEl.textContent = "Must be a @maristsj.co.za address";
      return;
    }

    try {
      const existing = await this.db.collection("users").doc(email).get();
      if (existing.exists) {
        errorEl.textContent = "This teacher is already authorized";
        return;
      }

      await this.db.collection("users").doc(email).set({
        email,
        addedBy: this.auth.currentUser.email,
        addedAt: firebase.firestore.FieldValue.serverTimestamp(),
        subjects: [],
        grades: [],
      });
      input.value = "";
      errorEl.textContent = "";
      this.showToast("Teacher added successfully", "success");
      this.loadTeachers();
    } catch (error) {
      console.error("Error adding teacher:", error);
      this.showToast("Error adding teacher: " + error.message, "error");
    }
  }

  async removeTeacher(email) {
    this.showConfirmDialog(
      `Are you sure you want to remove ${email}?`,
      async () => {
        try {
          await this.db.collection("users").doc(email).delete();
          this.showToast("Teacher removed successfully", "success");
          this.loadTeachers();
        } catch (error) {
          console.error("Error removing teacher:", error);
          this.showToast("Error removing teacher: " + error.message, "error");
        }
      }
    );
  }

  async loadTeachers() {
    const usersList = document.getElementById("usersList");
    if (!usersList) return;

    usersList.innerHTML = '<div class="teachers-loading">Loading teachers...</div>';

    try {
      const snapshot = await this.db.collection("users").get();

      if (snapshot.empty) {
        usersList.innerHTML = '<div class="teachers-empty">No teachers added yet. Add one above.</div>';
        return;
      }

      usersList.innerHTML = "";

      snapshot.forEach((doc) => {
        const teacher = doc.data();
        const safeId = teacher.email.replace(/[@.]/g, "_");
        const addedDate = teacher.addedAt ? formatDate(teacher.addedAt.toDate()) : "Unknown";
        const nameDisplay = teacher.email.split("@")[0]
          .replace(/\./g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const subjectTags = (teacher.subjects || [])
          .map((s) => `<span class="teacher-tag tag-subject">${s}</span>`)
          .join("");
        const gradeTags = (teacher.grades || [])
          .map((g) => `<span class="teacher-tag tag-grade">Gr ${g}</span>`)
          .join("");
        const tagsHtml = subjectTags || gradeTags
          ? `<div class="teacher-tags">${subjectTags}${gradeTags}</div>`
          : `<div class="teacher-tags teacher-tags-empty">No subjects or grades assigned</div>`;

        const card = document.createElement("div");
        card.className = "teacher-card";
        card.innerHTML = `
          <div class="teacher-card-main">
            <div class="teacher-info">
              <div class="teacher-name">${nameDisplay}</div>
              <div class="teacher-email">${teacher.email}</div>
              <div class="teacher-meta">Added by ${teacher.addedBy || "admin"} · ${addedDate}</div>
              ${tagsHtml}
            </div>
            <div class="teacher-actions">
              <button class="tch-btn tch-btn-history" onclick="adminPortal.toggleTeacherHistory('${teacher.email}')">View History</button>
              <button class="tch-btn tch-btn-edit" onclick="adminPortal.editTeacherTags('${teacher.email}')">Edit Tags</button>
              <button class="tch-btn tch-btn-remove" onclick="adminPortal.removeTeacher('${teacher.email}')">Remove</button>
            </div>
          </div>
          <div class="teacher-history-panel" id="hist_${safeId}" style="display:none"></div>
          <div class="teacher-tags-editor" id="tags_${safeId}" style="display:none"></div>
        `;
        usersList.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading teachers:", error);
      usersList.innerHTML = '<div class="teachers-error">Error loading teachers. Please try again.</div>';
    }
  }

  async toggleTeacherHistory(email) {
    const safeId = email.replace(/[@.]/g, "_");
    const panel = document.getElementById(`hist_${safeId}`);
    if (!panel) return;

    if (panel.style.display !== "none") {
      panel.style.display = "none";
      return;
    }

    panel.style.display = "block";
    panel.innerHTML = '<div class="history-loading">Loading history...</div>';

    try {
      const snapshot = await this.db.collection("exams")
        .where("createdBy", "==", email)
        .get();

      if (snapshot.empty) {
        panel.innerHTML = '<div class="history-empty">No assessments created by this teacher yet.</div>';
        return;
      }

      const exams = [];
      snapshot.forEach((doc) => exams.push(doc.data()));
      exams.sort((a, b) => {
        const aTime = a.scheduledDate?.toDate?.() || new Date(a.scheduledDate || 0);
        const bTime = b.scheduledDate?.toDate?.() || new Date(b.scheduledDate || 0);
        return bTime - aTime;
      });

      const activeCount = exams.filter((e) => !e.archived).length;
      const archivedCount = exams.filter((e) => e.archived).length;

      let html = `
        <div class="history-summary">${exams.length} assessment${exams.length !== 1 ? "s" : ""} · ${activeCount} active · ${archivedCount} archived</div>
        <div class="history-list">
      `;

      exams.forEach((exam) => {
        const date = exam.scheduledDisplayDateTime ||
          formatDate(exam.scheduledDate?.toDate ? exam.scheduledDate.toDate() : new Date(exam.scheduledDate || 0), true);
        const statusClass = exam.archived ? "hist-badge-archived" : "hist-badge-active";
        const statusLabel = exam.archived ? "Archived" : "Active";
        html += `
          <div class="history-item">
            <div class="history-item-main">
              <strong>Grade ${exam.grade} – ${exam.subject}</strong>
              <span class="hist-badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="history-item-date">${date}</div>
          </div>
        `;
      });

      html += "</div>";
      panel.innerHTML = html;
    } catch (error) {
      console.error("Error loading teacher history:", error);
      panel.innerHTML = '<div class="teachers-error">Error loading history.</div>';
    }
  }

  async editTeacherTags(email) {
    const safeId = email.replace(/[@.]/g, "_");
    const editor = document.getElementById(`tags_${safeId}`);
    if (!editor) return;

    if (editor.style.display !== "none") {
      editor.style.display = "none";
      return;
    }

    const doc = await this.db.collection("users").doc(email).get();
    const data = doc.data() || {};
    const currentSubjects = (data.subjects || []).join(", ");
    const currentGrades = data.grades || [];

    const gradeOptions = [8, 9, 10, 11, 12]
      .map((g) => `<label class="grade-check-label"><input type="checkbox" value="${g}" ${currentGrades.includes(g) ? "checked" : ""}> Grade ${g}</label>`)
      .join("");

    editor.style.display = "block";
    editor.innerHTML = `
      <div class="tags-editor-inner">
        <div class="tags-editor-field">
          <label>Subjects <span class="tags-editor-hint">(comma-separated)</span></label>
          <input type="text" id="subj_${safeId}" value="${currentSubjects}" placeholder="e.g. Mathematics, Physics">
        </div>
        <div class="tags-editor-field">
          <label>Grades</label>
          <div class="grade-check-group" id="grades_${safeId}">${gradeOptions}</div>
        </div>
        <div class="tags-editor-actions">
          <button class="tch-btn tch-btn-save" onclick="adminPortal.saveTeacherTags('${email}')">Save</button>
          <button class="tch-btn tch-btn-cancel" onclick="document.getElementById('tags_${safeId}').style.display='none'">Cancel</button>
        </div>
      </div>
    `;
  }

  async saveTeacherTags(email) {
    const safeId = email.replace(/[@.]/g, "_");
    const subjectsEl = document.getElementById(`subj_${safeId}`);
    const gradesEl = document.getElementById(`grades_${safeId}`);

    const subjects = subjectsEl.value.split(",").map((s) => s.trim()).filter(Boolean);
    const grades = [...gradesEl.querySelectorAll("input[type=checkbox]:checked")].map((cb) => parseInt(cb.value));

    try {
      await this.db.collection("users").doc(email).update({ subjects, grades });
      this.showToast("Tags updated", "success");
      this.loadTeachers();
    } catch (error) {
      console.error("Error saving tags:", error);
      this.showToast("Error saving tags: " + error.message, "error");
    }
  }

  async loadExams(filter = false) {
    const examsList = document.getElementById("examList");
    if (!examsList) return;

    try {
      examsList.innerHTML = '<div class="loading">Loading assessments...</div>';

      let query = this.db.collection("exams");

      if (filter) {
        const gradeFilter = document.getElementById("filterGrade").value;
        const typeFilter = document.getElementById("filterType").value;
        const archiveFilter = document.getElementById("filterArchived").value;

        // First handle archive status
        if (archiveFilter === "active") {
          // For active, we want both false and non-existent archived fields
          query = query.where("archived", "in", [false, null]);
        } else if (archiveFilter === "archived") {
          query = query.where("archived", "==", true);
        }
        // 'all' doesn't need any archived filter

        // Add other filters
        if (gradeFilter) {
          query = query.where("grade", "==", Number(gradeFilter));
        }

        if (typeFilter) {
          query = query.where("type", "==", typeFilter);
        }
      } else {
        // Default view shows active and unarchived assessments
        query = query.where("archived", "in", [false, null]);
      }

      // Always order by date
      query = query.orderBy("scheduledDate", "asc");

      // Execute the query and get results
      const querySnapshot = await query.get();

      // Clear the loading message
      examsList.innerHTML = "";

      if (querySnapshot.empty) {
        examsList.innerHTML = "<p>No assessments found.</p>";
        return;
      }

      // Process each document in the query results
      querySnapshot.forEach((doc) => {
        const exam = doc.data();
        const item = document.createElement("div");
        item.className = "exam-item" + (exam.archived ? " archived-item" : "");
        item.innerHTML = `
                <div>
                    <strong>Grade ${exam.grade} - ${exam.subject}</strong>
                    ${exam.archived ? '<span class="archived-badge">Archived</span>' : ""}
                    ${exam.type === "typing" ? '<span class="typing-badge">⌨️ Typing</span>' : ""}<br>
                    Password: ${exam.password}${exam.type === "typing" ? ' <span style="color:#6b7280;font-size:0.82em">(typing dispensation)</span>' : ""}<br>
                    Scheduled: ${exam.scheduledLocalTime ||
          formatDate(exam.scheduledDate, true)
          }<br>
                    Added: ${formatDate(exam.createdAt?.toDate())}<br>
                    ${exam.archived
            ? `Archived: ${formatDate(exam.archivedAt?.toDate())}`
            : ""
          }
                </div>
                <div class="exam-actions">
                    <button onclick="adminPortal.viewExamLink('${doc.id
          }')" class="view-link-btn" title="View Document">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Preview
                    </button>
                    <button onclick="adminPortal.editExamLink('${doc.id
          }')" class="edit-link-btn" title="Edit Link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit Link
                    </button>
                    <button onclick="adminPortal.copyPassword('${exam.password
          }')" class="copy-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    </button>
                    <button onclick="adminPortal.editExam('${doc.id
          }')" class="edit-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Edit Time
                    </button>
                    ${exam.archived
            ? `<button onclick="adminPortal.restoreExam('${doc.id}')" class="restore-button" title="Restore">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 2v6h6"></path>
                            <path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
                        </svg>
                        Restore
                    </button>`
            : `<button onclick="adminPortal.archiveSingleExam('${doc.id}')" class="archive-button" title="Archive">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="21 8 21 21 3 21 3 8"></polyline>
                            <rect x="1" y="3" width="22" height="5"></rect>
                            <line x1="10" y1="12" x2="14" y2="12"></line>
                        </svg>
                        Archive
                    </button>`
          }
                <button onclick="adminPortal.deleteExam('${doc.id}')" class="delete-button">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
    </svg>
    Delete
</button>
               `;
        examsList.appendChild(item);
      });
    } catch (error) {
      console.error("Error loading exams:", error);
      examsList.innerHTML = `<p>Error loading exams: ${error.message}</p>`;
    }
  }
  async archiveAll() {
    this.showConfirmDialog(
      "Are you sure you want to archive all currently visible assessments?",
      async () => {
        try {
          // Get current visible assessments
          const snapshot = await this.db
            .collection("exams")
            .where("archived", "==", false)
            .get();

          if (snapshot.empty) {
            this.showToast("No assessments to archive", "info");
            return;
          }

          // Use batched write for better performance
          const batch = this.db.batch();

          snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, {
              archived: true,
              archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
              archivedBy: this.auth.currentUser.email,
            });
          });

          await batch.commit();
          this.showToast("Successfully archived all assessments", "success");
          this.loadExams(true); // Refresh the list
        } catch (error) {
          console.error("Error archiving all assessments:", error);
          this.showToast(
            "Error archiving assessments: " + error.message,
            "error"
          );
        }
      }
    );
  }

  async restoreExam(examId) {
    try {
      await this.db.collection("exams").doc(examId).update({
        archived: false,
        restoredAt: firebase.firestore.FieldValue.serverTimestamp(),
        restoredBy: this.auth.currentUser.email,
      });
      this.showToast("Assessment restored successfully", "success");
      this.loadExams(true);
    } catch (error) {
      console.error("Error restoring exam:", error);
      this.showToast("Error restoring exam: " + error.message, "error");
    }
  }

  async archiveSingleExam(examId) {
    try {
      await this.db.collection("exams").doc(examId).update({
        archived: true,
        archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
        archivedBy: this.auth.currentUser.email,
      });
      this.showToast("Assessment archived successfully", "success");
      this.loadExams(true);
    } catch (error) {
      console.error("Error archiving exam:", error);
      this.showToast("Error archiving exam: " + error.message, "error");
    }
  }

  generatePassword() {
    const passwords = this.passwordGenerator.generateOptions(5);

    const dialog = document.createElement("div");
    dialog.className = "password-dialog";
    dialog.innerHTML = `
            <div class="password-options">
                <h3>Select a Password</h3>
                <div class="password-list">
                    ${passwords
        .map(
          (pass) => `
                        <button class="password-option" onclick="adminPortal.selectPassword('${pass}')">
                            ${pass}
                        </button>
                    `
        )
        .join("")}
                </div>
                <button class="refresh-btn" onclick="adminPortal.generatePassword()">
                    Generate More Options
                </button>
                <button class="close-btn" onclick="this.closest('.password-dialog').remove()">
                    Close
                </button>
            </div>
        `;

    document.querySelector(".password-dialog")?.remove();
    document.body.appendChild(dialog);
  }

  selectPassword(password) {
    document.getElementById("password").value = password;
    document.querySelector(".password-dialog").remove();
  }

  getExamFormData() {
    const dateInput = document.getElementById("scheduledDate").value;
    const timeInput = document.getElementById("scheduledTime").value;

    // Create Date objects that preserve the input times exactly
    const [year, month, day] = dateInput
      .split("-")
      .map((num) => parseInt(num, 10));
    const [hours, minutes] = timeInput
      .split(":")
      .map((num) => parseInt(num, 10));

    // Create a simple timestamp object with the raw values
    // This ensures we store exactly what the user entered without timezone conversions
    const timestamp = {
      year: year,
      month: month,
      day: day,
      hours: hours,
      minutes: minutes,
      raw: `${dateInput}T${timeInput}:00`,
    };

    // Create a formatted display string
    const displayDate = `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}`;
    const displayTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    const displayDateTime = `${displayDate}, ${displayTime}`;

    // Create a date object in local time zone (just for reference)
    const localDate = new Date(year, month - 1, day, hours, minutes, 0);

    const type = document.getElementById("assessmentType")?.value;
    const rawUrl = document.getElementById("driveUrl")?.value || "";
    const formData = {
      grade: Number(document.getElementById("grade")?.value),
      subject: document.getElementById("subject")?.value,
      type,
      url: type === "typing" ? this.ensureEditUrl(rawUrl) : this.formatDriveUrl(rawUrl),
      // Store the timestamp object and display strings
      scheduledTimestamp: timestamp,
      scheduledDisplayDateTime: displayDateTime,
      scheduledDisplayDate: displayDate,
      scheduledDisplayTime: displayTime,
      // Keep original ISO for backward compatibility
      scheduledDate: localDate.toISOString(),
      password: document.getElementById("password")?.value,
      archived: false,
      date: new Date().toISOString(),
    };
    // Optional timer fields — only add if set
    const readingTime = parseInt(document.getElementById("readingTime")?.value) || 0;
    const writingTime = parseInt(document.getElementById("writingTime")?.value) || 0;
    if (readingTime > 0) formData.readingTime = readingTime;
    if (writingTime > 0) formData.writingTime = writingTime;

    const optionalFields = new Set(["password"]);
    const missingFields = Object.entries(formData)
      .filter(([key, value]) => {
        if (typeof value === "boolean") return false;
        if (optionalFields.has(key)) return false;
        if (key.startsWith("scheduled") && key !== "scheduledDate")
          return false;
        return !value;
      })
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    return formData;
  }

  formatDriveUrl(url) {
    // Google Forms
    if (url.includes('forms.gle') || url.includes('docs.google.com/forms')) {
      // Ensure it's in viewform mode
      if (url.includes('/edit')) {
        return url.replace('/edit', '/viewform');
      }
      return url;
    }
    // Google Docs
    else if (url.includes('docs.google.com/document')) {
      // Convert edit URLs to preview mode
      if (url.includes('/edit')) {
        return url.replace('/edit', '/preview');
      }
      return url;
    }
    // Google Sheets
    else if (url.includes('docs.google.com/spreadsheets')) {
      if (url.includes('/edit')) {
        return url.replace('/edit', '/preview');
      }
      return url;
    }
    // Google Slides
    else if (url.includes('docs.google.com/presentation')) {
      if (url.includes('/edit')) {
        return url.replace('/edit', '/preview');
      }
      return url;
    }
    // Google Drive PDF files
    else {
      const fileId = url.match(/\/d\/(.*?)(\/|$)/)?.[1];
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
    }
  }

  setupTimeSelect() {
    const timeSelect = document.getElementById("scheduledTime");
    if (timeSelect) {
      timeSelect.addEventListener("mousedown", function () {
        if (this.options.length > 6) {
          this.size = 6;
        }
      });

      timeSelect.addEventListener("change", function () {
        this.size = 0;
      });

      timeSelect.addEventListener("blur", function () {
        this.size = 0;
      });
    }
  }

  async deleteExam(examId) {
    this.showConfirmDialog(
      "Are you sure you want to delete this exam?",
      async () => {
        try {
          await this.db.collection("exams").doc(examId).delete();
          this.showToast("Exam deleted successfully", "success");
          this.loadExams();
        } catch (error) {
          this.showToast("Error deleting exam: " + error.message, "error");
        }
      }
    );
  }

  copyPassword(password) {
    navigator.clipboard.writeText(password);
    this.showToast("Password copied to clipboard!", "success");
  }

  async generatePasswordReport() {
    const reportDate = document.getElementById("reportDate").value;
    if (!reportDate) {
      this.showToast("Please select a date", "warning");
      return;
    }

    try {
      const selectedDate = new Date(reportDate);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const snapshot = await this.db
        .collection("exams")
        .where("scheduledDate", ">=", startOfDay.toISOString())
        .where("scheduledDate", "<=", endOfDay.toISOString())
        .orderBy("scheduledDate")
        .get();

      const reportDiv = document.getElementById("passwordReport");

      if (snapshot.empty) {
        reportDiv.innerHTML = "<p>No assessments scheduled for this date.</p>";
        return;
      }

      const assessmentsByGrade = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!assessmentsByGrade[data.grade]) {
          assessmentsByGrade[data.grade] = [];
        }
        assessmentsByGrade[data.grade].push(data);
      });

      let reportHTML = `
                <h3>Passwords for ${new Date(
        reportDate
      ).toLocaleDateString()}</h3>
                <div class="password-list">
            `;

      const sortedGrades = Object.keys(assessmentsByGrade).sort(
        (a, b) => Number(a) - Number(b)
      );

      sortedGrades.forEach((grade) => {
        const assessments = assessmentsByGrade[grade];
        assessments.forEach((assessment) => {
          reportHTML += `
                        <div class="password-item">
                            <span>Grade ${grade} - ${assessment.subject}:</span>
                            <strong>${assessment.password}</strong>
                        </div>
                    `;
        });
      });

      reportHTML += `</div>
                <button onclick="adminPortal.copyPasswordReport()" class="copy-report-btn">
                    Copy All Passwords
                </button>
            `;

      reportDiv.innerHTML = reportHTML;
    } catch (error) {
      console.error("Error generating report:", error);
      this.showToast(
        "Error generating password report: " + error.message,
        "error"
      );
    }
  }

  async copyPasswordReport() {
    const reportDiv = document.getElementById("passwordReport");
    if (!reportDiv) return;

    const assessments = reportDiv.querySelectorAll(".password-item");
    const reportText = Array.from(assessments)
      .map((item) => item.textContent.trim().replace(/\s+/g, " "))
      .join("\n");

    try {
      await navigator.clipboard.writeText(reportText);
      this.showToast("Password report copied to clipboard!", "success");
    } catch (error) {
      console.error("Error copying report:", error);
      this.showToast("Error copying report: " + error.message, "error");
    }
  }

  async editExam(examId) {
    try {
      const doc = await this.db.collection("exams").doc(examId).get();
      if (!doc.exists) {
        this.showToast("Assessment not found", "error");
        return;
      }

      const exam = doc.data();

      // If we have the timestamp object, use it
      let dateValue = "";
      let timeValue = "";

      if (exam.scheduledTimestamp) {
        const ts = exam.scheduledTimestamp;
        dateValue = `${ts.year}-${ts.month.toString().padStart(2, "0")}-${ts.day
          .toString()
          .padStart(2, "0")}`;
        timeValue = `${ts.hours.toString().padStart(2, "0")}:${ts.minutes
          .toString()
          .padStart(2, "0")}`;
      } else {
        // Fallback to the old method
        const scheduledDate = new Date(exam.scheduledDate);
        dateValue = scheduledDate.toISOString().split("T")[0];
        timeValue = scheduledDate.toTimeString().slice(0, 5);
      }

      const dialog = document.createElement("div");
      dialog.className = "edit-dialog-overlay";
      dialog.innerHTML = `
                <div class="edit-dialog">
                    <h3>Edit Assessment</h3>
                    <form id="editForm" class="edit-form">
                        <div class="form-group">
                            <label>Grade ${exam.grade} - ${exam.subject}</label>
                        </div>
                        <div class="form-group">
                            <label for="editScheduledDate">Scheduled Date</label>
                            <input type="date" id="editScheduledDate" value="${dateValue}" required>
                        </div>
                        <div class="form-group">
                            <label for="editScheduledTime">Scheduled Time</label>
                            <input type="time" id="editScheduledTime" value="${timeValue}" required>
                        </div>
                        <div class="button-group">
                            <button type="submit" class="save-btn">Save Changes</button>
                            <button type="button" class="cancel-btn" onclick="this.closest('.edit-dialog-overlay').remove()">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            `;

      document.body.appendChild(dialog);

      document
        .getElementById("editForm")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const newDateInput =
            document.getElementById("editScheduledDate").value;
          const newTimeInput =
            document.getElementById("editScheduledTime").value;

          // Parse the inputs
          const [year, month, day] = newDateInput
            .split("-")
            .map((num) => parseInt(num, 10));
          const [hours, minutes] = newTimeInput
            .split(":")
            .map((num) => parseInt(num, 10));

          // Create the timestamp object
          const timestamp = {
            year: year,
            month: month,
            day: day,
            hours: hours,
            minutes: minutes,
            raw: `${newDateInput}T${newTimeInput}:00`,
          };

          // Create formatted display strings
          const displayDate = `${day.toString().padStart(2, "0")}/${month
            .toString()
            .padStart(2, "0")}/${year}`;
          const displayTime = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
          const displayDateTime = `${displayDate}, ${displayTime}`;

          // Create a local date object (for compatibility)
          const localDate = new Date(year, month - 1, day, hours, minutes, 0);

          try {
            await this.db.collection("exams").doc(examId).update({
              scheduledTimestamp: timestamp,
              scheduledDisplayDateTime: displayDateTime,
              scheduledDisplayDate: displayDate,
              scheduledDisplayTime: displayTime,
              scheduledDate: localDate.toISOString(),
            });

            this.showToast("Assessment updated successfully", "success");
            dialog.remove();
            this.loadExams();
          } catch (error) {
            console.error("Error updating assessment:", error);
            this.showToast(
              "Error updating assessment: " + error.message,
              "error"
            );
          }
        });
    } catch (error) {
      console.error("Error loading assessment for edit:", error);
      this.showToast("Error loading assessment: " + error.message, "error");
    }
  }
  async archiveCurrentAssessments() {
    this.showConfirmDialog(
      "Are you sure you want to archive all currently displayed assessments? They will be hidden from students but can be restored through filters.",
      async () => {
        try {
          const batch = this.db.batch();
          const snapshot = await this.db
            .collection("exams")
            .where("archived", "==", false)
            .get();

          if (snapshot.empty) {
            this.showToast("No assessments to archive", "info");
            return;
          }

          snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, {
              archived: true,
              archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
              archivedBy: this.auth.currentUser.email,
            });
          });

          await batch.commit();
          this.showToast("Assessments archived successfully", "success");
          this.loadExams(false);
        } catch (error) {
          console.error("Error archiving assessments:", error);
          this.showToast(
            "Error archiving assessments: " + error.message,
            "error"
          );
        }
      }
    );
  }

  async fixMissingArchivedStatus() {
    this.showConfirmDialog(
      "This will update all exams without an archived status to set them as active. Continue?",
      async () => {
        try {
          // Get ALL exams
          const snapshot = await this.db.collection("exams").get();

          if (snapshot.empty) {
            this.showToast("No exams found", "info");
            return;
          }

          const batch = this.db.batch();
          let count = 0;

          snapshot.forEach((doc) => {
            const examData = doc.data();
            // Check if archived field exists at all
            if (!examData.hasOwnProperty("archived")) {
              batch.update(doc.ref, {
                archived: false, // Set them as active by default
              });
              count++;
            }
          });

          if (count === 0) {
            this.showToast("No exams found needing update", "info");
            return;
          }

          await batch.commit();
          this.showToast(`Successfully updated ${count} exams`, "success");
          this.loadExams(true);
        } catch (error) {
          console.error("Error fixing archived status:", error);
          this.showToast("Error updating exams: " + error.message, "error");
        }
      }
    );
  }

  async checkAndArchiveOldExams() {
    try {
      const now = new Date();
      // Get exams that are either not archived or have no archive status
      const snapshot = await this.db
        .collection("exams")
        .where("archived", "in", [false, null])
        .get();

      const batch = this.db.batch();
      let count = 0;

      snapshot.forEach((doc) => {
        const exam = doc.data();
        const examDate = new Date(exam.scheduledDate);
        const hoursSinceExam = (now - examDate) / (1000 * 60 * 60);

        if (hoursSinceExam > 4) {
          // Archive if more than 4 hours old
          batch.update(doc.ref, {
            archived: true,
            archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
            archivedBy: "system",
            archiveReason: "auto-archived after 4 hours",
          });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error("Error in auto-archiving:", error);
    }
  }

  async fixExistingExams() {
    // Skip if this migration has already completed on this device
    if (localStorage.getItem("examsMigrated")) return;

    try {
      const snapshot = await this.db.collection("exams").get();
      const batch = this.db.batch();
      let count = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.hasOwnProperty("archived")) {
          batch.update(doc.ref, { archived: false });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        this.loadExams(true);
      }

      // Mark migration as done so it never runs again on this device
      localStorage.setItem("examsMigrated", "1");
    } catch (error) {
      console.error("Error fixing exams:", error);
    }
  }
}

// Initialize admin portal when document is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.adminPortal = new AdminPortal();
});

export default AdminPortal;
