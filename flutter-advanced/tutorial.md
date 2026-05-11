# Tutorial: Klasifikasi Audio dengan Teachable Machine di Flutter Menggunakan GetX (GetCLI Architecture)

Tutorial ini memandu Anda dari awal untuk membangun aplikasi klasifikasi audio (suara) menggunakan model yang dilatih di **Teachable Machine**, dan mengimplementasikannya di Flutter menggunakan arsitektur folder standar dari **GetCLI**. Terdapat dua modul utama:
1. Klasifikasi Suara dari Upload Audio (.wav)
2. Klasifikasi Suara Realtime dari Mikrofon

## 1. Persiapan Proyek dan Instalasi GetCLI

Pastikan Anda sudah menginstal package `get_cli` secara global jika belum punya:
```bash
dart pub global activate get_cli
```

Buat proyek Flutter baru menggunakan GetCLI:
```bash
get create project:klasifikasi_audio
```
(Pilih tipe arsitektur standar GetX jika ditanya).

Kemudian masuk ke folder proyek:
```bash
cd klasifikasi_audio
```

Salin model Teachable Machine Anda (`soundclassifier_with_metadata.tflite` dan `labels.txt`) ke dalam folder `assets/ml/`.

## 2. Menambahkan Dependencies

Jalankan perintah berikut di dalam terminal untuk menginstal semua package yang diperlukan:
```bash
flutter pub add get tflite_flutter permission_handler record file_picker
```

**Penjelasan Package:**
- `get`: State management, dependensi injeksi, dan routing.
- `tflite_flutter`: Untuk menjalankan model machine learning.
- `permission_handler`: Untuk meminta akses mikrofon Android/iOS.
- `record`: Mengambil data audio realtime secara streaming.
- `file_picker`: Mengambil file audio `.wav` dari memori perangkat.

## 3. Konfigurasi `pubspec.yaml`

Tambahkan aset ke dalam konfigurasi `pubspec.yaml` agar model terbaca oleh aplikasi:
```yaml
  assets:
    - assets/ml/labels.txt
    - assets/ml/soundclassifier_with_metadata.tflite
```

Jalankan `flutter pub get` setelah menyimpan file ini.

## 4. Konfigurasi Sistem Khusus (Android)

**A. Izin Mikrofon di AndroidManifest.xml**
Buka file `android/app/src/main/AndroidManifest.xml` dan tambahkan `RECORD_AUDIO` sebelum tag `<application>`:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <application
        ...
```

**B. Konfigurasi Versi SDK dan NDK Android**
Beberapa package seperti `record_android` dan `tflite_flutter` membutuhkan versi SDK dan NDK spesifik.
Buka `android/app/build.gradle.kts` dan perbarui nilai `compileSdk` serta `ndkVersion` di dalam blok `android`:
```kotlin
android {
    namespace = "com.example.klasifikasi_audio"
    compileSdk = 36 // <-- Ubah bagian ini
    ndkVersion = "27.0.12077973" // <-- Tambahkan/ubah bagian ini
    
    ...
    defaultConfig {
        ...
        minSdk = 23 // <-- Ubah bagian ini agar record_android berfungsi
        ...
    }
}
```

## 5. Membuat Modul GetX

Gunakan GetCLI untuk membuat modul (Halaman) baru. Kita akan membutuhkan halaman upload audio dan realtime audio:
```bash
get create page:upload_audio
get create page:realtime_audio
```
(Modul `home` biasanya sudah otomatis terbuat saat Anda menggunakan GetCLI untuk inisialisasi).

---

## 6. Penulisan Kode Modul

### A. Modul Home (Landing Page)
Ubah `lib/app/modules/home/views/home_view.dart` agar menjadi menu pilihan klasifikasi:

```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../routes/app_pages.dart';
import '../controllers/home_controller.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Audio Classification'),
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () => Get.toNamed(Routes.UPLOAD_AUDIO),
              child: const Text('Klasifikasi dari Upload Audio'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Get.toNamed(Routes.REALTIME_AUDIO),
              child: const Text('Klasifikasi Audio Realtime'),
            ),
          ],
        ),
      ),
    );
  }
}
```

### B. Modul Upload Audio
Buka `lib/app/modules/upload_audio/controllers/upload_audio_controller.dart` dan masukkan kode berikut. Controller ini akan mengambil file `.wav` dari memori, mengekstrak raw data PCM, lalu menjalankannya ke dalam TensorFlow Lite:

```dart
import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:tflite_flutter/tflite_flutter.dart';

class UploadAudioController extends GetxController {
  Interpreter? _interpreter;
  List<String> _labels = [];

  final selectedFileName = "No file selected".obs;
  final predictedLabel = "Select a WAV file".obs;
  final confidence = 0.0.obs;

  // Model audio Teachable Machine mengambil 15600 sampel
  static const int _expectedInputSize = 15600;

