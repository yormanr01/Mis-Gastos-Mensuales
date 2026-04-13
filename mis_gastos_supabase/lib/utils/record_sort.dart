import 'package:mis_gastos_supabase/models/domain.dart';

int compareYearMonthDesc(
  ({int year, String month}) a,
  ({int year, String month}) b,
) {
  if (a.year != b.year) return b.year.compareTo(a.year);
  return months.indexOf(b.month).compareTo(months.indexOf(a.month));
}
