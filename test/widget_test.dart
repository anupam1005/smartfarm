import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../lib/main.dart';
// Update if your package name is different

void main() {
  testWidgets('SmartFarm Home Page UI test', (WidgetTester tester) async {
    // Build the SmartFarmApp widget
    await tester.pumpWidget(const SmartFarmApp());

    // Look for the AppBar title
    expect(find.text('Smart Home Page'), findsOneWidget);

    // Look for welcome message
    expect(find.text('Welcome to My Flutter App!'), findsOneWidget);

    // Check if FloatingActionButton is present
    expect(find.byType(FloatingActionButton), findsOneWidget);
  });
}