  @override
  void onInit() {
    super.onInit();
    _loadModelAndLabels();
  }

  @override
  void onClose() {
    _interpreter?.close();
    super.onClose();
  }

  Future<void> _loadModelAndLabels() async {
    try {
      final labelData = await rootBundle.loadString('assets/ml/labels.txt');
      _labels = labelData.split('\n').where((line) => line.isNotEmpty)
          .map((line) => line.split(' ').sublist(1).join(' ')).toList();

      _interpreter = await Interpreter.fromAsset('assets/ml/soundclassifier_with_metadata.tflite');
    } catch (e) {
      predictedLabel.value = "Failed to load model: $e";
    }
  }

  Future<void> pickAndClassifyFile() async {
    try {
      FilePickerResult? result = await FilePicker.pickFiles(type: FileType.audio);

      if (result != null && result.files.isNotEmpty) {
        String? path = result.files.first.path;
        if (path != null) {
          selectedFileName.value = result.files.first.name;
          predictedLabel.value = "Processing...";
          confidence.value = 0.0;

          File file = File(path);
          Uint8List bytes = await file.readAsBytes();

          int headerSize = 44; // Anggapan header WAV standar
          if (bytes.length <= headerSize) {
            predictedLabel.value = "Invalid audio file";
            return;
          }

          // Mengekstrak PCM 16-bit
          Uint8List audioData = bytes.sublist(headerSize);
          Int16List int16Data = audioData.buffer.asInt16List(audioData.offsetInBytes, audioData.lengthInBytes ~/ 2);

          List<int> samplesToProcess = [];
          if (int16Data.length >= _expectedInputSize) {
            samplesToProcess = int16Data.sublist(0, _expectedInputSize);
          } else {
            samplesToProcess = int16Data.toList();
            while (samplesToProcess.length < _expectedInputSize) {
              samplesToProcess.add(0);
            }
          }

          _runInference(samplesToProcess);
        }
      }
    } catch (e) {
      predictedLabel.value = "Error picking file: $e";
    }
  }

  void _runInference(List<int> pcmData) {
    if (_interpreter == null || _labels.isEmpty) return;

    List<double> inputData = pcmData.map((e) => e / 32768.0).toList();
    var input = [inputData];
    var output = List.filled(1, List.filled(_labels.length, 0.0));

    try {
      _interpreter!.run(input, output);
      List<double> probabilities = output[0];
      
      double maxProb = 0.0;
      int maxIndex = -1;
      for (int i = 0; i < probabilities.length; i++) {
        if (probabilities[i] > maxProb) {
          maxProb = probabilities[i];
          maxIndex = i;
        }
      }

      if (maxIndex != -1) {
        predictedLabel.value = _labels[maxIndex];
        confidence.value = maxProb;
      }
    } catch (e) {
      predictedLabel.value = "Inference error";
    }
  }
}
```

Buka `lib/app/modules/upload_audio/views/upload_audio_view.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/upload_audio_controller.dart';

