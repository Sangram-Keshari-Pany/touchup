from flask import jsonify
import os
import cv2
import numpy as np
import base64
import tempfile
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=3)


def detect_objects_yolo(frame):
    yolo_dir = os.path.join(os.path.dirname(__file__), 'yolo')
    weights_path = os.path.abspath(os.path.join(yolo_dir, 'yolov3.weights'))
    config_path = os.path.abspath(os.path.join(yolo_dir, 'yolov3.cfg'))
    names_path = os.path.abspath(os.path.join(yolo_dir, 'coco.names'))

    if not (os.path.exists(weights_path) and os.path.exists(config_path) and os.path.exists(names_path)):
        raise FileNotFoundError("YOLO weights, config or names file missing in 'yolo' directory.")

    with open(names_path, 'r') as f:
        classes = [line.strip() for line in f.readlines()]

    net = cv2.dnn.readNet(weights_path, config_path)

    height, width = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(frame, 1 / 255.0, (416, 416), swapRB=True, crop=False)
    net.setInput(blob)

    layer_names = net.getLayerNames()
    layers = net.getUnconnectedOutLayers()

    output_layers = []
    for i in layers:
        idx = i[0] if isinstance(i, (list, tuple, np.ndarray)) else i
        output_layers.append(layer_names[idx - 1])

    outputs = net.forward(output_layers)

    boxes, confidences, class_ids = [], [], []

    conf_threshold = 0.25
    nms_threshold = 0.4

    for output in outputs:
        for detection in output:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > conf_threshold:
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)

                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)

    indices = cv2.dnn.NMSBoxes(boxes, confidences, conf_threshold, nms_threshold)

    detected_labels = []
    if len(indices) > 0:
        for i in indices.flatten():
            detected_labels.append(classes[class_ids[i]])

    return detected_labels


def analyze(request):
    try:
        data = request.get_json()
        img_b64 = data['image'].split(',')[1]
        frame_num = int(data.get('frame', 0))

        # Decode base64 image
        img_bytes = base64.b64decode(img_b64)
        np_img = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # === Initialize Violations Report ===
        violations = {
            "multiple_faces": False,
            "forbidden_objects_detected": False,
            "face_visible": False
        }

        # === Face Visibility / Multiple Face Detection ===
        face_results = face_mesh.process(rgb)
        face_count = len(face_results.multi_face_landmarks) if face_results.multi_face_landmarks else 0

        violations["face_visible"] = face_count > 0
        violations["multiple_faces"] = face_count > 1

        # === Forbidden Object Detection with YOLO ===
        try:
            labels = detect_objects_yolo(frame)
        except Exception as e:
            print(f"[WARN] Object detection failed: {e}")
            labels = []

        forbidden_objects = {"cell phone", "book", "laptop", "keyboard", "tvmonitor", "mouse"}
        violations["forbidden_objects_detected"] = any(obj in forbidden_objects for obj in labels if obj != "person")

        # === Return Results ===
        return jsonify({
            "violations": violations,
            "detected_objects": labels
        })

    except Exception as e:
        print(f"[ERROR] analyze() failed: {e}")
        return jsonify({"error": "Internal server error"}), 500
