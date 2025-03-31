#!/bin/bash

# Este script contiene comandos para ejecutar los diferentes conjuntos de tests
# Nota: Este archivo es informativo, para ejecutar los comandos cópialos y pégalos en la terminal

# Ejecutar todos los tests
# npx playwright test

# Ejecutar sólo los tests de autenticación
# npx playwright test tests/authentication/

# Ejecutar un archivo específico
# npx playwright test tests/authentication/patient-registration.spec.ts

# Ejecutar en modo debug (con navegador visible)
# npx playwright test --debug

# Ejecutar con interfaz gráfica
# npx playwright test --ui

# Generar reporte HTML
# npx playwright test --reporter=html

echo "Este es un archivo de referencia con comandos. Copia y pega los comandos en la terminal para ejecutarlos."
echo "Para más información, consulta tests/README.md"