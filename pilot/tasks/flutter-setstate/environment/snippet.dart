// profile_page.dart
class _ProfilePageState extends State<ProfilePage> {
  Future<void> _load() async {
    final user = await fetchUser();
    setState(() {
      _user = user;
    });
  }
}
