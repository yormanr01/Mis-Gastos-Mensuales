import 'package:intl/intl.dart';

final NumberFormat kCurrency = NumberFormat.currency(
  locale: 'en_US',
  symbol: r'$',
);

String formatMoney(double amount) => kCurrency.format(amount);
