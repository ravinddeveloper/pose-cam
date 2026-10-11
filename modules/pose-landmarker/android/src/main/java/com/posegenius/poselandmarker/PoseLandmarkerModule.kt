package com.posegenius.poselandmarker

import android.content.Context
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class PoseLandmarkerModule : Module() {
  private var poseLandmarker: PoseLandmarker? = null
  private var backgroundExecutor: ExecutorService? = null
  private var isDetecting: Boolean = false

  override fun definition() = ModuleDefinition {
    Name("PoseLandmarker")

    Events("onPoseLandmarks", "onError")

    AsyncFunction("initializeModel") { options: Map<String, Any>?, promise: Promise ->
      try {
        val context = appContext.reactContext ?: throw IllegalStateException("React context not available")
        val modelAssetPath = options?.get("modelAssetPath") as? String ?: "pose_landmarker_lite.task"
        val minConfidence = (options?.get("minDetectionConfidence") as? Number)?.toFloat() ?: 0.5f

        backgroundExecutor = Executors.newSingleThreadExecutor()

        val baseOptions = BaseOptions.builder()
          .setModelAssetPath(modelAssetPath)
          .build()

        val landmarkerOptions = PoseLandmarker.PoseLandmarkerOptions.builder()
          .setBaseOptions(baseOptions)
          .setMinPoseDetectionConfidence(minConfidence)
          .setMinTrackingConfidence(minConfidence)
          .setMinPosePresenceConfidence(minConfidence)
          .setRunningMode(RunningMode.LIVE_STREAM)
          .setResultListener { result: PoseLandmarkerResult, inputImage: MPImage ->
            handleResult(result)
          }
          .setErrorListener { error: RuntimeException ->
            sendEvent("onError", mapOf("message" to error.localizedMessage))
          }
          .build()

        poseLandmarker = PoseLandmarker.createFromOptions(context, landmarkerOptions)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("INIT_ERROR", e.message, e)
      }
    }

    Function("startDetection") {
      isDetecting = true
    }

    Function("stopDetection") {
      isDetecting = false
    }

    AsyncFunction("disposeModel") { promise: Promise ->
      try {
        isDetecting = false
        poseLandmarker?.close()
        poseLandmarker = null
        backgroundExecutor?.shutdown()
        backgroundExecutor = null
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("DISPOSE_ERROR", e.message, e)
      }
    }
  }

  private fun handleResult(result: PoseLandmarkerResult) {
    if (!isDetecting) return

    val landmarksList = result.landmarks()
    if (landmarksList.isNotEmpty()) {
      val firstPerson = landmarksList[0]
      val landmarks = firstPerson.map { landmark ->
        mapOf(
          "x" to landmark.x(),
          "y" to landmark.y(),
          "z" to landmark.z(),
          "visibility" to (landmark.visibility().orElse(1.0f)),
          "presence" to (landmark.presence().orElse(1.0f))
        )
      }
      sendEvent("onPoseLandmarks", mapOf("landmarks" to landmarks))
    }
  }
}
