export default {
  legal: {
    privacy_policy: "Privacy Policy",
    privacy: {
      responsible: "Data Controller",
      responsible_details: "OnCall Clinic (Ibiza Care SLU) with CIF B01234567",
      purpose: "Purpose",
      purpose_details: "Provision of home medical services and platform management",
      data_protection: "Data Protection",
      data_protection_details: "We implement appropriate security measures",
      rights: "Your Rights",
      rights_details: "Access, rectification, erasure and data portability"
    },
    terms: {
      general: "General Terms",
      general_details: "These terms govern the use of OnCall Clinic services",
      service: "Service Description",
      service_details: "Home medical care services through our platform",
      responsibilities: "Responsibilities",
      responsibilities_details: "User and platform obligations and responsibilities",
      modifications: "Modifications",
      modifications_details: "We reserve the right to modify these terms"
    },
    "aviso-legal": "Legal Notice", // Placeholder for legal notice content
    "politica-de-privacidad": "Privacy Policy", // Placeholder for privacy policy content
    "politica-de-cookies": "Cookie Policy", // Placeholder for cookie policy content
    "terminos-y-condiciones": "Terms and Conditions" // Placeholder for terms and conditions content

  },
  benefits: {
    title: "Why Choose OnCall Clinic",
    items: {
      fast: "Medical care at home in less than 1 hour",
      secure: "Secure online payment",
      track: "Track your doctor's location in real-time",
      verified: "Verified and licensed doctors"
    }
  },
  doctor: {
    benefits: {
      title: "Join Our Medical Network",
      earnings: "Earn up to 90% of consultation fees",
      freedom: "No fixed schedules, no clinic rental, no expenses",
      model: "100% flexible home care with verified patients"
    },
    proposal: { // Placeholder for doctor proposal content
      title: "Our Business Proposal for Doctors",
      description: "This is a brief summary of the benefits of joining our medical network.",
      link: "/propuesta-medico"
    }
  },
  auth: {
    terms_accept: "I have read and accept the privacy policy and terms of service",
    must_accept_terms: "You must accept the terms to continue",
    // Add other translation for login/registration as needed
    login: "Login",
    register: "Register"
  },
  sandbox: {
    testing_version_warning: "⚠️ This is a testing version. No real medical services are provided."
  },
  common: {
    loading: "Loading...",
    enterAddress: "Enter an address",
    error: "Error",
    success: "Success",
    retry: "Retry",
    welcome: "Welcome",
    required: "Required field",
    save: "Save",
    delete: "Delete",
    cancel: "Cancel",
    confirm: "Confirm",
    edit: "Edit",
    emailPlaceholder: "your.email@example.com",
    password: "Password",
    email: "Email",
    brand: "OnCall Clinic",
    tagline: "Healthcare at your doorstep",
    slogan: "Professional medical care. Without leaving home."
  },
  nav: {
    home: "Home",
    findDoctor: "Find a Doctor",
    appointments: "Appointments",
    login: "Login",
    register: "Register",
    profile: "Profile",
    dashboard: "Dashboard",
    logout: "Logout",
    about: "About",
    doctors: "For Doctors",
    language: "Language"
  },
  home: {
    hero: {
      title: "Healthcare at your doorstep",
      subtitle: "Professional medical care when you need it",
      cta: "Find a Doctor Now"
    },
    features: {
      title: "Why Choose OnCall Clinic",
      convenience: {
        title: "Convenience",
        description: "Get medical care without leaving your home. Our doctors come to you when you need them."
      },
      quality: {
        title: "Quality Care",
        description: "All our doctors are certified professionals with extensive experience in home medical visits."
      },
      safety: {
        title: "Safety First",
        description: "Strict health protocols and verification processes to ensure your safety and peace of mind."
      }
    },
    howItWorks: {
      title: "How It Works",
      step1: {
        title: "Find a Doctor",
        description: "Search for available doctors by specialty or location."
      },
      step2: {
        title: "Book an Appointment",
        description: "Select a convenient time and provide your address."
      },
      step3: {
        title: "Doctor Visits You",
        description: "The doctor arrives at your location at the scheduled time."
      },
      step4: {
        title: "Receive Treatment",
        description: "Get professional medical care in the comfort of your home."
      }
    },
    benefitsSection: { //Added based on user request
      title: "Benefits for Patients",
      items: [
        { icon: 'icon-home', text: t('benefits.items.fast') },
        { icon: 'icon-secure', text: t('benefits.items.secure') },
        { icon: 'icon-location', text: t('benefits.items.track') },
        { icon: 'icon-verified', text: t('benefits.items.verified') }
      ]
    }

  },
  // ... rest of the original code ...  (This is a placeholder, the rest of the original code should be pasted here)

  footer: {
    description: "OnCall Clinic connects patients with certified doctors for high-quality home medical services, when and where you need them.",
    sections: {
      navigation: "Navigation",
      legal: "Legal",
      contact: "Contact"
    },
    links: {
      "aviso-legal": t("legal.aviso-legal"),
      "politica-de-privacidad": t("legal.politica-de-privacidad"),
      "politica-de-cookies": t("legal.politica-de-cookies"),
      "terminos-y-condiciones": t("legal.terminos-y-condiciones")
    },
    address: "123 Health Street, 28001, Madrid, Spain",
    copyright: "All rights reserved."
  },
  // ... rest of the original code ... (This is a placeholder, the rest of the original code should be pasted here)

};

function t(key) {
  // Placeholder for translation function.  Replace with actual implementation
  return key;
}