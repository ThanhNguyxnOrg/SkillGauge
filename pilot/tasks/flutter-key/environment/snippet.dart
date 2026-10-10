// cart_page.dart
Widget build(BuildContext context) {
  return ListView(
    children: items.asMap().entries.map((e) {
      return CartRow(key: ValueKey(e.key), item: e.value);
    }).toList(),
  );
}
