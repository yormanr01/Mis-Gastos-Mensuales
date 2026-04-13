// Constantes alineadas con src/lib/types.ts (Next.js).

const List<String> months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

enum PaymentStatus { pendiente, pagado }

extension PaymentStatusDb on PaymentStatus {
  String get dbValue => switch (this) {
        PaymentStatus.pendiente => 'Pendiente',
        PaymentStatus.pagado => 'Pagado',
      };

  static PaymentStatus fromDb(String? v) => switch (v) {
        'Pagado' => PaymentStatus.pagado,
        _ => PaymentStatus.pendiente,
      };
}