class UploadAudioView extends GetView<UploadAudioController> {
  const UploadAudioView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upload Audio Classification')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.audio_file, size: 100, color: Colors.blueAccent),
              const SizedBox(height: 16),
              Obx(() => Text(controller.selectedFileName.value, style: const TextStyle(color: Colors.grey))),
              const SizedBox(height: 32),
              Obx(() => Text(controller.predictedLabel.value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold))),
              const SizedBox(height: 16),
              Obx(() => controller.confidence.value > 0
                  ? Column(
                      children: [
                        Text('Confidence: ${(controller.confidence.value * 100).toStringAsFixed(1)}%'),
                        LinearProgressIndicator(value: controller.confidence.value, color: Colors.deepPurple),
                      ],
                    )
                  : const SizedBox.shrink()),
              const SizedBox(height: 48),
              ElevatedButton.icon(
                onPressed: controller.pickAndClassifyFile,
                icon: const Icon(Icons.upload_file),
                label: const Text('Pilih Audio (.wav)'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### C. Modul Realtime Audio
Buka `lib/app/modules/realtime_audio/controllers/realtime_audio_controller.dart` dan masukkan kode untuk merekam dan stream audio secara real-time:

```dart
import 'dart:async';
import 'dart:typed_data';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:tflite_flutter/tflite_flutter.dart';

class RealtimeAudioController extends GetxController {
  final _audioRecorder = AudioRecorder();
  StreamSubscription<Uint8List>? _audioStreamSubscription;
  Interpreter? _interpreter;
  List<String> _labels = [];

  final isRecording = false.obs;
  final predictedLabel = "Loading...".obs;
  final confidence = 0.0.obs;

  static const int _sampleRate = 16000;
  static const int _expectedInputSize = 15600;
  
  List<int> _audioBuffer = [];

  @override
  void onInit() {
    super.onInit();
    _loadModelAndLabels();
  }

  @override
  void onClose() {
    _stopRecording();
    _audioRecorder.dispose();
    _interpreter?.close();
    super.onClose();
  }

  Future<void> _loadModelAndLabels() async {
    try {
      final labelData = await rootBundle.loadString('assets/ml/labels.txt');
      _labels = labelData.split('\n').where((line) => line.isNotEmpty)
          .map((line) => line.split(' ').sublist(1).join(' ')).toList();

      _interpreter = await Interpreter.fromAsset('assets/ml/soundclassifier_with_metadata.tflite');
      predictedLabel.value = "Ready to record";
    } catch (e) {
      predictedLabel.value = "Failed to load model";
    }
  }

  Future<void> toggleRecording() async {
    if (isRecording.value) {
      await _stopRecording();
    } else {
      await _startRecording();
    }
  }

  Future<void> _startRecording() async {
    try {
      var status = await Permission.microphone.request();
      if (status != PermissionStatus.granted) {
        predictedLabel.value = "Microphone permission denied";
        return;
      }

      if (await _audioRecorder.hasPermission()) {
        final stream = await _audioRecorder.startStream(const RecordConfig(
          encoder: AudioEncoder.pcm16bits,
          sampleRate: _sampleRate,
          numChannels: 1,
        ));

        _audioBuffer.clear();
        isRecording.value = true;
        predictedLabel.value = "Listening...";

        _audioStreamSubscription = stream.listen((Uint8List data) {
          _processAudioData(data);
        });
      }
    } catch (e) {
      predictedLabel.value = "Error starting record: $e";
    }
  }

  Future<void> _stopRecording() async {
    await _audioStreamSubscription?.cancel();
    _audioStreamSubscription = null;
    await _audioRecorder.stop();
    isRecording.value = false;
    predictedLabel.value = "Ready to record";
    confidence.value = 0.0;
  }

  void _processAudioData(Uint8List data) {
    Int16List int16Data = data.buffer.asInt16List(data.offsetInBytes, data.lengthInBytes ~/ 2);
    _audioBuffer.addAll(int16Data);

    if (_audioBuffer.length >= _expectedInputSize) {
      List<int> samplesToProcess = _audioBuffer.sublist(_audioBuffer.length - _expectedInputSize);
      _audioBuffer = _audioBuffer.sublist(_audioBuffer.length - (_expectedInputSize ~/ 2));
      _runInference(samplesToProcess);
    }
  }

  void _runInference(List<int> pcmData) {
    if (_interpreter == null || _labels.isEmpty) return;

    List<double> inputData = pcmData.map((e) => e / 32768.0).toList();
    var input = [inputData];
    var output = List.filled(1, List.filled(_labels.length, 0.0));

    try {
      _interpreter!.run(input, output);
      List<double> probabilities = output[0];
      
      double maxProb = 0.0;
      int maxIndex = -1;
      for (int i = 0; i < probabilities.length; i++) {
        if (probabilities[i] > maxProb) {
          maxProb = probabilities[i];
          maxIndex = i;
        }
      }

      if (maxIndex != -1) {
        predictedLabel.value = _labels[maxIndex];
        confidence.value = maxProb;
      }
    } catch (e) {}
  }
}
```

Buka `lib/app/modules/realtime_audio/views/realtime_audio_view.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/realtime_audio_controller.dart';

class RealtimeAudioView extends GetView<RealtimeAudioController> {
  const RealtimeAudioView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Realtime Audio Classification')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Obx(() => Icon(controller.isRecording.value ? Icons.mic : Icons.mic_none, size: 100, color: controller.isRecording.value ? Colors.red : Colors.grey)),
              const SizedBox(height: 32),
              Obx(() => Text(controller.predictedLabel.value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold))),
              const SizedBox(height: 16),
              Obx(() => controller.confidence.value > 0
                  ? Column(
                      children: [
                        Text('Confidence: ${(controller.confidence.value * 100).toStringAsFixed(1)}%'),
                        LinearProgressIndicator(value: controller.confidence.value, color: Colors.deepPurple),
                      ],
                    )
                  : const SizedBox.shrink()),
              const SizedBox(height: 48),
              Obx(() => ElevatedButton.icon(
                onPressed: controller.toggleRecording,
                icon: Icon(controller.isRecording.value ? Icons.stop : Icons.play_arrow),
                label: Text(controller.isRecording.value ? 'Stop Recording' : 'Start Recording'),
              )),
            ],
          ),
        ),
      ),
    );
  }
}
```

## 7. Menjalankan Aplikasi

Sekarang arsitektur modular Anda sudah lengkap. Hubungkan device (yang mendukung mikrofon dan penyimpanan) dan jalankan:
```bash
flutter run
```

Anda akan masuk ke Landing Page untuk memilih antara mengetes model menggunakan berkas audio `.wav` (*Upload*) atau *Realtime* melalui mikrofon!
