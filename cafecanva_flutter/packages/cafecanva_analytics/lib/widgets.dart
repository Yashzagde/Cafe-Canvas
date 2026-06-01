import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';

// --- CcRevenueChart ---
class CcRevenueChart extends StatelessWidget {
  final List<double> weeklyRevenue; // Values in Rupees
  final List<String> weekDays;

  const CcRevenueChart({
    Key? key,
    this.weeklyRevenue = const [12000.0, 15000.0, 18000.0, 11000.0, 22000.0, 29000.0, 24000.0],
    this.weekDays = const ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CcCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Revenue Trends (Weekly)',
            style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold, color: CafeCanvaColors.stone800),
          ),
          const SizedBox(height: 16.0),
          SizedBox(
            height: 200.0,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: CafeCanvaColors.stone200,
                    strokeWidth: 1,
                  ),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 45,
                      getTitlesWidget: (value, meta) {
                        return Text(
                          '₹${(value / 1000).toStringAsFixed(0)}k',
                          style: const TextStyle(color: CafeCanvaColors.stone500, fontSize: 10.0),
                        );
                      },
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final index = value.toInt();
                        if (index >= 0 && index < weekDays.length) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text(
                              weekDays[index],
                              style: const TextStyle(color: CafeCanvaColors.stone500, fontSize: 10.0),
                            ),
                          );
                        }
                        return const Text('');
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: List.generate(
                      weeklyRevenue.length,
                      (index) => FlSpot(index.toDouble(), weeklyRevenue[index]),
                    ),
                    isCurved: true,
                    color: CafeCanvaColors.primary,
                    barWidth: 3.5,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      color: CafeCanvaColors.primary.withOpacity(0.12),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// --- CcCategoryPieChart ---
class CcCategoryPieChart extends StatelessWidget {
  final Map<String, double> categorySplits; // Category Name to percentage

  const CcCategoryPieChart({
    Key? key,
    this.categorySplits = const {
      'Coffee': 40.0,
      'Bakery': 25.0,
      'Mocktails': 20.0,
      'Snacks': 15.0,
    },
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colors = [
      CafeCanvaColors.primary,
      CafeCanvaColors.secondary,
      CafeCanvaColors.info,
      CafeCanvaColors.success,
    ];

    int colorIndex = 0;

    return CcCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Sales Category Splits',
            style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold, color: CafeCanvaColors.stone800),
          ),
          const SizedBox(height: 16.0),
          Row(
            children: [
              SizedBox(
                height: 140.0,
                width: 140.0,
                child: PieChart(
                  PieChartData(
                    sectionsSpace: 2,
                    centerSpaceRadius: 35,
                    sections: categorySplits.entries.map((entry) {
                      final color = colors[colorIndex % colors.length];
                      colorIndex++;
                      return PieChartSectionData(
                        color: color,
                        value: entry.value,
                        title: '${entry.value.toStringAsFixed(0)}%',
                        radius: 20,
                        titleStyle: const TextStyle(
                          fontSize: 11.0,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(width: 24.0),
              // Legend
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: categorySplits.entries.map((entry) {
                    final color = colors[categorySplits.keys.toList().indexOf(entry.key) % colors.length];
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4.0),
                      child: Row(
                        children: [
                          Container(
                            width: 12.0,
                            height: 12.0,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8.0),
                          Expanded(
                            child: Text(
                              entry.key,
                              style: const TextStyle(fontSize: 12.0, color: CafeCanvaColors.stone800),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// --- CcLowSellingTable ---
class CcLowSellingTable extends StatelessWidget {
  final List<Map<String, dynamic>> items;

  const CcLowSellingTable({
    Key? key,
    this.items = const [
      {'name': 'Chai Latte', 'sales': 4, 'revenue': 44000},
      {'name': 'Matcha Muffin', 'sales': 7, 'revenue': 84000},
      {'name': 'Lemon Ice Tea', 'sales': 9, 'revenue': 117000},
    ],
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CcCard(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Padding(
            padding: EdgeInsets.all(CafeCanvaSpacing.lg),
            child: Text(
              'Low-Selling Items (Attention Required)',
              style: TextStyle(fontSize: 15.0, fontWeight: FontWeight.bold, color: CafeCanvaColors.error),
            ),
          ),
          const Divider(height: 1),
          DataTable(
            headingRowColor: MaterialStateProperty.all(CafeCanvaColors.stone50),
            columns: const [
              DataColumn(label: Text('Menu Item', style: TextStyle(fontWeight: FontWeight.bold))),
              DataColumn(label: Text('Qty Sold', style: TextStyle(fontWeight: FontWeight.bold))),
              DataColumn(label: Text('Revenue', style: TextStyle(fontWeight: FontWeight.bold))),
            ],
            rows: items.map((item) {
              return DataRow(
                cells: [
                  DataCell(Text(item['name'] as String)),
                  DataCell(Text(item['sales'].toString())),
                  DataCell(CcPriceText(priceInPaise: item['revenue'] as int)),
                ],
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
