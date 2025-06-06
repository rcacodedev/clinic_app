from io import BytesIO
import os
from django.conf import settings
from django.core.files.base import ContentFile
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor

def generar_pdf_factura(factura, datos_facturacion):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Colores
    pastel_brown = HexColor("#F2B1A1")

    # Márgenes y espaciado
    margin_left = 50
    margin_top = 800
    line_height = 18
    table_top = margin_top - 280

    # Franja vertical izquierda
    p.setFillColor(pastel_brown)
    p.rect(0, 0, 30, height, fill=True, stroke=False)  # 10 px de ancho, toda la altura

    # Logo
    logo_path = os.path.join(settings.BASE_DIR, "static", "img", "logo_clinicaactua.png")
    if os.path.exists(logo_path):
        logo = ImageReader(logo_path)
        p.drawImage(logo, margin_left, margin_top - 30, width=70, height=70, mask='auto')

    # Encabezado
    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(width - 180, margin_top, f"Factura Nº {factura.numero_factura}")

    # Datos del usuario
    p.setFont("Helvetica", 10)
    p.drawString(margin_left, margin_top - 70, f"{datos_facturacion.nombre} {datos_facturacion.primer_apellido} {datos_facturacion.segundo_apellido}")
    p.drawString(margin_left, margin_top - 85, f"DNI: {datos_facturacion.dni}")
    p.drawString(margin_left, margin_top - 100, f"{datos_facturacion.address}, {datos_facturacion.city} {datos_facturacion.postal_code} {datos_facturacion.country}")

    # Línea separadora
    p.setLineWidth(1.2)
    p.setStrokeColor(pastel_brown)
    p.line(margin_left, margin_top - 110, width - margin_left, margin_top - 110)

    # Datos del paciente
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin_left, margin_top - 130, "Datos del Cliente")
    p.setFont("Helvetica", 10)
    p.drawString(margin_left, margin_top - 150, f"{factura.cita.paciente.nombre} {factura.cita.paciente.primer_apellido} {factura.cita.paciente.segundo_apellido}")
    p.drawString(margin_left, margin_top - 165, f"DNI/NIF: {factura.cita.paciente.dni}")
    p.drawString(margin_left, margin_top - 180, f"{factura.cita.paciente.address}, {factura.cita.paciente.city} {factura.cita.paciente.code_postal} {factura.cita.paciente.country}")

    # Línea separadora
    p.setLineWidth(1.2)
    p.setStrokeColor(pastel_brown)
    p.line(margin_left, margin_top - 200, width - margin_left, margin_top - 200)

    # Tabla de factura
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin_left, margin_top - 220, "Datos de Facturación")
    p.setFillColor(pastel_brown)
    p.rect(margin_left, table_top, width - 100, 25, fill=True, stroke=False)
    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin_left + 10, table_top + 8, "Fecha")
    p.drawString(margin_left + 150, table_top + 8, "Concepto")
    p.drawString(width - 120, table_top + 8, "Precio")

    p.setLineWidth(1)
    p.setStrokeColor(pastel_brown)
    p.line(margin_left, table_top, width - margin_left, table_top)

    # Datos de la cita
    p.setFont("Helvetica", 10)
    p.drawString(margin_left + 10, table_top - line_height, f"{factura.cita.fecha.strftime('%d-%m-%Y')}")
    p.drawString(margin_left + 150, table_top - line_height, f"{factura.cita.descripcion}")
    p.drawString(width - 120, table_top - line_height, f"{factura.cita.precio}€")

    # Línea separadora
    p.line(margin_left, table_top - 2 * line_height, width - margin_left, table_top - 2 * line_height)

    # Base Imponible y Total Alineados
    precio_x = width - 120  # Alineado con precio
    p.setFont("Helvetica-Bold", 11)
    p.drawString(precio_x, table_top - 3 * line_height, f"{factura.total}€")
    p.setFont("Helvetica", 10)
    p.drawString(precio_x - 90, table_top - 3 * line_height, "Base Imponible:")

    p.setFont("Helvetica-Bold", 12)
    p.drawString(precio_x, table_top - 4 * line_height, f"{factura.total}€")
    p.setFont("Helvetica", 10)
    p.drawString(precio_x - 90, table_top - 4 * line_height, "Total:")

    # Mensaje de agradecimiento
    p.setFont("Helvetica", 10)
    p.setFillColor(colors.black)
    p.drawString(margin_left, table_top - 6 * line_height, "Exenta de IVA por aplicación del Art.20, uno, 9º de la Ley 37/1992 de 28 de diciembre")

    # Footer con fondo pastel_brown
    footer_height = 30
    p.setFillColor(pastel_brown)
    p.rect(0, 0, width, footer_height + 20, fill=True, stroke=False)

    footer_text = f"Datos de Contacto: {datos_facturacion.nombre} {datos_facturacion.primer_apellido} {datos_facturacion.segundo_apellido} {datos_facturacion.phone} {datos_facturacion.user.email}"
    p.setFont("Helvetica", 8)
    p.setFillColor(colors.whitesmoke)
    p.drawCentredString(width / 2, 15, footer_text)  # Ajustado para que quede centrado dentro del fondo

    # Guardar PDF
    p.showPage()
    p.save()
    buffer.seek(0)

    pdf_content = buffer.getvalue()
    pdf_file = ContentFile(pdf_content, f"factura_{factura.numero_factura}.pdf")
    return pdf_file

