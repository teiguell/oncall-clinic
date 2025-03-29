const es = {
  translation: {
    nav: {
      home: "Inicio",
      doctors: "Médicos",
      dashboard: "Panel",
      profile: "Mi Perfil",
      logout: "Cerrar sesión",
      login: "Iniciar sesión",
      register: "Registrarse",
      language: "Idioma"
    },
    home: {
      hero: {
        title: "Atención médica en la puerta de tu casa",
        subtitle: "Conecta con médicos cualificados que pueden visitarte en casa",
        cta: "Encuentra un médico ahora"
      },
      features: {
        title: "Cómo funciona",
        feature1: {
          title: "Encuentra un Médico",
          description: "Busca médicos por especialidad, ubicación o disponibilidad"
        },
        feature2: {
          title: "Reserva una Visita",
          description: "Programa una visita a domicilio en tu horario y ubicación preferidos"
        },
        feature3: {
          title: "Recibe Tratamiento",
          description: "Recibe atención médica de calidad en la comodidad de tu hogar"
        }
      },
      testimonials: {
        title: "Lo que dicen nuestros usuarios",
        testimonial1: {
          text: "El médico llegó puntualmente y fue muy profesional. No tuve que salir de casa cuando me sentía tan mal.",
          author: "Sara J."
        },
        testimonial2: {
          text: "Como padre ocupado, este servicio ha sido una salvación. ¡No más salas de espera con niños enfermos!",
          author: "Miguel T."
        },
        testimonial3: {
          text: "La aplicación es fácil de usar y pude encontrar un especialista el mismo día. ¡Muy recomendable!",
          author: "Elena R."
        }
      }
    },
    doctors: {
      search: {
        title: "Encuentra un Médico",
        specialtyLabel: "Especialidad",
        specialtyPlaceholder: "Selecciona especialidad",
        locationLabel: "Ubicación",
        locationPlaceholder: "Ingresa tu dirección",
        dateLabel: "Fecha",
        datePlaceholder: "Selecciona fecha",
        searchButton: "Buscar",
        noResults: "No se encontraron médicos. Prueba con diferentes criterios de búsqueda."
      },
      card: {
        availability: "Disponible",
        unavailable: "No disponible",
        rating: "Calificación",
        viewProfile: "Ver Perfil",
        bookAppointment: "Reservar Cita"
      }
    },
    profile: {
      title: "Mi Perfil",
      personalInfo: {
        title: "Información Personal",
        firstName: "Nombre",
        lastName: "Apellidos",
        email: "Correo Electrónico",
        phone: "Número de Teléfono",
        update: "Actualizar Perfil"
      },
      locations: {
        title: "Mis Ubicaciones",
        add: "Añadir Nueva Ubicación",
        default: "Predeterminada",
        makeDefault: "Establecer como Predeterminada",
        remove: "Eliminar"
      },
      password: {
        title: "Cambiar Contraseña",
        current: "Contraseña Actual",
        new: "Nueva Contraseña",
        confirm: "Confirmar Nueva Contraseña",
        update: "Actualizar Contraseña"
      }
    },
    doctor: {
      dashboard: {
        title: "Panel del Médico",
        upcoming: "Próximas Citas",
        today: "Hoy",
        tomorrow: "Mañana",
        future: "Citas Futuras",
        past: "Citas Pasadas",
        noAppointments: "No se encontraron citas."
      },
      profile: {
        title: "Perfil del Médico",
        experience: "Experiencia",
        education: "Educación",
        specialties: "Especialidades",
        languages: "Idiomas",
        pricing: "Tarifas",
        reviews: "Opiniones de Pacientes",
        availability: "Disponibilidad"
      },
      availability: {
        title: "Gestionar Disponibilidad",
        days: {
          monday: "Lunes",
          tuesday: "Martes",
          wednesday: "Miércoles",
          thursday: "Jueves",
          friday: "Viernes",
          saturday: "Sábado",
          sunday: "Domingo"
        },
        start: "Hora de Inicio",
        end: "Hora de Fin",
        add: "Añadir Franja Horaria",
        remove: "Eliminar"
      }
    },
    patient: {
      dashboard: {
        title: "Panel del Paciente",
        upcoming: "Próximas Citas",
        past: "Citas Pasadas",
        noAppointments: "No se encontraron citas.",
        bookNew: "Reservar Nueva Cita"
      },
      booking: {
        title: "Reservar una Cita",
        doctor: "Médico",
        location: "Ubicación",
        date: "Fecha",
        time: "Hora",
        reason: "Motivo de la Visita",
        book: "Confirmar Reserva",
        paymentDetails: "Detalles de Pago",
        cardName: "Nombre en la Tarjeta",
        cardNumber: "Número de Tarjeta",
        expiry: "Fecha de Caducidad",
        cvv: "CVV",
        pay: "Pagar y Confirmar"
      }
    },
    appointment: {
      status: {
        scheduled: "Programada",
        confirmed: "Confirmada",
        en_route: "En Camino",
        arrived: "Llegó",
        in_progress: "En Progreso",
        completed: "Completada",
        cancelled: "Cancelada",
        canceled: "Cancelada"
      },
      details: {
        title: "Detalles de la Cita",
        doctor: "Médico",
        patient: "Paciente",
        date: "Fecha",
        time: "Hora",
        location: "Ubicación",
        status: "Estado",
        reason: "Motivo de la Visita",
        notes: "Notas del Médico",
        cancel: "Cancelar Cita",
        reschedule: "Reprogramar"
      },
      review: {
        title: "Dejar una Opinión",
        rating: "Calificación",
        comment: "Comentario",
        submit: "Enviar Opinión"
      }
    },
    notifications: {
      title: "Notificaciones",
      markAllRead: "Marcar Todas como Leídas",
      noNotifications: "No hay notificaciones.",
      unknown: "desconocido",
      titleLabels: {
        statusUpdate: "Actualización de Estado",
        newAppointment: "Nueva Cita",
        reminder: "Recordatorio de Cita",
        paymentSuccess: "Pago Exitoso",
        newReview: "Nueva Opinión"
      },
      appointment: {
        confirmed: "Tu cita ha sido confirmada.",
        cancelled: "Tu cita ha sido cancelada.",
        rescheduled: "Tu cita ha sido reprogramada.",
        reminder: "Recordatorio: Tienes una cita próximamente.",
        enRoute: "Tu médico está en camino.",
        arrived: "Tu médico ha llegado.",
        completed: "Tu cita ha sido completada.",
        statusUpdate: "El estado de tu cita ha sido actualizado a {{status}}.",
        new: "Tienes una nueva cita."
      },
      payment: {
        success: "Tu pago ha sido exitoso."
      },
      review: {
        received: "Has recibido una nueva opinión."
      }
    },
    auth: {
      login: {
        title: "Iniciar Sesión",
        email: "Correo Electrónico",
        password: "Contraseña",
        forgotPassword: "¿Olvidaste la Contraseña?",
        loginButton: "Iniciar Sesión",
        noAccount: "¿No tienes una cuenta?",
        signUp: "Regístrate",
        googleLogin: "Iniciar sesión con Google"
      },
      register: {
        title: "Crear una Cuenta",
        firstName: "Nombre",
        lastName: "Apellidos",
        email: "Correo Electrónico",
        password: "Contraseña",
        confirmPassword: "Confirmar Contraseña",
        userType: "Soy un",
        patient: "Paciente",
        doctor: "Médico",
        termsAgree: "Acepto los",
        terms: "Términos y Condiciones",
        registerButton: "Registrarse",
        haveAccount: "¿Ya tienes una cuenta?",
        logIn: "Iniciar Sesión"
      },
      verify: {
        title: "Verifica tu Correo Electrónico",
        message: "Hemos enviado un código de verificación a tu correo electrónico.",
        code: "Código de Verificación",
        verifyButton: "Verificar",
        resend: "Reenviar Código"
      },
      forgotPassword: {
        title: "Contraseña Olvidada",
        email: "Correo Electrónico",
        sendButton: "Enviar Enlace de Restablecimiento",
        backToLogin: "Volver a Iniciar Sesión"
      },
      resetPassword: {
        title: "Restablecer Contraseña",
        newPassword: "Nueva Contraseña",
        confirmPassword: "Confirmar Nueva Contraseña",
        resetButton: "Restablecer Contraseña"
      }
    },
    payment: {
      status: {
        pending: "Pendiente",
        paid: "Pagado",
        refunded: "Reembolsado"
      }
    },
    errors: {
      general: "Algo salió mal. Por favor, inténtalo de nuevo.",
      auth: {
        invalidCredentials: "Correo electrónico o contraseña inválidos.",
        emailInUse: "El correo electrónico ya está en uso.",
        weakPassword: "La contraseña es demasiado débil.",
        mismatchPasswords: "Las contraseñas no coinciden.",
        invalidVerificationCode: "Código de verificación inválido."
      }
    }
  }
};

export default es;