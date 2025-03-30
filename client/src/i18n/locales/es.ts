export default {
  common: {
    loading: "Cargando...",
    enterAddress: "Introduce una dirección",
    error: "Error",
    success: "Éxito",
    retry: "Reintentar",
    welcome: "Bienvenido",
    required: "Campo obligatorio",
    save: "Guardar",
    delete: "Eliminar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    edit: "Editar",
    emailPlaceholder: "tu.correo@ejemplo.com",
    password: "Contraseña",
    email: "Correo electrónico",
    brand: "OnCall Clinic",
    tagline: "Asistencia médica en tu puerta"
  },
  nav: {
    home: "Inicio",
    findDoctor: "Buscar Médico",
    appointments: "Citas",
    login: "Iniciar sesión",
    register: "Registrarse",
    profile: "Perfil",
    dashboard: "Panel de control",
    logout: "Cerrar sesión",
    doctors: "Para Médicos",
    language: "Idioma"
  },
  home: {
    hero: {
      title: "Atención médica en tu puerta",
      subtitle: "Cuidado profesional cuando lo necesitas",
      cta: "Buscar un Médico Ahora"
    },
    features: {
      title: "¿Por qué elegir OnCall Clinic?",
      convenience: {
        title: "Comodidad",
        description: "Recibe atención médica sin salir de casa. Nuestros médicos vienen a ti cuando los necesitas."
      },
      quality: {
        title: "Atención de Calidad",
        description: "Todos nuestros médicos son profesionales certificados con amplia experiencia en visitas médicas a domicilio."
      },
      safety: {
        title: "Seguridad Primero",
        description: "Protocolos de salud estrictos y procesos de verificación para garantizar tu seguridad y tranquilidad."
      }
    },
    howItWorks: {
      title: "Cómo Funciona",
      step1: {
        title: "Encuentra un Médico",
        description: "Busca médicos disponibles por especialidad o ubicación."
      },
      step2: {
        title: "Reserva una Cita",
        description: "Selecciona un horario conveniente y proporciona tu dirección."
      },
      step3: {
        title: "El Médico te Visita",
        description: "El médico llega a tu ubicación a la hora programada."
      },
      step4: {
        title: "Recibe Tratamiento",
        description: "Obtén atención médica profesional en la comodidad de tu hogar."
      }
    }
  },
  auth: {
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    login: "Iniciar sesión",
    register: "Registrarse",
    forgotPassword: "¿Olvidaste tu contraseña?",
    createAccount: "Crear cuenta",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    dontHaveAccount: "¿No tienes una cuenta?",
    verificationCode: "Código de verificación",
    verify: "Verificar",
    verificationCodeSent: "El código de verificación ha sido enviado a tu correo electrónico",
    enterVerificationCode: "Introduce el código de verificación enviado a tu correo",
    resetPassword: "Restablecer contraseña",
    newPassword: "Nueva contraseña",
    resetPasswordInfo: "Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña",
    backToLogin: "Volver al inicio de sesión",
    registerAs: "Registrarse como",
    patient: "Paciente",
    doctor: "Médico",
    errors: {
      emailRequired: "El correo electrónico es obligatorio",
      invalidEmail: "Formato de correo electrónico no válido",
      passwordRequired: "La contraseña es obligatoria",
      passwordMismatch: "Las contraseñas no coinciden",
      passwordLength: "La contraseña debe tener al menos 8 caracteres",
      invalidCredentials: "Correo o contraseña no válidos",
      emailExists: "El correo ya está en uso",
      weakPassword: "La contraseña es demasiado débil",
      formValidationError: "Por favor, corrige los errores en el formulario"
    }
  },
  doctorSearch: {
    title: "Encuentra un Médico Cerca de Ti",
    searchPlaceholder: "Buscar por especialidad, nombre o condición",
    filters: {
      specialty: "Especialidad",
      distance: "Distancia",
      availability: "Disponibilidad",
      rating: "Valoración",
      price: "Precio",
      anySpecialty: "Cualquier especialidad"
    },
    yourLocation: "Tu Ubicación",
    enterAddress: "Introduce tu dirección",
    useCurrentLocation: "Usar ubicación actual",
    currentLocation: "Ubicación actual",
    locationUpdated: "Ubicación actualizada",
    results: {
      found: "{{count}} médicos encontrados",
      noResults: "No se encontraron médicos",
      tryAgain: "Intenta ajustar tus filtros o cambiar tu ubicación para ver más resultados."
    },
    showFilters: "Mostrar filtros",
    hideFilters: "Ocultar filtros",
    available: "Disponible",
    unavailable: "No disponible",
    viewProfile: "Ver Perfil",
    bookAppointment: "Reservar Cita"
  },
  doctorProfile: {
    about: "Acerca de",
    specialty: "Especialidad",
    experience: "Experiencia",
    years: "{{count}} años",
    education: "Educación",
    languages: "Idiomas",
    reviews: "Valoraciones",
    availability: "Disponibilidad",
    price: "Precio",
    bookNow: "Reservar Ahora",
    viewMore: "Ver Más",
    contactInfo: "Información de Contacto",
    location: "Ubicación",
    bookAppointment: "Reservar Cita"
  },
  appointment: {
    booking: {
      title: "Reservar una Cita",
      selectDate: "Seleccionar Fecha",
      selectTime: "Seleccionar Hora",
      selectLocation: "Seleccionar Ubicación",
      details: "Detalles de la Cita",
      reason: "Motivo de la Visita",
      notes: "Notas Adicionales",
      review: "Revisar y Confirmar",
      paymentInfo: "Información de Pago",
      total: "Total",
      confirm: "Confirmar y Pagar",
      back: "Atrás",
      next: "Siguiente",
      noTimesAvailable: "No hay horarios disponibles para la fecha seleccionada",
      chooseAnotherDate: "Por favor, elige otra fecha",
      locationPrompt: "¿Dónde deseas que te visite el médico?",
      addLocation: "Agregar Nueva Ubicación",
      chooseExisting: "O elige una ubicación existente",
      success: "Cita Reservada con Éxito"
    },
    status: {
      scheduled: "Programada",
      confirmed: "Confirmada",
      en_route: "En camino",
      arrived: "Llegó",
      in_progress: "En progreso",
      completed: "Completada",
      canceled: "Cancelada"
    },
    details: {
      with: "Cita con",
      on: "el",
      at: "a las",
      when: "Cuándo",
      where: "Dónde",
      status: "Estado",
      duration: "Duración",
      price: "Precio",
      payment: "Pago",
      actions: "Acciones",
      cancel: "Cancelar Cita",
      reschedule: "Reprogramar",
      payNow: "Pagar Ahora",
      leaveReview: "Dejar Valoración"
    },
    journey: {
      title: "Progreso de la Cita",
      eta: "Llegada estimada",
      arrivedAt: "Llegó a las",
      completedAt: "Completada a las"
    },
    actions: {
      confirm: "Confirmar Cita",
      startJourney: "Iniciar Trayecto",
      markArrived: "Marcar como Llegado",
      startConsultation: "Iniciar Consulta",
      completeAppointment: "Completar Cita",
      moreOptions: "Más Opciones",
      cancel: "Cancelar Cita"
    },
    statusChange: {
      confirmDescription: "Confirmar que asistirás a esta cita.",
      enRouteDescription: "Informar al paciente que estás en camino.",
      arrivedDescription: "Marcar que has llegado a la ubicación del paciente.",
      inProgressDescription: "Iniciar la consulta médica.",
      completedDescription: "Marcar la cita como completada.",
      success: "Estado de la cita actualizado a {{status}}",
      error: "Error al actualizar el estado de la cita"
    },
    canceled: {
      patientMessage: "Tu cita con el Dr. {{doctorName}} ha sido cancelada.",
      doctorMessage: "Tu cita con {{patientName}} ha sido cancelada."
    },
    statusControl: {
      title: "Control de Cita",
      subtitle: "Gestionar la cita actual"
    }
  },
  dashboard: {
    patient: {
      title: "Panel del Paciente",
      upcomingAppointments: "Próximas Citas",
      pastAppointments: "Citas Pasadas",
      medicalRecords: "Registros Médicos",
      payments: "Pagos",
      notifications: "Notificaciones",
      noUpcomingAppointments: "No hay citas próximas",
      noPastAppointments: "No hay citas pasadas"
    },
    doctor: {
      title: "Panel del Médico",
      overview: "Visión General",
      appointments: "Citas",
      patients: "Pacientes",
      schedule: "Mi Horario",
      earningsTitle: "Ganancias",
      reviews: "Valoraciones",
      setAvailability: "Establecer Disponibilidad",
      onlineStatus: "Estado en Línea",
      currentlyAvailable: "Actualmente Disponible",
      currentlyUnavailable: "Actualmente No Disponible",
      verificationStatus: "Estado de Verificación",
      pendingVerification: "Verificación Pendiente",
      verified: "Verificado",
      rejected: "Rechazado",
      todaysAppointments: "Citas de Hoy",
      upcomingAppointments: "Próximas Citas",
      earnings: {
        total: "Ganancias Totales",
        pending: "Pendientes",
        paid: "Pagadas",
        commission: "Comisión de la Plataforma",
        net: "Ganancias Netas"
      }
    }
  },
  profile: {
    personalInfo: "Información Personal",
    medicalInfo: "Información Médica",
    paymentInfo: "Información de Pago",
    security: "Seguridad y Privacidad",
    preferences: "Preferencias",
    firstName: "Nombre",
    lastName: "Apellidos",
    email: "Correo Electrónico",
    phone: "Teléfono",
    dob: "Fecha de Nacimiento",
    gender: "Género",
    address: "Dirección",
    city: "Ciudad",
    postalCode: "Código Postal",
    country: "País",
    updateProfile: "Actualizar Perfil",
    changePassword: "Cambiar Contraseña",
    twoFactorAuth: "Autenticación de Dos Factores",
    enable: "Activar",
    disable: "Desactivar",
    language: "Idioma",
    notifications: "Notificaciones",
    emailNotifications: "Notificaciones por Correo",
    smsNotifications: "Notificaciones por SMS",
    pushNotifications: "Notificaciones Push"
  },
  notifications: {
    title: "Notificaciones",
    markAllRead: "Marcar Todo como Leído",
    noNotifications: "No hay notificaciones",
    appointment: {
      new: "Nueva solicitud de cita",
      confirmed: "Cita confirmada",
      canceled: "Cita cancelada",
      reminder: "Recordatorio de cita",
      doctorArrived: "El médico ha llegado a tu ubicación",
      completed: "Cita completada"
    }
  },
  error: {
    generic: "Algo salió mal. Por favor, inténtalo de nuevo.",
    notFound: "Página no encontrada",
    notAuthorized: "No estás autorizado para acceder a esta página",
    locationAccess: "Acceso a la ubicación denegado",
    enableLocationAccess: "Por favor, activa el acceso a la ubicación en la configuración de tu navegador para usar esta función",
    mapLoadFailed: "Error al cargar el mapa. Por favor, inténtalo de nuevo más tarde."
  },
  footer: {
    description: "OnCall Clinic conecta pacientes con médicos certificados para servicios médicos a domicilio de alta calidad, cuando y donde los necesites.",
    sections: {
      navigation: "Navegación",
      legal: "Legal",
      contact: "Contacto"
    },
    terms: "Términos y Condiciones",
    privacy: "Política de Privacidad",
    cookies: "Política de Cookies",
    address: "Calle de la Salud 123, 28001, Madrid, España",
    copyright: "Todos los derechos reservados."
  },
  login: {
    title: "Bienvenido de nuevo",
    subtitle: "Inicia sesión en tu cuenta",
    rememberMe: "Recordarme",
    success: "Inicio de sesión exitoso",
    error: "Error al iniciar sesión",
    invalidCredentials: "Correo o contraseña no válidos",
    accountNotVerified: "Tu cuenta no está verificada. Por favor, revisa tu correo para instrucciones de verificación.",
    verificationRequired: "Verificación Requerida"
  },
  verification: {
    title: "Verifica Tu Correo",
    subtitle: "Hemos enviado un código de verificación a tu correo",
    instructions: "Por favor, introduce el código de 6 dígitos para verificar tu cuenta",
    verify: "Verificar",
    resendCode: "Reenviar código",
    success: "Correo verificado con éxito",
    error: "Verificación fallida",
    codeExpired: "El código de verificación ha expirado",
    invalidCode: "Código de verificación no válido"
  },
  twoFactor: {
    title: "Autenticación de Dos Factores",
    subtitle: "Introduce el código enviado a tu dispositivo",
    instructions: "Por favor, introduce el código de autenticación de 6 dígitos",
    verify: "Verificar",
    resendCode: "Reenviar código"
  }
};