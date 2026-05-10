/* ============================================================
   YAPPA Foundation — script.js
   ============================================================ */

// ============================================================
// KONFIGURASI SUPABASE
// ============================================================
const SUPABASE_URL       = "https://jdzwkhmgfenmxpkkjikk.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_nmu6tsYcqZxpAJ1M9unE9A_SDtlYYNE";

// ============================================================
// 1. HAMBURGER MENU
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navLinks  = document.querySelector(".nav-links");
  const navBtns   = document.querySelector(".nav-btns");

  if (!hamburger) return;

  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("active");
    if (navLinks) navLinks.classList.toggle("active");
    if (navBtns)  navBtns.classList.toggle("active");
  });

  // Tutup menu saat klik link navigasi
  if (navLinks) {
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
        if (navBtns) navBtns.classList.remove("active");
      });
    });
  }
});

// ============================================================
// 2. AOS INIT
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  AOS.init({ duration: 600, once: true, offset: 0 });
});

// ============================================================
// 3. HERO SLIDESHOW (index)
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".hero-slide");
  const dots   = document.querySelectorAll(".hero-dots .dot");

  if (slides.length === 0) return;

  let slideIndex = 0;
  let slideTimer;

  function showSlide(index) {
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    slideIndex = index;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === slideIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === slideIndex);
    });
  }

  function startAutoSlide() {
    clearInterval(slideTimer);
    slideTimer = setInterval(function () { showSlide(slideIndex + 1); }, 5000);
  }

  // Klik dots
  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      startAutoSlide();
    });
  });

  showSlide(0);
  startAutoSlide();
});

// ============================================================
// 4. VOLUNTEER MODAL
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  const modal       = document.getElementById("volunteerModal");
  const openBtns    = document.querySelectorAll(".open-volunteer");
  const closeBtn    = document.querySelector(".close-btn");
  const volunteerForm = document.getElementById("volunteerForm");
  const popup       = document.getElementById("registrationPopup");

  if (!modal) return;

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

  // Buka modal
  openBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      modal.classList.add("show");
      document.body.style.overflow = "hidden";
    });
  });

  // Tutup modal via tombol X
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Tutup modal via klik backdrop
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  // Tutup modal via ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  function closeModal() {
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  // Submit form volunteer
  if (!volunteerForm) return;

  volunteerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstName  = document.getElementById("firstName").value.trim();
    const lastName   = document.getElementById("lastName").value.trim();
    const phone      = document.getElementById("phone").value.trim();
    const email      = document.getElementById("email").value.trim();
    const address    = document.getElementById("address").value.trim();
    const age        = document.getElementById("age").value.trim();
    const motivation = document.getElementById("motivation").value.trim();
    const submitBtn  = volunteerForm.querySelector(".btn-submit");

    if (!firstName || !lastName || !phone || !email || !address || !age || !motivation) {
      alert("Please fill all fields!");
      return;
    }

    submitBtn.disabled    = true;
    submitBtn.textContent = "Submitting...";

    const { error } = await supabase.from("volunteer").insert([{
      first_name:  firstName,
      last_name:   lastName,
      phone_number: phone,
      email,
      address,
      age: Number(age),
      motivation,
    }]);

    if (error) {
      console.error("Supabase volunteer error:", error);
      alert("Registration failed. Please try again.");
      submitBtn.disabled    = false;
      submitBtn.textContent = "Submit";
      return;
    }

    closeModal();
    if (popup) popup.style.display = "flex";

    volunteerForm.reset();
    submitBtn.disabled    = false;
    submitBtn.textContent = "Submit";
  });
});

// ============================================================
// 5. POPUP HELPERS (global, dipanggil dari onclick HTML)
// ============================================================
function closeRegistrationPopup() {
  const popup = document.getElementById("registrationPopup");
  if (popup) popup.style.display = "none";
}

function closeDonationPopup() {
  const popup = document.getElementById("donationPopup");
  if (popup) popup.style.display = "none";
}

