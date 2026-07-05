const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const submitStatus = document.querySelector("[data-form-submit-status]");

if (contactForm) contactForm.noValidate = true;

function valueOrNotSelected(value) {
  return value || "Not selected";
}

function formPayload(form) {
  return {
    website: form.get("website") || "",
    name: form.get("name") || "",
    phone: form.get("phone") || "",
    email: form.get("email") || "",
    contactMethod: form.get("contactMethod") || "",
    contactTime: form.get("contactTime") || "",
    area: form.get("area") || "",
    service: form.get("service") || "",
    frequency: form.get("frequency") || "",
    urgency: form.get("urgency") || "",
    preferredTimes: form.get("preferredTimes") || "",
    propertyType: form.get("propertyType") || "",
    propertySize: form.get("propertySize") || "",
    bedrooms: form.get("bedrooms") || "",
    bathrooms: form.get("bathrooms") || "",
    pets: form.get("pets") || "",
    parking: form.get("parking") || "",
    products: form.get("products") || "",
    vacuum: form.get("vacuum") || "",
    mop: form.get("mop") || "",
    priorities: form.getAll("priorities"),
    message: form.get("message") || "",
    privacyAcknowledgement: Boolean(form.get("privacyAcknowledgement")),
    marketingConsent: Boolean(form.get("marketingConsent"))
  };
}

const fieldMessages = {
  name: "Please enter your name.",
  phone: "Please enter a phone number.",
  email_empty: "Please enter an email address.",
  email: "Please enter a valid email address.",
  area: "Please enter your area or postcode.",
  service: "Please choose a cleaning service.",
  privacyAcknowledgement: "Please confirm the privacy notice."
};

function fieldControl(name) {
  return contactForm?.querySelector(`[name="${name}"]`);
}

function clearFormErrors() {
  contactForm.querySelectorAll(".field-error-message").forEach((item) => item.remove());
  contactForm.querySelectorAll(".field-error-control").forEach((item) => {
    item.classList.remove("field-error-control");
    item.removeAttribute("aria-invalid");
    item.removeAttribute("aria-describedby");
  });
  contactForm.querySelectorAll(".field-error-label").forEach((item) => item.classList.remove("field-error-label"));
}

function markField(name, message, descriptionId = null) {
  const control = fieldControl(name);
  if (!control) return;
  const label = control.closest("label");
  const messageId = `field-error-${name}`;
  control.classList.add("field-error-control");
  control.setAttribute("aria-invalid", "true");

  if (message) {
    control.setAttribute("aria-describedby", messageId);
    label?.classList.add("field-error-label");

    const errorText = document.createElement("span");
    errorText.id = messageId;
    errorText.className = "field-error-message";
    errorText.textContent = message;
    label?.appendChild(errorText);
  } else if (descriptionId) {
    control.setAttribute("aria-describedby", descriptionId);
    label?.classList.add("field-error-label");
  }
}

function showFormErrors(errors) {
  clearFormErrors();
  const entries = Object.entries(errors).filter(([, message]) => message);
  entries.forEach(([field, message]) => {
    markField(field, message);
  });

  submitStatus.classList.add("error");
  // Only use unique messages for the status banner to avoid clutter
  const uniqueMessages = [...new Set(entries.map(([, message]) => message))];
  submitStatus.textContent = uniqueMessages.join(" ");

  const firstField = entries[0]?.[0];
  fieldControl(firstField)?.focus();
}

function frontendErrors(payload) {
  const errors = {};
  if (!payload.name) errors.name = fieldMessages.name;
  if (!payload.phone) errors.phone = fieldMessages.phone;
  if (!payload.email) errors.email = fieldMessages.email_empty;
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.email = fieldMessages.email;
  if (!payload.area) errors.area = fieldMessages.area;
  if (!payload.service) errors.service = fieldMessages.service;
  if (!payload.privacyAcknowledgement) errors.privacyAcknowledgement = fieldMessages.privacyAcknowledgement;
  return errors;
}

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  header.classList.toggle("is-open", isOpen);
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    header.classList.remove("is-open");
  }
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(contactForm);
  const payload = formPayload(form);
  clearFormErrors();
  submitStatus.classList.remove("error");
  const errors = frontendErrors(payload);
  if (Object.keys(errors).length) {
    showFormErrors(errors);
    return;
  }

  const subject = `New PandaZen enquiry — ${payload.area} — ${payload.name}`;
  const body = `Name: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone}
Preferred contact method: ${valueOrNotSelected(payload.contactMethod)}
Area/Postcode: ${payload.area}
Best time to contact: ${valueOrNotSelected(payload.contactTime)}
Service: ${payload.service}
Frequency: ${valueOrNotSelected(payload.frequency)}
How soon: ${valueOrNotSelected(payload.urgency)}
Preferred days/times: ${valueOrNotSelected(payload.preferredTimes)}
Property type: ${valueOrNotSelected(payload.propertyType)}
Approx size: ${valueOrNotSelected(payload.propertySize)}
Bedrooms: ${valueOrNotSelected(payload.bedrooms)}
Bathrooms: ${valueOrNotSelected(payload.bathrooms)}
Pets: ${valueOrNotSelected(payload.pets)}
Parking: ${valueOrNotSelected(payload.parking)}
Main priorities: ${payload.priorities.length ? payload.priorities.join(", ") : "Not selected"}
Products preference: ${valueOrNotSelected(payload.products)}
Vacuum/hoover supplied by: ${valueOrNotSelected(payload.vacuum)}
Mop supplied by: ${valueOrNotSelected(payload.mop)}

Message/Notes:
${valueOrNotSelected(payload.message)}

Marketing opt-in status: ${payload.marketingConsent ? "Yes" : "No"}

I understand that submitting this form is an enquiry only and does not create a confirmed booking. PandaZen will contact me to discuss availability, scope and price.`;

  const mailtoLink = `mailto:hello.pandazen@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;

  submitStatus.classList.remove("error");
  submitStatus.textContent = "Your email app should now open with your enquiry prepared. Please review and send the email to PandaZen. If your email app does not open, please email hello.pandazen@gmail.com and include your name, phone number, area/postcode and cleaning requirements.";
});

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
