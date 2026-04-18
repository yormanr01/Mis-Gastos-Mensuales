import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:mis_gastos_supabase/models/records.dart';
import 'package:mis_gastos_supabase/utils/formatters.dart';

class PdfGenerator {
  static Future<void> generateMonthlySummary({
    required String month,
    required int year,
    WaterRecord? water,
    ElectricityRecord? electricity,
    InternetRecord? internet,
    required double total,
  }) async {
    print('[PdfGenerator] Iniciando generación de PDF para $month $year...');

    try {
      final pdf = pw.Document();

      pw.Font font;
      pw.Font fontBold;
      pw.Font iconFont;

      try {
        print('[PdfGenerator] Cargando Google Fonts...');
        font = await PdfGoogleFonts.interRegular();
        fontBold = await PdfGoogleFonts.interBold();
        iconFont = await PdfGoogleFonts.materialIcons();
      } catch (e) {
        print(
          '[PdfGenerator] Error cargando Google Fonts, usando fuentes estándar: $e',
        );
        font = pw.Font.helvetica();
        fontBold = pw.Font.helveticaBold();
        iconFont = pw.Font.helvetica(); // Fallback básico
      }

      print('[PdfGenerator] Construyendo páginas...');
      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(40),
          theme: pw.ThemeData.withFont(
            base: font,
            bold: fontBold,
            icons: iconFont,
          ),
          build: (context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                // Encabezado
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(
                      'REPORTE DE GASTOS',
                      style: pw.TextStyle(
                        font: fontBold,
                        fontSize: 20,
                        color: PdfColors.blueGrey900,
                      ),
                    ),
                    pw.Text(
                      '$month $year',
                      style: pw.TextStyle(font: fontBold, fontSize: 18),
                    ),
                  ],
                ),
                pw.SizedBox(height: 24),

                // Tarjetas de Servicios en columna
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.stretch,
                  children: [
                    _buildServiceCard(
                      'Agua',
                      water?.totalToPay,
                      water?.status ?? 'N/A',
                      const pw.IconData(0xe798), // water_drop (antes e08e)
                      PdfColors.lightBlue,
                      font,
                      fontBold,
                      details: water != null
                          ? [
                              'Monto Facturado: ${formatMoney(water.totalInvoiced)}',
                              'Descuento: ${formatMoney(water.discount)}',
                            ]
                          : null,
                    ),
                    pw.SizedBox(height: 12),
                    _buildServiceCard(
                      'Electricidad',
                      electricity?.totalToPay,
                      electricity?.status ?? 'N/A',
                      const pw.IconData(0xea0b), // bolt
                      PdfColors.amber,
                      font,
                      fontBold,
                      details: electricity != null
                          ? [
                              'Lectura Anterior: ${electricity.previousMeter}',
                              'Lectura Actual: ${electricity.currentMeter}',
                              'Diferencia Medidor: ${electricity.consumptionMeter}',
                              'Precio kWh: ${formatMoney(electricity.kwhCost)}',
                              'Descuento: ${formatMoney(electricity.discount)}',
                            ]
                          : null,
                    ),
                    pw.SizedBox(height: 12),
                    _buildServiceCard(
                      'Internet',
                      internet?.totalToPay,
                      internet?.status ?? 'N/A',
                      const pw.IconData(0xe63e), // wifi
                      PdfColors.teal,
                      font,
                      fontBold,
                      details: internet != null
                          ? [
                              'Costo del Plan: ${formatMoney(internet.monthlyCost)}',
                              'Descuento: ${formatMoney(internet.discount)}',
                            ]
                          : null,
                    ),
                  ],
                ),
                pw.SizedBox(height: 24),