def generar_pdf_factura_irpf(factura, datos_facturacion):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Colores
    pastel_brown = HexColor("#F2B1A1")

    # Márgenes y espaciado
    margin_left = 50
    margin_top = 800
    line_height = 18
    table_top = margin_top - 280

    # Franja vertical izquierda
    p.setFillColor(pastel_brown)
    p.rect(0, 0, 30, height, fill=True, stroke=False)  # 10 px de ancho, toda la altura

    # Logo
    logo_path = os.path.join(settings.BASE_DIR, "static", "img", "logo_clinicaactua.png")
    if os.path.exists(logo_path):
        logo = ImageReader(logo_path)
        p.drawImage(logo, margin_left, margin_top - 30, width=70, height=70, mask='auto')

    # Encabezado
    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(width - 180, margin_top, f"Factura Nº {factura.numero_factura}")

    # Datos del usuario
    p.setFont("Helvetica", 10)
    p.drawString(margin_left, margin_top - 70, f"{datos_facturacion.nombre} {datos_facturacion.primer_apellido} {datos_facturacion.segundo_apellido}")
    p.drawString(margin_left, margin_top - 85, f"DNI: {datos_facturacion.dni}")
    p.drawString(margin_left, margin_top - 100, f"{datos_facturacion.address}, {datos_facturacion.city} {datos_facturacion.postal_code} {datos_facturacion.country}")

    # Línea separadora
    p.setLineWidth(1.2)
    p.setStrokeColor(pastel_brown)
    p.line(margin_left, margin_top - 110, width - margin_left, margin_top - 110)

    # Datos del paciente
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin_left, margin_top - 130, "Datos del Cliente")
    p.setFont("Helvetica", 10)
    p.drawString(margin_left, margin_top - 150, f"{factura.cita.paciente.nombre} {factura.cita.paciente.primer_apellido} {factura.cita.paciente.segundo_apellido}")
    p.drawString(margin_left, margin_top - 165, f"DNI/NIF: {factura.cita.paciente.dni}")
    p.drawString(margin_left, margin_top - 180, f"{factura.cita.paciente.address}, {factura.cita.paciente.city} {factura.cita.paciente.code_postal} {factura.cita.paciente.country}")

    # Línea separadora
    p.setLineWidth(1.2)
    p.setStrokeColor(pastel_brown)
    p.line(margin_left, margin_top - 200, width - margin_left, margin_top - 200)

    # Tabla de factura
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin_left, margin_top - 220, "Datos de Facturación")
    p.setFillColor(pastel_brown)
    p.rect(margin_left, table_top, width - 100, 25, fill=True, stroke=False)
    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin_left + 10, table_top + 8, "Fecha")
    p.drawString(margin_left + 150, table_top + 8, "Concepto")
    p.drawString(width - 120, table_top + 8, "Precio")

    p.setLineWidth(1)
    p.setStrokeColor(pastel_brown)
    p.line(margin_left, table_top, width - margin_left, table_top)

    # Datos de la cita
    p.setFont("Helvetica", 10)
    p.drawString(margin_left + 10, table_top - line_height, f"{factura.cita.fecha.strftime('%d-%m-%Y')}")
    p.drawString(margin_left + 150, table_top - line_height, f"{factura.cita.descripcion}")
    p.drawString(width - 120, table_top - line_height, f"{factura.cita.precio}€")

    # Línea separadora
    p.line(margin_left, table_top - 2 * line_height, width - margin_left, table_top - 2 * line_height)

    # Base Imponible, IRPF y Total Alineados
    precio_x = width - 120  # Alineado con precio
    p.setFont("Helvetica-Bold", 11)
    p.drawString(precio_x, table_top - 3 * line_height, f"{factura.total}€")
    p.setFont("Helvetica", 10)
    p.drawString(precio_x - 90, table_top - 3 * line_height, "Base Imponible:")

    # Calcular IRPF (15%)
    irpf = round(factura.total * 0.15, 2)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(precio_x, table_top - 4 * line_height, f"-{irpf}€")  # Mostrar como descuento (con signo -)
    p.setFont("Helvetica", 10)
    p.drawString(precio_x - 90, table_top - 4 * line_height, "IRPF (15%):")

    # Total después de IRPF
    total_despues_irpf = round(factura.total - irpf, 2)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(precio_x, table_top - 5 * line_height, f"{total_despues_irpf}€")
    p.setFont("Helvetica", 10)
    p.drawString(precio_x - 90, table_top - 5 * line_height, "Total:")


    # Mensaje de agradecimiento
    p.setFont("Helvetica", 10)
    p.setFillColor(colors.black)
    p.drawString(margin_left, table_top - 6 * line_height, "Exenta de IVA por aplicación del Art.20, uno, 9º de la Ley 37/1992 de 28 de diciembre")

    # Footer con fondo pastel_brown
    footer_height = 30
    p.setFillColor(pastel_brown)
    p.rect(0, 0, width, footer_height + 20, fill=True, stroke=False)

    footer_text = f"Datos de Contacto: {datos_facturacion.nombre} {datos_facturacion.primer_apellido} {datos_facturacion.segundo_apellido} {datos_facturacion.phone} {datos_facturacion.user.email}"
    p.setFont("Helvetica", 8)
    p.setFillColor(colors.whitesmoke)
    p.drawCentredString(width / 2, 15, footer_text)  # Ajustado para que quede centrado dentro del fondo

    # Guardar PDF
    p.showPage()
    p.save()
    buffer.seek(0)

    pdf_content = buffer.getvalue()
    pdf_file = ContentFile(pdf_content, f"factura_{factura.numero_factura}.pdf")
    return pdf_file