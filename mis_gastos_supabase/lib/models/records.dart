import 'package:equatable/equatable.dart';

typedef ServiceStatus = String;

class WaterRecord extends Equatable {
  const WaterRecord({
    required this.id,
    required this.year,
    required this.month,
    required this.totalInvoiced,
    required this.discount,
    required this.totalToPay,
    required this.status,
  });

  final String id;
  final int year;
  final String month;
  final double totalInvoiced;
  final double discount;
  final double totalToPay;
  final ServiceStatus status;

  factory WaterRecord.fromRow(Map<String, dynamic> row) {
    return WaterRecord(
      id: row['id'] as String,
      year: (row['year'] as num).toInt(),
      month: row['month'] as String,
      totalInvoiced: (row['total_invoiced'] as num).toDouble(),
      discount: (row['discount'] as num).toDouble(),
      totalToPay: (row['total_to_pay'] as num).toDouble(),
      status: row['status'] as String,
    );
  }

  Map<String, dynamic> toInsert() => {
    if (id.isNotEmpty) 'id': id,
    'year': year,
    'month': month,
    'total_invoiced': totalInvoiced,
    'discount': discount,
    'total_to_pay': totalToPay,
    'status': status,
  };

  Map<String, dynamic> toRow() => {'id': id, ...toInsert()};

  Map<String, dynamic> toUpdate() => toInsert();

  @override
  List<Object?> get props => [
    id,
    year,
    month,
    totalInvoiced,
    discount,
    totalToPay,
    status,
  ];
}

class ElectricityRecord extends Equatable {
  const ElectricityRecord({
    required this.id,
    required this.year,
    required this.month,
    required this.totalInvoiced,
    required this.kwhConsumption,
    required this.kwhCost,
    required this.previousMeter,
    required this.currentMeter,
    required this.consumptionMeter,
    required this.discount,
    required this.totalToPay,
    required this.status,
  });

  final String id;
  final int year;
  final String month;
  final double totalInvoiced;
  final double kwhConsumption;
  final double kwhCost;
  final int previousMeter;
  final int currentMeter;
  final int consumptionMeter;
  final double discount;
  final double totalToPay;
  final ServiceStatus status;

  factory ElectricityRecord.fromRow(Map<String, dynamic> row) {
    return ElectricityRecord(
      id: row['id'] as String,
      year: (row['year'] as num).toInt(),
      month: row['month'] as String,
      totalInvoiced: (row['total_invoiced'] as num).toDouble(),
      kwhConsumption: (row['kwh_consumption'] as num).toDouble(),
      kwhCost: (row['kwh_cost'] as num).toDouble(),
      previousMeter: (row['previous_meter'] as num).toInt(),
      currentMeter: (row['current_meter'] as num).toInt(),
      consumptionMeter: (row['consumption_meter'] as num).toInt(),
      discount: (row['discount'] as num).toDouble(),
      totalToPay: (row['total_to_pay'] as num).toDouble(),
      status: row['status'] as String,
    );
  }

  Map<String, dynamic> toInsert() => {
    if (id.isNotEmpty) 'id': id,
    'year': year,
    'month': month,
    'total_invoiced': totalInvoiced,
    'kwh_consumption': kwhConsumption,
    'kwh_cost': kwhCost,
    'previous_meter': previousMeter,
    'current_meter': currentMeter,
    'consumption_meter': consumptionMeter,
    'discount': discount,
    'total_to_pay': totalToPay,
    'status': status,
  };

  Map<String, dynamic> toRow() => {'id': id, ...toInsert()};

  Map<String, dynamic> toUpdate() => toInsert();

  @override
  List<Object?> get props => [
    id,
    year,
    month,
    totalInvoiced,
    kwhConsumption,
    kwhCost,
    previousMeter,
    currentMeter,
    consumptionMeter,
    discount,
    totalToPay,
    status,
  ];
}

class InternetRecord extends Equatable {
  const InternetRecord({
    required this.id,
    required this.year,
    required this.month,
    required this.monthlyCost,
    required this.discount,
    required this.totalToPay,
    required this.status,
  });

  final String id;
  final int year;
  final String month;
  final double monthlyCost;
  final double discount;
  final double totalToPay;
  final ServiceStatus status;

  factory InternetRecord.fromRow(Map<String, dynamic> row) {
    return InternetRecord(
      id: row['id'] as String,
      year: (row['year'] as num).toInt(),
      month: row['month'] as String,
      monthlyCost: (row['monthly_cost'] as num).toDouble(),
      discount: (row['discount'] as num).toDouble(),
      totalToPay: (row['total_to_pay'] as num).toDouble(),
      status: row['status'] as String,
    );
  }

  Map<String, dynamic> toInsert() => {
    if (id.isNotEmpty) 'id': id,
    'year': year,
    'month': month,
    'monthly_cost': monthlyCost,
    'discount': discount,
    'total_to_pay': totalToPay,
    'status': status,
  };

  Map<String, dynamic> toRow() => {'id': id, ...toInsert()};

  Map<String, dynamic> toUpdate() => toInsert();

  @override
  List<Object?> get props => [
    id,
    year,
    month,
    monthlyCost,
    discount,
    totalToPay,
    status,
  ];
}

class FixedValues extends Equatable {
  const FixedValues({
    this.waterDiscount = 0,
    this.electricityDiscount = 0,
    this.internetDiscount = 0,
  });

  final double waterDiscount;
  final double electricityDiscount;
  final double internetDiscount;

  FixedValues copyWith({
    double? waterDiscount,
    double? electricityDiscount,
    double? internetDiscount,
  }) {
    return FixedValues(
      waterDiscount: waterDiscount ?? this.waterDiscount,
      electricityDiscount: electricityDiscount ?? this.electricityDiscount,
      internetDiscount: internetDiscount ?? this.internetDiscount,
    );
  }

  Map<String, dynamic> toMap() => {
    'water_discount': waterDiscount,
    'electricity_discount': electricityDiscount,
    'internet_discount': internetDiscount,
  };

  factory FixedValues.fromMap(Map<String, dynamic> map) => FixedValues(
    waterDiscount: (map['water_discount'] as num?)?.toDouble() ?? 0,
    electricityDiscount: (map['electricity_discount'] as num?)?.toDouble() ?? 0,
    internetDiscount: (map['internet_discount'] as num?)?.toDouble() ?? 0,
  );

  @override
  List<Object?> get props => [
    waterDiscount,
    electricityDiscount,
    internetDiscount,
  ];
}