                // Tarjeta de Total General
                pw.Container(
                  width: double.infinity,
                  padding: const pw.EdgeInsets.all(16),
                  decoration: pw.BoxDecoration(
                    color: PdfColors.blueGrey50,
                    borderRadius: pw.BorderRadius.circular(8),
                    border: pw.Border.all(color: PdfColors.blueGrey100),
                  ),
                  child: pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text(
                        'TOTAL GENERAL DEL PERIODO',
                        style: pw.TextStyle(
                          font: fontBold,
                          fontSize: 14,
                          color: PdfColors.blueGrey800,
                        ),
                      ),
                      pw.Text(
                        formatMoney(total),
                        style: pw.TextStyle(
                          font: fontBold,
                          fontSize: 22,
                          color: PdfColors.blue900,
                        ),
                      ),
                    ],
                  ),
                ),
                pw.SizedBox(height: 12),

                // Nota de la fórmula
                if (electricity != null) ...[
                  pw.Container(
                    padding: const pw.EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: const pw.BoxDecoration(
                      border: pw.Border(
                        left: pw.BorderSide(
                          color: PdfColors.blueGrey200,
                          width: 2,
                        ),
                      ),
                    ),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(
                          'NOTA SOBRE EL CÁLCULO DE ELECTRICIDAD:',
                          style: pw.TextStyle(
                            font: fontBold,
                            fontSize: 7,
                            color: PdfColors.blueGrey400,
                          ),
                        ),
                        pw.SizedBox(height: 2),
                        pw.Text(
                          'Total = ((Lectura Actual - Lectura Anterior) x Precio kWh) - Descuento',
                          style: pw.TextStyle(
                            font: font,
                            fontSize: 8,
                            color: PdfColors.blueGrey700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                pw.Spacer(),
                pw.Center(
                  child: pw.Text(
                    'Generado por Mis Gastos Mensuales • ${DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now())}',
                    style: pw.TextStyle(
                      font: font,
                      fontSize: 8,
                      color: PdfColors.grey500,
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      );
      print('[PdfGenerator] Lanzando Printing.layoutPdf...');
      await Printing.layoutPdf(
        onLayout: (PdfPageFormat format) async {
          print('[PdfGenerator] Guardando documento PDF...');
          return pdf.save();
        },
        name: 'Resumen_${month}_$year.pdf',
      );
      print('[PdfGenerator] PDF generado exitosamente.');
    } catch (e) {
      print('[PdfGenerator] ERROR CRÍTICO AL GENERAR PDF: $e');
      rethrow;
    }
  }

  static pw.Widget _buildServiceCard(
    String title,
    double? amount,
    String status,
    pw.IconData iconData,
    PdfColor color,
    pw.Font font,
    pw.Font bold, {
    List<String>? details,
  }) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.all(10),
      decoration: pw.BoxDecoration(
        color: PdfColors.white,
        borderRadius: pw.BorderRadius.circular(8),
        border: pw.Border.all(color: PdfColors.grey200),
      ),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Row(
                children: [
                  pw.Icon(iconData, size: 10, color: color),
                  pw.SizedBox(width: 4),
                  pw.Text(
                    title.toUpperCase(),
                    style: pw.TextStyle(font: bold, fontSize: 8, color: color),
                  ),
                ],
              ),
              pw.Container(
                width: 6,
                height: 6,
                decoration: pw.BoxDecoration(
                  color: status == 'Pagado'
                      ? PdfColors.green
                      : PdfColors.orange,
                  shape: pw.BoxShape.circle,
                ),
              ),
            ],
          ),
          pw.SizedBox(height: 6),
          pw.Text(
            formatMoney(amount ?? 0),
            style: pw.TextStyle(
              font: bold,
              fontSize: 14,
              color: PdfColors.blueGrey900,
            ),
          ),
          if (details != null) ...[
            pw.SizedBox(height: 8),
            pw.Divider(color: PdfColors.grey100, thickness: 0.5),
            pw.SizedBox(height: 4),
            ...details.map(
              (d) => pw.Padding(
                padding: const pw.EdgeInsets.only(bottom: 2),
                child: pw.Text(
                  d,
                  style: pw.TextStyle(
                    font: font,
                    fontSize: 7,
                    color: PdfColors.grey700,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
