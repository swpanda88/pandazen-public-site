export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();

    // Basic server-side validation
    if (!data.name || !data.email || !data.phone || !data.area || !data.service) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!data.privacyAcknowledgement) {
      return new Response(JSON.stringify({ error: "Privacy acknowledgement is required." }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" }
      });
    }

    const priorities = Array.isArray(data.priorities) ? data.priorities.join(", ") : (data.priorities || "Not specified");

    const emailHtml = `
      <h2>New Enquiry for Panda Zen</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Area/postcode:</strong> ${data.area}</p>
      <p><strong>Best way to contact:</strong> ${data.contactMethod || "Not selected"}</p>
      <p><strong>Best time to contact:</strong> ${data.contactTime || "Not selected"}</p>
      <hr>
      <p><strong>Service:</strong> ${data.service}</p>
      <p><strong>Frequency:</strong> ${data.frequency || "Not selected"}</p>
      <p><strong>How soon:</strong> ${data.urgency || "Not selected"}</p>
      <p><strong>Preferred days/times:</strong> ${data.preferredTimes || "Not selected"}</p>
      <hr>
      <p><strong>Property type:</strong> ${data.propertyType || "Not selected"}</p>
      <p><strong>Approx size:</strong> ${data.propertySize || "Not selected"}</p>
      <p><strong>Bedrooms:</strong> ${data.bedrooms || "Not selected"}</p>
      <p><strong>Bathrooms:</strong> ${data.bathrooms || "Not selected"}</p>
      <p><strong>Pets:</strong> ${data.pets || "Not selected"}</p>
      <p><strong>Parking:</strong> ${data.parking || "Not selected"}</p>
      <hr>
      <p><strong>Main priorities:</strong> ${priorities}</p>
      <p><strong>Cleaning products supplied by:</strong> ${data.products || "Not selected"}</p>
      <p><strong>Vacuum / hoover supplied by:</strong> ${data.vacuum || "Not selected"}</p>
      <p><strong>Mop supplied by:</strong> ${data.mop || "Not selected"}</p>
      <p><strong>Message/Notes:</strong> ${data.message || "None"}</p>
      <hr>
      <p><strong>Privacy acknowledgement:</strong> Yes</p>
      <p><strong>Marketing consent:</strong> ${data.marketingConsent ? "Yes" : "No"}</p>
    `;

    if (!env.RESEND_API_KEY || !env.PANDAZEN_CONTACT_EMAIL || !env.SENDING_DOMAIN_EMAIL) {
      console.error("Email service is not configured. Missing required environment variables.");
      return new Response(JSON.stringify({ ok: false, error: "Email service is not configured. Please try again later." }), { 
        status: 500, 
        headers: { "Content-Type": "application/json" }
      });
    }

    const resendPayload = {
      from: `Panda Zen Website <${env.SENDING_DOMAIN_EMAIL}>`,
      to: env.PANDAZEN_CONTACT_EMAIL,
      reply_to: data.email,
      subject: `New Panda Zen enquiry — ${data.area} — ${data.name}`,
      html: emailHtml
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(resendPayload)
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend API error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send email." }), { 
        status: 500, 
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ message: "Thanks, your request has been sent successfully." }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" }
    });
  }
}
