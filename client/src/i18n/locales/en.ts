export default {
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
    tagline: "Healthcare at your doorstep"
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
    }
  },
  auth: {
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    login: "Login",
    register: "Register",
    forgotPassword: "Forgot password?",
    createAccount: "Create account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    verificationCode: "Verification Code",
    verify: "Verify",
    verificationCodeSent: "Verification code has been sent to your email",
    enterVerificationCode: "Enter the verification code sent to your email",
    resetPassword: "Reset Password",
    newPassword: "New Password",
    resetPasswordInfo: "Enter your email address and we will send you a link to reset your password",
    backToLogin: "Back to login",
    registerAs: "Register as",
    patient: "Patient",
    doctor: "Doctor",
    errors: {
      emailRequired: "Email is required",
      invalidEmail: "Invalid email address format",
      passwordRequired: "Password is required",
      passwordMismatch: "Passwords do not match",
      passwordLength: "Password must be at least 8 characters",
      invalidCredentials: "Invalid email or password",
      emailExists: "Email already exists",
      weakPassword: "Password is too weak",
      formValidationError: "Please fix the errors in the form"
    }
  },
  doctorSearch: {
    title: "Find a Doctor Near You",
    searchPlaceholder: "Search by specialty, name, or condition",
    filters: {
      specialty: "Specialty",
      distance: "Distance",
      availability: "Availability",
      rating: "Rating",
      price: "Price",
      anySpecialty: "Any specialty"
    },
    yourLocation: "Your Location",
    enterAddress: "Enter your address",
    useCurrentLocation: "Use current location",
    currentLocation: "Current location",
    locationUpdated: "Location updated",
    results: {
      found: "{{count}} doctors found",
      noResults: "No doctors found",
      tryAgain: "Try adjusting your filters or changing your location to see more results."
    },
    showFilters: "Show filters",
    hideFilters: "Hide filters",
    available: "Available",
    unavailable: "Unavailable",
    viewProfile: "View Profile",
    bookAppointment: "Book Appointment"
  },
  doctorProfile: {
    about: "About",
    specialty: "Specialty",
    experience: "Experience",
    years: "{{count}} years",
    education: "Education",
    languages: "Languages",
    reviews: "Reviews",
    availability: "Availability",
    price: "Price",
    bookNow: "Book Now",
    viewMore: "View More",
    contactInfo: "Contact Information",
    location: "Location",
    bookAppointment: "Book Appointment"
  },
  appointment: {
    booking: {
      title: "Book an Appointment",
      selectDate: "Select a Date",
      selectTime: "Select a Time",
      selectLocation: "Select a Location",
      details: "Appointment Details",
      reason: "Reason for Visit",
      notes: "Additional Notes",
      review: "Review and Confirm",
      paymentInfo: "Payment Information",
      total: "Total",
      confirm: "Confirm and Pay",
      back: "Back",
      next: "Next",
      noTimesAvailable: "No available appointment times for the selected date",
      chooseAnotherDate: "Please choose another date",
      locationPrompt: "Where would you like the doctor to visit you?",
      addLocation: "Add a New Location",
      chooseExisting: "Or choose an existing location",
      success: "Appointment Booked Successfully"
    },
    status: {
      scheduled: "Scheduled",
      confirmed: "Confirmed",
      en_route: "En route",
      arrived: "Arrived",
      in_progress: "In progress",
      completed: "Completed",
      canceled: "Canceled"
    },
    details: {
      with: "Appointment with",
      on: "on",
      at: "at",
      when: "When",
      where: "Where",
      status: "Status",
      duration: "Duration",
      price: "Price",
      payment: "Payment",
      actions: "Actions",
      cancel: "Cancel Appointment",
      reschedule: "Reschedule",
      payNow: "Pay Now",
      leaveReview: "Leave a Review"
    },
    journey: {
      title: "Appointment Journey",
      eta: "Estimated arrival",
      arrivedAt: "Arrived at",
      completedAt: "Completed at"
    },
    actions: {
      confirm: "Confirm Appointment",
      startJourney: "Start Journey",
      markArrived: "Mark as Arrived",
      startConsultation: "Start Consultation",
      completeAppointment: "Complete Appointment",
      moreOptions: "More Options",
      cancel: "Cancel Appointment"
    },
    statusChange: {
      confirmDescription: "Confirm that you will attend this appointment.",
      enRouteDescription: "Let the patient know you are on your way.",
      arrivedDescription: "Mark that you have arrived at the patient's location.",
      inProgressDescription: "Start the medical consultation.",
      completedDescription: "Mark the appointment as completed.",
      success: "Appointment status updated to {{status}}",
      error: "Failed to update appointment status"
    },
    canceled: {
      patientMessage: "Your appointment with Dr. {{doctorName}} has been canceled.",
      doctorMessage: "Your appointment with {{patientName}} has been canceled."
    },
    statusControl: {
      title: "Appointment Control",
      subtitle: "Manage the current appointment"
    }
  },
  dashboard: {
    patient: {
      title: "Patient Dashboard",
      upcomingAppointments: "Upcoming Appointments",
      pastAppointments: "Past Appointments",
      medicalRecords: "Medical Records",
      payments: "Payments",
      notifications: "Notifications",
      noUpcomingAppointments: "No upcoming appointments",
      noPastAppointments: "No past appointments"
    },
    doctor: {
      title: "Doctor Dashboard",
      overview: "Overview",
      appointments: "Appointments",
      patients: "Patients",
      schedule: "My Schedule",
      earningsTitle: "Earnings",
      reviews: "Reviews",
      setAvailability: "Set Availability",
      onlineStatus: "Online Status",
      currentlyAvailable: "Currently Available",
      currentlyUnavailable: "Currently Unavailable",
      verificationStatus: "Verification Status",
      pendingVerification: "Pending Verification",
      verified: "Verified",
      rejected: "Rejected",
      todaysAppointments: "Today's Appointments",
      upcomingAppointments: "Upcoming Appointments",
      earnings: {
        total: "Total Earnings",
        pending: "Pending",
        paid: "Paid",
        commission: "Platform Commission",
        net: "Net Earnings"
      }
    }
  },
  profile: {
    personalInfo: "Personal Information",
    medicalInfo: "Medical Information",
    paymentInfo: "Payment Information",
    security: "Security & Privacy",
    preferences: "Preferences",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    dob: "Date of Birth",
    gender: "Gender",
    address: "Address",
    city: "City",
    postalCode: "Postal Code",
    country: "Country",
    updateProfile: "Update Profile",
    changePassword: "Change Password",
    twoFactorAuth: "Two-Factor Authentication",
    enable: "Enable",
    disable: "Disable",
    language: "Language",
    notifications: "Notifications",
    emailNotifications: "Email Notifications",
    smsNotifications: "SMS Notifications",
    pushNotifications: "Push Notifications"
  },
  notifications: {
    title: "Notifications",
    markAllRead: "Mark All as Read",
    noNotifications: "No notifications",
    appointment: {
      new: "New appointment request",
      confirmed: "Appointment confirmed",
      canceled: "Appointment canceled",
      reminder: "Appointment reminder",
      doctorArrived: "Doctor has arrived at your location",
      completed: "Appointment completed"
    }
  },
  error: {
    generic: "Something went wrong. Please try again.",
    notFound: "Page not found",
    notAuthorized: "You are not authorized to access this page",
    locationAccess: "Location access denied",
    enableLocationAccess: "Please enable location access in your browser settings to use this feature",
    mapLoadFailed: "Failed to load map. Please try again later."
  },
  footer: {
    description: "OnCall Clinic connects patients with certified doctors for high-quality home medical services, when and where you need them.",
    sections: {
      navigation: "Navigation",
      legal: "Legal",
      contact: "Contact"
    },
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    address: "123 Health Street, 28001, Madrid, Spain",
    copyright: "All rights reserved."
  },
  login: {
    title: "Welcome Back",
    subtitle: "Sign in to your account",
    rememberMe: "Remember me",
    success: "Login successful",
    error: "Login failed",
    invalidCredentials: "Invalid email or password",
    accountNotVerified: "Your account is not verified. Please check your email for verification instructions.",
    verificationRequired: "Verification Required"
  },
  verification: {
    title: "Verify Your Email",
    subtitle: "We've sent a verification code to your email",
    instructions: "Please enter the 6-digit code to verify your account",
    verify: "Verify",
    resendCode: "Resend code",
    success: "Email verified successfully",
    error: "Verification failed",
    codeExpired: "Verification code has expired",
    invalidCode: "Invalid verification code"
  },
  twoFactor: {
    title: "Two-Factor Authentication",
    subtitle: "Enter the code sent to your device",
    instructions: "Please enter the 6-digit authentication code",
    verify: "Verify",
    resendCode: "Resend code"
  }
};