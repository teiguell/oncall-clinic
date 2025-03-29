const en = {
  translation: {
    nav: {
      home: "Home",
      doctors: "Doctors",
      dashboard: "Dashboard",
      profile: "My Profile",
      logout: "Log out",
      login: "Log in",
      register: "Sign up",
      language: "Language"
    },
    home: {
      hero: {
        title: "Medical care at your doorstep",
        subtitle: "Connect with qualified doctors who can visit you at home",
        cta: "Find a doctor now"
      },
      features: {
        title: "How it works",
        feature1: {
          title: "Find a Doctor",
          description: "Search for doctors by specialty, location, or availability"
        },
        feature2: {
          title: "Book a Visit",
          description: "Schedule a house call at your preferred time and location"
        },
        feature3: {
          title: "Get Treatment",
          description: "Receive quality medical care in the comfort of your home"
        }
      },
      testimonials: {
        title: "What our users say",
        testimonial1: {
          text: "The doctor arrived promptly and was very professional. I didn't have to leave my home when I was feeling so ill.",
          author: "Sarah J."
        },
        testimonial2: {
          text: "As a busy parent, this service has been a lifesaver. No more waiting rooms with sick children!",
          author: "Michael T."
        },
        testimonial3: {
          text: "The app is easy to use and I was able to find a specialist the same day. Highly recommended!",
          author: "Elena R."
        }
      }
    },
    doctors: {
      search: {
        title: "Find a Doctor",
        specialtyLabel: "Specialty",
        specialtyPlaceholder: "Select specialty",
        locationLabel: "Location",
        locationPlaceholder: "Enter your address",
        dateLabel: "Date",
        datePlaceholder: "Select date",
        searchButton: "Search",
        noResults: "No doctors found. Try different search criteria."
      },
      card: {
        availability: "Available",
        unavailable: "Unavailable",
        rating: "Rating",
        viewProfile: "View Profile",
        bookAppointment: "Book Appointment"
      }
    },
    profile: {
      title: "My Profile",
      personalInfo: {
        title: "Personal Information",
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        phone: "Phone Number",
        update: "Update Profile"
      },
      locations: {
        title: "My Locations",
        add: "Add New Location",
        default: "Default",
        makeDefault: "Make Default",
        remove: "Remove"
      },
      password: {
        title: "Change Password",
        current: "Current Password",
        new: "New Password",
        confirm: "Confirm New Password",
        update: "Update Password"
      }
    },
    doctor: {
      dashboard: {
        title: "Doctor Dashboard",
        upcoming: "Upcoming Appointments",
        today: "Today",
        tomorrow: "Tomorrow",
        future: "Future Appointments",
        past: "Past Appointments",
        noAppointments: "No appointments found."
      },
      profile: {
        title: "Doctor Profile",
        experience: "Experience",
        education: "Education",
        specialties: "Specialties",
        languages: "Languages",
        pricing: "Pricing",
        reviews: "Patient Reviews",
        availability: "Availability"
      },
      availability: {
        title: "Manage Availability",
        days: {
          monday: "Monday",
          tuesday: "Tuesday",
          wednesday: "Wednesday",
          thursday: "Thursday",
          friday: "Friday",
          saturday: "Saturday",
          sunday: "Sunday"
        },
        start: "Start Time",
        end: "End Time",
        add: "Add Time Slot",
        remove: "Remove"
      }
    },
    patient: {
      dashboard: {
        title: "Patient Dashboard",
        upcoming: "Upcoming Appointments",
        past: "Past Appointments",
        noAppointments: "No appointments found.",
        bookNew: "Book New Appointment"
      },
      booking: {
        title: "Book an Appointment",
        doctor: "Doctor",
        location: "Location",
        date: "Date",
        time: "Time",
        reason: "Reason for Visit",
        book: "Confirm Booking",
        paymentDetails: "Payment Details",
        cardName: "Name on Card",
        cardNumber: "Card Number",
        expiry: "Expiry Date",
        cvv: "CVV",
        pay: "Pay and Confirm"
      }
    },
    appointment: {
      status: {
        scheduled: "Scheduled",
        confirmed: "Confirmed",
        en_route: "En Route",
        arrived: "Arrived",
        in_progress: "In Progress",
        completed: "Completed",
        cancelled: "Cancelled",
        canceled: "Cancelled"
      },
      details: {
        title: "Appointment Details",
        doctor: "Doctor",
        patient: "Patient",
        date: "Date",
        time: "Time",
        location: "Location",
        status: "Status",
        reason: "Reason for Visit",
        notes: "Doctor's Notes",
        cancel: "Cancel Appointment",
        reschedule: "Reschedule"
      },
      review: {
        title: "Leave a Review",
        rating: "Rating",
        comment: "Comment",
        submit: "Submit Review"
      }
    },
    notifications: {
      title: "Notifications",
      markAllRead: "Mark All as Read",
      noNotifications: "No notifications.",
      unknown: "unknown",
      titleLabels: {
        statusUpdate: "Status Update",
        newAppointment: "New Appointment",
        reminder: "Appointment Reminder",
        paymentSuccess: "Payment Successful",
        newReview: "New Review"
      },
      appointment: {
        confirmed: "Your appointment has been confirmed.",
        cancelled: "Your appointment has been cancelled.",
        rescheduled: "Your appointment has been rescheduled.",
        reminder: "Reminder: You have an upcoming appointment.",
        enRoute: "Your doctor is on the way.",
        arrived: "Your doctor has arrived.",
        completed: "Your appointment has been completed.",
        statusUpdate: "Your appointment status has been updated to {{status}}.",
        new: "You have a new appointment."
      },
      payment: {
        success: "Your payment was successful."
      },
      review: {
        received: "You received a new review."
      }
    },
    auth: {
      login: {
        title: "Log In",
        email: "Email",
        password: "Password",
        forgotPassword: "Forgot Password?",
        loginButton: "Log In",
        noAccount: "Don't have an account?",
        signUp: "Sign Up",
        googleLogin: "Log in with Google"
      },
      register: {
        title: "Create an Account",
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        userType: "I am a",
        patient: "Patient",
        doctor: "Doctor",
        termsAgree: "I agree to the",
        terms: "Terms and Conditions",
        registerButton: "Sign Up",
        haveAccount: "Already have an account?",
        logIn: "Log In"
      },
      verify: {
        title: "Verify Your Email",
        message: "We've sent a verification code to your email.",
        code: "Verification Code",
        verifyButton: "Verify",
        resend: "Resend Code"
      },
      forgotPassword: {
        title: "Forgot Password",
        email: "Email",
        sendButton: "Send Reset Link",
        backToLogin: "Back to Login"
      },
      resetPassword: {
        title: "Reset Password",
        newPassword: "New Password",
        confirmPassword: "Confirm New Password",
        resetButton: "Reset Password"
      }
    },
    payment: {
      status: {
        pending: "Pending",
        paid: "Paid",
        refunded: "Refunded"
      }
    },
    errors: {
      general: "Something went wrong. Please try again.",
      auth: {
        invalidCredentials: "Invalid email or password.",
        emailInUse: "Email is already in use.",
        weakPassword: "Password is too weak.",
        mismatchPasswords: "Passwords do not match.",
        invalidVerificationCode: "Invalid verification code."
      }
    }
  }
};

export default en;