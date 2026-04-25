import 'dart:async';
import 'dart:convert';
import 'dart:html' as html;
import 'dart:typed_data';

Future<void> downloadCsvFile(String filename, String content) async {
  final bytes = Uint8List.fromList(utf8.encode('\uFEFF$content'));
  final blob = html.Blob([bytes], 'text/csv;charset=utf-8');
  final url = html.Url.createObjectUrlFromBlob(blob);
  final anchor = html.AnchorElement(href: url)
    ..download = filename
    ..style.display = 'none';
  html.document.body?.append(anchor);
  anchor.click();
  anchor.remove();
  html.Url.revokeObjectUrl(url);
}

Future<String?> pickCsvFileContent() async {
  final completer = Completer<String?>();
  final input = html.FileUploadInputElement()
    ..accept = '.csv,text/csv'
    ..multiple = false;
  input.click();

  try {
    await input.onChange.first;
    final file = input.files?.isNotEmpty == true ? input.files!.first : null;
    if (file == null) {
      completer.complete(null);
      return completer.future;
    }
    final reader = html.FileReader();
    reader.readAsText(file);
    await reader.onLoad.first;
    completer.complete(reader.result as String?);
  } catch (_) {
    completer.complete(null);
  }

  return completer.future;
}