// ============================================================
// 6. NEWS SEARCH & FILTER
// ============================================================
(function () {
  const input          = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchBtn      = document.getElementById("searchBtn");
  const cards          = document.querySelectorAll(".news-card");
  const noResult       = document.getElementById("noResult");

  if (cards.length === 0) return;

  function getCategoryByTitle(title) {
    const t = title.toLowerCase();
    if (t.includes("bni") || t.includes("pelindo") || t.includes("elnusa")) return "partnership";
    if (
      t.includes("pesantren") || t.includes("islamic boarding") ||
      t.includes("competitions") || t.includes("cooperative") ||
      t.includes("rat") || t.includes("humanitarian") || t.includes("admission")
    ) return "programs";
    return "events";
  }

  function filterNews() {
    const keyword  = input ? input.value.toLowerCase().trim() : "";
    const category = categoryFilter ? categoryFilter.value : "all";
    let found = false;

    cards.forEach(function (card) {
      const title = (card.querySelector("h3") || {}).textContent || "";
      const desc  = (card.querySelector("p")  || {}).textContent || "";
      const cardCat = card.dataset.category || getCategoryByTitle(title);

      const matchSearch   = keyword === "" || title.toLowerCase().includes(keyword) || desc.toLowerCase().includes(keyword);
      const matchCategory = category === "all" || cardCat === category;
      const show = matchSearch && matchCategory;

      card.style.display = show ? "" : "none";
      if (show) found = true;
    });

    if (noResult) noResult.style.display = found ? "none" : "block";
  }

  if (categoryFilter) categoryFilter.addEventListener("change", filterNews);
  if (searchBtn) searchBtn.addEventListener("click", function (e) { e.preventDefault(); filterNews(); });

  // Auto-filter dari URL param ?category=...
  const urlParams      = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get("category");
  if (categoryFromUrl && categoryFilter && ["events","programs","partnership"].includes(categoryFromUrl)) {
    categoryFilter.value = categoryFromUrl;
    window.history.replaceState({}, document.title, "news.html");
  }

  filterNews();
})();

// ============================================================
// 7. GALLERY SEARCH & MONTHLY FILTER
// ============================================================
(function () {
  const searchInput   = document.getElementById("gallerySearchInput");
  const monthFilter   = document.getElementById("galleryMonthFilter");
  const searchBtn     = document.getElementById("gallerySearchBtn");
  const galleryItems  = document.querySelectorAll(".gallery-item");
  const noResult      = document.getElementById("galleryNoResult");

  if (galleryItems.length === 0) return;

  const monthNames = ["January","February","March","April","May","June",
                      "July","August","September","October","November","December"];

  function getDateText(item) {
    const el = item.querySelector(".overlay p");
    return el ? el.textContent.replace("Date:", "").trim() : "";
  }

  function parseDate(dateText) {
    const parts = dateText.split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return {
      value: `${year}-${month}`,
      label: `${monthNames[Number(month) - 1]} ${year}`,
    };
  }

  function buildMonthFilter() {
    if (!monthFilter) return;
    const months = new Map();

    galleryItems.forEach(function (item) {
      const parsed = parseDate(getDateText(item));
      if (parsed) months.set(parsed.value, parsed.label);
    });

    Array.from(months.entries())
      .sort(function (a, b) { return b[0].localeCompare(a[0]); })
      .forEach(function ([value, label]) {
        const opt = document.createElement("option");
        opt.value   = value;
        opt.textContent = label;
        monthFilter.appendChild(opt);
      });
  }

  function filterGallery() {
    const keyword      = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedMonth = monthFilter ? monthFilter.value : "all";
    let found = false;

    galleryItems.forEach(function (item) {
      const title     = ((item.querySelector(".overlay h4") || {}).textContent || "").toLowerCase();
      const dateText  = getDateText(item).toLowerCase();
      const parsed    = parseDate(getDateText(item));
      const monthLabel = parsed ? parsed.label.toLowerCase() : "";

      const matchSearch = keyword === "" || `${title} ${dateText} ${monthLabel}`.includes(keyword);
      const matchMonth  = selectedMonth === "all" || (parsed && parsed.value === selectedMonth);
      const show = matchSearch && matchMonth;

      item.style.display = show ? "" : "none";
      if (show) found = true;
    });

    if (noResult) noResult.style.display = found ? "none" : "block";
  }

  buildMonthFilter();
  if (monthFilter) monthFilter.addEventListener("change", filterGallery);
  if (searchBtn)   searchBtn.addEventListener("click", function (e) { e.preventDefault(); filterGallery(); });
  filterGallery();
})();

