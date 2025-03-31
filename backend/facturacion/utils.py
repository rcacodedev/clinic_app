from io import BytesIO
import os
from django.conf import settings
from django.core.files.base import ContentFile
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader

def generar_pdf_factura(factura, datos_facturacion):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Márgenes y espaciado
    margin_left = 50
    margin_top = 800
    line_height = 18
    table_top = margin_top - 280

    # Logo con mayor calidad
    logo_path = os.path.join(settings.BASE_DIR, "static", "img", "logo_clinicaactua.png")
    if os.path.exists(logo_path):
        logo = ImageReader(logo_path)
        p.drawImage(logo, margin_left, margin_top - 30, width=70, height=70, mask='auto')

    # Encabezado
    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(width - 180, margin_top, f"Factura Nº {factura.numero_factura}")

    # Datos del usuario
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin_left, margin_top - 50, "Emitido por")
    p.setFont("Helvetica", 10)
    p.drawString(margin_left, margin_top - 70, f"{datos_facturacion.user.first_name} {datos_facturacion.user.last_name} {datos_facturacion.segundo_apellido}")
    p.drawString(margin_left, margin_top - 85, f"DNI: {datos_facturacion.dni}")
    p.drawString(margin_left, margin_top - 100, f"{datos_facturacion.address}, {datos_facturacion.city} {datos_facturacion.postal_code} {datos_facturacion.country}")

    # Línea separadora
    p.setLineWidth(1.2)
    p.setStrokeColor(colors.purple)
    p.line(margin_left, margin_top - 110, width - margin_left, margin_top - 110)

    # Datos del paciente
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin_left, margin_top - 130, "Datos del Paciente")
    p.setFont("Helvetica", 10)
    p.drawString(margin_left, margin_top - 150, f"{factura.cita.patient.nombre} {factura.cita.patient.primer_apellido} {factura.cita.patient.segundo_apellido}")
    p.drawString(margin_left, margin_top - 165, f"DNI: {factura.cita.patient.dni}")
    p.drawString(margin_left, margin_top - 180, f"{factura.cita.patient.address}, {factura.cita.patient.city} {factura.cita.patient.code_postal} {factura.cita.patient.country}")

    # Línea separadora
    p.setLineWidth(1.2)
    p.setStrokeColor(colors.purple)
    p.line(margin_left, margin_top - 200, width - margin_left, margin_top - 200)

    # Tabla de factura
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin_left, margin_top - 220, "Datos de Facturación")
    p.setFillColor(colors.lightgrey)
    p.rect(margin_left, table_top, width - 100, 25, fill=True, stroke=False)
    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin_left + 10, table_top + 8, "Fecha")
    p.drawString(margin_left + 150, table_top + 8, "Concepto")
    p.drawString(width - 120, table_top + 8, "Precio")

    p.setLineWidth(1)
    p.setStrokeColor(colors.purple)
    p.line(margin_left, table_top, width - margin_left, table_top)

    # Datos de la cita
    p.setFont("Helvetica", 10)
    p.drawString(margin_left + 10, table_top - line_height, f"{factura.cita.fecha.strftime('%d-%m-%Y')}")
    p.drawString(margin_left + 150, table_top - line_height, f"{factura.cita.descripcion}")
    p.drawString(width - 120, table_top - line_height, f"{factura.cita.precio}€")

    # Línea separadora
    p.line(margin_left, table_top - 2 * line_height, width - margin_left, table_top - 2 * line_height)

    # Total
    p.setFont("Helvetica-Bold", 12)
    p.setFillColor(colors.purple)
    p.drawString(width - 150, table_top - 4 * line_height, f"Total: {factura.total}€")
    p.setFillColor(colors.black)

    # Mensaje de agradecimiento
    p.setFont("Helvetica", 10)
    p.setFillColor(colors.darkblue)
    p.drawString(margin_left, table_top - 6 * line_height, "Gracias por confiar en nosotros. Para cualquier consulta, contáctenos.")
    p.setFillColor(colors.black)

    # Guardar PDF
    p.showPage()
    p.save()
    buffer.seek(0)

    pdf_content = buffer.getvalue()
    pdf_file = ContentFile(pdf_content, f"factura_{factura.numero_factura}.pdf")
    return pdf_file
