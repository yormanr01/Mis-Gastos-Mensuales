import 'package:flutter/material.dart';
import 'package:toastification/toastification.dart';

abstract class UiUtils {
  static void showTopSnackBar(
    BuildContext context, 
    String message, {
    bool isError = false,
    bool isDelete = false,
  }) {
    toastification.show(
      context: context,
      type: isDelete ? ToastificationType.error : (isError ? ToastificationType.error : ToastificationType.success),
      style: ToastificationStyle.fillColored,
      title: Text(message),
      icon: Icon(
        isDelete 
          ? Icons.delete_forever 
          : (isError ? Icons.error_outline : Icons.check_circle_outline),
        color: Colors.white,
      ),
      alignment: Alignment.topCenter,
      autoCloseDuration: const Duration(seconds: 4),
      showProgressBar: false,
    );
  }
}