// ============================================================
// 8. NEWS MODAL (Read More)
// ============================================================
(function () {
  const newsModal   = document.getElementById("newsModal");
  const newsTitle   = document.getElementById("newsTitle");
  const newsImage   = document.getElementById("newsImage");
  const newsDate    = document.getElementById("newsDate");
  const newsDesc    = document.getElementById("newsDesc");
  const closeNewsBtn = document.querySelector(".close-news");
  const backNewsBtn  = document.querySelector(".btn-back");

  if (!newsModal) return;

  function closeNewsModal() {
    newsModal.style.display = "none";
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".read-more").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (!newsTitle || !newsImage || !newsDate || !newsDesc) return;

      newsTitle.textContent = this.dataset.title;
      newsImage.src         = this.dataset.image;
      newsDate.innerHTML    = "📅 <span>" + this.dataset.date + "</span>";
      newsDesc.innerHTML    = this.dataset.desc.replace(/\n/g, "<br><br>");

      newsModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  if (closeNewsBtn) closeNewsBtn.addEventListener("click", closeNewsModal);
  if (backNewsBtn)  backNewsBtn.addEventListener("click",  closeNewsModal);

  newsModal.addEventListener("click", function (e) {
    if (e.target === newsModal) closeNewsModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNewsModal();
  });
})();

// ============================================================
// 9. CONTACT — SEND MESSAGE
// ============================================================
(function () {
  const messageForm     = document.getElementById("messageForm");
  const messageSubmitBtn = document.getElementById("messageSubmitBtn");

  if (!messageForm) return;

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

  messageForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstName   = document.getElementById("contactFirstName").value.trim();
    const lastName    = document.getElementById("contactLastName").value.trim();
    const email       = document.getElementById("contactEmail").value.trim();
    const phoneNumber = document.getElementById("contactPhoneNumber").value.trim();
    const message     = document.getElementById("contactMessage").value.trim();

    if (!firstName || !email || !message) {
      alert("Please fill in First Name, Email, and Message.");
      return;
    }

    messageSubmitBtn.disabled    = true;
    messageSubmitBtn.textContent = "Sending...";

    const { error } = await supabase.from("message").insert([{
      first_name:   firstName,
      last_name:    lastName,
      email,
      phone_number: phoneNumber,
      message,
    }]);

    if (error) {
      console.error("Supabase message error:", error);
      alert("Message failed to send. Please try again.");
      messageSubmitBtn.disabled    = false;
      messageSubmitBtn.textContent = "Send Message";
      return;
    }

    alert("Message sent successfully!");
    messageForm.reset();
    messageSubmitBtn.disabled    = false;
    messageSubmitBtn.textContent = "Send Message";
  });
})();

// ============================================================
// 10. DONATION — AMOUNT BUTTONS
// ============================================================
(function () {
  const amountBtns = document.querySelectorAll(".amount-buttons button");
  if (amountBtns.length === 0) return;

  amountBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      amountBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
    });
  });
})();

// ============================================================
// 11. DONATION — PAYMENT METHOD
// ============================================================
(function () {
  const paymentOptions = document.querySelectorAll(".payment-option");
  const detailBox      = document.getElementById("payment-detail");

  if (paymentOptions.length === 0) return;

  paymentOptions.forEach(function (option) {
    option.addEventListener("click", function () {
      paymentOptions.forEach(function (o) { o.classList.remove("active"); });
      option.classList.add("active");

      if (!detailBox) return;

      if (option.dataset.method === "bank") {
        detailBox.innerHTML = `
          <div class="payment-detail-box" style="margin-top:12px;padding:14px;background:#f8fbff;border-radius:8px;font-size:14px;">
            <p><strong>Bank BCA</strong><br>No. Rek: 6110596764</p>
            <p style="margin-top:8px;"><strong>Bank BSI</strong><br>No. Rek: 7081684477</p>
            <p style="margin-top:8px;"><strong>Atas Nama:</strong> Yayasan Yappa</p>
          </div>`;
      } else if (option.dataset.method === "ewallet") {
        detailBox.innerHTML = `
          <div class="payment-detail-box" style="margin-top:12px;text-align:center;">
            <p style="margin-bottom:8px;">Scan QRIS below</p>
            <img src="images/qris.png" width="150" style="margin:0 auto;">
          </div>`;
      }
    });
  });
})();

// ============================================================
// 12. DONATION — IMPACT CARD & FORM LOGIC
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  const impactCards    = document.querySelectorAll(".impact-card");
  const formSection    = document.querySelector(".donation-form-section");
  const selectedText   = document.getElementById("selectedImpact");
  const impactFields   = document.getElementById("impactFields");
  const donationBox    = document.querySelector(".donation-box");
  const donationBtn    = document.getElementById("donationSubmit");
  const donationPopup  = document.getElementById("donationPopup");
  const detailBox      = document.getElementById("payment-detail");

  // Guard: hanya jalan di halaman donation
  if (!donationBtn) return;

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

  let currentCategory = "";

  const amountSection  = document.querySelector(".amount-buttons")?.parentElement;
  const paymentOptions = document.querySelectorAll(".payment-option");

  // Klik impact card
  impactCards.forEach(function (card) {
    card.addEventListener("click", function () {
      impactCards.forEach(function (c) { c.classList.remove("active"); });
      card.classList.add("active");

      currentCategory = card.dataset.impact;
      if (formSection) formSection.scrollIntoView({ behavior: "smooth" });

      // Reset state
      donationBox.classList.remove("blue", "purple", "green");
      paymentOptions.forEach(function (p) { p.classList.remove("active"); });
      document.querySelectorAll(".amount-buttons button").forEach(function (b) { b.classList.remove("active"); });
      if (detailBox) detailBox.innerHTML = "";

      if (currentCategory === "education") {
        donationBox.classList.add("blue");
        renderEducation();
        togglePayment(true);
      } else if (currentCategory === "daily") {
        donationBox.classList.add("purple");
        renderDaily();
      } else if (currentCategory === "health") {
        donationBox.classList.add("green");
        renderHealth();
        togglePayment(true);
      }
    });
  });

  function renderEducation() {
    if (selectedText) selectedText.textContent = "Selected Impact: Education Support";
    if (!impactFields) return;
    impactFields.innerHTML = `
      <h4>Education Support</h4>
      <label>Type of Support</label>
      <select style="width:100%;padding:12px;margin-bottom:14px;border-radius:8px;border:1px solid #d1d5db;font-size:14px;">
        <option>School Supplies</option>
        <option>Tuition Fee</option>
        <option>Books & Learning Materials</option>
        <option>Scholarship</option>
      </select>
      <label>Purpose (Optional)</label>
      <input type="text" placeholder="School uniform / Monthly tuition">`;
  }

  function renderHealth() {
    if (selectedText) selectedText.textContent = "Selected Impact: Healthcare";
    if (!impactFields) return;
    impactFields.innerHTML = `
      <h4>Healthcare Support</h4>
      <label>Type of Support</label>
      <select style="width:100%;padding:12px;margin-bottom:14px;border-radius:8px;border:1px solid #d1d5db;font-size:14px;">
        <option>Medical Checkup</option>
        <option>Treatment Support</option>
        <option>Nutrition Support</option>
        <option>Emergency Aid</option>
      </select>
      <label>Notes (Optional)</label>
      <input type="text" placeholder="Medical assistance / Nutrition support">`;
  }

  function renderDaily() {
    if (selectedText) selectedText.textContent = "Selected Impact: Daily Needs";
    if (!impactFields) return;
    impactFields.innerHTML = `
      <h4>Daily Needs</h4>
      <label>Donation Type</label>
      <select id="donationType" style="width:100%;padding:12px;margin-bottom:14px;border-radius:8px;border:1px solid #d1d5db;font-size:14px;">
        <option value="money">Monetary Donation</option>
        <option value="item">Direct Item Donation</option>
      </select>
      <div id="dailyDynamic"></div>`;

    document.getElementById("donationType").addEventListener("change", handleDailyType);
    handleDailyType();
  }

  function handleDailyType() {
    const type      = document.getElementById("donationType").value;
    const container = document.getElementById("dailyDynamic");
    if (!container) return;

    if (type === "money") {
      container.innerHTML = `
        <label>Type of Support</label>
        <select style="width:100%;padding:12px;margin-bottom:14px;border-radius:8px;border:1px solid #d1d5db;font-size:14px;">
          <option>Food Package (Sembako)</option>
          <option>Clothing Support</option>
          <option>Hygiene Kit</option>
          <option>General Needs</option>
        </select>
        <label>Details (Optional)</label>
        <input type="text" placeholder="Food for 1 month">`;
      togglePayment(true);
    } else {
      container.innerHTML = `
        <label>Type of Donation</label>
        <select style="width:100%;padding:12px;margin-bottom:14px;border-radius:8px;border:1px solid #d1d5db;font-size:14px;">
          <option>Clothes</option>
          <option>Food (Sembako)</option>
          <option>Hygiene Items</option>
          <option>General Needs</option>
        </select>
        <label>Details (Optional)</label>
        <input type="text" placeholder="Kids clothes">
        <p style="font-size:13px;color:#6b7280;margin-top:8px;">
          You may bring your donation items directly to YAPPA Foundation.
        </p>`;
      togglePayment(false);
    }
  }

  function togglePayment(show) {
    if (amountSection)   amountSection.style.display = show ? "block" : "none";
    paymentOptions.forEach(function (el) { el.style.display = show ? "block" : "none"; });
  }

  // Submit donasi
  donationBtn.addEventListener("click", async function () {
    if (!currentCategory) { alert("Pilih kategori donasi dulu!"); return; }

    const firstName = document.getElementById("donFirstName").value.trim();
    const lastName  = document.getElementById("donLastName").value.trim();
    const email     = document.getElementById("donEmail").value.trim();
    const phone     = document.getElementById("donPhone").value.trim();
    const message   = document.getElementById("donMessage").value.trim();

    if (!firstName || !email || !phone) {
      alert("First Name, Email, and Phone are required!");
      return;
    }

    const activeBtn    = document.querySelector(".amount-buttons button.active");
    const customAmount = (document.getElementById("customAmount") || {}).value || "";
    let amount = null;
    if (activeBtn)    amount = activeBtn.textContent.replace(/[^\d]/g, "");
    else if (customAmount) amount = customAmount.replace(/[^\d]/g, "");

    const activePayment = document.querySelector(".payment-option.active");
    const paymentMethod = activePayment ? activePayment.dataset.method : null;

    const select      = document.querySelector("#impactFields select");
    const supportType = select ? select.value : null;

    const detailInput = document.querySelector("#impactFields input[type='text']");
    const details     = detailInput ? detailInput.value : null;

    const donationTypeEl = document.getElementById("donationType");
    const donationType   = donationTypeEl ? donationTypeEl.value : "money";

    if (currentCategory !== "daily" || donationType === "money") {
      if (!amount)        { alert("Masukkan nominal donasi!"); return; }
      if (!paymentMethod) { alert("Pilih metode pembayaran!"); return; }
    }

    donationBtn.disabled    = true;
    donationBtn.textContent = "Processing...";

    const { error } = await supabase.from("donations").insert([{
      category:       currentCategory,
      donation_type:  donationType,
      support_type:   supportType,
      details,
      first_name:     firstName,
      last_name:      lastName,
      email,
      phone_number:   phone,
      amount:         amount ? Number(amount) : null,
      payment_method: paymentMethod,
      message,
    }]);

    if (error) {
      console.error("Supabase donation error:", error);
      alert("Donasi gagal! Silakan coba lagi.");
      donationBtn.disabled    = false;
      donationBtn.textContent = "Complete Donation";
      return;
    }

    // Reset form
    document.querySelectorAll(".donation-form-section input, .donation-form-section textarea")
      .forEach(function (el) { el.value = ""; });
    document.querySelectorAll(".amount-buttons button").forEach(function (b) { b.classList.remove("active"); });
    document.querySelectorAll(".payment-option").forEach(function (p) { p.classList.remove("active"); });
    if (detailBox) detailBox.innerHTML = "";
    impactCards.forEach(function (c) { c.classList.remove("active"); });
    donationBox.classList.remove("blue", "purple", "green");
    if (impactFields) impactFields.innerHTML = "";
    if (selectedText) selectedText.textContent = "";
    currentCategory = "";

    donationBtn.disabled    = false;
    donationBtn.textContent = "Complete Donation";

    // Tampilkan popup sukses
    if (donationPopup) donationPopup.style.display = "flex";
  });
});